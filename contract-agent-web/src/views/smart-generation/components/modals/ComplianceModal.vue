<script setup lang="ts">
import { computed } from 'vue'
import { useSmartGenerationStore } from '@/stores/smart-generation'

const store = useSmartGenerationStore()

const status = computed(() => store.compStatus)
const subs = computed(() => store.COMPLIANCE_SUB_STEPS)
const percent = computed(() => store.compPercent + '%')
const stats = computed(() => store.compStats)

const STATUS_LABEL: Record<string, string> = { pass: '通过', warn: '警告', fail: '不通过' }
const STATUS_ICON: Record<string, string> = { pass: '✓', warn: '!', fail: '✗' }

const badge = computed(() => {
  const s = status.value
  if (s === 'running') return { cls: 'running', txt: '处理中' }
  if (s === 'done') return { cls: 'success', txt: '已完成' }
  return { cls: 'idle', txt: '待启动' }
})

const headText = computed(() => {
  const s = status.value
  if (s === 'running') {
    const sub = subs.value[store.compSubsDone - 1]
    return sub ? sub.txt + '…' : '处理中…'
  }
  if (s === 'done') return '共 ' + subs.value.length + ' 项全部完成'
  return '等待启动'
})

function subState(i: number): 'pending' | 'success' | 'running' {
  const s = status.value
  if (s === 'running') {
    if (i < store.compSubsDone - 1) return 'success'
    if (i === store.compSubsDone - 1) return 'running'
    return 'pending'
  }
  if (s === 'done') return 'success'
  return 'pending'
}

function subMeta(state: string): string {
  if (state === 'success') return '已完成'
  if (state === 'running') return '进行中'
  return '等待中'
}

const doneIconClass = computed(() => {
  if (stats.value.fail > 0) return 'is-err'
  if (stats.value.warn > 0) return 'is-warn'
  return ''
})
const doneIcon = computed(() => (stats.value.fail > 0 ? '✗' : '✓'))
const doneText = computed(() => {
  if (stats.value.fail > 0) return '审查未通过'
  if (stats.value.warn > 0) return '审查完成（有警告）'
  return '审查全部通过'
})
</script>

<template>
  <div class="sg-modal-mask" :class="{ show: store.compModalOpen }" @click.self="store.closeComplianceModal()">
    <div class="sg-modal">
      <div class="sg-modal-head">
        <div class="sg-modal-title">合规校验</div>
        <div class="sg-modal-close" @click="store.closeComplianceModal()">✕</div>
      </div>
      <div class="sg-modal-body">
        <p class="hint">
          依据招标文件编制规范<b>逐项校验合规性</b>，标注问题与建议。
        </p>
        <div class="sg-ai-panel">
          <div class="sg-ai-panel__head">
            <span class="sg-ai-panel__label">合规校验</span>
            <span class="sg-ai-panel__text">{{ headText }}</span>
            <span class="sg-ai-panel__badge" :class="badge.cls">{{ badge.txt }}</span>
          </div>
          <div class="sg-ai-bar">
            <div class="sg-ai-bar__fill" :class="{ success: status === 'done' }" :style="{ width: percent }"></div>
            <span class="sg-ai-bar__pct">{{ percent }}</span>
          </div>
          <ul class="sg-ai-steps">
            <li
              v-for="(s, i) in subs"
              :key="s.key"
              class="sg-ai-step"
              :class="'is-' + subState(i)"
            >
              <span class="sg-ai-step__icon" :class="'is-' + subState(i)">
                <template v-if="subState(i) === 'success'">✓</template>
              </span>
              <span class="sg-ai-step__label">{{ s.txt }}</span>
              <span class="sg-ai-step__meta">{{ subMeta(subState(i)) }}</span>
            </li>
          </ul>
          <div v-if="status === 'done'" class="sg-ai-done show">
            <span class="sg-ai-done__icon" :class="doneIconClass">{{ doneIcon }}</span>
            <span class="sg-ai-done__text">
              {{ doneText }} · 通过 <span class="num">{{ stats.pass }}</span> / 警告 <span class="num">{{ stats.warn }}</span> / 不通过 <span class="num">{{ stats.fail }}</span>
            </span>
          </div>
        </div>

        <!-- 结果 -->
        <div v-if="status === 'done'" class="sg-result-section">
          <div class="sg-result-block">
            <div class="sg-cmp-summary" :class="stats.overall === 'pass' ? '' : 'is-' + stats.overall">
              <div>
                <div class="sg-cmp-summary__big">{{ stats.big }}</div>
                <div class="sg-cmp-summary__label">整体合规结论</div>
              </div>
              <div class="sg-cmp-summary__items">
                <span class="sg-cmp-pill pass"><span class="n">{{ stats.pass }}</span> 通过</span>
                <span class="sg-cmp-pill warn"><span class="n">{{ stats.warn }}</span> 警告</span>
                <span class="sg-cmp-pill fail"><span class="n">{{ stats.fail }}</span> 不通过</span>
              </div>
            </div>
            <div class="sg-result-head">
              检查明细
              <span class="sg-rh-count">共 {{ store.COMPLIANCE_CHECKS.length }} 项</span>
            </div>
            <div class="sg-cmp-check-head">
              <span></span><span>审查维度</span><span>具体内容</span><span>技术手段</span><span>结果</span>
            </div>
            <div>
              <div
                v-for="c in store.COMPLIANCE_CHECKS"
                :key="c.title"
                class="sg-cmp-row"
                :class="c.status"
              >
                <div class="sg-cmp-row__icon">{{ STATUS_ICON[c.status] }}</div>
                <div class="sg-cmp-row__body">
                  <div class="sg-cmp-row__title">{{ c.title }}</div>
                  <div class="sg-cmp-row__desc">
                    {{ c.desc }}
                    <br />
                    <span class="loc">📍 {{ c.loc }}</span>
                  </div>
                </div>
                <div class="sg-cmp-row__method"><b>{{ c.method }}</b></div>
                <span class="sg-cmp-status" :class="c.status">{{ STATUS_LABEL[c.status] }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div class="sg-modal-foot">
        <button class="sg-btn sg-btn-ghost" @click="store.closeComplianceModal()">关闭</button>
        <button v-if="status === 'done'" class="sg-btn sg-btn-secondary" @click="store.retryCompliance()">重新校验</button>
        <button v-if="status === 'idle'" class="sg-btn sg-btn-primary" @click="store.runCompliance()">开始校验</button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.hint {
  font-size: 13px;
  color: var(--ink-3);
  margin: 0 0 14px;
}
.hint b {
  color: var(--ink-2);
}
.loc {
  color: var(--ink-3);
  font-size: 11px;
}
</style>

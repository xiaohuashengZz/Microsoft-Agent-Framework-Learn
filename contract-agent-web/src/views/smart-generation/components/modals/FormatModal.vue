<script setup lang="ts">
import { computed } from 'vue'
import { useSmartGenerationStore } from '@/stores/smart-generation'

const store = useSmartGenerationStore()

const status = computed(() => store.fmtStatus)
const subs = computed(() => store.FORMAT_SUB_STEPS)
const percent = computed(() => store.fmtPercent + '%')

const badge = computed(() => {
  const s = status.value
  if (s === 'running') return { cls: 'running', txt: '处理中' }
  if (s === 'done') return { cls: 'success', txt: '已完成' }
  return { cls: 'idle', txt: '待启动' }
})

const headText = computed(() => {
  const s = status.value
  if (s === 'running') {
    const sub = subs.value[store.fmtSubsDone - 1]
    return sub ? sub.txt + '…' : '处理中…'
  }
  if (s === 'done') return '共 ' + subs.value.length + ' 项全部完成'
  return '等待启动'
})

function subState(i: number): 'pending' | 'success' | 'running' {
  const s = status.value
  if (s === 'running') {
    if (i < store.fmtSubsDone - 1) return 'success'
    if (i === store.fmtSubsDone - 1) return 'running'
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

/** 格式化规则总数 */
const totalRules = computed(() =>
  store.FMT_CELLS.reduce((sum, c) => sum + c.rules.length, 0),
)
</script>

<template>
  <div class="sg-modal-mask" :class="{ show: store.fmtModalOpen }" @click.self="store.closeFormatModal()">
    <div class="sg-modal">
      <div class="sg-modal-head">
        <div class="sg-modal-title">文件格式标准化</div>
        <div class="sg-modal-close" @click="store.closeFormatModal()">✕</div>
      </div>
      <div class="sg-modal-body">
        <p class="hint">
          按范本规范<b>统一标题层级、段落样式、编号与页眉页脚</b>。
        </p>
        <div class="sg-ai-panel">
          <div class="sg-ai-panel__head">
            <span class="sg-ai-panel__label">格式生成</span>
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
            <span class="sg-ai-done__icon">✓</span>
            <span class="sg-ai-done__text">
              应用 <span class="num">4</span> 类共 <span class="num">{{ totalRules }}</span> 条格式化规则
            </span>
          </div>
        </div>

        <!-- 结果 -->
        <div v-if="status === 'done'" class="sg-result-section">
          <div class="sg-result-block">
            <div class="sg-result-head">
              格式化规则应用
              <span class="sg-rh-count">{{ totalRules }} 项</span>
            </div>
            <div class="sg-header-footer">
              <div class="sg-hf-row">
                <span class="left">{{项目名称}}招标文件</span>
                <span class="right">招标编号：{{招标编号}}</span>
              </div>
              <div class="sg-hf-row">
                <span class="left">第 {{页码}} 页 · 共 {{总页数}} 页</span>
                <span class="right">{{招标人}} · {{日期}}</span>
              </div>
            </div>
            <div class="sg-fmt-grid">
              <div v-for="cell in store.FMT_CELLS" :key="cell.title" class="sg-fmt-cell">
                <div class="sg-fmt-cell__head">
                  <span class="ico">{{ cell.ico }}</span>
                  {{ cell.title }}
                </div>
                <div
                  v-for="rule in cell.rules"
                  :key="rule.k"
                  class="sg-fmt-rule"
                >
                  <span class="k">{{ rule.k }}</span>
                  <span class="v ok">✓ {{ rule.v }}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div class="sg-modal-foot">
        <button class="sg-btn sg-btn-ghost" @click="store.closeFormatModal()">关闭</button>
        <button v-if="status === 'done'" class="sg-btn sg-btn-secondary" @click="store.retryFormat()">重新生成</button>
        <button v-if="status === 'idle'" class="sg-btn sg-btn-primary" @click="store.runFormat()">开始生成</button>
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
</style>

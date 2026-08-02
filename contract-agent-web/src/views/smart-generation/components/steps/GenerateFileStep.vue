<script setup lang="ts">
import { computed } from 'vue'
import { useSmartGenerationStore } from '@/stores/smart-generation'

const store = useSmartGenerationStore()

/** 进度条类名 */
const barFillClass = computed(() => ({
  success: store.genStatus === 'done',
}))

/** 进度条百分比文本 */
const pctText = computed(() => store.genPercent + '%')

/** 状态徽章类名与文本 */
const badge = computed(() => {
  const s = store.genStatus
  if (s === 'running') return { cls: 'running', txt: '生成中' }
  if (s === 'done') return { cls: 'success', txt: '已完成' }
  return { cls: '', txt: '待启动' }
})

/** 顶部说明文本 */
const headText = computed(() => {
  const s = store.genStatus
  if (s === 'running') {
    const sub = store.GEN_SUB_STEPS[store.genSubsDone - 1]
    return sub ? sub.txt + '…' : '生成中…'
  }
  if (s === 'done') return '初稿已生成'
  return '等待启动'
})

/** 子步骤状态：返回每个 sub 的 sst（pending/done/active） */
function subState(i: number): 'pending' | 'done' | 'active' {
  const s = store.genStatus
  if (s === 'running') {
    if (i < store.genSubsDone - 1) return 'done'
    if (i === store.genSubsDone - 1) return 'active'
    return 'pending'
  }
  if (s === 'done') return 'done'
  return 'pending'
}

function subMeta(i: number): string {
  const sst = subState(i)
  if (sst === 'done' || sst === 'active') return store.GEN_SUB_STEPS[i].meta
  if (sst === 'done') return '已完成'
  if (sst === 'active') return '进行中'
  return '等待中'
}
</script>

<template>
  <section class="chapter show">
    <p class="ch-hint">
      AI 将基于项目信息和已选范本<b>生成招标文件初稿</b>，生成后进入详细编辑。
    </p>

    <div class="gen-panel">
      <div class="gen-panel-head">
        <span class="gen-panel-label">文件生成</span>
        <span class="gen-panel-text">{{ headText }}</span>
        <span class="gen-panel-badge" :class="badge.cls">{{ badge.txt }}</span>
      </div>
      <div class="gen-bar">
        <div class="gen-bar-fill" :class="barFillClass" :style="{ width: pctText }"></div>
        <span class="gen-bar-pct">{{ pctText }}</span>
      </div>
      <ul class="gen-steps">
        <li
          v-for="(s, i) in store.GEN_SUB_STEPS"
          :key="s.key"
          class="gen-step"
          :class="subState(i)"
        >
          <span class="gen-step-icon">
            <template v-if="subState(i) === 'done'">✓</template>
          </span>
          <div class="gen-step-body">
            <div class="gen-step-label">{{ s.txt }}</div>
            <div class="gen-step-meta">{{ subMeta(i) }}</div>
          </div>
        </li>
      </ul>
    </div>

    <div v-if="store.genStatus === 'done'" class="gen-summary">
      <div class="gen-summary-title"><span class="ok">✓</span>初稿已生成</div>
      <div class="gen-summary-stats">
        <div class="gen-stat-item">
          <span class="gen-stat-num">8</span>
          <span class="gen-stat-lbl">章节数</span>
        </div>
        <div class="gen-stat-item">
          <span class="gen-stat-num">16</span>
          <span class="gen-stat-lbl">填充字段</span>
        </div>
        <div class="gen-stat-item">
          <span class="gen-stat-num">约 8,200</span>
          <span class="gen-stat-lbl">字数</span>
        </div>
        <div class="gen-stat-item">
          <span class="gen-stat-num">94%</span>
          <span class="gen-stat-lbl">平均置信度</span>
        </div>
      </div>
    </div>
  </section>
</template>

<style scoped>
.chapter {
  animation: sg-fade-in 0.35s ease;
  padding-top: 20px;
}
.ch-hint {
  font-size: 13px;
  color: var(--ink-3);
  line-height: 1.5;
  margin: 0 0 18px;
}
.ch-hint b {
  color: var(--ink-2);
  font-weight: 600;
}

.gen-panel {
  background: var(--bg);
  border: 1px solid var(--line-soft);
  border-radius: var(--radius);
  padding: 24px 26px;
}
.gen-panel-head {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 16px;
  flex-wrap: wrap;
}
.gen-panel-label {
  font-size: 16px;
  font-weight: 600;
  color: var(--ink);
}
.gen-panel-text {
  font-size: 13px;
  color: var(--ink-2);
  flex: 1;
  min-width: 0;
}
.gen-panel-badge {
  padding: 4px 12px;
  border-radius: 999px;
  font-size: 12px;
  font-weight: 600;
  background: var(--bg-2);
  color: var(--ink-3);
}
.gen-panel-badge.running {
  background: var(--brand-soft);
  color: var(--brand-press);
}
.gen-panel-badge.success {
  background: #e8f9ec;
  color: #1a8a3a;
}

.gen-bar {
  width: 100%;
  height: 12px;
  background: var(--bg-2);
  border-radius: 999px;
  overflow: hidden;
  position: relative;
}
.gen-bar-fill {
  height: 100%;
  width: 0;
  background: linear-gradient(90deg, var(--brand), #4aa3ff);
  border-radius: 999px;
  transition: width 0.45s cubic-bezier(0.4, 0, 0.2, 1);
}
.gen-bar-fill.success {
  background: var(--ok);
}
.gen-bar-pct {
  position: absolute;
  right: 10px;
  top: 50%;
  transform: translateY(-50%);
  font-size: 11px;
  color: var(--ink-3);
  font-weight: 600;
}

.gen-steps {
  margin: 18px 0 0;
  padding: 0;
  list-style: none;
}
.gen-step {
  display: flex;
  align-items: flex-start;
  gap: 12px;
  padding: 10px 0;
  font-size: 14px;
  line-height: 22px;
  border-top: 1px dashed var(--line-soft);
}
.gen-step:first-child {
  border-top: 0;
}
.gen-step-icon {
  width: 24px;
  height: 24px;
  flex-shrink: 0;
  border-radius: 50%;
  background: var(--bg-2);
  color: var(--ink-3);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 12px;
  font-weight: 700;
  margin-top: -1px;
}
.gen-step.done .gen-step-icon {
  background: #e8f9ec;
  color: var(--ok);
}
.gen-step.active .gen-step-icon {
  background: var(--brand-soft);
  color: var(--brand);
  position: relative;
}
.gen-step.active .gen-step-icon::after {
  content: '';
  position: absolute;
  width: 12px;
  height: 12px;
  border: 2px solid var(--brand);
  border-top-color: transparent;
  border-radius: 50%;
  animation: sg-spin 0.7s linear infinite;
}
.gen-step-body {
  flex: 1;
  min-width: 0;
}
.gen-step-label {
  font-weight: 500;
  color: var(--ink);
}
.gen-step-meta {
  color: var(--ink-3);
  font-size: 12px;
  margin-top: 3px;
}
.gen-step.active .gen-step-meta {
  color: var(--brand);
}
.gen-step.done .gen-step-meta {
  color: var(--ok);
}

.gen-summary {
  margin-top: 22px;
  padding: 20px 22px;
  background: linear-gradient(135deg, #e8f9ec, #f3f6fb);
  border-radius: var(--radius);
}
.gen-summary-title {
  font-size: 16px;
  font-weight: 600;
  color: var(--ink);
  margin-bottom: 14px;
  display: flex;
  align-items: center;
  gap: 8px;
}
.gen-summary-title .ok {
  color: var(--ok);
  font-size: 20px;
}
.gen-summary-stats {
  display: flex;
  gap: 24px;
  flex-wrap: wrap;
}
.gen-stat-item {
  display: flex;
  flex-direction: column;
  gap: 2px;
}
.gen-stat-num {
  font-size: 22px;
  font-weight: 700;
  color: var(--brand);
  font-variant-numeric: tabular-nums;
}
.gen-stat-lbl {
  font-size: 12px;
  color: var(--ink-3);
}
</style>

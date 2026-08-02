<script setup lang="ts">
import { useSmartGenerationStore } from '@/stores/smart-generation'

const store = useSmartGenerationStore()
</script>

<template>
  <section class="chapter show">
    <p class="ch-hint">
      AI 已根据项目信息检索匹配范本，<b>首项为推荐项</b>，请选择用于生成文件的范本。
    </p>
    <div class="rec-meta">
      <span class="rec-status" :class="store.templateRecStatusClass">
        <span class="dot"></span>
        <span class="txt">{{ store.templateRecStatusText }}</span>
      </span>
      <span class="rec-count">{{ store.templateRecCount }}</span>
    </div>

    <div class="cand-list">
      <template v-if="store.templateDone">
        <div
          v-for="item in store.AGENT_CANDIDATES.template"
          :key="item.id"
          class="cand"
          :class="{ selected: store.templatePick === item.id }"
          @click="store.pickTemplate(item.id)"
        >
          <div class="cand-head">
            <div class="cand-name">
              {{ item.name }}
              <span v-if="item.rec" class="cand-rec">推荐</span>
            </div>
            <div class="cand-score">匹配度 {{ item.score }}%</div>
          </div>
          <p class="cand-reason">{{ item.reason }}</p>
          <span class="cand-check"></span>
        </div>
      </template>
    </div>

    <div class="rec-summary">
      <span class="dot-ok" :class="{ done: !!store.pickedTemplate }"></span>
      <span>范本：<span>{{ store.templateRecSummaryText }}</span></span>
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

.rec-meta {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 14px;
}
.rec-status {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  font-size: 13px;
  color: var(--ink-3);
}
.rec-status .dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: var(--ink-3);
}
.rec-status.running .dot {
  background: var(--brand);
  animation: sg-pulse 1s ease-in-out infinite;
}
.rec-status.done .dot {
  background: var(--ok);
}
.rec-count {
  font-size: 13px;
  color: var(--ink-3);
}

.cand-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}
.cand {
  background: var(--bg);
  border: 2px solid var(--line-soft);
  border-radius: var(--radius);
  padding: 20px 22px;
  cursor: pointer;
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
  position: relative;
}
.cand:hover {
  border-color: var(--brand-line);
  background: #fafbfc;
}
.cand.selected {
  border-color: var(--brand);
  background: var(--brand-soft);
}
.cand-head {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 16px;
  margin-bottom: 8px;
}
.cand-name {
  font-size: 16px;
  font-weight: 600;
  color: var(--ink);
  line-height: 1.4;
  flex: 1;
  padding-right: 30px;
}
.cand-score {
  font-size: 13px;
  color: var(--ink-3);
  font-weight: 500;
  flex-shrink: 0;
}
.cand.selected .cand-score {
  color: var(--brand);
  font-weight: 600;
}
.cand-reason {
  font-size: 14px;
  color: var(--ink-2);
  line-height: 1.6;
  margin: 0;
}
.cand-check {
  position: absolute;
  top: 20px;
  right: 22px;
  width: 22px;
  height: 22px;
  border-radius: 50%;
  border: 2px solid var(--line);
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s;
}
.cand.selected .cand-check {
  background: var(--brand);
  border-color: var(--brand);
}
.cand.selected .cand-check::after {
  content: '✓';
  color: #fff;
  font-size: 13px;
}
.cand-rec {
  display: inline-block;
  font-size: 11px;
  font-weight: 600;
  padding: 2px 8px;
  background: var(--brand);
  color: #fff;
  border-radius: 4px;
  margin-left: 8px;
  vertical-align: middle;
}

.rec-summary {
  margin-top: 20px;
  padding: 14px 18px;
  background: var(--bg-2);
  border-radius: var(--radius-sm);
  display: flex;
  align-items: center;
  gap: 10px;
  font-size: 13px;
  color: var(--ink-2);
}
.rec-summary .dot-ok {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: var(--ink-3);
}
.rec-summary .dot-ok.done {
  background: var(--ok);
}
</style>

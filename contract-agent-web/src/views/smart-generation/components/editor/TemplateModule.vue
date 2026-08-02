<script setup lang="ts">
import { useSmartGenerationStore } from '@/stores/smart-generation'

const store = useSmartGenerationStore()
</script>

<template>
  <div class="module-pane module-pane-template show">
    <div class="template-source-layout">
      <!-- 左侧文件来源导航 -->
      <aside class="template-source-nav">
        <div class="template-source-nav-title">文件来源</div>
        <button
          class="template-source-item"
          :class="{ active: store.templateSource === 'ai' }"
          @click="store.switchTemplateSource('ai')"
        >
          <span class="ico">✨</span>
          <span class="lbl">AI 智能生成</span>
          <span v-if="store.templateSource === 'ai'" class="badge">当前</span>
        </button>
        <button
          class="template-source-item"
          :class="{ active: store.templateSource === 'platform' }"
          @click="store.switchTemplateSource('platform')"
        >
          <span class="ico">📚</span>
          <span class="lbl">平台范本</span>
        </button>
        <button
          class="template-source-item"
          :class="{ active: store.templateSource === 'mine' }"
          @click="store.switchTemplateSource('mine')"
        >
          <span class="ico">📁</span>
          <span class="lbl">我的文件</span>
        </button>
      </aside>

      <!-- 右侧详情 -->
      <div class="template-source-main">
        <!-- AI 智能生成：左范本 + 右概览 -->
        <div v-show="store.templateSource === 'ai'" class="template-source-split">
          <div class="tpl-split-left">
            <p class="ch-hint" style="margin-top: 0">
              AI 已根据项目信息检索匹配范本，<b>首项为推荐项</b>，可在第 2 步或此处重新选择。
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
          </div>

          <aside class="tpl-split-right">
            <div class="tpl-summary-title">AI 智能生成</div>
            <div class="tpl-summary-sub">基于第 2 步推荐范本自动创建的当前招标文件</div>
            <ul class="tpl-summary-list">
              <li><span class="lbl">生成方式</span><b>AI 智能生成</b></li>
              <li>
                <span class="lbl">应用范本</span>
                <b>{{ store.pickedTemplate ? '已基于「' + store.pickedTemplate.name + '」生成当前招标文件。' : '已基于推荐范本生成当前招标文件。' }}</b>
              </li>
              <li><span class="lbl">生成时间</span><b>刚刚</b></li>
              <li><span class="lbl">章节 / 字段</span><b>8 章节 · 16 字段</b></li>
            </ul>
            <div class="tpl-meta-foot">
              <button class="sg-btn sg-btn-primary" @click="store.switchEditorModule('edit')">进入详细编辑</button>
              <span class="tpl-view-pick-info">当前文件由 AI 智能生成</span>
            </div>
          </aside>
        </div>

        <!-- 平台范本 -->
        <div v-show="store.templateSource === 'platform'" class="template-source-empty">
          平台范本库仅作占位演示，请通过「AI 智能生成」在第 2 步「范本推荐」中选择主文档范本。
        </div>

        <!-- 我的文件 -->
        <div v-show="store.templateSource === 'mine'" class="template-source-empty">
          我的文件仅作占位演示，历史文件入口位于顶部右上角。
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.module-pane {
  display: flex;
  flex: 1;
  min-height: 0;
  overflow: hidden;
}
.module-pane-template {
  flex-direction: row;
}
.template-source-layout {
  display: flex;
  flex: 1;
  min-height: 0;
  background: var(--bg-3);
}
.template-source-nav {
  width: 220px;
  flex-shrink: 0;
  background: var(--bg);
  border-right: 1px solid var(--line-soft);
  padding: 16px 12px;
  display: flex;
  flex-direction: column;
  gap: 6px;
}
.template-source-nav-title {
  font-size: 12px;
  font-weight: 600;
  color: var(--ink-3);
  letter-spacing: 0.04em;
  padding: 4px 10px 8px;
}
.template-source-item {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px 12px;
  border-radius: 8px;
  cursor: pointer;
  transition: background 0.2s, color 0.2s;
  background: transparent;
  border: none;
  text-align: left;
  width: 100%;
  color: var(--ink-2);
  font-size: 14px;
}
.template-source-item:hover {
  background: var(--bg-2);
  color: var(--ink);
}
.template-source-item.active {
  background: var(--brand-soft);
  color: var(--brand);
  font-weight: 600;
}
.template-source-item .ico {
  width: 18px;
  text-align: center;
}
.template-source-item .lbl {
  flex: 1;
}
.template-source-item .badge {
  font-size: 11px;
  background: var(--brand);
  color: #fff;
  padding: 1px 8px;
  border-radius: 999px;
}
.template-source-main {
  flex: 1;
  min-width: 0;
  padding: 24px 32px;
  overflow-y: auto;
}

.template-source-split {
  display: grid;
  grid-template-columns: minmax(0, 1fr) 360px;
  gap: 28px;
  align-items: start;
}
.tpl-split-left {
  min-width: 0;
}
.tpl-split-right {
  background: var(--bg);
  border: 1px solid var(--line-soft);
  border-radius: var(--radius);
  padding: 22px 24px;
  position: sticky;
  top: 0;
}
.tpl-summary-title {
  font-size: 22px;
  font-weight: 700;
  color: var(--ink);
  margin-bottom: 4px;
}
.tpl-summary-sub {
  font-size: 13px;
  color: var(--ink-3);
  margin-bottom: 18px;
}
.tpl-summary-list {
  list-style: none;
  padding: 0;
  margin: 0 0 18px;
  display: flex;
  flex-direction: column;
  gap: 12px;
}
.tpl-summary-list li {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  gap: 16px;
  font-size: 14px;
  color: var(--ink-2);
}
.tpl-summary-list .lbl {
  color: var(--ink-3);
  flex-shrink: 0;
}
.tpl-summary-list b {
  color: var(--ink);
  font-weight: 600;
  text-align: right;
}
.tpl-meta-foot {
  margin-top: 20px;
  display: flex;
  align-items: center;
  gap: 14px;
  flex-wrap: wrap;
}
.tpl-view-pick-info {
  font-size: 13px;
  color: var(--ink-3);
}
.template-source-empty {
  background: var(--bg);
  border: 1px dashed var(--line-soft);
  border-radius: var(--radius);
  padding: 24px;
  color: var(--ink-3);
  font-size: 14px;
  text-align: center;
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

@media (max-width: 1100px) {
  .template-source-split {
    grid-template-columns: 1fr;
  }
  .tpl-split-right {
    position: static;
  }
}
</style>

<script setup lang="ts">
import { useSmartGenerationStore } from '@/stores/smart-generation'

const store = useSmartGenerationStore()
</script>

<template>
  <!-- 选中内容浮动工具条 -->
  <div
    class="selection-toolbar"
    :class="{ show: store.selectionToolbarPos.show }"
    :style="{
      left: store.selectionToolbarPos.left + 'px',
      top: store.selectionToolbarPos.top + 'px',
    }"
  >
    <button class="st-btn ai" @click="store.showActionPanel('polish')">✨ AI 润色</button>
    <button class="st-btn" @click="store.showActionPanel('format')">📐 格式标准化</button>
    <button class="st-btn" @click="store.showActionPanel('insert')">＋ 插入变量</button>
    <span class="st-divider"></span>
    <button class="st-btn" @click="store.showToast('已复制（演示）')">复制</button>
  </div>

  <!-- 工具条触发的动作面板 -->
  <div
    class="st-action-panel"
    :class="{ show: store.actionPanelPos.show }"
    :style="{
      left: store.actionPanelPos.left + 'px',
      top: store.actionPanelPos.top + 'px',
    }"
  >
    <div class="st-action-panel-title">
      {{ store.stActionMode ? store.ST_ACTIONS[store.stActionMode]?.title : '' }}
    </div>
    <div class="st-action-list">
      <div
        v-for="(it, i) in (store.stActionMode ? store.ST_ACTIONS[store.stActionMode]?.items : [])"
        :key="i"
        class="st-action-item"
        :class="{ selected: store.stActionPick === i }"
        @click="store.pickStAction(i)"
      >
        <span class="ico">{{ it.ico }}</span>
        <div>
          <div>
            {{ it.name }}
            <span v-if="it.sub" class="rec-tag">{{ it.sub }}</span>
          </div>
          <div class="desc">{{ it.desc || '' }}</div>
        </div>
      </div>
    </div>
    <div class="st-action-foot">
      <button class="cancel" @click="store.hideActionPanel()">取消</button>
      <button class="confirm" @click="store.applyStAction()">应用</button>
    </div>
  </div>
</template>

<style scoped>
.selection-toolbar {
  position: fixed;
  display: none;
  background: var(--ink);
  color: #fff;
  border-radius: 10px;
  padding: 4px;
  box-shadow: 0 6px 24px rgba(0, 0, 0, 0.22);
  z-index: 1060;
  gap: 2px;
  align-items: center;
  transform: translateX(-50%);
}
.selection-toolbar.show {
  display: flex;
}
.selection-toolbar::after {
  content: '';
  position: absolute;
  bottom: -6px;
  left: 50%;
  transform: translateX(-50%);
  width: 0;
  height: 0;
  border-left: 6px solid transparent;
  border-right: 6px solid transparent;
  border-top: 6px solid var(--ink);
}
.st-btn {
  padding: 7px 11px;
  font-size: 12px;
  color: rgba(255, 255, 255, 0.85);
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.15s;
  white-space: nowrap;
  display: inline-flex;
  align-items: center;
  gap: 4px;
  font-weight: 500;
}
.st-btn:hover {
  background: rgba(255, 255, 255, 0.14);
  color: #fff;
}
.st-btn.ai {
  background: var(--ai-grad);
  color: #fff;
}
.st-btn.ai:hover {
  opacity: 0.92;
}
.st-divider {
  width: 1px;
  height: 16px;
  background: rgba(255, 255, 255, 0.2);
  margin: 0 3px;
}

.st-action-panel {
  position: fixed;
  display: none;
  background: var(--bg);
  color: var(--ink);
  border-radius: var(--radius-sm);
  box-shadow: var(--shadow-lg);
  padding: 14px;
  z-index: 1070;
  min-width: 280px;
  transform: translateX(-50%);
}
.st-action-panel.show {
  display: block;
}
.st-action-panel-title {
  font-size: 13px;
  font-weight: 600;
  color: var(--ink);
  margin-bottom: 10px;
  display: flex;
  align-items: center;
  gap: 6px;
}
.st-action-list {
  display: flex;
  flex-direction: column;
  gap: 6px;
}
.st-action-item {
  padding: 9px 11px;
  border-radius: 7px;
  cursor: pointer;
  transition: background 0.15s;
  display: flex;
  align-items: center;
  gap: 9px;
  font-size: 13px;
  color: var(--ink-2);
}
.st-action-item:hover {
  background: var(--bg-2);
  color: var(--ink);
}
.st-action-item.selected {
  background: var(--brand-soft);
  color: var(--brand-press);
}
.st-action-item.selected .ico {
  background: var(--brand);
  color: #fff;
}
.st-action-item .ico {
  width: 22px;
  height: 22px;
  border-radius: 6px;
  background: var(--ai-grad-soft);
  color: var(--ai-violet);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 12px;
  flex-shrink: 0;
}
.st-action-item .desc {
  font-size: 11px;
  color: var(--ink-3);
}
.rec-tag {
  display: inline-block;
  font-size: 10px;
  font-weight: 600;
  padding: 1px 6px;
  background: var(--brand);
  color: #fff;
  border-radius: 3px;
  margin-left: 6px;
  vertical-align: middle;
}
.st-action-foot {
  margin-top: 10px;
  padding-top: 10px;
  border-top: 1px solid var(--line-soft);
  font-size: 11px;
  color: var(--ink-3);
  display: flex;
  justify-content: flex-end;
  gap: 8px;
}
.st-action-foot button {
  padding: 5px 12px;
  border-radius: 6px;
  font-size: 12px;
  cursor: pointer;
}
.st-action-foot .cancel {
  color: var(--ink-2);
}
.st-action-foot .cancel:hover {
  background: var(--bg-2);
}
.st-action-foot .confirm {
  background: var(--brand);
  color: #fff;
}
.st-action-foot .confirm:hover {
  background: var(--brand-press);
}
</style>

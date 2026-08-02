<script setup lang="ts">
import { useSmartGenerationStore } from '@/stores/smart-generation'

const store = useSmartGenerationStore()

defineProps<{
  /** 是否处于 OnlyOffice 真实编辑器模式 */
  onlyOfficeMode: boolean
}>()

const emit = defineEmits<{
  (e: 'toggle-mode'): void
}>()

function onRevision() {
  store.showToast('修订记录 · 演示占位')
}
function onSave() {
  store.showToast('已保存（演示）')
}
</script>

<template>
  <div class="editor-topline">
    <div class="editor-tl-title">武汉市轨道交通12号线工程 · 招标文件.docx</div>

    <!-- OnlyOffice / 预览模式切换 -->
    <button
      class="editor-tl-btn mode-toggle"
      :class="{ active: onlyOfficeMode }"
      :title="onlyOfficeMode ? '当前为 OnlyOffice 真实编辑器，点击切换到预览' : '当前为预览模式，点击切换到 OnlyOffice 真实编辑器'"
      @click="emit('toggle-mode')"
    >
      {{ onlyOfficeMode ? 'OnlyOffice 编辑器' : '文档预览' }}
    </button>

    <button class="editor-tl-btn ai-btn" @click="store.openAIDrawer()">✨ AI助手</button>
    <div class="editor-tl-divider"></div>
    <button class="editor-tl-btn" @click="onRevision">修订记录</button>
    <button class="editor-tl-btn" @click="onSave">保存</button>
    <button
      class="editor-tl-btn primary"
      :disabled="store.submitting"
      @click="store.submitDocument()"
    >
      {{ store.submitting ? '保存中…' : '完成编辑' }}
    </button>
  </div>
</template>

<style scoped>
.editor-topline {
  flex-shrink: 0;
  height: 48px;
  background: var(--bg);
  border-bottom: 1px solid var(--line-soft);
  display: flex;
  align-items: center;
  padding: 0 16px;
  gap: 8px;
}
.editor-tl-title {
  font-size: 14px;
  font-weight: 600;
  color: var(--ink);
  margin-right: auto;
  padding-left: 8px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.editor-tl-btn {
  height: 32px;
  padding: 0 12px;
  border-radius: 6px;
  font-size: 13px;
  color: var(--ink-2);
  display: inline-flex;
  align-items: center;
  gap: 5px;
  transition: all 0.15s;
  white-space: nowrap;
  background: transparent;
  cursor: pointer;
}
.editor-tl-btn:hover {
  background: var(--bg-2);
  color: var(--ink);
}
.editor-tl-btn.primary {
  background: var(--brand);
  color: #fff;
}
.editor-tl-btn.primary:hover {
  background: var(--brand-press);
  color: #fff;
}
.editor-tl-btn.primary:disabled {
  opacity: 0.7;
  cursor: not-allowed;
}
.editor-tl-btn.ai-btn {
  background: var(--ai-grad);
  color: #fff;
  font-weight: 500;
}
.editor-tl-btn.ai-btn:hover {
  opacity: 0.92;
  color: #fff;
}
.editor-tl-btn.mode-toggle {
  border: 1px solid var(--brand-line);
  color: var(--brand-press);
  background: var(--brand-soft);
}
.editor-tl-btn.mode-toggle.active {
  background: var(--brand);
  color: #fff;
  border-color: var(--brand);
}
.editor-tl-btn.mode-toggle:hover {
  opacity: 0.92;
}
.editor-tl-divider {
  width: 1px;
  height: 18px;
  background: var(--line-soft);
  margin: 0 2px;
}
</style>

<script setup lang="ts">
import { ref } from 'vue'
import { useSmartGenerationStore } from '@/stores/smart-generation'

const store = useSmartGenerationStore()
const keyword = ref('')

function onRefresh() {
  store.showToast('已刷新')
}
function onBatchEdit() {
  store.showToast('批量编辑 · 演示占位')
}
</script>

<template>
  <div class="editor-nav">
    <div class="nav-header">
      <span class="nav-title">导航</span>
      <button class="nav-refresh" @click="onRefresh">刷新</button>
    </div>
    <div class="nav-search">
      <input v-model="keyword" type="text" placeholder="搜索章节或变量…" />
    </div>
    <div class="catalog-header">
      <span>标书目录（{{ store.CHAPTER_TREE.length }}）</span>
      <span class="catalog-batch-edit" @click="onBatchEdit">批量编辑</span>
    </div>
    <div class="nav-tree">
      <div
        v-for="ch in store.CHAPTER_TREE"
        :key="ch.id"
        class="nav-node"
        :class="{ active: store.activeChapter === ch.id }"
        @click="store.selectChapter(ch.id)"
      >
        <div class="nav-node-chapter">
          <span class="ico">📁</span>
          <span class="name">{{ ch.name }}</span>
          <span v-if="ch.vars.length > 0" class="var-count">{{ ch.vars.length }} 个变量</span>
        </div>
        <div
          v-for="v in ch.vars"
          :key="v.name"
          class="nav-node-var"
        >
          <span class="dot" :class="{ unfilled: !v.filled }"></span>
          {{ v.name }}
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.editor-nav {
  width: 280px;
  flex-shrink: 0;
  background: var(--bg);
  border-right: 1px solid var(--line-soft);
  display: flex;
  flex-direction: column;
  overflow: hidden;
}
.nav-header {
  padding: 14px 16px 10px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  border-bottom: 1px solid var(--line-soft);
  flex-shrink: 0;
}
.nav-title {
  font-size: 13px;
  font-weight: 600;
  color: var(--ink);
}
.nav-refresh {
  height: 24px;
  padding: 0 8px;
  font-size: 12px;
  border-radius: 6px;
  color: var(--ink-2);
  cursor: pointer;
  background: transparent;
}
.nav-refresh:hover {
  background: var(--bg-2);
  color: var(--brand);
}
.nav-search {
  padding: 10px 12px;
  border-bottom: 1px solid var(--line-soft);
  flex-shrink: 0;
}
.nav-search input {
  width: 100%;
  height: 30px;
  padding: 0 10px;
  border: 1px solid var(--line-soft);
  border-radius: 6px;
  font-size: 12px;
  background: var(--bg-2);
  color: var(--ink);
  outline: none;
}
.nav-search input:focus {
  border-color: var(--brand-line);
  background: var(--bg);
}
.catalog-header {
  padding: 10px 16px 6px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  font-size: 12px;
  color: var(--ink-3);
  flex-shrink: 0;
}
.catalog-batch-edit {
  color: var(--brand);
  font-size: 12px;
  cursor: pointer;
}
.catalog-batch-edit:hover {
  text-decoration: underline;
}
.nav-tree {
  flex: 1;
  overflow-y: auto;
  padding: 4px 8px 16px;
}
.nav-node {
  padding: 6px 8px;
  cursor: pointer;
  border-radius: 6px;
  transition: background 0.15s;
}
.nav-node:hover {
  background: var(--bg-2);
}
.nav-node.active {
  background: var(--brand-soft);
}
.nav-node-chapter {
  display: flex;
  align-items: center;
  gap: 6px;
}
.nav-node-chapter .ico {
  color: var(--ink-3);
  font-size: 14px;
}
.nav-node-chapter .name {
  font-size: 13px;
  font-weight: 500;
  color: var(--ink);
  flex: 1;
}
.nav-node-chapter .var-count {
  font-size: 11px;
  color: var(--ink-3);
  background: var(--bg-2);
  padding: 1px 6px;
  border-radius: 999px;
}
.nav-node-var {
  padding-left: 28px;
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 12px;
  color: var(--ink-2);
  line-height: 22px;
}
.nav-node-var .dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: var(--brand);
  flex-shrink: 0;
}
.nav-node-var .dot.unfilled {
  background: var(--warn);
}

@media (max-width: 768px) {
  .editor-nav {
    width: 200px;
  }
}
</style>

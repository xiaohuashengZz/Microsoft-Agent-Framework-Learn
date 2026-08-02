<script setup lang="ts">
import { computed } from 'vue'
import { useSmartGenerationStore } from '@/stores/smart-generation'

const store = useSmartGenerationStore()

/** 「模板」按钮：步4 切换模板模块；其他步回到步1 */
function onTemplateClick() {
  if (store.current === 4) {
    store.switchEditorModule('template')
  } else {
    store.goto(1)
  }
}

/** 「编辑」按钮：步4 切换编辑模块；其他步尝试进入步4 */
function onEditClick() {
  if (store.current === 4) {
    store.switchEditorModule('edit')
  } else if (store.isStepDone(3)) {
    store.goto(4)
  } else {
    store.showToast('请先完成文件生成')
  }
}

/** 模板项是否激活：步4 时取 editorModule，其他步默认模板激活 */
const templateActive = computed(() =>
  store.current === 4 ? store.editorModule === 'template' : true,
)
/** 编辑项是否激活 */
const editActive = computed(() =>
  store.current === 4 ? store.editorModule === 'edit' : false,
)
</script>

<template>
  <aside class="module-rail">
    <button
      class="module-rail-item"
      :class="{ active: templateActive }"
      title="模板"
      @click="onTemplateClick"
    >
      <span class="module-rail-icon">▤</span>
      <span>模板</span>
    </button>
    <button
      class="module-rail-item"
      :class="{ active: editActive }"
      title="编辑"
      @click="onEditClick"
    >
      <span class="module-rail-icon">▣</span>
      <span>编辑</span>
    </button>
  </aside>
</template>

<style scoped>
.module-rail {
  width: 44px;
  flex-shrink: 0;
  background: #edf1f6;
  border-right: 1px solid #dfe5ee;
  display: flex;
  flex-direction: column;
  align-items: stretch;
}
.module-rail-item {
  width: 44px;
  flex: 1;
  padding: 10px 8px;
  border-left: 2px solid transparent;
  color: #5d6775;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  justify-content: center;
  gap: 5px;
  font-size: 12px;
  cursor: pointer;
  background: transparent;
  transition: all 0.15s;
}
.module-rail-item:hover {
  color: var(--brand);
  background: #e5edf8;
}
.module-rail-item.active {
  color: var(--brand);
  background: #dcecff;
  border-left-color: var(--brand);
  font-weight: 600;
}
.module-rail-icon {
  font-size: 20px;
  line-height: 1;
}
</style>

<script setup lang="ts">
import { ref } from 'vue'
import { useSmartGenerationStore } from '@/stores/smart-generation'
import EditorTopBar from '../editor/EditorTopBar.vue'
import ChapterTree from '../editor/ChapterTree.vue'
import OnlyOfficeEditor from '../editor/OnlyOfficeEditor.vue'
import AiAssistant from '../editor/AiAssistant.vue'
import SelectionToolbar from '../editor/SelectionToolbar.vue'
import SaveOverlay from '../editor/SaveOverlay.vue'
import TemplateModule from '../editor/TemplateModule.vue'

const store = useSmartGenerationStore()

/** 编辑器模式：true=OnlyOffice 真实编辑器；false=文档预览（支持选中工具条）*/
const onlyOfficeMode = ref(false)

function toggleMode() {
  onlyOfficeMode.value = !onlyOfficeMode.value
}
</script>

<template>
  <section class="chapter show editor-chapter">
    <div class="editor-root">
      <div class="module-stage">
        <!-- 「模板」模块 -->
        <TemplateModule v-show="store.editorModule === 'template'" />

        <!-- 「编辑」模块 -->
        <div v-show="store.editorModule === 'edit'" class="module-pane module-pane-edit show">
          <EditorTopBar :only-office-mode="onlyOfficeMode" @toggle-mode="toggleMode" />

          <div class="editor-workspace">
            <ChapterTree />
            <OnlyOfficeEditor :only-office-mode="onlyOfficeMode" />
            <AiAssistant />
          </div>
        </div>
      </div>
    </div>

    <!-- 选中工具条 + 动作面板（浮层）-->
    <SelectionToolbar />

    <!-- 保存遮罩 -->
    <SaveOverlay />
  </section>
</template>

<style scoped>
.editor-chapter {
  display: flex;
  flex-direction: column;
  flex: 1;
  min-height: 0;
  overflow: hidden;
  padding-top: 0;
}
.editor-root {
  display: flex;
  flex-direction: column;
  flex: 1;
  min-height: 0;
  background: var(--bg-3);
}
.module-stage {
  flex: 1;
  min-width: 0;
  min-height: 0;
  display: flex;
  flex-direction: column;
}
.module-pane {
  display: flex;
  flex: 1;
  min-height: 0;
  overflow: hidden;
}
.module-pane-edit {
  flex-direction: column;
}
.editor-workspace {
  flex: 1;
  display: flex;
  overflow: hidden;
  min-height: 0;
}
</style>

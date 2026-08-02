<script setup lang="ts">
import { useSmartGenerationStore } from '@/stores/smart-generation'
import PortalHeader from './components/PortalHeader.vue'
import Stepper from './components/Stepper.vue'
import ActionBar from './components/ActionBar.vue'
import ModuleRail from './components/ModuleRail.vue'
import ProjectInfoStep from './components/steps/ProjectInfoStep.vue'
import TemplateRecommendStep from './components/steps/TemplateRecommendStep.vue'
import GenerateFileStep from './components/steps/GenerateFileStep.vue'
import DocumentEditorStep from './components/steps/DocumentEditorStep.vue'
import FormatModal from './components/modals/FormatModal.vue'
import ComplianceModal from './components/modals/ComplianceModal.vue'

const store = useSmartGenerationStore()

/** portal-tabs：步1-3 仅作演示，步4 隐藏（由模板模块内文件来源接管）*/
function onPortalTabClick(target: string) {
  if (store.isEditorStep) {
    store.switchTemplateSource(target as 'ai' | 'platform' | 'mine')
    if (store.editorModule !== 'template') store.switchEditorModule('template')
    store.showToast(
      target === 'ai' ? 'AI 智能生成（当前）' : target === 'platform' ? '平台范本（演示）' : '我的文件（演示）',
    )
  } else if (target !== 'ai') {
    store.showToast('该标签仅为演示占位，当前位于「AI 智能生成」')
  }
}
</script>

<template>
  <div class="smart-generation-root" :class="{ 'step-editor': store.isEditorStep }">
    <!-- 顶部导航栏 -->
    <PortalHeader />

    <!-- 中间内容区 -->
    <main class="content">
      <div class="content-inner" :class="{ wide: store.isEditorStep }">
        <!-- 左侧一级模块栏（常驻）-->
        <ModuleRail />

        <div class="content-main">
          <!-- portal-tabs 子界面（步4 隐藏）-->
          <div v-if="!store.isEditorStep" class="portal-tabs">
            <button
              class="portal-tab"
              :class="{ active: false }"
              @click="onPortalTabClick('platform')"
            >
              平台范本
            </button>
            <button class="portal-tab active" @click="onPortalTabClick('ai')">AI 智能生成</button>
            <button class="portal-tab" @click="onPortalTabClick('mine')">我的文件</button>
            <span class="portal-tab-spacer"></span>
            <span class="portal-tab-action">从历史文件进入</span>
          </div>

          <!-- 步骤导航（步4 隐藏）-->
          <Stepper v-if="!store.isEditorStep" />

          <!-- 各步骤内容 -->
          <ProjectInfoStep v-if="store.current === 1" />
          <TemplateRecommendStep v-else-if="store.current === 2" />
          <GenerateFileStep v-else-if="store.current === 3" />
          <DocumentEditorStep v-else-if="store.current === 4" />
        </div>
      </div>
    </main>

    <!-- 底部按钮栏（步4 隐藏）-->
    <ActionBar v-if="!store.isEditorStep" />

    <!-- 浮窗 -->
    <FormatModal />
    <ComplianceModal />

    <!-- Toast -->
    <div class="sg-toast" :class="{ show: store.toastVisible }">{{ store.toastText }}</div>
  </div>
</template>

<style scoped>
.content {
  flex: 1;
  overflow-y: auto;
  padding: 0 40px 32px;
  min-height: 0;
}
.step-editor .content {
  padding: 0;
  overflow: hidden;
}

.content-inner {
  max-width: 980px;
  margin: 0 auto;
  display: flex;
  flex-direction: row;
  align-items: stretch;
  gap: 0;
}
.content-inner.wide {
  max-width: none;
  height: 100%;
}

.content-main {
  flex: 1;
  min-width: 0;
  min-height: 0;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

/* portal-tabs */
.portal-tabs {
  padding: 0;
  display: flex;
  align-items: center;
  gap: 4px;
  border-bottom: 1px solid var(--line-soft);
  background: rgba(255, 255, 255, 0.5);
  flex-shrink: 0;
  height: 44px;
}
.portal-tab {
  padding: 12px 22px;
  font-size: 14px;
  font-weight: 500;
  color: #6b7280;
  cursor: pointer;
  position: relative;
  transition: color 0.2s;
  border: none;
  background: none;
}
.portal-tab:hover {
  color: var(--brand);
}
.portal-tab.active {
  color: var(--brand);
  font-weight: 600;
}
.portal-tab.active::after {
  content: '';
  position: absolute;
  left: 22px;
  right: 22px;
  bottom: -1px;
  height: 2.5px;
  background: var(--brand);
  border-radius: 2px;
}
.portal-tab-spacer {
  flex: 1;
}
.portal-tab-action {
  font-size: 13px;
  color: #9ca3af;
  padding: 6px 10px;
}

@media (max-width: 768px) {
  .content {
    padding: 24px 20px 24px;
  }
  .portal-tab {
    padding: 12px 14px;
  }
}
</style>

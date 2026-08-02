<script setup lang="ts">
import { ref, nextTick, onMounted, onBeforeUnmount } from 'vue'
import { useSmartGenerationStore } from '@/stores/smart-generation'
import OnlyOfficeEditor from '@/components/OnlyOfficeEditor.vue'

const store = useSmartGenerationStore()
const props = defineProps<{
  /** 是否处于 OnlyOffice 真实编辑器模式 */
  onlyOfficeMode: boolean
}>()

const canvasRef = ref<HTMLDivElement | null>(null)
let stBound = false
let mousedownHandler: ((e: MouseEvent) => void) | null = null

/** 文档字段点击 */
function onFieldClick(code: string) {
  store.selectField(code)
}

/** 处理选区，触发浮动工具条 */
function handleSelection() {
  setTimeout(() => {
    const sel = window.getSelection ? window.getSelection() : null
    const text = sel ? sel.toString().trim() : ''
    if (!text || text.length < 2) {
      store.hideSelectionToolbar()
      return
    }
    if (!sel || sel.rangeCount === 0) return
    const range = sel.getRangeAt(0)
    if (!canvasRef.value || !canvasRef.value.contains(range.commonAncestorContainer)) return
    const rect = range.getBoundingClientRect()
    store.showSelectionToolbar(rect.left + rect.width / 2, rect.top - 44, text)
  }, 10)
}

/** 绑定选区监听 */
function bindSelectionToolbar() {
  const canvas = canvasRef.value
  if (!canvas || stBound) return
  stBound = true
  canvas.addEventListener('mouseup', handleSelection)
  canvas.addEventListener('touchend', handleSelection)
  mousedownHandler = (e: MouseEvent) => {
    const target = e.target as HTMLElement
    if (
      !target.closest('.selection-toolbar') &&
      !target.closest('.st-action-panel') &&
      !canvasRef.value?.contains(target)
    ) {
      store.hideSelectionToolbar()
      store.hideActionPanel()
    }
  }
  document.addEventListener('mousedown', mousedownHandler)
}

onMounted(() => {
  nextTick(() => bindSelectionToolbar())
})

onBeforeUnmount(() => {
  if (mousedownHandler) {
    document.removeEventListener('mousedown', mousedownHandler)
    mousedownHandler = null
  }
})

/** OnlyOffice 编辑器事件 */
function onOOError(msg: string) {
  // 占位提示已由组件内部处理
  console.warn('[OnlyOffice]', msg)
}
</script>

<template>
  <div class="editor-view">
    <!-- OnlyOffice 真实编辑器模式 -->
    <div v-if="props.onlyOfficeMode" class="oo-stage">
      <OnlyOfficeEditor
        title="武汉市轨道交通12号线工程 · 招标文件.docx"
        file-type="docx"
        document-key="smart-gen-doc-v1"
        server-url="http://localhost:8080"
        @error="onOOError"
      />
    </div>

    <!-- 文档预览模式（支持字段点击 + 选中工具条）-->
    <div v-else class="canvas-container">
      <div ref="canvasRef" class="doc-canvas">
        <h3 class="doc-title">
          武汉市轨道交通12号线工程<br />土建施工总承包招标文件
        </h3>
        <h4 class="doc-h">第一章 投标须知</h4>
        <p>
          本招标项目名称为「<span class="doc-field" data-field="projectName" @click.stop="onFieldClick('projectName')">{{ store.PROJECT_INFO.projectName }}</span>」，项目编号：<span class="doc-field" data-field="projectCode" @click.stop="onFieldClick('projectCode')">{{ store.PROJECT_INFO.projectCode }}</span>。招标方式：公开招标。
        </p>
        <p>
          招标人：<span class="doc-field" data-field="tenderer" @click.stop="onFieldClick('tenderer')">{{ store.PROJECT_INFO.tenderer }}</span>。代理机构：<span class="doc-field" data-field="agency" @click.stop="onFieldClick('agency')">{{ store.PROJECT_INFO.agency }}</span>。
        </p>
        <h4 class="doc-h">第二章 项目概况与招标范围</h4>
        <p>
          建设地点：<span class="doc-field" data-field="location" @click.stop="onFieldClick('location')">{{ store.PROJECT_INFO.location }}</span>。资金来源：<span class="doc-field" data-field="fundSource" @click.stop="onFieldClick('fundSource')">{{ store.PROJECT_INFO.fundSource }}</span>。
        </p>
        <p>武汉市轨道交通12号线工程为环线，线路全长约59.9km，设站37座，全部为地下站…</p>
        <h4 class="doc-h">第三章 投标资格要求</h4>
        <p>3.1 资质：投标人须具备市政公用工程施工总承包特级资质。</p>
        <p>3.2 业绩：近5年承担过单项合同额≥10亿元的轨道交通工程。</p>
        <p>3.3 项目经理：一级建造师（市政公用工程）+ 高级工程师。</p>
        <h4 class="doc-h">第四章 评标办法</h4>
        <p>
          本次评标采用综合评估法，总分100分。商务分40分，技术分40分，价格分<span class="doc-field unfilled" data-field="priceScore" @click.stop="onFieldClick('priceScore')">__待填写__</span>。
        </p>
        <h4 class="doc-h">第五章 合同条款</h4>
        <p>
          合同估算价：<span class="doc-field" data-field="controlPrice" @click.stop="onFieldClick('controlPrice')">{{ store.PROJECT_INFO.controlPrice }}</span>。投标保证金：<span class="doc-field" data-field="deposit" @click.stop="onFieldClick('deposit')">{{ store.PROJECT_INFO.deposit }}</span>。
        </p>
        <p>
          履约期限：<span class="doc-field unfilled" data-field="duration" @click.stop="onFieldClick('duration')">__待填写__</span>。
        </p>
      </div>
    </div>
  </div>
</template>

<style scoped>
.editor-view {
  flex: 1;
  background: var(--bg-3);
  overflow-y: auto;
  padding: 24px;
  min-width: 0;
}
.oo-stage {
  width: 100%;
  height: 100%;
  min-height: calc(100vh - 96px);
  background: var(--bg);
  border-radius: 2px;
  box-shadow: 0 1px 8px rgba(0, 0, 0, 0.08);
}
.canvas-container {
  background: var(--bg);
  max-width: 820px;
  margin: 0 auto;
  box-shadow: 0 1px 8px rgba(0, 0, 0, 0.08);
  border-radius: 2px;
  min-height: calc(100vh - 96px);
}
.doc-canvas {
  padding: 56px 64px 80px;
  font-family: "PingFang SC", "Microsoft YaHei", "SimSun", serif;
  color: #2a2a2a;
  font-size: 14px;
  line-height: 1.9;
}
.doc-canvas .doc-title {
  font-size: 22px;
  font-weight: 700;
  text-align: center;
  margin: 0 0 24px;
  letter-spacing: 2px;
  color: #1a1a1a;
}
.doc-canvas .doc-h {
  font-size: 15px;
  font-weight: 700;
  margin: 22px 0 10px;
  color: #333;
}
.doc-canvas p {
  margin: 6px 0;
  text-indent: 2em;
}
.doc-canvas .doc-field {
  background: #fff3cd;
  padding: 1px 4px;
  border-radius: 3px;
  cursor: pointer;
  transition: background 0.2s;
}
.doc-canvas .doc-field:hover {
  background: #ffe69c;
}
.doc-canvas .doc-field.active {
  background: var(--brand);
  color: #fff;
  box-shadow: 0 0 0 2px rgba(0, 132, 252, 0.3);
}
.doc-canvas .doc-field.unfilled {
  background: #fff0e6;
  border-bottom: 1px dashed var(--warn);
}
</style>

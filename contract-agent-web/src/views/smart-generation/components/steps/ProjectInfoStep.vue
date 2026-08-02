<script setup lang="ts">
import { ref } from 'vue'
import { useSmartGenerationStore } from '@/stores/smart-generation'

const store = useSmartGenerationStore()
const fileInput = ref<HTMLInputElement | null>(null)

function triggerUpload() {
  // 已有文件时不再触发选择
  if (store.uploadFile) return
  fileInput.value?.click()
}

function onFileChosen(e: Event) {
  const target = e.target as HTMLInputElement
  const f = target.files && target.files[0]
  store.onFileChosen(f)
  // 清空 input 的值，便于重新选择同一文件
  target.value = ''
}
</script>

<template>
  <section class="chapter show">
    <p class="ch-hint">请<b>确认项目信息来源</b>，核对无误后继续。</p>

    <!-- 入口卡片 -->
    <div class="entry-cards">
      <div
        class="entry-card"
        :class="{ selected: store.entryMode === 'preset' }"
        @click="store.selectEntry('preset')"
      >
        <div class="entry-card-radio"></div>
        <div>
          <div class="entry-card-title">✓ 使用已立案项目信息</div>
          <div class="entry-card-desc">AI 已带入项目立案信息，可直接核对使用。</div>
        </div>
      </div>
      <div
        class="entry-card"
        :class="{ selected: store.entryMode === 'upload' }"
        @click="store.selectEntry('upload')"
      >
        <div class="entry-card-radio"></div>
        <div>
          <div class="entry-card-title">📎 上传采购方案，AI 解析</div>
          <div class="entry-card-desc">上传 Word/PDF 采购方案，AI 自动提取项目信息。</div>
        </div>
      </div>
    </div>

    <!-- 上传区（选「上传采购方案」时显示）-->
    <div
      v-if="store.entryMode === 'upload'"
      class="upload-zone"
      :class="{ 'has-file': store.uploadFile }"
      @click="triggerUpload"
    >
      <div class="ico">📎</div>
      <div class="ttl">
        {{ store.uploadFile ? store.uploadFileName : '点击上传采购方案' }}
      </div>
      <div class="sub">
        {{ store.uploadFile ? store.uploadFileSize : '支持 .docx / .pdf，单文件 ≤ 20MB' }}
      </div>
      <input
        ref="fileInput"
        type="file"
        style="display: none"
        accept=".docx,.pdf"
        @change="onFileChosen"
      />
    </div>

    <!-- AI 解析进度 -->
    <div
      v-if="store.entryMode === 'upload' && (store.parsing || store.parseDone)"
      class="parse-progress"
      :class="{ done: store.parseDone }"
    >
      <div class="parse-progress-row">
        <div class="parse-spin"></div>
        <span>{{
          store.parseDone ? '解析完成，已回填 10 项项目信息' : 'AI 正在解析采购方案…'
        }}</span>
      </div>
    </div>

    <!-- 项目信息列表 -->
    <div class="info-list">
      <div
        v-for="row in store.PROJECT_INFO_ROWS"
        :key="row.k"
        class="info-row"
        :class="{ highlight: row.highlight }"
      >
        <div class="info-k">{{ row.k }}</div>
        <div class="info-v">{{ row.v }}</div>
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

.entry-cards {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 14px;
  margin-bottom: 22px;
}
.entry-card {
  padding: 18px 20px;
  background: var(--bg);
  border: 2px solid var(--line-soft);
  border-radius: var(--radius);
  cursor: pointer;
  transition: all 0.2s;
  display: flex;
  align-items: flex-start;
  gap: 14px;
}
.entry-card:hover {
  border-color: var(--brand-line);
}
.entry-card.selected {
  border-color: var(--brand);
  background: var(--brand-soft);
}
.entry-card-radio {
  width: 18px;
  height: 18px;
  border-radius: 50%;
  border: 2px solid var(--line);
  flex-shrink: 0;
  margin-top: 2px;
  position: relative;
  transition: all 0.2s;
}
.entry-card.selected .entry-card-radio {
  border-color: var(--brand);
}
.entry-card.selected .entry-card-radio::after {
  content: '';
  position: absolute;
  inset: 3px;
  background: var(--brand);
  border-radius: 50%;
}
.entry-card-title {
  font-size: 14px;
  font-weight: 600;
  color: var(--ink);
  margin-bottom: 4px;
}
.entry-card-desc {
  font-size: 12px;
  color: var(--ink-3);
  line-height: 1.5;
}

.upload-zone {
  margin-bottom: 18px;
  padding: 24px;
  background: var(--bg);
  border: 2px dashed var(--line);
  border-radius: var(--radius);
  text-align: center;
  cursor: pointer;
  transition: all 0.2s;
}
.upload-zone:hover {
  border-color: var(--brand);
  background: #fafbfc;
}
.upload-zone.has-file {
  border-style: solid;
  border-color: var(--ok);
  background: #f5fcf6;
  cursor: default;
}
.upload-zone .ico {
  width: 40px;
  height: 40px;
  margin: 0 auto 10px;
  border-radius: 50%;
  background: var(--brand-soft);
  color: var(--brand);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 20px;
}
.upload-zone .ttl {
  font-size: 14px;
  font-weight: 600;
  color: var(--ink);
  margin-bottom: 4px;
}
.upload-zone .sub {
  font-size: 12px;
  color: var(--ink-3);
}

.parse-progress {
  margin-bottom: 18px;
  padding: 14px 18px;
  background: var(--brand-soft);
  border-radius: var(--radius);
}
.parse-progress-row {
  display: flex;
  align-items: center;
  gap: 10px;
  font-size: 13px;
  color: var(--ink-2);
}
.parse-spin {
  width: 16px;
  height: 16px;
  border: 2px solid var(--brand-line);
  border-top-color: var(--brand);
  border-radius: 50%;
  animation: sg-spin 0.7s linear infinite;
}
.parse-progress.done .parse-spin {
  border-color: #b8efc4;
  border-top-color: var(--ok);
  animation: none;
  position: relative;
}
.parse-progress.done .parse-spin::after {
  content: '✓';
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--ok);
  font-size: 11px;
  font-weight: 700;
}

.info-list {
  background: var(--bg);
  border: 1px solid var(--line-soft);
  border-radius: var(--radius);
  overflow: hidden;
}
.info-row {
  display: grid;
  grid-template-columns: 160px 1fr;
  gap: 24px;
  padding: 16px 24px;
  border-bottom: 1px solid var(--line-soft);
  align-items: baseline;
}
.info-row:last-child {
  border-bottom: 0;
}
.info-row.highlight {
  background: var(--brand-soft);
}
.info-row.highlight .info-k,
.info-row.highlight .info-v {
  color: var(--ink);
}
.info-k {
  font-size: 13px;
  color: var(--ink-3);
  font-weight: 500;
}
.info-v {
  font-size: 15px;
  color: var(--ink);
  font-weight: 500;
}
.info-row.highlight .info-v {
  font-size: 17px;
  font-weight: 600;
}

@media (max-width: 768px) {
  .info-row {
    grid-template-columns: 1fr;
    gap: 4px;
  }
  .entry-cards {
    grid-template-columns: 1fr;
  }
}
</style>

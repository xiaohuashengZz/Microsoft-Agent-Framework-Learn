<script setup lang="ts">
import { useSmartGenerationStore } from '@/stores/smart-generation'

const store = useSmartGenerationStore()
</script>

<template>
  <div class="save-overlay" :class="{ show: store.saveOverlayShow, done: store.saveOverlayDone }">
    <div class="save-overlay-card">
      <div class="save-spin"></div>
      <div class="save-text">{{ store.saveText }}</div>
    </div>
  </div>
</template>

<style scoped>
.save-overlay {
  position: fixed;
  inset: 0;
  background: rgba(255, 255, 255, 0.7);
  backdrop-filter: blur(4px);
  -webkit-backdrop-filter: blur(4px);
  display: none;
  align-items: center;
  justify-content: center;
  z-index: 1080;
  animation: sg-fade-in 0.2s ease;
}
.save-overlay.show {
  display: flex;
}
.save-overlay-card {
  background: var(--bg);
  padding: 28px 40px;
  border-radius: var(--radius);
  box-shadow: var(--shadow-lg);
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 14px;
  min-width: 240px;
}
.save-spin {
  width: 36px;
  height: 36px;
  border: 3px solid var(--brand-line);
  border-top-color: var(--brand);
  border-radius: 50%;
  animation: sg-spin 0.7s linear infinite;
}
.save-overlay.done .save-spin {
  border-color: #b8efc4;
  border-top-color: var(--ok);
  animation: none;
  position: relative;
}
.save-overlay.done .save-spin::after {
  content: '✓';
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--ok);
  font-size: 20px;
  font-weight: 700;
}
.save-text {
  font-size: 14px;
  color: var(--ink-2);
  font-weight: 500;
}
.save-overlay.done .save-text {
  color: var(--ok);
  font-weight: 600;
}
</style>

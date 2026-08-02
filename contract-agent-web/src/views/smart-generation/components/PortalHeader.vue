<script setup lang="ts">
import { useSmartGenerationStore } from '@/stores/smart-generation'

const store = useSmartGenerationStore()
</script>

<template>
  <header class="portal-header">
    <div class="portal-bar">
      <div class="portal-brand">
        <div class="portal-logo">标</div>
        <div class="portal-title">标书制作系统</div>
      </div>
      <div class="portal-meta">
        <span>武汉市轨道交通12号线工程</span>
        <span class="portal-user"><span class="ava">张</span>张工</span>
      </div>
    </div>
  </header>
</template>

<style scoped>
.portal-header {
  flex-shrink: 0;
  background: linear-gradient(135deg, #e6f0ff 0%, #f3f6fb 100%);
  border-bottom: 1px solid #d6e4ff;
  box-shadow: 0 2px 8px rgba(0, 132, 252, 0.08);
}
.portal-bar {
  max-width: 1280px;
  margin: 0 auto;
  padding: 14px 40px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
}
.portal-brand {
  display: flex;
  align-items: center;
  gap: 10px;
}
.portal-logo {
  width: 30px;
  height: 30px;
  border-radius: 8px;
  background: var(--brand);
  color: #fff;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 15px;
  font-weight: 700;
}
.portal-title {
  font-size: 16px;
  font-weight: 700;
  color: #1f2937;
  letter-spacing: 0.02em;
}
.portal-meta {
  display: flex;
  align-items: center;
  gap: 14px;
  font-size: 13px;
  color: #4b5563;
}
.portal-user {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 4px 12px;
  background: rgba(0, 132, 252, 0.1);
  border-radius: 999px;
  color: #0069c9;
  font-weight: 500;
}
.portal-user .ava {
  width: 22px;
  height: 22px;
  border-radius: 50%;
  background: var(--brand);
  color: #fff;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 11px;
}

@media (max-width: 768px) {
  .portal-bar {
    padding: 12px 20px;
  }
  .portal-meta span:first-child {
    display: none;
  }
}
</style>

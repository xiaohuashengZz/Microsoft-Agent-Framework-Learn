<script setup lang="ts">
import { useSmartGenerationStore } from '@/stores/smart-generation'

const store = useSmartGenerationStore()
</script>

<template>
  <footer class="actionbar">
    <div class="actionbar-inner" :class="{ wide: store.current === 4 }">
      <div class="ab-status">{{ store.actionBar.hint }}</div>
      <div class="ab-btns">
        <button
          v-if="store.actionBar.showPrev"
          class="sg-btn sg-btn-ghost"
          @click="store.prev()"
        >
          ← 上一步
        </button>
        <button
          class="sg-btn sg-btn-primary"
          :disabled="store.actionBar.disabled"
          @click="store.next()"
        >
          {{ store.actionBar.label }}
        </button>
      </div>
    </div>
  </footer>
</template>

<style scoped>
.actionbar {
  flex-shrink: 0;
  background: var(--bg);
  border-top: 1px solid var(--line-soft);
  padding: 16px 40px;
}
.actionbar-inner {
  max-width: 980px;
  margin: 0 auto;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
}
.actionbar-inner.wide {
  max-width: 1240px;
}
.ab-status {
  font-size: 14px;
  color: var(--ink-2);
  flex: 1;
  min-width: 0;
}
.ab-btns {
  display: flex;
  gap: 10px;
  flex-shrink: 0;
  align-items: center;
}

@media (max-width: 768px) {
  .actionbar {
    padding: 14px 20px;
  }
}
</style>

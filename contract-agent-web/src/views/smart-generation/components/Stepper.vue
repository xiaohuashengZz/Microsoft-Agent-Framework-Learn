<script setup lang="ts">
import { computed } from 'vue'
import { useSmartGenerationStore } from '@/stores/smart-generation'

const store = useSmartGenerationStore()

const steps = computed(() => store.STEPS)
</script>

<template>
  <nav class="stepper">
    <template v-for="(s, i) in steps" :key="s.no">
      <div
        class="step"
        :class="{
          active: s.no === store.current,
          done: store.isStepDone(s.no) && s.no !== store.current,
        }"
        @click="store.goto(s.no)"
      >
        <div class="step-dot">
          <span v-if="!(store.isStepDone(s.no) && s.no !== store.current)" class="step-dot-num">{{ s.no }}</span>
        </div>
        <span class="step-label">{{ s.label }}</span>
      </div>
      <div
        v-if="i < steps.length - 1"
        class="step-line"
        :class="{ done: store.isStepDone(s.no) }"
      ></div>
    </template>
  </nav>
</template>

<style scoped>
.stepper {
  padding: 14px 0 10px;
  display: flex;
  align-items: center;
  gap: 0;
  background: var(--bg);
  border-bottom: 1px solid var(--line-soft);
  flex-shrink: 0;
}
.step {
  display: flex;
  align-items: center;
  gap: 10px;
  cursor: pointer;
  flex: 0 0 auto;
}
.step-dot {
  width: 28px;
  height: 28px;
  border-radius: 50%;
  background: var(--bg-2);
  color: var(--ink-3);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 13px;
  font-weight: 600;
  transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
  border: 2px solid transparent;
}
.step.active .step-dot {
  background: var(--brand);
  color: #fff;
  transform: scale(1.05);
}
.step.done .step-dot {
  background: var(--brand);
  color: #fff;
}
.step.done .step-dot::after {
  content: '✓';
}
.step.done .step-dot-num {
  display: none;
}
.step-label {
  font-size: 14px;
  color: var(--ink-3);
  font-weight: 500;
  transition: color 0.25s;
  white-space: nowrap;
}
.step.active .step-label {
  color: var(--ink);
  font-weight: 600;
}
.step.done .step-label {
  color: var(--ink-2);
}
.step-line {
  flex: 1;
  height: 2px;
  background: var(--line-soft);
  margin: 0 14px;
  border-radius: 1px;
  transition: background 0.3s;
  min-width: 20px;
}
.step-line.done {
  background: var(--brand);
}

@media (max-width: 768px) {
  .stepper {
    padding-left: 20px;
    padding-right: 20px;
  }
  .step-label {
    display: none;
  }
  .step {
    gap: 0;
  }
}
</style>

<script setup lang="ts">
import { ref, nextTick, watch } from 'vue'
import { useSmartGenerationStore } from '@/stores/smart-generation'

const store = useSmartGenerationStore()
const inputText = ref('')
const chatListRef = ref<HTMLDivElement | null>(null)

/** 发送对话 */
function onSend() {
  const text = inputText.value
  if (!text.trim()) return
  store.sendChat(text)
  inputText.value = ''
}

/** 回车发送，Shift+回车换行 */
function onKeydown(e: KeyboardEvent) {
  if (e.key === 'Enter' && !e.shiftKey) {
    e.preventDefault()
    onSend()
  }
}

/** 当前智能体运行结果列表 */
function agentResultList(key: string) {
  return store.AGENT_CANDIDATES[key] || []
}

/** 当前智能体名称 */
function agentName(key: string) {
  return store.AGENTS.find(a => a.key === key)?.name || ''
}
function agentIco(key: string) {
  return store.AGENTS.find(a => a.key === key)?.ico || ''
}

/** 滚动到底部 */
watch(
  () => store.chat.length,
  () => {
    nextTick(() => {
      if (chatListRef.value) chatListRef.value.scrollTop = chatListRef.value.scrollHeight
    })
  },
)
</script>

<template>
  <aside class="ai-pane" :class="{ hidden: !store.aiDrawerOpen }">
    <!-- 顶栏 -->
    <header class="ai-pane-header">
      <div class="ai-pane-brand">标书 AI 助手</div>
      <div class="ai-pane-actions">
        <button class="ai-pane-icon" title="新建会话" @click="store.newChat()">✦ 新建会话</button>
        <button class="ai-pane-icon" title="收起" @click="store.closeAIDrawer()">✕</button>
      </div>
    </header>

    <!-- 智能体快捷区 -->
    <div class="ai-agents-strip">
      <div class="agent-grid">
        <div
          v-for="a in store.AGENTS"
          :key="a.key"
          class="agent-card"
          :class="{ done: !!store.agentPicks[a.key] }"
          :title="a.desc"
          @click="store.runAgent(a.key)"
        >
          <div class="agent-card-head">
            <div class="agent-card-ico">{{ a.ico }}</div>
            <div class="agent-card-name">
              {{ a.name }}
              <span v-if="store.agentPicks[a.key]" class="agent-done-mark">✓</span>
            </div>
          </div>
        </div>
      </div>
      <div class="agent-grid agent-grid-tools">
        <div
          class="agent-card"
          title="按范本规范统一标题层级、段落样式、编号与页眉页脚。"
          @click="store.openFormatModal()"
        >
          <div class="agent-card-head">
            <div class="agent-card-ico">📐</div>
            <div class="agent-card-name">文件格式标准化</div>
          </div>
        </div>
        <div
          class="agent-card"
          title="依据招标文件编制规范逐项校验合规性，标注问题与建议。"
          @click="store.openComplianceModal()"
        >
          <div class="agent-card-head">
            <div class="agent-card-ico">🛡️</div>
            <div class="agent-card-name">
              合规校验
              <span v-if="store.compHasIssue" class="tl-badge">{{ store.compStats.warn + store.compStats.fail }}</span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 消息列表 -->
    <div ref="chatListRef" class="ai-chat-list">
      <div v-if="store.chat.length === 0" class="ai-chat-empty">
        <div class="ai-chat-empty-ico">🤖</div>
        <div class="ai-chat-empty-ttl">有什么可以帮你？</div>
        <div class="ai-chat-empty-sub">可在下方直接提问，或点击上方智能体快速运行。</div>
      </div>
      <div
        v-for="(m, i) in store.chat"
        :key="i"
        class="ai-msg"
        :class="m.role"
      >
        <div class="ai-msg-bubble">{{ m.text }}</div>
        <div class="ai-msg-meta">{{ m.role === 'user' ? '我' : 'AI 助手' }} · {{ m.time }}</div>
      </div>
    </div>

    <!-- 智能体运行进度 -->
    <div v-if="store.agentRunning" class="agent-mini-progress show">
      <div class="spin"></div>
      <span>{{ agentName(store.agentRunning) }} · 检索中…</span>
    </div>

    <!-- 智能体运行结果 -->
    <div
      v-if="store.agentRunning === null && store.agentPicks.qual !== undefined && (store.agentPicks.qual || store.agentPicks.eval)"
      class="agent-result show"
    >
      <template v-for="key in ['qual', 'eval']" :key="key">
        <template v-if="store.agentPicks[key]">
          <div class="agent-result-title">
            <span>{{ agentIco(key) }} {{ agentName(key) }} 结果</span>
            <span class="agent-result-count">{{ agentResultList(key).length }} 项</span>
          </div>
          <div class="agent-result-list">
            <div
              v-for="c in agentResultList(key)"
              :key="c.id"
              class="agent-cand"
              :class="{ selected: store.agentPicks[key] === c.id }"
              @click="store.pickAgent(key, c.id)"
            >
              <div class="agent-cand-head">
                <div class="agent-cand-name">
                  {{ c.name }}
                  <span v-if="c.rec" class="agent-cand-rec">推荐</span>
                </div>
                <div class="agent-cand-score">匹配度 {{ c.score }}%</div>
              </div>
              <p class="agent-cand-reason">{{ c.reason }}</p>
            </div>
          </div>
        </template>
      </template>
    </div>

    <!-- 底部输入区 -->
    <footer class="ai-pane-input">
      <div class="ai-input-box">
        <textarea
          v-model="inputText"
          class="ai-input-area"
          placeholder="输入你的问题，回车发送；Shift+回车换行"
          @keydown="onKeydown"
        ></textarea>
        <div class="ai-input-row">
          <div class="ai-input-tools">
            <button class="ai-input-tool" title="@">@</button>
            <button class="ai-input-tool" title="#">#</button>
          </div>
          <div class="ai-input-right">
            <select class="ai-model-select">
              <option>GLM-5.1</option>
              <option>GPT-4</option>
              <option>Claude</option>
            </select>
            <button class="ai-input-tool" title="语音">🎤</button>
            <button class="ai-send-btn" title="发送" @click="onSend">↑</button>
          </div>
        </div>
      </div>
    </footer>
  </aside>
</template>

<style scoped>
.ai-pane {
  width: 380px;
  flex-shrink: 0;
  background: var(--bg);
  border-left: 1px solid var(--line-soft);
  display: flex;
  flex-direction: column;
  overflow: hidden;
  min-height: 0;
}
.ai-pane.hidden {
  display: none;
}

.ai-pane-header {
  flex-shrink: 0;
  height: 44px;
  padding: 0 12px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  border-bottom: 1px solid var(--line-soft);
}
.ai-pane-brand {
  font-size: 14px;
  font-weight: 600;
  color: var(--ink);
}
.ai-pane-actions {
  display: flex;
  align-items: center;
  gap: 4px;
}
.ai-pane-icon {
  border: none;
  background: transparent;
  border-radius: 6px;
  font-size: 12px;
  color: var(--ink-2);
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  height: 28px;
  padding: 0 8px;
  gap: 4px;
}
.ai-pane-icon:hover {
  background: var(--bg-2);
  color: var(--ink);
}

.ai-agents-strip {
  flex-shrink: 0;
  padding: 12px;
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 8px;
  border-bottom: 1px solid var(--line-soft);
  background: var(--bg-2);
}
.agent-grid {
  display: contents;
}
.agent-card {
  padding: 10px 12px;
  border: 1px solid var(--line-soft);
  border-radius: 8px;
  background: var(--bg);
  cursor: pointer;
  transition: all 0.15s;
  display: flex;
  align-items: center;
}
.agent-card:hover {
  border-color: var(--brand);
  background: #f0f6ff;
  transform: translateY(-1px);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
}
.agent-card.done {
  border-color: var(--brand);
  background: rgba(0, 132, 252, 0.06);
}
.agent-card-head {
  display: flex;
  align-items: center;
  gap: 8px;
  width: 100%;
}
.agent-card-ico {
  font-size: 18px;
  line-height: 1;
  flex-shrink: 0;
}
.agent-card-name {
  font-size: 12px;
  font-weight: 500;
  color: var(--ink);
  line-height: 1.3;
}
.agent-done-mark {
  color: var(--brand);
  font-weight: 700;
}
.tl-badge {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 16px;
  height: 16px;
  padding: 0 4px;
  border-radius: 999px;
  background: var(--err);
  color: #fff;
  font-size: 10px;
  font-weight: 700;
  margin-left: 4px;
}

.ai-chat-list {
  flex: 1;
  overflow-y: auto;
  padding: 16px 14px;
  display: flex;
  flex-direction: column;
  gap: 12px;
  min-height: 0;
}
.ai-chat-empty {
  margin: auto;
  text-align: center;
  color: var(--ink-3);
  padding: 20px 0;
}
.ai-chat-empty-ico {
  font-size: 36px;
  margin-bottom: 10px;
}
.ai-chat-empty-ttl {
  font-size: 15px;
  font-weight: 600;
  color: var(--ink-2);
  margin-bottom: 4px;
}
.ai-chat-empty-sub {
  font-size: 12px;
  line-height: 1.5;
}

.ai-msg {
  display: flex;
  flex-direction: column;
  max-width: 92%;
}
.ai-msg.user {
  align-self: flex-end;
  align-items: flex-end;
}
.ai-msg.bot {
  align-self: flex-start;
  align-items: flex-start;
}
.ai-msg-bubble {
  padding: 9px 12px;
  border-radius: 12px;
  font-size: 13px;
  line-height: 1.55;
  word-break: break-word;
  white-space: pre-wrap;
}
.ai-msg.user .ai-msg-bubble {
  background: var(--brand);
  color: #fff;
  border-bottom-right-radius: 4px;
}
.ai-msg.bot .ai-msg-bubble {
  background: var(--bg-2);
  color: var(--ink);
  border-bottom-left-radius: 4px;
}
.ai-msg-meta {
  font-size: 10px;
  color: var(--ink-3);
  margin-top: 4px;
  padding: 0 4px;
}

.agent-mini-progress {
  flex-shrink: 0;
  margin: 0 14px 12px;
  padding: 14px 16px;
  background: var(--brand-soft);
  border-radius: var(--radius-sm);
  font-size: 12px;
  color: var(--brand-press);
  display: flex;
  align-items: center;
  gap: 10px;
}
.agent-mini-progress .spin {
  width: 14px;
  height: 14px;
  border: 2px solid var(--brand-line);
  border-top-color: var(--brand);
  border-radius: 50%;
  animation: sg-spin 0.7s linear infinite;
}

.agent-result {
  flex-shrink: 0;
  margin: 0 14px 12px;
  padding: 14px;
  background: var(--bg-2);
  border-radius: var(--radius);
}
.agent-result-title {
  font-size: 13px;
  font-weight: 600;
  color: var(--ink);
  margin-bottom: 12px;
  display: flex;
  align-items: center;
  gap: 8px;
}
.agent-result-count {
  margin-left: auto;
  font-size: 12px;
  color: var(--ink-3);
  font-weight: 500;
}
.agent-result-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}
.agent-cand {
  padding: 12px 14px;
  background: var(--bg);
  border: 1px solid var(--line-soft);
  border-radius: var(--radius-sm);
  cursor: pointer;
  transition: all 0.15s;
}
.agent-cand:hover {
  border-color: var(--brand-line);
}
.agent-cand.selected {
  border-color: var(--brand);
  background: var(--brand-soft);
}
.agent-cand-head {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 10px;
  margin-bottom: 4px;
}
.agent-cand-name {
  font-size: 13px;
  font-weight: 600;
  color: var(--ink);
  flex: 1;
  line-height: 1.4;
}
.agent-cand-score {
  font-size: 12px;
  color: var(--ink-3);
  font-weight: 500;
  flex-shrink: 0;
}
.agent-cand.selected .agent-cand-score {
  color: var(--brand);
  font-weight: 600;
}
.agent-cand-reason {
  font-size: 12px;
  color: var(--ink-2);
  margin: 0;
  line-height: 1.5;
}
.agent-cand-rec {
  font-size: 10px;
  font-weight: 600;
  padding: 1px 6px;
  background: var(--brand);
  color: #fff;
  border-radius: 3px;
  margin-left: 6px;
  vertical-align: middle;
}

.ai-pane-input {
  flex-shrink: 0;
  padding: 10px 14px 12px;
  border-top: 1px solid var(--line-soft);
  background: var(--bg);
}
.ai-input-box {
  border: 1px solid var(--line-soft);
  border-radius: 10px;
  padding: 8px 10px 6px;
  background: var(--bg);
  transition: border-color 0.15s;
}
.ai-input-box:focus-within {
  border-color: var(--brand);
  box-shadow: 0 0 0 3px rgba(0, 132, 252, 0.08);
}
.ai-input-area {
  width: 100%;
  min-height: 60px;
  max-height: 140px;
  border: none;
  padding: 4px 6px;
  font-size: 13px;
  color: var(--ink);
  resize: none;
  font-family: inherit;
  box-sizing: border-box;
  background: transparent;
  outline: none;
}
.ai-input-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-top: 8px;
}
.ai-input-tools {
  display: flex;
  gap: 4px;
}
.ai-input-tool {
  width: 26px;
  height: 26px;
  border: none;
  background: transparent;
  border-radius: 6px;
  font-size: 13px;
  color: var(--ink-2);
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
}
.ai-input-tool:hover {
  background: var(--bg-2);
  color: var(--ink);
}
.ai-input-right {
  display: flex;
  align-items: center;
  gap: 6px;
}
.ai-model-select {
  height: 24px;
  border: none;
  background: transparent;
  font-size: 12px;
  color: var(--ink-2);
  cursor: pointer;
  outline: none;
}
.ai-send-btn {
  width: 28px;
  height: 28px;
  border: none;
  border-radius: 7px;
  background: var(--brand);
  color: #fff;
  font-size: 13px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
}
.ai-send-btn:hover {
  background: var(--brand-press);
}

@media (max-width: 768px) {
  .ai-pane {
    width: 100vw;
  }
}
</style>

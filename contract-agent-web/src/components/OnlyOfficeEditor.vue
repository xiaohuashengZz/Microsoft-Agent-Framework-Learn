<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount, watch } from 'vue'

/* ============================================================
   OnlyOffice 文档编辑器集成组件
   - 通过 <script> 引入 OnlyOffice JS SDK（index.html 已引入兜底）
   - 使用 new DocsAPI.DocEditor() 创建编辑器实例
   - 提供 loading / error 状态与友好占位提示
   - JWT 令牌、文档 URL 由后端 API 提供（演示阶段使用占位值）
   ============================================================ */

const props = withDefaults(
  defineProps<{
    /** 文档标题 */
    title?: string
    /** 文件类型，如 docx */
    fileType?: string
    /** 文档唯一 key（用于 OnlyOffice 识别文档版本） */
    documentKey?: string
    /** 文档下载地址（后端提供） */
    documentUrl?: string
    /** 回调地址（OnlyOffice 保存回调） */
    callbackUrl?: string
    /** 用户名 */
    userName?: string
    /** 用户 ID */
    userId?: string
    /** OnlyOffice 服务地址，默认 http://localhost:8080 */
    serverUrl?: string
    /** JWT 令牌（OnlyOffice 服务端开启 JWT 时必填） */
    token?: string
    /** 高度，默认 100% */
    height?: string
  }>(),
  {
    title: '武汉市轨道交通12号线工程 · 招标文件.docx',
    fileType: 'docx',
    documentKey: 'smart-gen-doc-v1',
    documentUrl: '',
    callbackUrl: '',
    userName: '张工',
    userId: 'zhang',
    serverUrl: 'http://localhost:8080',
    token: '',
    height: '100%',
  },
)

const emit = defineEmits<{
  (e: 'ready'): void
  (e: 'error', msg: string): void
}>()

const containerRef = ref<HTMLDivElement | null>(null)
const loading = ref(true)
const errorMsg = ref('')
let editor: any = null

/** OnlyOffice SDK 全局声明 */
declare global {
  interface Window {
    DocsAPI?: any
  }
}

/** 动态加载 OnlyOffice SDK（若 index.html 未引入则按需加载） */
function loadSdk(serverUrl: string): Promise<void> {
  return new Promise((resolve, reject) => {
    if (window.DocsAPI) {
      resolve()
      return
    }
    const existing = document.querySelector<HTMLScriptElement>(
      `script[data-onlyoffice-sdk]`,
    )
    if (existing) {
      existing.addEventListener('load', () => resolve())
      existing.addEventListener('error', () => reject(new Error('OnlyOffice SDK 加载失败')))
      return
    }
    const script = document.createElement('script')
    script.src = `${serverUrl}/web-apps/apps/api/documents/api.js`
    script.async = true
    script.dataset.onlyOfficeSdk = 'true'
    script.onload = () => {
      if (window.DocsAPI) resolve()
      else reject(new Error('OnlyOffice SDK 加载失败：window.DocsAPI 未定义'))
    }
    script.onerror = () => reject(new Error(`无法连接 OnlyOffice 服务（${serverUrl}），请确认 Docker 已启动`))
    document.head.appendChild(script)
  })
}

/** 销毁编辑器实例 */
function destroyEditor() {
  if (editor) {
    try {
      editor.destroyEditor()
    } catch (e) {
      // 忽略销毁异常
    }
    editor = null
  }
}

/** 初始化编辑器 */
async function initEditor() {
  loading.value = true
  errorMsg.value = ''
  destroyEditor()
  try {
    await loadSdk(props.serverUrl)
    if (!containerRef.value) return
    const config: any = {
      document: {
        fileType: props.fileType,
        key: props.documentKey,
        title: props.title,
        url: props.documentUrl || `${props.serverUrl}/example/demo.docx`,
        permissions: {
          edit: true,
          download: true,
          print: true,
          review: true,
        },
      },
      documentType: 'word',
      editorConfig: {
        mode: 'edit',
        callbackUrl: props.callbackUrl || `${props.serverUrl}/track`,
        user: {
          id: props.userId,
          name: props.userName,
        },
        customization: {
          autosave: true,
          forcesave: true,
          compactHeader: false,
          toolbarNoTabs: false,
          chat: false,
          comments: true,
        },
      },
      height: props.height,
      width: '100%',
      events: {
        onAppReady: () => {
          loading.value = false
          emit('ready')
        },
        onError: (e: any) => {
          const msg = (e && e.data && e.data.errorDescription) || '编辑器发生错误'
          errorMsg.value = msg
          loading.value = false
          emit('error', msg)
        },
      },
    }
    // 若提供 JWT 令牌，加入 token 字段
    if (props.token) {
      config.token = props.token
    }
    editor = new window.DocsAPI.DocEditor(containerRef.value, config)
    // 兜底：若 onAppReady 未触发，1.2s 后关闭 loading
    setTimeout(() => {
      if (loading.value) loading.value = false
    }, 1200)
  } catch (e: any) {
    errorMsg.value = e?.message || 'OnlyOffice 初始化失败'
    loading.value = false
    emit('error', errorMsg.value)
  }
}

/** 重试 */
function retry() {
  initEditor()
}

onMounted(() => {
  initEditor()
})

onBeforeUnmount(() => {
  destroyEditor()
})

// 文档信息变化时重建编辑器
watch(
  () => [props.documentKey, props.documentUrl, props.title],
  () => {
    initEditor()
  },
)
</script>

<template>
  <div class="onlyoffice-wrapper">
    <!-- 加载态 -->
    <div v-if="loading" class="oo-loading">
      <div class="oo-spin"></div>
      <div class="oo-loading-text">正在加载 OnlyOffice 文档编辑器…</div>
      <div class="oo-loading-sub">首次加载可能需要数秒</div>
    </div>

    <!-- 错误态：Docker 未启动等 -->
    <div v-else-if="errorMsg" class="oo-error">
      <div class="oo-error-ico">📄</div>
      <div class="oo-error-ttl">文档编辑器暂不可用</div>
      <div class="oo-error-desc">{{ errorMsg }}</div>
      <div class="oo-error-hint">
        请确认：
        <br />1. OnlyOffice Docker 服务已启动（默认端口 8080）
        <br />2. 后端 API 已返回文档 URL 与 JWT 令牌
        <br />3. vite 已配置 /onlyoffice 代理
      </div>
      <button class="oo-retry-btn" @click="retry">重新加载</button>
    </div>

    <!-- 编辑器挂载点 -->
    <div ref="containerRef" class="oo-container" :class="{ hidden: loading || errorMsg }"></div>
  </div>
</template>

<style scoped>
.onlyoffice-wrapper {
  position: relative;
  width: 100%;
  height: 100%;
  min-height: 400px;
  background: var(--bg-3, #f2f3f5);
}
.oo-container {
  width: 100%;
  height: 100%;
}
.oo-container.hidden {
  visibility: hidden;
}

.oo-loading,
.oo-error {
  position: absolute;
  inset: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 10px;
  background: var(--bg, #fff);
  padding: 32px;
  text-align: center;
}

.oo-spin {
  width: 36px;
  height: 36px;
  border: 3px solid var(--brand-line, #cfe7ff);
  border-top-color: var(--brand, #0084fc);
  border-radius: 50%;
  animation: oo-spin 0.7s linear infinite;
}
@keyframes oo-spin {
  to {
    transform: rotate(360deg);
  }
}

.oo-loading-text {
  font-size: 14px;
  font-weight: 600;
  color: var(--ink, #1d1d1f);
}
.oo-loading-sub {
  font-size: 12px;
  color: var(--ink-3, #86868b);
}

.oo-error-ico {
  font-size: 48px;
  line-height: 1;
  margin-bottom: 6px;
}
.oo-error-ttl {
  font-size: 16px;
  font-weight: 600;
  color: var(--ink, #1d1d1f);
}
.oo-error-desc {
  font-size: 13px;
  color: var(--err, #ff3b30);
  max-width: 460px;
  line-height: 1.6;
}
.oo-error-hint {
  font-size: 12px;
  color: var(--ink-3, #86868b);
  line-height: 1.8;
  max-width: 460px;
  text-align: left;
  background: var(--bg-2, #f5f5f7);
  padding: 12px 16px;
  border-radius: 8px;
  margin-top: 6px;
}
.oo-retry-btn {
  margin-top: 10px;
  padding: 8px 22px;
  border-radius: 980px;
  background: var(--brand, #0084fc);
  color: #fff;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: background 0.2s;
}
.oo-retry-btn:hover {
  background: var(--brand-press, #0069c9);
}
</style>

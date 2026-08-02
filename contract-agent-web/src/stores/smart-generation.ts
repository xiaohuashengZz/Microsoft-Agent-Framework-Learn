import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

/* ============================================================
   类型定义
   ============================================================ */
export interface StepItem {
  no: number
  label: string
  optional: boolean
}

export interface GenSubStep {
  key: string
  txt: string
  meta: string
}

export interface ChapterVar {
  name: string
  filled: boolean
}

export interface Chapter {
  id: string
  name: string
  vars: ChapterVar[]
}

export interface Agent {
  key: string
  name: string
  ico: string
  desc: string
}

export interface Candidate {
  id: string
  name: string
  score: number
  rec?: boolean
  reason: string
}

export interface FormatSubStep {
  key: string
  txt: string
}

export interface FmtRule {
  k: string
  v: string
}

export interface FmtCell {
  title: string
  ico: string
  rules: FmtRule[]
}

export interface ComplianceCheck {
  status: 'pass' | 'warn' | 'fail'
  title: string
  desc: string
  method: string
  loc: string
}

export interface ChatMessage {
  role: 'user' | 'bot'
  text: string
  time: string
}

export interface StActionItem {
  ico: string
  name: string
  sub?: string
  desc?: string
}

export interface StActionGroup {
  title: string
  items: StActionItem[]
}

export type GenStatus = 'idle' | 'running' | 'done'
export type EntryMode = 'preset' | 'upload'
export type EditorModule = 'template' | 'edit'
export type TemplateSource = 'ai' | 'platform' | 'mine'
export type ToolStatus = 'idle' | 'running' | 'done'

/* ============================================================
   数据常量（来自原型）
   ============================================================ */
const STEPS: StepItem[] = [
  { no: 1, label: '项目信息', optional: false },
  { no: 2, label: '范本推荐', optional: false },
  { no: 3, label: '生成文件', optional: false },
  { no: 4, label: '详细编辑', optional: false },
]

// 项目信息（步1）
const PROJECT_INFO = {
  projectName: '武汉市轨道交通12号线工程土建施工总承包项目',
  projectCode: 'WH-Rail-12-2026-001',
  tenderer: '武汉地铁集团有限公司',
  agency: '中铁第四勘察设计院集团有限公司',
  location: '湖北省武汉市',
  fundSource: '财政资金 + 银行贷款',
  controlPrice: '128,500.00 万元',
  deposit: '80.00 万元',
}

// 步1 项目信息列表（用于渲染）
const PROJECT_INFO_ROWS = [
  { k: '项目名称', v: PROJECT_INFO.projectName, highlight: true },
  { k: '项目编号', v: PROJECT_INFO.projectCode },
  { k: '招标方式', v: '公开招标' },
  { k: '项目类型', v: '工程类 · 施工总承包 · 施工阶段' },
  { k: '招标人', v: PROJECT_INFO.tenderer },
  { k: '招标代理机构', v: PROJECT_INFO.agency },
  { k: '工程地点', v: PROJECT_INFO.location },
  { k: '资金来源', v: PROJECT_INFO.fundSource },
  { k: '招标控制价', v: PROJECT_INFO.controlPrice },
  { k: '投标保证金', v: PROJECT_INFO.deposit },
]

// 步3：文件生成子步骤
const GEN_SUB_STEPS: GenSubStep[] = [
  { key: 'parse', txt: '解析项目立案信息', meta: '读取 10 项关键信息' },
  { key: 'match', txt: '应用所选范本框架', meta: '使用范本：轨道交通工程土建施工总承包范本（2025版）' },
  { key: 'fill', txt: '填充字段内容', meta: '从招标方案/历史文件回填 16 项字段' },
  { key: 'build', txt: '生成文档结构', meta: '8 章节 · 约 8,200 字' },
]

// 步4：章节树
const CHAPTER_TREE: Chapter[] = [
  { id: 'ch1', name: '第一章 投标须知', vars: [
    { name: '项目名称', filled: true }, { name: '项目编号', filled: true }, { name: '招标方式', filled: true },
  ]},
  { id: 'ch2', name: '第二章 项目概况与招标范围', vars: [
    { name: '建设地点', filled: true }, { name: '资金来源', filled: true }, { name: '项目概况', filled: true },
  ]},
  { id: 'ch3', name: '第三章 投标资格要求', vars: [
    { name: '资质要求', filled: true }, { name: '业绩要求', filled: true }, { name: '项目经理要求', filled: true },
  ]},
  { id: 'ch4', name: '第四章 评标办法', vars: [
    { name: '评审办法', filled: true }, { name: '商务分权重', filled: true }, { name: '价格分权重', filled: false },
  ]},
  { id: 'ch5', name: '第五章 合同条款', vars: [
    { name: '合同估算价', filled: true }, { name: '投标保证金', filled: true }, { name: '履约期限', filled: false },
  ]},
  { id: 'ch6', name: '第六章 技术要求', vars: [] },
  { id: 'ch7', name: '第七章 投标文件格式', vars: [] },
  { id: 'ch8', name: '第八章 附件', vars: [] },
]

// AI 抽屉里的智能体
const AGENTS: Agent[] = [
  { key: 'qual', name: '资格条件推荐', ico: '🧾', desc: '检索轨道交通专业资格条件素材' },
  { key: 'eval', name: '评审办法推荐', ico: '⚖️', desc: '检索适配的评标办法模型' },
]

const AGENT_CANDIDATES: Record<string, Candidate[]> = {
  template: [
    { id: 'tpl-1', name: '轨道交通工程土建施工总承包范本（2025版）', score: 96, rec: true, reason: '与本项目专业类型、阶段完全匹配，最新版，覆盖完整 18 章节。' },
    { id: 'tpl-2', name: '市政公用工程施工总承包范本（2024版）', score: 78, reason: '通用施工总承包范本，专业覆盖度一般。' },
    { id: 'tpl-3', name: '通用工程总承包范本（2024版）', score: 72, reason: '通用兜底范本，缺少轨道交通专业章节。' },
  ],
  qual: [
    { id: 'qual-1', name: '轨道交通工程资格条件素材包 v3.2', score: 95, rec: true, reason: '含轨道交通完整资格条件（资质+业绩+项目经理）。' },
    { id: 'qual-2', name: '施工总承包通用资格条件素材包 v2.5', score: 82, reason: '通用素材，缺少轨道交通专业细节。' },
    { id: 'qual-3', name: '市政工程资格条件素材包 v1.8', score: 74, reason: '市政口径，需二次修改。' },
  ],
  eval: [
    { id: 'eval-1', name: '综合评估法（轨道交通专业）v2.1', score: 94, rec: true, reason: '4 维度 + 12 子项，完全适配本项目。' },
    { id: 'eval-2', name: '综合评估法（通用）v3.0', score: 80, reason: '通用版，需补充专业子项。' },
    { id: 'eval-3', name: '最低评标价法（通用）v1.5', score: 68, reason: '不适用于复杂工程施工。' },
  ],
  polish: [
    { id: 'pl-1', name: '商务化润色（推荐）', score: 95, rec: true, reason: '增强正式度、统一术语、规范句式。' },
    { id: 'pl-2', name: '简洁化润色', score: 88, reason: '压缩冗余，提升可读性。' },
    { id: 'pl-3', name: '法务合规化润色', score: 82, reason: '强化条款严谨性，降低歧义风险。' },
  ],
}

// 文件标准格式生成
const FORMAT_SUB_STEPS: FormatSubStep[] = [
  { key: 'heading', txt: '统一标题层级（H1–H4）' },
  { key: 'number', txt: '应用章节自动编号' },
  { key: 'para', txt: '规范段落缩进与行距' },
  { key: 'hf', txt: '生成页眉页脚模板' },
]

const FMT_CELLS: FmtCell[] = [
  { title: '标题层级', ico: 'H', rules: [
    { k: '一级标题（章）', v: 'H1 · 黑体 18pt · 居中' }, { k: '二级标题（节）', v: 'H2 · 黑体 15pt · 左对齐' },
    { k: '三级标题（条）', v: 'H3 · 宋体 13pt 加粗' }, { k: '四级标题（款）', v: 'H4 · 宋体 12pt 加粗' },
  ]},
  { title: '编号体系', ico: '№', rules: [
    { k: '章节编号', v: '第一章 / 1.1 / 1.1.1' }, { k: '图表编号', v: '图3-1 / 表5-2' },
    { k: '公式编号', v: '(3-1) 右对齐' }, { k: '附件编号', v: '附件1 / 附表8-1' },
  ]},
  { title: '段落样式', ico: '¶', rules: [
    { k: '正文字体', v: '宋体 · 12pt' }, { k: '行距', v: '1.5 倍' },
    { k: '首行缩进', v: '2 字符' }, { k: '段落间距', v: '段前 0 / 段后 6pt' },
  ]},
  { title: '页面设置', ico: '▦', rules: [
    { k: '纸张', v: 'A4（210 × 297 mm）' }, { k: '页边距', v: '上 25 / 下 22 / 左 28 / 右 22 mm' },
    { k: '页码', v: '底部居中 · 阿拉伯数字' }, { k: '总页数', v: '{{总页数}} 自动统计' },
  ]},
]

// 合规校验
const COMPLIANCE_SUB_STEPS: FormatSubStep[] = [
  { key: 'compliance', txt: '开展法规合规性审查' },
  { key: 'discrimination', txt: '识别歧视性与排他性条款' },
  { key: 'logic', txt: '分析条款逻辑性与前后一致性' },
  { key: 'risk', txt: '检测完整性与潜在风险' },
]

const COMPLIANCE_CHECKS: ComplianceCheck[] = [
  { status: 'pass', title: '合规性', desc: '是否符合招标投标相关法律法规、行业规范及范本编制要求。', method: '法规知识图谱匹配', loc: '全文' },
  { status: 'warn', title: '歧视性', desc: '是否存在排他性、指向性或不合理限制潜在投标人的条款。', method: '规则引擎 + 案例比对', loc: '资格条件 / 评标办法' },
  { status: 'pass', title: '逻辑性', desc: '条款之间是否存在矛盾、冲突或前后条件不一致。', method: '语义分析 + 逻辑推理', loc: '投标人须知 / 合同条款' },
  { status: 'pass', title: '一致性', desc: '同一事项在不同章节中的名称、时间、金额和表述是否统一。', method: '文本比对算法', loc: '全文' },
  { status: 'warn', title: '完整性', desc: '强制性条款、关键章节和必填信息是否完整。', method: '结构化检测模块', loc: '章节结构 / 变量清单' },
  { status: 'fail', title: '风险性', desc: '是否存在潜在废标风险、履约风险或争议风险。', method: '风险规则库', loc: '资格条件 / 合同条款' },
]

// 选中工具条动作面板
const ST_ACTIONS: Record<string, StActionGroup> = {
  polish: {
    title: '✨ AI 润色 — 选择风格',
    items: [
      { ico: '商务', name: '商务化润色', sub: '推荐', desc: '增强正式度、统一术语' },
      { ico: '简洁', name: '简洁化润色', desc: '压缩冗余，提升可读性' },
      { ico: '法务', name: '法务合规化润色', desc: '强化条款严谨性' },
    ],
  },
  format: {
    title: '📐 格式标准化 — 选择类型',
    items: [
      { ico: 'H', name: '套用标题样式', desc: 'H1-H4 按范本规范' },
      { ico: '¶', name: '规范段落格式', desc: '首行缩进 2 字 · 1.5 倍行距' },
      { ico: '№', name: '应用自动编号', desc: '章节/图表/公式编号' },
    ],
  },
  insert: {
    title: '＋ 插入变量 — 选择字段',
    items: [
      { ico: 'P', name: '项目名称', desc: '{{项目名称}}' },
      { ico: 'T', name: '招标人', desc: '{{招标人}}' },
      { ico: '$', name: '招标控制价', desc: '{{招标控制价}}' },
      { ico: 'D', name: '投标保证金', desc: '{{投标保证金}}' },
    ],
  },
}

/* ============================================================
   Store 定义
   ============================================================ */
export const useSmartGenerationStore = defineStore('smart-generation', () => {
  // —— 状态 ——
  const current = ref(1)
  // 步1
  const entryMode = ref<EntryMode>('preset')
  const uploadFile = ref<File | null>(null)
  const uploadFileName = ref('')
  const uploadFileSize = ref('')
  const parsing = ref(false)
  const parseDone = ref(false)
  const infoDone = ref(false)
  // 步2：范本推荐
  const templateRan = ref(false)
  const templateDone = ref(false)
  const templatePick = ref<string | null>(null)
  // 步3：生成文件
  const genStatus = ref<GenStatus>('idle')
  const genSubsDone = ref(0)
  // 步4：详细编辑
  const activeChapter = ref('ch1')
  const activeField = ref<string | null>(null)
  const editorModule = ref<EditorModule>('edit')
  const templateSource = ref<TemplateSource>('ai')
  const lastSelection = ref<{ text: string } | null>(null)
  const submitting = ref(false)
  // AI 抽屉显隐
  const aiDrawerOpen = ref(true)
  // 独立智能体
  const agentRunning = ref<string | null>(null)
  const agentPicks = ref<Record<string, string | null>>({ qual: null, eval: null, polish: null })
  // AI 对话消息列表
  const chat = ref<ChatMessage[]>([])
  // 浮窗：文件标准格式生成
  const fmtStatus = ref<ToolStatus>('idle')
  const fmtSubsDone = ref(0)
  const fmtModalOpen = ref(false)
  // 浮窗：合规校验
  const compStatus = ref<ToolStatus>('idle')
  const compSubsDone = ref(0)
  const compModalOpen = ref(false)
  const compHasIssue = ref(false)
  // 选中工具条动作面板
  const stActionMode = ref<string | null>(null)
  const stActionPick = ref(0)
  const selectionToolbarPos = ref<{ left: number; top: number; show: boolean }>({ left: 0, top: 0, show: false })
  const actionPanelPos = ref<{ left: number; top: number; show: boolean }>({ left: 0, top: 0, show: false })
  // 保存遮罩
  const saveOverlayShow = ref(false)
  const saveOverlayDone = ref(false)
  const saveText = ref('正在保存文档…')
  // Toast
  const toastText = ref('')
  const toastVisible = ref(false)
  let toastTimer: ReturnType<typeof setTimeout> | null = null

  // —— 计算属性 ——
  /** 是否处于详细编辑步（步4） */
  const isEditorStep = computed(() => current.value === 4)

  /** 当前选中的范本对象 */
  const pickedTemplate = computed(() =>
    AGENT_CANDIDATES.template.find(item => item.id === templatePick.value) || null,
  )

  /** 范本推荐状态文本 */
  const templateRecStatusText = computed(() => {
    if (!templateRan.value) return '待启动'
    return templateDone.value ? '检索完成' : 'AI 正在检索匹配范本…'
  })

  /** 范本推荐状态类名 */
  const templateRecStatusClass = computed(() => {
    if (!templateRan.value) return ''
    return templateDone.value ? 'done' : 'running'
  })

  /** 范本推荐数量文本 */
  const templateRecCount = computed(() =>
    templateDone.value ? `${AGENT_CANDIDATES.template.length} 项` : '— 项',
  )

  /** 范本推荐摘要文本 */
  const templateRecSummaryText = computed(() => {
    if (!templateDone.value) return '待检索'
    return pickedTemplate.value ? pickedTemplate.value.name : '请选择'
  })

  /** 步骤是否完成 */
  function isStepDone(no: number): boolean {
    if (no === 1) return infoDone.value
    if (no === 2) return templateDone.value && !!templatePick.value
    if (no === 3) return genStatus.value === 'done'
    return false
  }

  /** 底部按钮栏状态 */
  const actionBar = computed(() => {
    const no = current.value
    let label = '继续'
    let disabled = false
    let hint = ''
    let showPrev = no === 2 || no === 3

    if (no === 1) {
      label = '确认项目信息'
      hint = '核对项目信息后获取推荐范本'
      if (entryMode.value === 'upload' && !uploadFile.value) {
        disabled = true
        hint = '请先上传采购方案'
      }
      if (parsing.value) {
        disabled = true
        label = '解析中…'
        hint = 'AI 正在解析采购方案…'
      }
    } else if (no === 2) {
      label = '使用所选范本'
      disabled = !templateDone.value || !templatePick.value
      hint = templateDone.value
        ? (templatePick.value ? '已选择范本，可生成文件' : '请选择一个范本')
        : 'AI 正在检索匹配范本…'
    } else if (no === 3) {
      if (genStatus.value === 'running') {
        label = '生成中…'
        disabled = true
        hint = 'AI 正在生成文件初稿…'
      } else if (genStatus.value === 'done') {
        label = '进入详细编辑'
        hint = '初稿已生成，可进入详细编辑'
      } else {
        label = '开始生成'
        hint = '基于已选范本生成招标文件初稿'
      }
    }

    return { label, disabled, hint, showPrev }
  })

  /** 生成文件进度百分比 */
  const genPercent = computed(() => {
    if (genStatus.value === 'done') return 100
    if (genStatus.value === 'running') return Math.round((genSubsDone.value / GEN_SUB_STEPS.length) * 100)
    return 0
  })

  /** 格式化进度百分比 */
  const fmtPercent = computed(() => {
    if (fmtStatus.value === 'done') return 100
    if (fmtStatus.value === 'running') return Math.round((fmtSubsDone.value / FORMAT_SUB_STEPS.length) * 100)
    return 0
  })

  /** 合规校验进度百分比 */
  const compPercent = computed(() => {
    if (compStatus.value === 'done') return 100
    if (compStatus.value === 'running') return Math.round((compSubsDone.value / COMPLIANCE_SUB_STEPS.length) * 100)
    return 0
  })

  /** 合规校验结果统计 */
  const compStats = computed(() => {
    const pass = COMPLIANCE_CHECKS.filter(c => c.status === 'pass').length
    const warn = COMPLIANCE_CHECKS.filter(c => c.status === 'warn').length
    const fail = COMPLIANCE_CHECKS.filter(c => c.status === 'fail').length
    const overall = fail > 0 ? 'fail' : (warn > 0 ? 'warn' : 'pass')
    const big = fail > 0 ? '不通过' : (warn > 0 ? '有警告' : '通过')
    return { pass, warn, fail, overall, big }
  })

  // —— Toast ——
  function showToast(msg: string, ms = 2000) {
    toastText.value = msg
    toastVisible.value = true
    if (toastTimer) clearTimeout(toastTimer)
    toastTimer = setTimeout(() => {
      toastVisible.value = false
    }, ms)
  }

  // —— 步骤导航 ——
  function goto(no: number) {
    if (no < 1 || no > 4) return
    if (no > 1 && !infoDone.value) { showToast('请先确认项目信息'); return }
    if (no > 2 && !isStepDone(2)) { showToast('请先选择推荐范本'); return }
    if (no > 3 && !isStepDone(3)) { showToast('请先生成文件初稿'); return }

    current.value = no
    if (no === 2) onEnterTemplateRecommendation()
    if (no === 3 && genStatus.value === 'idle') startGen()
    if (no === 4) onEnterEditor()
  }

  function next() {
    const no = current.value
    if (no === 1) {
      if (entryMode.value === 'upload' && !uploadFile.value) { showToast('请先上传采购方案'); return }
      infoDone.value = true
      showToast('已确认项目信息')
      goto(2)
      return
    }
    if (no === 2) {
      if (!templateDone.value || !templatePick.value) { showToast('请先选择推荐范本'); return }
      goto(3)
      return
    }
    if (no === 3) {
      if (genStatus.value === 'idle') { startGen(); return }
      if (genStatus.value === 'done') goto(4)
    }
  }

  function prev() {
    if (current.value === 2) return goto(1)
    if (current.value === 3) return goto(2)
  }

  // —— Step 1: 项目信息 ——
  function selectEntry(mode: EntryMode) {
    entryMode.value = mode
    if (mode === 'preset') {
      uploadFile.value = null
      parseDone.value = false
      parsing.value = false
    }
  }

  function onFileChosen(file: File | null) {
    if (!file) return
    uploadFile.value = file
    uploadFileName.value = file.name
    uploadFileSize.value = (file.size / 1024 / 1024).toFixed(2) + ' MB · 点击重新选择'
    // 模拟 AI 解析
    parsing.value = true
    parseDone.value = false
    setTimeout(() => {
      parsing.value = false
      parseDone.value = true
      showToast('采购方案解析完成')
    }, 1800)
  }

  // —— Step 2: 范本推荐 ——
  function onEnterTemplateRecommendation() {
    if (templateRan.value) return
    templateRan.value = true
    setTimeout(() => {
      templateDone.value = true
      const recommended = AGENT_CANDIDATES.template.find(item => item.rec) || AGENT_CANDIDATES.template[0]
      if (recommended) templatePick.value = recommended.id
      showToast('已完成范本推荐')
    }, 1200)
  }

  function pickTemplate(id: string) {
    if (!templateDone.value) return
    templatePick.value = id
    showToast('已选择范本')
  }

  // —— Step 3: 生成文件 ——
  function startGen() {
    if (genStatus.value === 'running' || genStatus.value === 'done') return
    if (!templatePick.value) { showToast('请先选择范本'); return }
    const picked = AGENT_CANDIDATES.template.find(item => item.id === templatePick.value)
    if (picked) GEN_SUB_STEPS[1].meta = '使用范本：' + picked.name
    genStatus.value = 'running'
    genSubsDone.value = 0
    let i = 0
    const timer = setInterval(() => {
      if (i >= GEN_SUB_STEPS.length) {
        clearInterval(timer)
        genStatus.value = 'done'
        genSubsDone.value = GEN_SUB_STEPS.length
        showToast('文件初稿生成完成')
        return
      }
      genSubsDone.value = i + 1
      i++
    }, 1000)
  }

  // —— Step 4: 详细编辑 ——
  function onEnterEditor() {
    templateSource.value = 'ai'
    editorModule.value = 'edit'
    aiDrawerOpen.value = true
  }

  function switchEditorModule(module: EditorModule) {
    editorModule.value = module
    if (module === 'template' && !templateRan.value) {
      onEnterTemplateRecommendation()
    }
  }

  function switchTemplateSource(source: TemplateSource) {
    templateSource.value = source
    if (source === 'ai' && !templateRan.value) {
      onEnterTemplateRecommendation()
    }
  }

  function selectChapter(id: string) {
    activeChapter.value = id
    const ch = CHAPTER_TREE.find(c => c.id === id)
    if (ch) showToast('已定位到「' + ch.name + '」')
  }

  function selectField(code: string) {
    activeField.value = code
    showToast('已选中字段：' + code)
  }

  // —— AI 抽屉 ——
  function openAIDrawer() {
    if (current.value !== 4) {
      showToast('AI 助手仅在详细编辑时可用')
      return
    }
    aiDrawerOpen.value = true
  }
  function closeAIDrawer() {
    aiDrawerOpen.value = false
  }

  function newChat() {
    agentRunning.value = null
    agentPicks.value = { qual: null, eval: null, polish: null }
    chat.value = []
    showToast('已新建对话')
  }

  /** 追加一条对话消息 */
  function appendChat(role: 'user' | 'bot', text: string) {
    const now = new Date()
    const time = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`
    chat.value.push({ role, text, time })
  }

  /** 简单的关键词模拟回复 */
  function mockAIReply(q: string): string {
    if (/资格|资质/.test(q)) return '根据本项目（轨道交通土建施工总承包），建议投标人具备市政公用工程施工总承包特级资质，近 5 年承担过单项合同额≥10 亿元的轨道交通工程。'
    if (/评标|评审|办法/.test(q)) return '推荐采用综合评估法（轨道交通专业）v2.1，匹配度 94%，含 4 维度 + 12 子项，完全适配本项目。'
    if (/润色|修改|优化/.test(q)) return '已对当前段落做商务化润色：统一了术语、修正了标点、增强了合规表述。可在文档中查看修订。'
    if (/你好|hello|hi/i.test(q)) return '你好！我是标书 AI 助手，可以帮你推荐资格条件、评审办法，也能润色段落、解答编制问题。'
    return '收到你的问题：「' + q + '」。这是一个演示回复，正式环境将接入大模型生成专业建议。'
  }

  function sendChat(text: string) {
    const trimmed = text.trim()
    if (!trimmed) return
    appendChat('user', trimmed)
    setTimeout(() => {
      appendChat('bot', mockAIReply(trimmed))
    }, 600)
  }

  // —— 智能体 ——
  function runAgent(key: string) {
    if (agentRunning.value) { showToast('已有智能体运行中…'); return }
    const agent = AGENTS.find(a => a.key === key)
    if (!agent) return
    agentRunning.value = key
    setTimeout(() => {
      agentRunning.value = null
      // 默认选中推荐项
      const list = AGENT_CANDIDATES[key]
      if (list && list.length && !agentPicks.value[key]) {
        const rec = list.find(c => c.rec) || list[0]
        agentPicks.value[key] = rec.id
      }
      showToast(agent.name + '完成')
    }, 1400)
  }

  function pickAgent(key: string, id: string, silent = false) {
    agentPicks.value[key] = id
    if (!silent) {
      const agent = AGENTS.find(a => a.key === key)
      if (agent) showToast('已采纳「' + agent.name + '」推荐项')
    }
  }

  // —— 选中工具条动作面板 ——
  function showActionPanel(mode: string) {
    if (!lastSelection.value) { showToast('请先选中内容'); return }
    stActionMode.value = mode
    stActionPick.value = 0
    actionPanelPos.value = { ...actionPanelPos.value, show: true }
  }
  function pickStAction(idx: number) {
    stActionPick.value = idx
  }
  function hideActionPanel() {
    actionPanelPos.value = { ...actionPanelPos.value, show: false }
  }
  function applyStAction() {
    if (!stActionMode.value || !lastSelection.value) return
    const conf = ST_ACTIONS[stActionMode.value]
    const item = conf.items[stActionPick.value]
    const modeLabel: Record<string, string> = { polish: 'AI 润色', format: '格式标准化', insert: '插入变量' }
    showToast(modeLabel[stActionMode.value] + '：已应用「' + item.name + '」到选中内容')
    hideActionPanel()
    hideSelectionToolbar()
    if (window.getSelection) window.getSelection()?.removeAllRanges()
    lastSelection.value = null
  }
  function hideSelectionToolbar() {
    selectionToolbarPos.value = { ...selectionToolbarPos.value, show: false }
  }
  function showSelectionToolbar(left: number, top: number, text: string) {
    lastSelection.value = { text }
    selectionToolbarPos.value = { left, top, show: true }
    hideActionPanel()
  }

  // —— 完成编辑（保存） ——
  function submitDocument() {
    if (submitting.value) return
    submitting.value = true
    saveOverlayDone.value = false
    saveText.value = '正在保存文档…'
    saveOverlayShow.value = true
    setTimeout(() => {
      saveOverlayDone.value = true
      saveText.value = '文档已保存'
      showToast('编辑已完成，文档保存成功', 1800)
    }, 900)
    setTimeout(() => {
      saveOverlayShow.value = false
      saveOverlayDone.value = false
      submitting.value = false
    }, 1500)
  }

  // —— 浮窗：文件格式标准化 ——
  function openFormatModal() {
    fmtModalOpen.value = true
  }
  function closeFormatModal() {
    fmtModalOpen.value = false
  }
  function runFormat() {
    if (fmtStatus.value === 'running' || fmtStatus.value === 'done') return
    fmtStatus.value = 'running'
    fmtSubsDone.value = 0
    let i = 0
    const timer = setInterval(() => {
      if (i >= FORMAT_SUB_STEPS.length) {
        clearInterval(timer)
        fmtStatus.value = 'done'
        fmtSubsDone.value = FORMAT_SUB_STEPS.length
        showToast('文件标准格式生成完成')
        return
      }
      fmtSubsDone.value = i + 1
      i++
    }, 850)
  }
  function retryFormat() {
    fmtStatus.value = 'idle'
    fmtSubsDone.value = 0
    runFormat()
  }

  // —— 浮窗：合规校验 ——
  function openComplianceModal() {
    compModalOpen.value = true
  }
  function closeComplianceModal() {
    compModalOpen.value = false
  }
  function runCompliance() {
    if (compStatus.value === 'running' || compStatus.value === 'done') return
    compStatus.value = 'running'
    compSubsDone.value = 0
    let i = 0
    const timer = setInterval(() => {
      if (i >= COMPLIANCE_SUB_STEPS.length) {
        clearInterval(timer)
        compStatus.value = 'done'
        compSubsDone.value = COMPLIANCE_SUB_STEPS.length
        compHasIssue.value = (compStats.value.warn + compStats.value.fail) > 0
        showToast('合规校验完成')
        return
      }
      compSubsDone.value = i + 1
      i++
    }, 850)
  }
  function retryCompliance() {
    compStatus.value = 'idle'
    compSubsDone.value = 0
    runCompliance()
  }

  return {
    // 数据常量
    STEPS,
    PROJECT_INFO,
    PROJECT_INFO_ROWS,
    GEN_SUB_STEPS,
    CHAPTER_TREE,
    AGENTS,
    AGENT_CANDIDATES,
    FORMAT_SUB_STEPS,
    FMT_CELLS,
    COMPLIANCE_SUB_STEPS,
    COMPLIANCE_CHECKS,
    ST_ACTIONS,
    // 状态
    current,
    entryMode,
    uploadFile,
    uploadFileName,
    uploadFileSize,
    parsing,
    parseDone,
    infoDone,
    templateRan,
    templateDone,
    templatePick,
    genStatus,
    genSubsDone,
    activeChapter,
    activeField,
    editorModule,
    templateSource,
    lastSelection,
    submitting,
    aiDrawerOpen,
    agentRunning,
    agentPicks,
    chat,
    fmtStatus,
    fmtSubsDone,
    fmtModalOpen,
    compStatus,
    compSubsDone,
    compModalOpen,
    compHasIssue,
    stActionMode,
    stActionPick,
    selectionToolbarPos,
    actionPanelPos,
    saveOverlayShow,
    saveOverlayDone,
    saveText,
    toastText,
    toastVisible,
    // 计算属性
    isEditorStep,
    pickedTemplate,
    templateRecStatusText,
    templateRecStatusClass,
    templateRecCount,
    templateRecSummaryText,
    actionBar,
    genPercent,
    fmtPercent,
    compPercent,
    compStats,
    // 方法
    isStepDone,
    showToast,
    goto,
    next,
    prev,
    selectEntry,
    onFileChosen,
    onEnterTemplateRecommendation,
    pickTemplate,
    startGen,
    onEnterEditor,
    switchEditorModule,
    switchTemplateSource,
    selectChapter,
    selectField,
    openAIDrawer,
    closeAIDrawer,
    newChat,
    appendChat,
    mockAIReply,
    sendChat,
    runAgent,
    pickAgent,
    showActionPanel,
    pickStAction,
    hideActionPanel,
    applyStAction,
    hideSelectionToolbar,
    showSelectionToolbar,
    submitDocument,
    openFormatModal,
    closeFormatModal,
    runFormat,
    retryFormat,
    openComplianceModal,
    closeComplianceModal,
    runCompliance,
    retryCompliance,
  }
})

import { createRouter, createWebHistory, type RouteRecordRaw } from 'vue-router'
import DefaultLayout from '@/layout/DefaultLayout.vue'

// 路由表
const routes: RouteRecordRaw[] = [
  {
    path: '/',
    component: DefaultLayout,
    redirect: '/smart-generation',
    children: [
      {
        path: 'smart-generation',
        name: 'SmartGeneration',
        component: () => import('@/views/smart-generation/SmartGeneration.vue'),
        // fullBleed: 让该页面填满 el-main，去除默认内边距
        meta: { title: 'AI 智能生成', icon: 'MagicStick', fullBleed: true },
      },
    ],
  },
  // 404 兜底
  {
    path: '/:pathMatch(.*)*',
    redirect: '/smart-generation',
  },
]

const router = createRouter({
  // 使用 history 模式
  history: createWebHistory(),
  routes,
})

// 全局前置守卫：设置页面标题
router.beforeEach((to, _from, next) => {
  const title = (to.meta?.title as string) || '合同 Agent 平台'
  document.title = `${title} - 合同 Agent 平台`
  next()
})

export default router

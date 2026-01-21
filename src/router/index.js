import Vue from 'vue'
import VueRouter from 'vue-router'

Vue.use(VueRouter)

const routes = [
  {
    path: '/index.html',
    name: 'dashboard',
    component: () => import('../views/index.vue'),
    meta: {
      title: 'Dashboard'
    }
  },
  {
    path: '/projects/dashboard/index.html',
    name: 'dashboard',
    component: () => import('../views/index.vue'),
    meta: {
      title: 'Dashboard'
    }
  },
]

const router = new VueRouter({
  mode: 'history',
  base: process.env.BASE_URL,
  routes
})

router.beforeEach((to, from, next) => {
  document.title = to.meta.title;
  next()
})

export default router

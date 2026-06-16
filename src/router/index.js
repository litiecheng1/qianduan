import Vue from 'vue'
import VueRouter from 'vue-router'
import HomePage from '../views/HomePage.vue'
import MainLayout from '../views/MainLayout.vue'
import BookSearch from '../components/BookSearch.vue'
import BorrowBooks from '../components/BorrowBooks.vue'
import ReturnBooks from '../components/ReturnBooks.vue'
import CardManage from '../components/CardManage.vue'
import BookManage from '../components/BookManage.vue'
import FineManage from '../components/FineManage.vue'
import Statistics from '../components/Statistics.vue'

Vue.use(VueRouter)

const routes = [
  {
    path: '/',
    name: 'Home',
    component: HomePage
  },
  {
    path: '/main',
    component: MainLayout,
    meta: { requiresAuth: true },
    children: [
      { path: 'search', component: BookSearch, props: true },
      { path: 'borrow', component: BorrowBooks, props: true },
      { path: 'return', component: ReturnBooks, props: true },
      { path: 'card', component: CardManage, props: true },
      { path: 'book-manage', component: BookManage, props: true },
      { path: 'fine', component: FineManage, props: true },
      { path: 'statistics', component: Statistics, props: true },
      { path: '', redirect: '/main/search' }
    ]
  }
]

const router = new VueRouter({
  mode: 'history',
  base: process.env.BASE_URL,
  routes
})

router.beforeEach((to, from, next) => {
  const token = localStorage.getItem('adminInfo')
  if (to.meta.requiresAuth && !token) {
    next('/')
  } else {
    next()
  }
})

export default router
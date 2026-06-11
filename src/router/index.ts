import { createRouter, createWebHistory } from 'vue-router'
import AboutView from '@/views/AboutView.vue'
import HomeView from '@/views/HomeView.vue'
import MatchDetailView from '@/views/MatchDetailView.vue'
import TeamsView from '@/views/TeamsView.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    { path: '/', name: 'home', component: HomeView },
    { path: '/match/:id', name: 'match-detail', component: MatchDetailView, props: true },
    { path: '/teams', name: 'teams', component: TeamsView },
    { path: '/about', name: 'about', component: AboutView },
  ],
})

export default router

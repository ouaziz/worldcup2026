import { defineStore } from 'pinia'
import apiService from '@/services/apiService'
import { usePredictionStore } from '@/stores/predictionStore'

const DEFAULT_REFRESH_MS = 60_000

function refreshIntervalMs() {
  const value = Number(import.meta.env.VITE_MATCH_REFRESH_MS)
  return Number.isFinite(value) && value > 0 ? value : DEFAULT_REFRESH_MS
}

export const useMatchStore = defineStore('matches', {
  state: () => ({
    matches: [] as any[],
    loading: false,
    refreshing: false,
    lastUpdatedAt: '',
    refreshError: '',
    refreshTimer: null as ReturnType<typeof window.setInterval> | null,
  }),
  getters: {
    byId: (state) => (id: string) => state.matches.find((match) => match.id === id),
    groups: (state) => [...new Set(state.matches.map((match) => match.group))].sort(),
  },
  actions: {
    async loadMatches({ forceRefresh = false } = {}) {
      if (this.matches.length && !forceRefresh) return
      this.loading = true
      try {
        this.matches = (await apiService.getMatches({ forceRefresh })) as any[]
        this.lastUpdatedAt = new Date().toISOString()
        this.refreshError = ''
      } finally {
        this.loading = false
      }
    },
    async refreshMatches() {
      this.refreshing = true
      try {
        this.matches = (await apiService.refreshMatches()) as any[]
        this.lastUpdatedAt = new Date().toISOString()
        this.refreshError = ''
        usePredictionStore().syncMatches(this.matches)
      } catch (error) {
        this.refreshError = error instanceof Error ? error.message : 'Mise à jour impossible'
      } finally {
        this.refreshing = false
      }
    },
    startAutoRefresh() {
      if (this.refreshTimer) return

      this.refreshTimer = window.setInterval(() => {
        void this.refreshMatches()
      }, refreshIntervalMs())
    },
    stopAutoRefresh() {
      if (!this.refreshTimer) return

      window.clearInterval(this.refreshTimer)
      this.refreshTimer = null
    },
  },
})

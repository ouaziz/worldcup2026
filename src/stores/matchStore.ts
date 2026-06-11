import { defineStore } from 'pinia'
import apiService from '@/services/apiService'

export const useMatchStore = defineStore('matches', {
  state: () => ({
    matches: [] as any[],
    loading: false,
  }),
  getters: {
    byId: (state) => (id: string) => state.matches.find((match) => match.id === id),
    groups: (state) => [...new Set(state.matches.map((match) => match.group))].sort(),
  },
  actions: {
    async loadMatches() {
      if (this.matches.length) return
      this.loading = true
      try {
        this.matches = (await apiService.getMatches()) as any[]
      } finally {
        this.loading = false
      }
    },
  },
})

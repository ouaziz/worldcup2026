import { defineStore } from 'pinia'
import apiService from '@/services/apiService'

export const useTeamStore = defineStore('teams', {
  state: () => ({
    teams: [] as any[],
    performances: [] as any[],
    loading: false,
  }),
  getters: {
    byId: (state) => (id: string) => state.teams.find((team) => team.id === id),
    performanceByTeamId: (state) => (id: string) =>
      state.performances.find((performance) => performance.teamId === id),
    groups: (state) => [...new Set(state.teams.map((team) => team.group))].sort(),
  },
  actions: {
    async loadTeams() {
      if (this.teams.length && this.performances.length) return
      this.loading = true
      try {
        const [teams, performances] = await Promise.all([
          apiService.getTeams(),
          apiService.getPerformances(),
        ])
        this.teams = teams as any[]
        this.performances = performances as any[]
      } finally {
        this.loading = false
      }
    },
  },
})

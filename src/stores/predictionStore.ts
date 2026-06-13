import { defineStore } from 'pinia'
import apiService from '@/services/apiService'
import { calculatePrediction } from '@/services/predictionService'

export const usePredictionStore = defineStore('predictions', {
  state: () => ({
    cache: {} as Record<string, any>,
    loading: false,
  }),
  actions: {
    async predictMatch(matchId: string) {
      if (this.cache[matchId]) return this.cache[matchId]

      this.loading = true
      try {
        const context = await apiService.getMatchContext(matchId)
        if (!context) return null

        const prediction = calculatePrediction(context)
        this.cache[matchId] = { ...context, prediction }
        return this.cache[matchId]
      } finally {
        this.loading = false
      }
    },
    syncMatches(matches: any[]) {
      for (const cachedContext of Object.values(this.cache)) {
        const match = matches.find((item) => item.id === cachedContext.match.id)
        if (!match) continue

        cachedContext.match = match
        cachedContext.prediction = calculatePrediction(cachedContext)
      }
    },
  },
})

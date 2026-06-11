import axios from 'axios'
import teams from '@/data/teams.json'
import matches from '@/data/matches.json'
import performances from '@/data/performances.json'
import headToHead from '@/data/headToHead.json'

const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || '/',
  timeout: 8000,
})

const wait = (data) => new Promise((resolve) => window.setTimeout(() => resolve(data), 120))

export const apiService = {
  client: apiClient,

  async getTeams() {
    return wait(teams)
  },

  async getMatches() {
    return wait(matches)
  },

  async getPerformances() {
    return wait(performances)
  },

  async getHeadToHead() {
    return wait(headToHead)
  },

  async getMatchContext(matchId) {
    const [allTeams, allMatches, allPerformances, allHeadToHead] = await Promise.all([
      this.getTeams(),
      this.getMatches(),
      this.getPerformances(),
      this.getHeadToHead(),
    ])

    const match = allMatches.find((item) => item.id === matchId)
    if (!match) return null

    const teamA = allTeams.find((team) => team.id === match.teamAId)
    const teamB = allTeams.find((team) => team.id === match.teamBId)

    return {
      match,
      teamA,
      teamB,
      performanceA: allPerformances.find((item) => item.teamId === match.teamAId),
      performanceB: allPerformances.find((item) => item.teamId === match.teamBId),
      headToHead: allHeadToHead.find(
        (item) =>
          (item.teamAId === match.teamAId && item.teamBId === match.teamBId) ||
          (item.teamAId === match.teamBId && item.teamBId === match.teamAId),
      ),
    }
  },
}

export default apiService

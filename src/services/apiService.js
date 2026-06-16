import axios from 'axios'
import teams from '@/data/teams.json'
import matches from '@/data/matches.json'
import performances from '@/data/performances.json'
import headToHead from '@/data/headToHead.json'
import players from '@/data/players.json'

const matchFeedUrl = import.meta.env.VITE_MATCHES_FEED_URL
const localMatches = matches
let matchesCache = null

const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || '/',
  timeout: 8000,
})

const wait = (data) => new Promise((resolve) => window.setTimeout(() => resolve(data), 120))

function normalizeMatchesPayload(payload) {
  if (Array.isArray(payload)) return payload
  if (Array.isArray(payload?.matches)) return payload.matches
  return null
}

function mergeMatches(baseMatches, remoteMatches) {
  if (!remoteMatches?.length) return baseMatches

  const remoteById = new Map(remoteMatches.map((match) => [match.id, match]))

  return baseMatches.map((match) => {
    const remoteMatch = remoteById.get(match.id)
    if (!remoteMatch) return match

    return {
      ...match,
      ...remoteMatch,
      result: Object.prototype.hasOwnProperty.call(remoteMatch, 'result')
        ? remoteMatch.result
        : match.result,
    }
  })
}

async function fetchRemoteMatches() {
  if (!matchFeedUrl) return null

  const response = await apiClient.get(matchFeedUrl, {
    baseURL: undefined,
    params: { t: Date.now() },
  })
  const remoteMatches = normalizeMatchesPayload(response.data)

  if (!remoteMatches) {
    throw new Error('Le flux de matchs doit renvoyer un tableau ou un objet { matches }.')
  }

  return mergeMatches(localMatches, remoteMatches)
}

export const apiService = {
  client: apiClient,

  async getTeams() {
    return wait(teams)
  },

  async getMatches({ forceRefresh = false } = {}) {
    if (matchesCache && !forceRefresh) return wait(matchesCache)

    try {
      matchesCache = (await fetchRemoteMatches()) || localMatches
    } catch (error) {
      console.warn('Impossible de mettre les scores à jour depuis le flux distant.', error)
      matchesCache = matchesCache || localMatches
    }

    return wait(matchesCache)
  },

  async refreshMatches() {
    return this.getMatches({ forceRefresh: true })
  },

  async getPerformances() {
    return wait(performances)
  },

  async getHeadToHead() {
    return wait(headToHead)
  },

  async getPlayers() {
    return wait(players)
  },

  async getMatchContext(matchId) {
    const [allTeams, allMatches, allPerformances, allHeadToHead, allPlayers] = await Promise.all([
      this.getTeams(),
      this.getMatches(),
      this.getPerformances(),
      this.getHeadToHead(),
      this.getPlayers(),
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
      playersA: allPlayers.find((item) => item.teamId === match.teamAId),
      playersB: allPlayers.find((item) => item.teamId === match.teamBId),
      headToHead: allHeadToHead.find(
        (item) =>
          (item.teamAId === match.teamAId && item.teamBId === match.teamBId) ||
          (item.teamAId === match.teamBId && item.teamBId === match.teamAId),
      ),
    }
  },
}

export default apiService

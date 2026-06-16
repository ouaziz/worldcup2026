<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref } from 'vue'
import MatchCard from '@/components/MatchCard.vue'
import MatchFilters from '@/components/MatchFilters.vue'
import { useMatchStore } from '@/stores/matchStore'
import { useTeamStore } from '@/stores/teamStore'
import apiService from '@/services/apiService'
import { calculatePrediction } from '@/services/predictionService'

const matchStore = useMatchStore()
const teamStore = useTeamStore()

const filters = ref({ group: '', team: '', date: '' })
const performances = ref<any[]>([])
const headToHead = ref<any[]>([])
const playerProfiles = ref<any[]>([])

onMounted(async () => {
  const [, , performanceData, headToHeadData, playerData] = await Promise.all([
    matchStore.loadMatches(),
    teamStore.loadTeams(),
    apiService.getPerformances(),
    apiService.getHeadToHead(),
    apiService.getPlayers(),
  ])
  performances.value = performanceData as any[]
  headToHead.value = headToHeadData as any[]
  playerProfiles.value = playerData as any[]
  matchStore.startAutoRefresh()
})

onUnmounted(() => {
  matchStore.stopAutoRefresh()
})

const teamsById = computed(() => Object.fromEntries(teamStore.teams.map((team) => [team.id, team])))
const performancesByTeamId = computed(() =>
  Object.fromEntries(performances.value.map((performance) => [performance.teamId, performance])),
)
const playersByTeamId = computed(() =>
  Object.fromEntries(playerProfiles.value.map((profile) => [profile.teamId, profile])),
)

function predictedOutcome(prediction: any) {
  const outcomes = [
    { key: 'teamA', value: prediction.probabilities.teamAWin },
    { key: 'draw', value: prediction.probabilities.draw },
    { key: 'teamB', value: prediction.probabilities.teamBWin },
  ]
  const maxValue = Math.max(...outcomes.map((outcome) => outcome.value))
  const winners = outcomes.filter((outcome) => outcome.value === maxValue)

  return winners.length === 1 && winners[0] ? winners[0].key : 'undecided'
}

function actualOutcome(match: any) {
  if (!match.result) return null
  if (match.result.teamAScore === match.result.teamBScore) return 'draw'
  return match.result.winnerTeamId === match.teamAId ? 'teamA' : 'teamB'
}

const predictionAccuracy = computed(() => {
  let correct = 0
  let wrong = 0
  let undecided = 0

  for (const match of matchStore.matches) {
    if (match.status !== 'completed' || !match.result) continue

    const teamA = teamsById.value[match.teamAId]
    const teamB = teamsById.value[match.teamBId]
    const performanceA = performancesByTeamId.value[match.teamAId]
    const performanceB = performancesByTeamId.value[match.teamBId]
    const playersA = playersByTeamId.value[match.teamAId]
    const playersB = playersByTeamId.value[match.teamBId]
    const directHistory = headToHead.value.find(
      (item) =>
        (item.teamAId === match.teamAId && item.teamBId === match.teamBId) ||
        (item.teamAId === match.teamBId && item.teamBId === match.teamAId),
    )

    if (!teamA || !teamB || !performanceA || !performanceB) continue

    const prediction = calculatePrediction({
      match,
      teamA,
      teamB,
      performanceA,
      performanceB,
      playersA,
      playersB,
      headToHead: directHistory,
    })
    const predicted = predictedOutcome(prediction)
    const actual = actualOutcome(match)

    if (!actual) continue
    if (predicted === 'undecided') {
      undecided += 1
    } else if (predicted === actual) {
      correct += 1
    } else {
      wrong += 1
    }
  }

  const evaluated = correct + wrong

  return {
    correct,
    wrong,
    undecided,
    evaluated,
    correctRate: evaluated ? Math.round((correct / evaluated) * 100) : 0,
    wrongRate: evaluated ? Math.round((wrong / evaluated) * 100) : 0,
  }
})

const lastUpdatedLabel = computed(() => {
  if (!matchStore.lastUpdatedAt) return 'Mise à jour en attente'

  return new Intl.DateTimeFormat('fr-CA', {
    timeStyle: 'medium',
  }).format(new Date(matchStore.lastUpdatedAt))
})

const filteredMatches = computed(() => {
  return matchStore.matches.filter((match) => {
    const matchDate = match.date.slice(0, 10)
    const groupMatch = !filters.value.group || match.group === filters.value.group
    const teamMatch =
      !filters.value.team ||
      match.teamAId === filters.value.team ||
      match.teamBId === filters.value.team
    const dateMatch = !filters.value.date || matchDate === filters.value.date

    return groupMatch && teamMatch && dateMatch
  })
})
</script>

<template>
  <div class="space-y-6">
    <section class="grid gap-4 lg:grid-cols-[1fr_320px] lg:items-end">
      <div>
        <p class="text-sm font-semibold uppercase tracking-wide text-emerald-700">
          Coupe du Monde 2026
        </p>
        <h1 class="mt-2 max-w-3xl text-4xl font-bold tracking-tight text-slate-950">
          Probabilités éducatives des matchs
        </h1>
        <p class="mt-3 max-w-2xl text-slate-600">
          Les prédictions combinent classement FIFA, forme récente, attaque, défense et historique
          direct. Elles servent uniquement à l’analyse statistique.
        </p>
      </div>
      <div class="rounded-lg border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-900">
        <p>Aucun module de pari sportif n’est inclus.</p>
        <p class="mt-2 font-semibold">Scores mis à jour automatiquement.</p>
        <p class="mt-1 text-emerald-800">
          Dernière vérification : {{ lastUpdatedLabel }}
          <span v-if="matchStore.refreshing">...</span>
        </p>
        <p v-if="matchStore.refreshError" class="mt-1 text-rose-700">
          {{ matchStore.refreshError }}
        </p>
      </div>
    </section>

    <section
      class="grid gap-3 rounded-lg border border-slate-200 bg-white p-4 shadow-sm sm:grid-cols-3"
      aria-label="Fiabilité des pronostics"
    >
      <div>
        <p class="text-sm font-semibold uppercase text-slate-500">Pronostics justes</p>
        <p class="mt-1 text-3xl font-bold text-emerald-700">
          {{ predictionAccuracy.correctRate }}%
        </p>
        <p class="text-sm text-slate-500">
          {{ predictionAccuracy.correct }} sur {{ predictionAccuracy.evaluated }} évalués
        </p>
      </div>
      <div>
        <p class="text-sm font-semibold uppercase text-slate-500">Pronostics faux</p>
        <p class="mt-1 text-3xl font-bold text-rose-700">
          {{ predictionAccuracy.wrongRate }}%
        </p>
        <p class="text-sm text-slate-500">
          {{ predictionAccuracy.wrong }} sur {{ predictionAccuracy.evaluated }} évalués
        </p>
      </div>
      <div>
        <p class="text-sm font-semibold uppercase text-slate-500">Matchs terminés</p>
        <p class="mt-1 text-3xl font-bold text-slate-950">
          {{ predictionAccuracy.evaluated + predictionAccuracy.undecided }}
        </p>
        <p class="text-sm text-slate-500">
          <span v-if="predictionAccuracy.undecided">
            {{ predictionAccuracy.undecided }} pronostic non tranché
          </span>
          <span v-else>Tous les pronostics sont tranchés</span>
        </p>
      </div>
    </section>

    <MatchFilters v-model="filters" :groups="matchStore.groups" :teams="teamStore.teams" />

    <section v-if="matchStore.loading || teamStore.loading" class="card p-8 text-center text-slate-500">
      Chargement des matchs...
    </section>

    <section v-else class="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
      <MatchCard
        v-for="match in filteredMatches"
        :key="match.id"
        :match="match"
        :team-a="teamsById[match.teamAId]"
        :team-b="teamsById[match.teamBId]"
      />
    </section>

    <section v-if="!matchStore.loading && filteredMatches.length === 0" class="card p-8 text-center">
      <p class="text-lg font-semibold">Aucun match ne correspond aux filtres.</p>
      <p class="mt-1 text-slate-500">Essayez un autre groupe, une autre date ou une autre équipe.</p>
    </section>
  </div>
</template>

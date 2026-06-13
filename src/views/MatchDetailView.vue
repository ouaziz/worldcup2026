<script setup lang="ts">
import { computed, onMounted, onUnmounted } from 'vue'
import { RouterLink, useRoute } from 'vue-router'
import FormChart from '@/components/FormChart.vue'
import HeadToHead from '@/components/HeadToHead.vue'
import MatchPrediction from '@/components/MatchPrediction.vue'
import TeamStats from '@/components/TeamStats.vue'
import { useMatchStore } from '@/stores/matchStore'
import { usePredictionStore } from '@/stores/predictionStore'

const route = useRoute()
const matchStore = useMatchStore()
const predictionStore = usePredictionStore()
const matchId = computed(() => String(route.params.id))
const context = computed(() => predictionStore.cache[matchId.value])

onMounted(async () => {
  await Promise.all([matchStore.loadMatches(), predictionStore.predictMatch(matchId.value)])
  matchStore.startAutoRefresh()
})

onUnmounted(() => {
  matchStore.stopAutoRefresh()
})

const dateLabel = computed(() => {
  if (!context.value?.match) return ''
  return new Intl.DateTimeFormat('fr-CA', {
    dateStyle: 'full',
    timeStyle: 'short',
  }).format(new Date(context.value.match.date))
})

const statusLabel = computed(() => {
  if (context.value?.match.status === 'completed') return 'Terminé'
  if (context.value?.match.status === 'live') return 'En direct'
  return 'À venir'
})

const resultTone = (teamId: string) => {
  const winnerTeamId = context.value?.match.result?.winnerTeamId
  if (!winnerTeamId) return 'text-slate-900'
  return winnerTeamId === teamId ? 'text-emerald-700' : 'text-rose-700'
}

const resultScoreTone = (teamId: string) => {
  const winnerTeamId = context.value?.match.result?.winnerTeamId
  if (!winnerTeamId) return 'text-slate-900'
  return winnerTeamId === teamId ? 'text-emerald-950' : 'text-rose-950'
}
</script>

<template>
  <div class="space-y-6">
    <RouterLink class="inline-flex text-sm font-semibold text-emerald-700 hover:text-emerald-800" to="/">
      Retour aux matchs
    </RouterLink>

    <section v-if="predictionStore.loading && !context" class="card p-8 text-center text-slate-500">
      Calcul de la prédiction...
    </section>

    <template v-else-if="context">
      <MatchPrediction :team-a="context.teamA" :team-b="context.teamB" :prediction="context.prediction" />

      <section class="card p-5">
        <div class="grid gap-4 md:grid-cols-3">
          <div>
            <p class="text-sm text-slate-500">Date</p>
            <p class="font-semibold">{{ dateLabel }}</p>
          </div>
          <div>
            <p class="text-sm text-slate-500">Stade</p>
            <p class="font-semibold">{{ context.match.stadium }}</p>
          </div>
          <div>
            <p class="text-sm text-slate-500">Importance du match</p>
            <p class="font-semibold">{{ Math.round(context.match.importance * 100) }}%</p>
          </div>
        </div>
      </section>

      <section
        v-if="context.match.result"
        class="card border-slate-200 bg-slate-50 p-5"
      >
        <div class="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div>
            <p class="text-sm font-semibold uppercase tracking-wide text-slate-600">
              Résultat actuel
            </p>
            <p class="mt-1 flex flex-wrap items-baseline gap-x-3 text-3xl font-bold">
              <span :class="resultTone(context.teamA.id)">{{ context.teamA.name }}</span>
              <span :class="resultScoreTone(context.teamA.id)">{{ context.match.result.teamAScore }}</span>
              <span class="text-slate-400">-</span>
              <span :class="resultScoreTone(context.teamB.id)">{{ context.match.result.teamBScore }}</span>
              <span :class="resultTone(context.teamB.id)">{{ context.teamB.name }}</span>
            </p>
          </div>
          <div class="rounded-md bg-white/70 px-4 py-3 text-sm text-slate-700">
            <p class="font-semibold">{{ statusLabel }}</p>
            <p>Source : {{ context.match.result.source }}</p>
          </div>
        </div>
      </section>

      <section class="grid gap-4 lg:grid-cols-2">
        <TeamStats :team="context.teamA" :performance="context.performanceA" />
        <TeamStats :team="context.teamB" :performance="context.performanceB" />
      </section>

      <HeadToHead :team-a="context.teamA" :team-b="context.teamB" :head-to-head="context.headToHead" />

      <FormChart
        :team-a="context.teamA"
        :team-b="context.teamB"
        :performance-a="context.performanceA"
        :performance-b="context.performanceB"
        :factors="context.prediction.factors"
      />

      <section class="card p-5">
        <h2 class="text-xl font-semibold">Formule utilisée</h2>
        <p class="mt-2 text-slate-600">
          Score équipe = 30% classement FIFA + 25% forme récente + 20% attaque + 15% défense +
          10% historique direct. Un léger ajustement tient compte de l’avantage terrain et de
          l’importance du match, puis les scores sont convertis en probabilités totalisant 100%.
        </p>
      </section>
    </template>

    <section v-else class="card p-8 text-center">
      <p class="text-lg font-semibold">Match introuvable.</p>
      <RouterLink class="mt-3 inline-flex font-semibold text-emerald-700" to="/">Voir la liste</RouterLink>
    </section>
  </div>
</template>

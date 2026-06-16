<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref } from 'vue'
import { usePredictionStore } from '@/stores/predictionStore'
import ProbabilityBars from './ProbabilityBars.vue'

const LIVE_WINDOW_MS = 135 * 60 * 1000

const props = defineProps<{
  match: any
  teamA: any
  teamB: any
}>()

const predictionStore = usePredictionStore()
const context = computed(() => predictionStore.cache[props.match.id])
const prediction = computed(() => context.value?.prediction)
const now = ref(Date.now())
let liveTimer: ReturnType<typeof window.setInterval> | null = null

predictionStore.predictMatch(props.match.id)

onMounted(() => {
  liveTimer = window.setInterval(() => {
    now.value = Date.now()
  }, 30_000)
})

onUnmounted(() => {
  if (!liveTimer) return

  window.clearInterval(liveTimer)
  liveTimer = null
})

const dateLabel = computed(() =>
  new Intl.DateTimeFormat('fr-CA', {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(new Date(props.match.date)),
)

const isLiveNow = computed(() => {
  if (props.match.status === 'completed') return false
  if (props.match.status === 'live') return true

  const kickoff = new Date(props.match.date).getTime()
  return now.value >= kickoff && now.value < kickoff + LIVE_WINDOW_MS
})

const statusLabel = computed(() => {
  if (isLiveNow.value) return 'LIVE NOW'
  if (props.match.status === 'completed') return 'Terminé'
  if (props.match.status === 'live') return 'En direct'
  return 'À venir'
})

const resultTone = (teamId: string) => {
  const winnerTeamId = props.match.result?.winnerTeamId
  if (!winnerTeamId) return 'text-slate-900'
  return winnerTeamId === teamId ? 'text-emerald-700' : 'text-rose-700'
}

const resultScoreTone = (teamId: string) => {
  const winnerTeamId = props.match.result?.winnerTeamId
  if (!winnerTeamId) return 'text-slate-900'
  return winnerTeamId === teamId ? 'text-emerald-950' : 'text-rose-950'
}
</script>

<template>
  <article
    class="card flex h-full flex-col p-5 transition"
    :class="{
      'border-rose-300 bg-rose-50 shadow-md shadow-rose-100 ring-2 ring-rose-200': isLiveNow,
    }"
  >
    <div class="mb-4 flex items-start justify-between gap-3">
      <div>
        <p
          class="text-sm font-medium"
          :class="isLiveNow ? 'text-rose-700' : 'text-emerald-700'"
        >
          Groupe {{ match.group }}
        </p>
        <p class="text-sm text-slate-500">{{ dateLabel }}</p>
      </div>
      <span
        class="rounded-full px-3 py-1 text-xs font-semibold"
        :class="{
          'bg-rose-600 text-white shadow-sm': isLiveNow,
          'bg-emerald-100 text-emerald-700': !isLiveNow && match.status === 'completed',
          'bg-slate-100 text-slate-600': !isLiveNow && match.status === 'scheduled',
        }"
      >
        {{ statusLabel }}
      </span>
    </div>

    <div class="grid grid-cols-[1fr_auto_1fr] items-center gap-3">
      <div class="min-w-0">
        <img :src="teamA.flagUrl" :alt="teamA.name" class="mb-2 h-8 w-12 rounded object-cover shadow-sm" />
        <h2 class="truncate text-lg font-semibold">{{ teamA.name }}</h2>
        <p class="text-sm text-slate-500">FIFA #{{ teamA.fifaRanking }}</p>
      </div>
      <span class="text-sm font-bold text-slate-400">VS</span>
      <div class="min-w-0 text-right">
        <img :src="teamB.flagUrl" :alt="teamB.name" class="mb-2 ml-auto h-8 w-12 rounded object-cover shadow-sm" />
        <h2 class="truncate text-lg font-semibold">{{ teamB.name }}</h2>
        <p class="text-sm text-slate-500">FIFA #{{ teamB.fifaRanking }}</p>
      </div>
    </div>

    <p class="mt-4 text-sm text-slate-500">{{ match.stadium }}</p>

    <div
      v-if="match.result"
      class="mt-4 rounded-md border border-slate-200 bg-slate-50 p-3"
    >
      <p class="text-xs font-semibold uppercase tracking-wide text-slate-600">
        Résultat actuel
      </p>
      <p class="mt-1 flex flex-wrap items-baseline gap-x-2 text-xl font-bold">
        <span :class="resultTone(teamA.id)">{{ teamA.name }}</span>
        <span :class="resultScoreTone(teamA.id)">{{ match.result.teamAScore }}</span>
        <span class="text-slate-400">-</span>
        <span :class="resultScoreTone(teamB.id)">{{ match.result.teamBScore }}</span>
        <span :class="resultTone(teamB.id)">{{ teamB.name }}</span>
      </p>
    </div>

    <div v-if="prediction" class="mt-5 space-y-4">
      <div class="flex flex-wrap gap-2">
        <span v-if="prediction.badges.favorite" class="rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700">
          Favori : {{ prediction.badges.favorite }}
        </span>
        <span v-if="prediction.badges.isCloseMatch" class="rounded-full bg-amber-50 px-3 py-1 text-xs font-semibold text-amber-700">
          Match serré
        </span>
        <span class="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-700">
          {{ prediction.confidence.label }}
        </span>
      </div>
      <ProbabilityBars :probabilities="prediction.probabilities" :team-a-name="teamA.name" :team-b-name="teamB.name" />
    </div>

    <RouterLink
      class="focus-ring mt-5 inline-flex justify-center rounded-md bg-emerald-600 px-4 py-2 font-semibold text-white hover:bg-emerald-700"
      :to="`/match/${match.id}`"
    >
      Voir prédiction
    </RouterLink>
  </article>
</template>

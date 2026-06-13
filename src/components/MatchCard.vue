<script setup lang="ts">
import { computed } from 'vue'
import { usePredictionStore } from '@/stores/predictionStore'
import ProbabilityBars from './ProbabilityBars.vue'

const props = defineProps<{
  match: any
  teamA: any
  teamB: any
}>()

const predictionStore = usePredictionStore()
const context = computed(() => predictionStore.cache[props.match.id])
const prediction = computed(() => context.value?.prediction)

predictionStore.predictMatch(props.match.id)

const dateLabel = computed(() =>
  new Intl.DateTimeFormat('fr-CA', {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(new Date(props.match.date)),
)

const statusLabel = computed(() => {
  if (props.match.status === 'completed') return 'Terminé'
  if (props.match.status === 'live') return 'En direct'
  return 'À venir'
})

const resultLabel = computed(() => {
  if (!props.match.result) return null
  return `${props.match.result.teamAScore}-${props.match.result.teamBScore}`
})

const resultMatchesPrediction = computed(() => {
  if (!resultLabel.value || !prediction.value?.probableScore) return null
  return resultLabel.value === prediction.value.probableScore
})
</script>

<template>
  <article class="card flex h-full flex-col p-5">
    <div class="mb-4 flex items-start justify-between gap-3">
      <div>
        <p class="text-sm font-medium text-emerald-700">Groupe {{ match.group }}</p>
        <p class="text-sm text-slate-500">{{ dateLabel }}</p>
      </div>
      <span
        class="rounded-full px-3 py-1 text-xs font-semibold"
        :class="{
          'bg-emerald-100 text-emerald-700': match.status === 'completed',
          'bg-rose-100 text-rose-700': match.status === 'live',
          'bg-slate-100 text-slate-600': match.status === 'scheduled',
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
      v-if="resultLabel"
      class="mt-4 rounded-md border p-3"
      :class="{
        'border-emerald-200 bg-emerald-50': resultMatchesPrediction !== false,
        'border-rose-200 bg-rose-50': resultMatchesPrediction === false,
      }"
    >
      <p
        class="text-xs font-semibold uppercase tracking-wide"
        :class="{
          'text-emerald-700': resultMatchesPrediction !== false,
          'text-rose-700': resultMatchesPrediction === false,
        }"
      >
        Résultat actuel
      </p>
      <p
        class="mt-1 text-xl font-bold"
        :class="{
          'text-emerald-950': resultMatchesPrediction !== false,
          'text-rose-950': resultMatchesPrediction === false,
        }"
      >
        {{ teamA.name }} {{ resultLabel }} {{ teamB.name }}
      </p>
      <p
        v-if="prediction"
        class="mt-1 text-sm font-medium"
        :class="{
          'text-emerald-800': resultMatchesPrediction,
          'text-rose-800': resultMatchesPrediction === false,
        }"
      >
        Prédiction : {{ prediction.probableScore }}
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
      <p class="rounded-md bg-slate-50 px-3 py-2 text-sm font-medium text-slate-700">
        Score probable : {{ prediction.probableScore }}
      </p>
    </div>

    <RouterLink
      class="focus-ring mt-5 inline-flex justify-center rounded-md bg-emerald-600 px-4 py-2 font-semibold text-white hover:bg-emerald-700"
      :to="`/match/${match.id}`"
    >
      Voir prédiction
    </RouterLink>
  </article>
</template>

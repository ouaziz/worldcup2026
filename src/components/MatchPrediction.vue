<script setup lang="ts">
import ProbabilityBars from './ProbabilityBars.vue'

defineProps<{
  teamA: any
  teamB: any
  prediction: any
}>()
</script>

<template>
  <section class="card overflow-hidden">
    <div class="bg-slate-950 px-5 py-6 text-white">
      <div class="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <p class="text-sm uppercase tracking-wide text-emerald-300">Prédiction statistique</p>
          <h1 class="mt-1 text-3xl font-bold">{{ teamA.name }} vs {{ teamB.name }}</h1>
        </div>
      </div>
    </div>

    <div class="grid gap-6 p-5 lg:grid-cols-[1.1fr_0.9fr]">
      <ProbabilityBars
        :probabilities="prediction.probabilities"
        :team-a-name="teamA.name"
        :team-b-name="teamB.name"
      />

      <div class="space-y-3">
        <div class="flex flex-wrap gap-2">
          <span v-if="prediction.badges.favorite" class="rounded-full bg-emerald-50 px-3 py-1 text-sm font-semibold text-emerald-700">
            Favori : {{ prediction.badges.favorite }}
          </span>
          <span v-if="prediction.badges.isCloseMatch" class="rounded-full bg-amber-50 px-3 py-1 text-sm font-semibold text-amber-700">
            Match serré
          </span>
          <span
            class="rounded-full px-3 py-1 text-sm font-semibold"
            :class="{
              'bg-emerald-50 text-emerald-700': prediction.confidence.level === 'high',
              'bg-sky-50 text-sky-700': prediction.confidence.level === 'medium',
              'bg-rose-50 text-rose-700': prediction.confidence.level === 'low',
            }"
          >
            {{ prediction.confidence.label }}
          </span>
        </div>

        <dl class="grid grid-cols-2 gap-3">
          <div class="rounded-md bg-slate-50 p-3">
            <dt class="text-sm text-slate-500">Score modèle {{ teamA.name }}</dt>
            <dd class="text-xl font-bold">{{ prediction.teamAScore }}</dd>
          </div>
          <div class="rounded-md bg-slate-50 p-3">
            <dt class="text-sm text-slate-500">Score modèle {{ teamB.name }}</dt>
            <dd class="text-xl font-bold">{{ prediction.teamBScore }}</dd>
          </div>
          <div class="rounded-md bg-slate-50 p-3">
            <dt class="text-sm text-slate-500">Joueurs clés {{ teamA.name }}</dt>
            <dd class="text-xl font-bold">{{ Math.round(prediction.factors.players[0]) }}/100</dd>
          </div>
          <div class="rounded-md bg-slate-50 p-3">
            <dt class="text-sm text-slate-500">Joueurs clés {{ teamB.name }}</dt>
            <dd class="text-xl font-bold">{{ Math.round(prediction.factors.players[1]) }}/100</dd>
          </div>
        </dl>
      </div>
    </div>
  </section>
</template>

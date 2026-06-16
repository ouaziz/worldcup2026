<script setup lang="ts">
defineProps<{
  prediction: any
  teamA: any
  teamB: any
  compact?: boolean
}>()

function comboNumber(index: string | number) {
  return Number(index) + 1
}
</script>

<template>
  <section
    class="rounded-md border border-slate-200 bg-white/80 p-3"
    :class="{ 'space-y-3': !compact }"
  >
    <div class="grid grid-cols-3 gap-2 text-center">
      <div class="rounded-md bg-slate-50 px-2 py-2">
        <p class="text-xs text-slate-500">{{ teamA.name }}</p>
        <p class="text-lg font-bold text-slate-950">
          {{ prediction.goalPredictions.teamGoals.teamA }}
        </p>
      </div>
      <div class="rounded-md bg-slate-50 px-2 py-2">
        <p class="text-xs text-slate-500">Total</p>
        <p class="text-lg font-bold text-slate-950">
          {{ prediction.goalPredictions.totalGoalsLabel }}
        </p>
      </div>
      <div class="rounded-md bg-slate-50 px-2 py-2">
        <p class="text-xs text-slate-500">{{ teamB.name }}</p>
        <p class="text-lg font-bold text-slate-950">
          {{ prediction.goalPredictions.teamGoals.teamB }}
        </p>
      </div>
    </div>

    <div v-if="!compact" class="grid gap-3 lg:grid-cols-[0.9fr_1.1fr]">
      <div>
        <h3 class="text-sm font-semibold uppercase text-slate-500">Buteurs probables</h3>
        <div class="mt-2 space-y-2">
          <div
            v-for="scorer in prediction.goalPredictions.topScorers"
            :key="`${scorer.team}-${scorer.name}`"
            class="flex items-center justify-between gap-3 rounded-md bg-slate-50 px-3 py-2"
          >
            <div>
              <p class="font-semibold text-slate-950">{{ scorer.name }}</p>
              <p class="text-sm text-slate-500">{{ scorer.team }} · {{ scorer.position }}</p>
            </div>
            <span class="text-sm font-bold text-emerald-700">{{ scorer.chance }}%</span>
          </div>
        </div>
      </div>

      <div>
        <h3 class="text-sm font-semibold uppercase text-slate-500">5 combos possibles</h3>
        <ol class="mt-2 space-y-2">
          <li
            v-for="(combo, index) in prediction.goalPredictions.combos"
            :key="combo"
            class="flex gap-3 rounded-md bg-slate-50 px-3 py-2 text-sm text-slate-700"
          >
            <span class="font-bold text-slate-950">{{ comboNumber(index) }}</span>
            <span>{{ combo }}</span>
          </li>
        </ol>
      </div>
    </div>

    <div v-else class="mt-3 space-y-2">
      <p class="text-sm text-slate-600">
        Score estimé :
        <span class="font-semibold text-slate-950">
          {{ teamA.name }} {{ prediction.goalPredictions.teamGoals.teamA }}-{{
            prediction.goalPredictions.teamGoals.teamB
          }}
          {{ teamB.name }}
        </span>
      </p>
      <p v-if="prediction.goalPredictions.topScorers[0]" class="text-sm text-slate-600">
        Buteur possible :
        <span class="font-semibold text-slate-950">
          {{ prediction.goalPredictions.topScorers[0].name }}
        </span>
      </p>
      <ul class="space-y-1 text-sm text-slate-600">
        <li
          v-for="combo in prediction.goalPredictions.combos.slice(0, 2)"
          :key="combo"
        >
          {{ combo }}
        </li>
      </ul>
    </div>
  </section>
</template>

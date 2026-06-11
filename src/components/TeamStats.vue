<script setup lang="ts">
defineProps<{
  team: any
  performance: any
}>()

const resultClass = {
  W: 'bg-emerald-100 text-emerald-700',
  D: 'bg-amber-100 text-amber-700',
  L: 'bg-rose-100 text-rose-700',
}
</script>

<template>
  <section class="card p-5">
    <div class="flex items-center gap-3">
      <img :src="team.flagUrl" :alt="team.name" class="h-10 w-14 rounded object-cover shadow-sm" />
      <div>
        <h2 class="text-xl font-semibold">{{ team.name }}</h2>
        <p class="text-sm text-slate-500">Classement FIFA #{{ team.fifaRanking }}</p>
      </div>
    </div>

    <div class="mt-5 grid grid-cols-3 gap-3 text-center">
      <div class="rounded-md bg-slate-50 p-3">
        <p class="text-2xl font-bold text-emerald-700">{{ performance.wins }}</p>
        <p class="text-xs text-slate-500">Victoires</p>
      </div>
      <div class="rounded-md bg-slate-50 p-3">
        <p class="text-2xl font-bold text-amber-600">{{ performance.draws }}</p>
        <p class="text-xs text-slate-500">Nuls</p>
      </div>
      <div class="rounded-md bg-slate-50 p-3">
        <p class="text-2xl font-bold text-rose-600">{{ performance.losses }}</p>
        <p class="text-xs text-slate-500">Défaites</p>
      </div>
    </div>

    <div class="mt-5 grid grid-cols-2 gap-3">
      <div class="rounded-md border border-slate-200 p-3">
        <p class="text-sm text-slate-500">Buts marqués</p>
        <p class="text-lg font-semibold">{{ performance.goalsFor }} <span class="text-sm text-slate-400">/ 5 matchs</span></p>
      </div>
      <div class="rounded-md border border-slate-200 p-3">
        <p class="text-sm text-slate-500">Buts encaissés</p>
        <p class="text-lg font-semibold">{{ performance.goalsAgainst }} <span class="text-sm text-slate-400">/ 5 matchs</span></p>
      </div>
    </div>

    <div class="mt-5">
      <p class="mb-2 text-sm font-semibold text-slate-700">Derniers 5 matchs</p>
      <div class="flex gap-2">
        <span
          v-for="(result, index) in performance.lastMatches"
          :key="`${result}-${index}`"
          class="grid size-9 place-items-center rounded-full text-sm font-bold"
          :class="resultClass[result as keyof typeof resultClass]"
        >
          {{ result }}
        </span>
      </div>
    </div>
  </section>
</template>

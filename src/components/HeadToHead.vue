<script setup lang="ts">
defineProps<{
  teamA: any
  teamB: any
  headToHead: any
}>()
</script>

<template>
  <section class="card p-5">
    <h2 class="text-xl font-semibold">Confrontations directes</h2>
    <div v-if="headToHead" class="mt-4 grid gap-3 sm:grid-cols-5">
      <div class="rounded-md bg-slate-50 p-3 text-center">
        <p class="text-2xl font-bold">{{ headToHead.matchesPlayed }}</p>
        <p class="text-xs text-slate-500">Matchs</p>
      </div>
      <div class="rounded-md bg-emerald-50 p-3 text-center">
        <p class="text-2xl font-bold text-emerald-700">
          {{ headToHead.teamAId === teamA.id ? headToHead.teamAWins : headToHead.teamBWins }}
        </p>
        <p class="text-xs text-slate-500">{{ teamA.name }}</p>
      </div>
      <div class="rounded-md bg-amber-50 p-3 text-center">
        <p class="text-2xl font-bold text-amber-700">{{ headToHead.draws }}</p>
        <p class="text-xs text-slate-500">Nuls</p>
      </div>
      <div class="rounded-md bg-sky-50 p-3 text-center">
        <p class="text-2xl font-bold text-sky-700">
          {{ headToHead.teamAId === teamB.id ? headToHead.teamAWins : headToHead.teamBWins }}
        </p>
        <p class="text-xs text-slate-500">{{ teamB.name }}</p>
      </div>
      <div class="rounded-md bg-slate-50 p-3 text-center">
        <p class="text-2xl font-bold">
          {{ headToHead.teamAId === teamA.id ? headToHead.goalsA : headToHead.goalsB }}
          -
          {{ headToHead.teamAId === teamA.id ? headToHead.goalsB : headToHead.goalsA }}
        </p>
        <p class="text-xs text-slate-500">Buts</p>
      </div>
    </div>
    <p v-else class="mt-4 text-slate-500">Aucune confrontation directe disponible.</p>
  </section>
</template>

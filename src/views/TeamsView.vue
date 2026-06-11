<script setup lang="ts">
import { computed, onMounted } from 'vue'
import { useTeamStore } from '@/stores/teamStore'

const teamStore = useTeamStore()

onMounted(() => {
  teamStore.loadTeams()
})

const teams = computed(() => [...teamStore.teams].sort((a, b) => a.fifaRanking - b.fifaRanking))
</script>

<template>
  <div class="space-y-6">
    <div>
      <p class="text-sm font-semibold uppercase tracking-wide text-emerald-700">Équipes</p>
      <h1 class="mt-2 text-3xl font-bold">Classements et formes récentes</h1>
    </div>

    <section class="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      <article v-for="team in teams" :key="team.id" class="card p-5">
        <div class="flex items-center gap-3">
          <img :src="team.flagUrl" :alt="team.name" class="h-10 w-14 rounded object-cover shadow-sm" />
          <div class="min-w-0">
            <h2 class="truncate font-semibold">{{ team.name }}</h2>
            <p class="text-sm text-slate-500">Groupe {{ team.group }}</p>
          </div>
        </div>
        <div class="mt-4 rounded-md bg-slate-50 p-3">
          <p class="text-sm text-slate-500">Classement FIFA</p>
          <p class="text-2xl font-bold">#{{ team.fifaRanking }}</p>
        </div>
        <div v-if="teamStore.performanceByTeamId(team.id)" class="mt-4 flex gap-2">
          <span
            v-for="(result, index) in teamStore.performanceByTeamId(team.id).lastMatches"
            :key="`${team.id}-${index}`"
            class="grid size-8 place-items-center rounded-full text-xs font-bold"
            :class="{
              'bg-emerald-100 text-emerald-700': result === 'W',
              'bg-amber-100 text-amber-700': result === 'D',
              'bg-rose-100 text-rose-700': result === 'L',
            }"
          >
            {{ result }}
          </span>
        </div>
      </article>
    </section>
  </div>
</template>

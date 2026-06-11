<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import MatchCard from '@/components/MatchCard.vue'
import MatchFilters from '@/components/MatchFilters.vue'
import { useMatchStore } from '@/stores/matchStore'
import { useTeamStore } from '@/stores/teamStore'

const matchStore = useMatchStore()
const teamStore = useTeamStore()

const filters = ref({ group: '', team: '', date: '' })

onMounted(async () => {
  await Promise.all([matchStore.loadMatches(), teamStore.loadTeams()])
})

const teamsById = computed(() => Object.fromEntries(teamStore.teams.map((team) => [team.id, team])))

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
        Aucun module de pari sportif n’est inclus. Les données sont locales et remplaçables par une
        API via <code>apiService.js</code>.
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

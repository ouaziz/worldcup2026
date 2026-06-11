<script setup lang="ts">
import { computed, onMounted } from 'vue'
import { RouterLink, useRoute } from 'vue-router'
import FormChart from '@/components/FormChart.vue'
import HeadToHead from '@/components/HeadToHead.vue'
import MatchPrediction from '@/components/MatchPrediction.vue'
import TeamStats from '@/components/TeamStats.vue'
import { usePredictionStore } from '@/stores/predictionStore'

const route = useRoute()
const predictionStore = usePredictionStore()
const matchId = computed(() => String(route.params.id))
const context = computed(() => predictionStore.cache[matchId.value])

onMounted(() => {
  predictionStore.predictMatch(matchId.value)
})

const dateLabel = computed(() => {
  if (!context.value?.match) return ''
  return new Intl.DateTimeFormat('fr-CA', {
    dateStyle: 'full',
    timeStyle: 'short',
  }).format(new Date(context.value.match.date))
})
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

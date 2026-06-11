<script setup lang="ts">
import {
  BarElement,
  CategoryScale,
  Chart as ChartJS,
  Legend,
  LinearScale,
  RadialLinearScale,
  PointElement,
  LineElement,
  Tooltip,
} from 'chart.js'
import { computed } from 'vue'
import { Bar, Radar } from 'vue-chartjs'

ChartJS.register(
  BarElement,
  CategoryScale,
  Legend,
  LinearScale,
  RadialLinearScale,
  PointElement,
  LineElement,
  Tooltip,
)

const props = defineProps<{
  teamA: any
  teamB: any
  performanceA: any
  performanceB: any
  factors?: Record<string, number[]>
}>()

const barData = computed(() => ({
  labels: ['Victoires', 'Nuls', 'Défaites', 'Buts marqués', 'Buts encaissés'],
  datasets: [
    {
      label: props.teamA.name,
      backgroundColor: '#10b981',
      data: [
        props.performanceA.wins,
        props.performanceA.draws,
        props.performanceA.losses,
        props.performanceA.goalsFor,
        props.performanceA.goalsAgainst,
      ],
    },
    {
      label: props.teamB.name,
      backgroundColor: '#0ea5e9',
      data: [
        props.performanceB.wins,
        props.performanceB.draws,
        props.performanceB.losses,
        props.performanceB.goalsFor,
        props.performanceB.goalsAgainst,
      ],
    },
  ],
}))

const radarData = computed(() => ({
  labels: ['Classement', 'Forme', 'Attaque', 'Défense', 'Historique'],
  datasets: [
    {
      label: props.teamA.name,
      borderColor: '#059669',
      backgroundColor: 'rgba(16, 185, 129, 0.16)',
      data: [
        props.factors?.ranking?.[0] || 0,
        props.factors?.recentForm?.[0] || 0,
        props.factors?.attack?.[0] || 0,
        props.factors?.defense?.[0] || 0,
        props.factors?.headToHead?.[0] || 0,
      ],
    },
    {
      label: props.teamB.name,
      borderColor: '#0284c7',
      backgroundColor: 'rgba(14, 165, 233, 0.16)',
      data: [
        props.factors?.ranking?.[1] || 0,
        props.factors?.recentForm?.[1] || 0,
        props.factors?.attack?.[1] || 0,
        props.factors?.defense?.[1] || 0,
        props.factors?.headToHead?.[1] || 0,
      ],
    },
  ],
}))

const commonOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: { position: 'bottom' },
  },
} as const
</script>

<template>
  <section class="grid gap-4 lg:grid-cols-2">
    <div class="card p-5">
      <h2 class="mb-4 text-xl font-semibold">Comparaison récente</h2>
      <div class="h-72">
        <Bar :data="barData" :options="commonOptions" />
      </div>
    </div>
    <div class="card p-5">
      <h2 class="mb-4 text-xl font-semibold">Facteurs du modèle</h2>
      <div class="h-72">
        <Radar :data="radarData" :options="commonOptions" />
      </div>
    </div>
  </section>
</template>

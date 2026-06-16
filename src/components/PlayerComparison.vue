<script setup lang="ts">
import { computed } from 'vue'

const props = defineProps<{
  teamA: any
  teamB: any
  playersA?: any
  playersB?: any
}>()

function playerRating(player: any) {
  const historyScore = Math.min(Math.max(player.caps * 0.45 + player.goals * 1.25, 20), 100)
  const availabilityScore = player.status === 'starter' ? 100 : player.status === 'rotation' ? 82 : 62

  return Math.round(
    historyScore * 0.24 +
      player.recentForm * 0.24 +
      player.performance * 0.28 +
      player.endurance * 0.18 +
      availabilityScore * 0.06,
  )
}

function squadRating(profile: any) {
  if (!profile?.players?.length) return 0
  const total = profile.players.reduce((sum: number, player: any) => sum + playerRating(player), 0)

  return Math.round(total / profile.players.length)
}

const teamARating = computed(() => squadRating(props.playersA))
const teamBRating = computed(() => squadRating(props.playersB))

const advantageLabel = computed(() => {
  const diff = teamARating.value - teamBRating.value
  if (Math.abs(diff) <= 2) return 'Équilibre'
  return diff > 0 ? props.teamA.name : props.teamB.name
})
</script>

<template>
  <section class="card p-5">
    <div class="flex flex-col gap-2 md:flex-row md:items-end md:justify-between">
      <div>
        <h2 class="text-xl font-semibold">Comparaison des joueurs clés</h2>
        <p class="mt-1 text-sm text-slate-500">
          Historique international, forme récente, performance et endurance.
        </p>
      </div>
      <div class="rounded-md bg-slate-50 px-4 py-2 text-sm">
        <span class="text-slate-500">Avantage joueurs : </span>
        <span class="font-semibold text-slate-950">{{ advantageLabel }}</span>
      </div>
    </div>

    <div class="mt-5 grid gap-4 lg:grid-cols-2">
      <div class="rounded-md border border-slate-200 p-4">
        <div class="mb-4 flex items-center justify-between gap-3">
          <h3 class="font-semibold">{{ teamA.name }}</h3>
          <span class="rounded-full bg-emerald-50 px-3 py-1 text-sm font-bold text-emerald-700">
            {{ teamARating }}/100
          </span>
        </div>

        <div class="space-y-3">
          <div v-for="player in playersA?.players || []" :key="player.name" class="rounded-md bg-slate-50 p-3">
            <div class="flex items-start justify-between gap-3">
              <div>
                <p class="font-semibold text-slate-950">{{ player.name }}</p>
                <p class="text-sm text-slate-500">{{ player.position }} · {{ player.age }} ans · {{ player.status }}</p>
              </div>
              <span class="text-lg font-bold text-emerald-700">{{ playerRating(player) }}</span>
            </div>
            <dl class="mt-3 grid grid-cols-2 gap-2 text-sm sm:grid-cols-4">
              <div>
                <dt class="text-slate-500">Historique</dt>
                <dd class="font-semibold">{{ player.caps }} sél. / {{ player.goals }} buts</dd>
              </div>
              <div>
                <dt class="text-slate-500">Forme</dt>
                <dd class="font-semibold">{{ player.recentForm }}/100</dd>
              </div>
              <div>
                <dt class="text-slate-500">Performance</dt>
                <dd class="font-semibold">{{ player.performance }}/100</dd>
              </div>
              <div>
                <dt class="text-slate-500">Endurance</dt>
                <dd class="font-semibold">{{ player.endurance }}/100</dd>
              </div>
            </dl>
          </div>
        </div>
      </div>

      <div class="rounded-md border border-slate-200 p-4">
        <div class="mb-4 flex items-center justify-between gap-3">
          <h3 class="font-semibold">{{ teamB.name }}</h3>
          <span class="rounded-full bg-sky-50 px-3 py-1 text-sm font-bold text-sky-700">
            {{ teamBRating }}/100
          </span>
        </div>

        <div class="space-y-3">
          <div v-for="player in playersB?.players || []" :key="player.name" class="rounded-md bg-slate-50 p-3">
            <div class="flex items-start justify-between gap-3">
              <div>
                <p class="font-semibold text-slate-950">{{ player.name }}</p>
                <p class="text-sm text-slate-500">{{ player.position }} · {{ player.age }} ans · {{ player.status }}</p>
              </div>
              <span class="text-lg font-bold text-sky-700">{{ playerRating(player) }}</span>
            </div>
            <dl class="mt-3 grid grid-cols-2 gap-2 text-sm sm:grid-cols-4">
              <div>
                <dt class="text-slate-500">Historique</dt>
                <dd class="font-semibold">{{ player.caps }} sél. / {{ player.goals }} buts</dd>
              </div>
              <div>
                <dt class="text-slate-500">Forme</dt>
                <dd class="font-semibold">{{ player.recentForm }}/100</dd>
              </div>
              <div>
                <dt class="text-slate-500">Performance</dt>
                <dd class="font-semibold">{{ player.performance }}/100</dd>
              </div>
              <div>
                <dt class="text-slate-500">Endurance</dt>
                <dd class="font-semibold">{{ player.endurance }}/100</dd>
              </div>
            </dl>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

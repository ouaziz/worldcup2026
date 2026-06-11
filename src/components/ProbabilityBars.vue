<script setup lang="ts">
defineProps<{
  probabilities: { teamAWin: number; draw: number; teamBWin: number }
  teamAName: string
  teamBName: string
}>()
</script>

<template>
  <div class="space-y-3">
    <div>
      <div class="mb-1 flex justify-between text-sm font-medium">
        <span>{{ teamAName }}</span>
        <span>{{ probabilities.teamAWin }}%</span>
      </div>
      <div class="h-3 overflow-hidden rounded-full bg-slate-100">
        <div class="h-full rounded-full bg-emerald-500" :style="{ width: `${probabilities.teamAWin}%` }"></div>
      </div>
    </div>

    <div>
      <div class="mb-1 flex justify-between text-sm font-medium">
        <span>Match nul</span>
        <span>{{ probabilities.draw }}%</span>
      </div>
      <div class="h-3 overflow-hidden rounded-full bg-slate-100">
        <div class="h-full rounded-full bg-amber-400" :style="{ width: `${probabilities.draw}%` }"></div>
      </div>
    </div>

    <div>
      <div class="mb-1 flex justify-between text-sm font-medium">
        <span>{{ teamBName }}</span>
        <span>{{ probabilities.teamBWin }}%</span>
      </div>
      <div class="h-3 overflow-hidden rounded-full bg-slate-100">
        <div class="h-full rounded-full bg-sky-500" :style="{ width: `${probabilities.teamBWin}%` }"></div>
      </div>
    </div>
  </div>
</template>

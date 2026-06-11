<script setup lang="ts">
const props = defineProps<{
  groups: string[]
  teams: any[]
  modelValue: { group: string; team: string; date: string }
}>()

const emit = defineEmits<{
  'update:modelValue': [value: { group: string; team: string; date: string }]
}>()

function updateField(field: 'group' | 'team' | 'date', value: string) {
  emit('update:modelValue', { ...props.modelValue, [field]: value })
}
</script>

<template>
  <section class="card p-4">
    <div class="grid gap-3 md:grid-cols-4">
      <label class="space-y-1">
        <span class="text-xs font-semibold uppercase tracking-wide text-slate-500">Groupe</span>
        <select
          class="focus-ring w-full rounded-md border border-slate-300 bg-white px-3 py-2"
          :value="modelValue.group"
          @change="updateField('group', ($event.target as HTMLSelectElement).value)"
        >
          <option value="">Tous</option>
          <option v-for="group in groups" :key="group" :value="group">Groupe {{ group }}</option>
        </select>
      </label>

      <label class="space-y-1">
        <span class="text-xs font-semibold uppercase tracking-wide text-slate-500">Équipe</span>
        <select
          class="focus-ring w-full rounded-md border border-slate-300 bg-white px-3 py-2"
          :value="modelValue.team"
          @change="updateField('team', ($event.target as HTMLSelectElement).value)"
        >
          <option value="">Toutes</option>
          <option v-for="team in teams" :key="team.id" :value="team.id">{{ team.name }}</option>
        </select>
      </label>

      <label class="space-y-1">
        <span class="text-xs font-semibold uppercase tracking-wide text-slate-500">Date</span>
        <input
          class="focus-ring w-full rounded-md border border-slate-300 px-3 py-2"
          type="date"
          :value="modelValue.date"
          @input="updateField('date', ($event.target as HTMLInputElement).value)"
        />
      </label>

      <button
        class="focus-ring self-end rounded-md border border-slate-300 px-4 py-2 font-medium text-slate-700 hover:bg-slate-100"
        type="button"
        @click="emit('update:modelValue', { group: '', team: '', date: '' })"
      >
        Réinitialiser
      </button>
    </div>
  </section>
</template>

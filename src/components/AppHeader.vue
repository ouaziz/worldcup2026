<template>
  <header class="border-b border-slate-200 bg-white">
    <div class="mx-auto flex max-w-7xl flex-col gap-4 px-4 py-4 sm:px-6 md:flex-row md:items-center md:justify-between lg:px-8">
      <RouterLink to="/" class="flex items-center gap-3">
        <span class="grid size-10 place-items-center rounded-lg bg-emerald-600 font-bold text-white">WC</span>
        <div>
          <p class="text-lg font-semibold leading-tight text-slate-950">World Cup Predictor</p>
          <p class="text-sm text-slate-500">Modèle éducatif et statistique</p>
        </div>
      </RouterLink>

      <nav class="flex flex-wrap gap-2 text-sm font-medium">
        <RouterLink class="rounded-md px-3 py-2 text-slate-600 hover:bg-slate-100" to="/">Matchs</RouterLink>
        <RouterLink class="rounded-md px-3 py-2 text-slate-600 hover:bg-slate-100" to="/teams">Équipes</RouterLink>
        <RouterLink class="rounded-md px-3 py-2 text-slate-600 hover:bg-slate-100" to="/about">À propos</RouterLink>
      </nav>
    </div>
  </header>
</template>

<style scoped>
.router-link-active {
  background: #ecfdf5;
  color: #047857;
}
</style>

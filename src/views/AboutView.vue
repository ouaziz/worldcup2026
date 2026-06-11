<template>
  <div class="space-y-6">
    <section class="card p-6">
      <p class="text-sm font-semibold uppercase tracking-wide text-emerald-700">À propos</p>
      <h1 class="mt-2 text-3xl font-bold">Application éducative de prédiction football</h1>
      <p class="mt-4 max-w-3xl text-slate-600">
        Cette application Vue 3 calcule des probabilités indicatives à partir de données JSON
        locales. Le modèle est volontairement simple, transparent et conçu pour être remplacé ou
        enrichi par de vraies sources statistiques.
      </p>
    </section>

    <section class="grid gap-4 md:grid-cols-2">
      <article class="card p-5">
        <h2 class="text-xl font-semibold">Ce que le modèle utilise</h2>
        <ul class="mt-3 space-y-2 text-slate-600">
          <li>Classement FIFA</li>
          <li>Forme récente sur les 5 derniers matchs</li>
          <li>Moyenne de buts marqués et encaissés</li>
          <li>Historique des confrontations directes</li>
          <li>Avantage terrain et importance du match</li>
        </ul>
      </article>
      <article class="card p-5">
        <h2 class="text-xl font-semibold">Limites</h2>
        <p class="mt-3 text-slate-600">
          Les résultats ne sont pas des certitudes et ne doivent pas être utilisés comme conseil
          financier ou sportif. Aucune fonctionnalité de pari sportif n’est présente dans
          l’application.
        </p>
      </article>
    </section>
  </div>
</template>

<template>
  <div class="rounded-[var(--radius-lg)] border border-[var(--color-border-soft)] bg-[var(--color-surface)] p-5 sm:p-6">
    <ul class="grid gap-4 text-sm leading-6 text-[var(--color-text-secondary)] sm:grid-cols-2" role="list">
      <li>
        <strong class="block font-semibold text-[var(--color-text-primary)]">Weather requests</strong>
        Forecast and city search requests go directly to Open-Meteo.
      </li>
      <li>
        <strong class="block font-semibold text-[var(--color-text-primary)]">Local planning</strong>
        The selected city, todos, countdowns, and bookmarks stay in this browser.
      </li>
      <li>
        <strong class="block font-semibold text-[var(--color-text-primary)]">Tools input</strong>
        Text and data entered in Tools is processed locally and is not saved.
      </li>
      <li>
        <strong class="block font-semibold text-[var(--color-text-primary)]">Backup files</strong>
        Exports are downloaded locally. Imports are read only after selection and are never uploaded.
      </li>
    </ul>
  </div>
</template>

<script setup lang="ts">
import { useI18n } from '@/i18n/useI18n'

interface Props {
  searchQuery: string
  activeCategory: string | null
  categories: string[]
  hasUncategorized: boolean
}

interface Emits {
  updateSearch: [query: string]
  updateCategory: [category: string | null]
  clear: []
}

defineProps<Props>()
const emit = defineEmits<Emits>()
const { t } = useI18n()

const ALL_VALUE = '__all__'
const UNCATEGORIZED_VALUE = '__uncategorized__'

function categoryValue(category: string | null) {
  if (category === null) return ALL_VALUE
  if (category === '') return UNCATEGORIZED_VALUE
  return `category:${encodeURIComponent(category)}`
}

function handleCategoryChange(event: Event) {
  const value = (event.target as HTMLSelectElement).value

  if (value === ALL_VALUE) {
    emit('updateCategory', null)
  } else if (value === UNCATEGORIZED_VALUE) {
    emit('updateCategory', '')
  } else {
    emit('updateCategory', decodeURIComponent(value.slice('category:'.length)))
  }
}
</script>

<template>
  <section
    class="rounded-[var(--radius-md)] border border-[var(--color-border-soft)] bg-[var(--color-surface)] p-4"
    aria-labelledby="bookmark-controls-title"
  >
    <h2 id="bookmark-controls-title" class="sr-only">
      {{ t('bookmarks.controls.title') }}
    </h2>
    <div class="grid gap-4 md:grid-cols-[minmax(0,1fr)_15rem_auto] md:items-end">
      <div class="space-y-2">
        <label class="block text-sm font-semibold" for="bookmark-search">
          {{ t('bookmarks.controls.searchLabel') }}
        </label>
        <input
          id="bookmark-search"
          :value="searchQuery"
          autocomplete="off"
          class="min-h-11 w-full rounded-[var(--radius-sm)] border border-[var(--color-control-border)] bg-[var(--color-surface-inset)] px-3 text-[var(--color-text-primary)] placeholder:text-[var(--color-text-tertiary)] hover:border-[var(--color-accent)]"
          :placeholder="t('bookmarks.controls.searchPlaceholder')"
          type="search"
          @input="emit('updateSearch', ($event.target as HTMLInputElement).value)"
        />
      </div>

      <div class="space-y-2">
        <label class="block text-sm font-semibold" for="bookmark-category-filter">
          {{ t('bookmarks.controls.categoryLabel') }}
        </label>
        <select
          id="bookmark-category-filter"
          class="min-h-11 w-full rounded-[var(--radius-sm)] border border-[var(--color-control-border)] bg-[var(--color-surface-inset)] px-3 text-[var(--color-text-primary)] hover:border-[var(--color-accent)]"
          :value="categoryValue(activeCategory)"
          @change="handleCategoryChange"
        >
          <option :value="ALL_VALUE">{{ t('bookmarks.controls.allCategories') }}</option>
          <option v-if="hasUncategorized" :value="UNCATEGORIZED_VALUE">
            {{ t('bookmarks.controls.uncategorized') }}
          </option>
          <option
            v-for="category in categories"
            :key="category.toLocaleLowerCase()"
            :value="categoryValue(category)"
          >
            {{ category }}
          </option>
        </select>
      </div>

      <button
        class="interactive-surface min-h-11 rounded-[var(--radius-sm)] px-3 text-sm font-medium text-[var(--color-accent-text)] hover:bg-[var(--color-accent-wash)] disabled:cursor-not-allowed disabled:opacity-55"
        :disabled="!searchQuery && activeCategory === null"
        type="button"
        @click="emit('clear')"
      >
        {{ t('bookmarks.controls.clear') }}
      </button>
    </div>
  </section>
</template>

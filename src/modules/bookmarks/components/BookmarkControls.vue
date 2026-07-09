<script setup lang="ts">
import { computed } from 'vue'
import BaseInput from '@/components/base/BaseInput.vue'
import BaseSurface from '@/components/base/BaseSurface.vue'
import SectionHeader from '@/components/base/SectionHeader.vue'
import { useI18n } from '@/i18n/useI18n'

interface Props {
  searchQuery: string
  activeCategory: string | null
  categories: string[]
  hasUncategorized: boolean
  pinnedOnly: boolean
}

interface Emits {
  updateSearch: [query: string]
  updateCategory: [category: string | null]
  updatePinnedOnly: [value: boolean]
  clear: []
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()
const { t } = useI18n()

const hasActiveFilters = computed(
  () =>
    props.searchQuery.trim().length > 0 ||
    props.activeCategory !== null ||
    props.pinnedOnly,
)

function selectAll() {
  emit('updatePinnedOnly', false)
  emit('updateCategory', null)
}

function selectPinned() {
  emit('updatePinnedOnly', true)
  emit('updateCategory', null)
}

function selectCategory(category: string) {
  emit('updatePinnedOnly', false)
  emit('updateCategory', category)
}
</script>

<template>
  <BaseSurface
    as="section"
    class="bookmarks-controls"
    aria-labelledby="bookmark-controls-title"
    padding="sm"
    variant="plain"
  >
    <SectionHeader
      :description="t('bookmarks.controls.description')"
      :title="t('bookmarks.controls.title')"
      title-id="bookmark-controls-title"
    >
      <template #actions>
      <button
        class="interactive-surface bookmarks-controls__clear"
        :disabled="!hasActiveFilters"
        type="button"
        @click="emit('clear')"
      >
        {{ t('bookmarks.controls.clear') }}
      </button>
      </template>
    </SectionHeader>

    <div class="bookmarks-controls__search">
      <div class="space-y-2">
        <label class="block text-sm font-semibold" for="bookmark-search">
          {{ t('bookmarks.controls.searchLabel') }}
        </label>
        <BaseInput
          id="bookmark-search"
          :model-value="searchQuery"
          :placeholder="t('bookmarks.controls.searchPlaceholder')"
          type="search"
          @update:model-value="emit('updateSearch', $event)"
        />
      </div>
    </div>

    <div class="bookmarks-controls__filters" :aria-label="t('bookmarks.controls.categoryLabel')">
      <button
        class="interactive-surface bookmarks-controls__chip"
        :class="{ 'is-active': !pinnedOnly && activeCategory === null }"
        type="button"
        :aria-pressed="!pinnedOnly && activeCategory === null"
        @click="selectAll"
      >
        {{ t('bookmarks.controls.allCategories') }}
      </button>
      <button
        class="interactive-surface bookmarks-controls__chip"
        :class="{ 'is-active': pinnedOnly }"
        type="button"
        :aria-pressed="pinnedOnly"
        @click="selectPinned"
      >
        {{ t('bookmarks.controls.pinnedOnly') }}
      </button>
      <button
        v-if="hasUncategorized"
        class="interactive-surface bookmarks-controls__chip"
        :class="{ 'is-active': !pinnedOnly && activeCategory === '' }"
        type="button"
        :aria-pressed="!pinnedOnly && activeCategory === ''"
        @click="selectCategory('')"
      >
        {{ t('bookmarks.controls.uncategorized') }}
      </button>
      <button
        v-for="category in categories"
        :key="category.toLocaleLowerCase()"
        class="interactive-surface bookmarks-controls__chip"
        :class="{ 'is-active': !pinnedOnly && activeCategory === category }"
        type="button"
        :aria-pressed="!pinnedOnly && activeCategory === category"
        @click="selectCategory(category)"
      >
        {{ category }}
      </button>
    </div>
  </BaseSurface>
</template>

<style scoped>
.bookmarks-controls {
  display: grid;
  gap: var(--space-3);
  border-color: color-mix(in srgb, var(--color-border-soft) 80%, transparent);
  background: color-mix(in srgb, var(--color-surface-raised) 78%, var(--color-canvas));
  box-shadow: none;
}

.bookmarks-controls :deep(.section-header) {
  gap: var(--space-2);
}

.bookmarks-controls :deep(.section-header__title) {
  font-size: 1.25rem;
}

.bookmarks-controls :deep(.section-header__description) {
  max-width: 32rem;
  font-size: var(--font-size-caption);
}

.bookmarks-controls__clear {
  min-height: 2.75rem;
  border-radius: var(--radius-sm);
  padding: 0 var(--space-3);
  color: var(--color-accent-text);
  font-size: var(--font-size-label);
  font-weight: var(--font-weight-medium);
}

.bookmarks-controls__clear:hover {
  background: var(--color-accent-wash);
}

.bookmarks-controls__clear:disabled {
  cursor: not-allowed;
  opacity: 0.55;
}

.bookmarks-controls__filters {
  display: flex;
  gap: var(--space-2);
  overflow-x: auto;
  padding-bottom: 0.125rem;
  scrollbar-width: thin;
}

.bookmarks-controls__chip {
  min-height: 2.75rem;
  max-width: 18rem;
  flex: 0 0 auto;
  border: 1px solid var(--color-border-soft);
  border-radius: var(--radius-pill);
  background: var(--color-surface-raised);
  color: var(--color-text-secondary);
  padding: 0 var(--space-3);
  font-size: var(--font-size-label);
  font-weight: var(--font-weight-medium);
  overflow-wrap: anywhere;
}

.bookmarks-controls__chip:hover,
.bookmarks-controls__chip.is-active {
  border-color: var(--color-accent);
  background: var(--color-accent-wash);
  color: var(--color-accent-text);
}

@media (max-width: 40rem) {
  .bookmarks-controls {
    gap: var(--space-3);
  }

  .bookmarks-controls__clear,
  .bookmarks-controls__chip {
    min-height: 2.5rem;
  }

  .bookmarks-controls__chip {
    padding: 0 var(--space-2);
  }
}
</style>

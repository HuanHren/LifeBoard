<script setup lang="ts">
import { computed, onMounted, shallowRef, useTemplateRef } from 'vue'
import { storeToRefs } from 'pinia'
import BaseEmpty from '@/components/base/BaseEmpty.vue'
import BaseError from '@/components/base/BaseError.vue'
import BaseSkeleton from '@/components/base/BaseSkeleton.vue'
import BaseButton from '@/components/base/BaseButton.vue'
import BaseSurface from '@/components/base/BaseSurface.vue'
import StatCard from '@/components/base/StatCard.vue'
import { useI18n } from '@/i18n/useI18n'
import BookmarkComposer from '@/modules/bookmarks/components/BookmarkComposer.vue'
import BookmarkControls from '@/modules/bookmarks/components/BookmarkControls.vue'
import BookmarkSection from '@/modules/bookmarks/components/BookmarkSection.vue'
import { useBookmarksStore } from '@/modules/bookmarks/stores/bookmarks'
import { localizeBookmarkError } from '@/modules/bookmarks/utils/bookmarksI18n'

const { t } = useI18n()
const bookmarksStore = useBookmarksStore()
const {
  activeCategory,
  bookmarks,
  categories,
  filteredBookmarks,
  filteredPinnedBookmarks,
  hasBookmarks,
  isInitialized,
  persistenceError,
  searchQuery,
} = storeToRefs(bookmarksStore)
const {
  clearFilters,
  initializeBookmarks,
  setActiveCategory,
  setSearchQuery,
} = bookmarksStore
const composer = useTemplateRef<InstanceType<typeof BookmarkComposer>>('composer')
const pinnedOnly = shallowRef(false)

const hasUncategorized = computed(() =>
  bookmarks.value.some((bookmark) => bookmark.category === null),
)
const filtersActive = computed(
  () => searchQuery.value.trim().length > 0 || activeCategory.value !== null || pinnedOnly.value,
)
const totalCount = computed(() => bookmarks.value.length)
const pinnedCount = computed(() => bookmarks.value.filter((bookmark) => bookmark.pinned).length)
const categoryCount = computed(() => categories.value.length + (hasUncategorized.value ? 1 : 0))
const visiblePinnedBookmarks = computed(() => filteredPinnedBookmarks.value)
const visibleSavedBookmarks = computed(() =>
  pinnedOnly.value ? [] : filteredBookmarks.value,
)
const visibleCount = computed(
  () => visiblePinnedBookmarks.value.length + visibleSavedBookmarks.value.length,
)
const workspaceHasVisibleBookmarks = computed(() => visibleCount.value > 0)
const hasOnlyPinnedEmpty = computed(() => pinnedOnly.value && pinnedCount.value === 0)

const totalLabel = computed(() =>
  totalCount.value === 1
    ? t('bookmarks.hero.totalOne')
    : t('bookmarks.hero.totalMany', { count: totalCount.value }),
)
const pinnedLabel = computed(() =>
  pinnedCount.value === 1
    ? t('bookmarks.hero.pinnedOne')
    : t('bookmarks.hero.pinnedMany', { count: pinnedCount.value }),
)
const categoryLabel = computed(() =>
  categoryCount.value === 1
    ? t('bookmarks.hero.categoryOne')
    : t('bookmarks.hero.categoryMany', { count: categoryCount.value }),
)
const visibleLabel = computed(() =>
  visibleCount.value === 1
    ? t('bookmarks.hero.visibleOne')
    : t('bookmarks.hero.visibleMany', { count: visibleCount.value }),
)

function focusComposer() {
  composer.value?.focusTitle()
}

function clearAllFilters() {
  pinnedOnly.value = false
  clearFilters()
}

function setPinnedOnly(value: boolean) {
  pinnedOnly.value = value
}

onMounted(() => {
  initializeBookmarks()
})
</script>

<template>
  <div class="bookmarks-workspace">
    <BaseSurface as="section" class="bookmarks-hero" aria-labelledby="bookmarks-title" padding="lg" variant="raised">
      <div class="bookmarks-hero__copy">
        <p class="bookmarks-hero__eyebrow">{{ t('bookmarks.hero.eyebrow') }}</p>
        <h1 id="bookmarks-title" class="bookmarks-hero__title">
          {{ t('bookmarks.page.title') }}
        </h1>
        <p class="bookmarks-hero__description">
          {{ t('bookmarks.page.description') }}
        </p>
        <div class="bookmarks-hero__actions" :aria-label="t('bookmarks.hero.actionsLabel')">
          <BaseButton variant="primary" @click="focusComposer">
            {{ t('bookmarks.hero.primaryAction') }}
          </BaseButton>
          <BaseButton variant="secondary" @click="clearAllFilters">
            {{ t('bookmarks.hero.secondaryAction') }}
          </BaseButton>
        </div>
      </div>

      <dl class="bookmarks-hero__metrics" :aria-label="t('bookmarks.hero.metricsLabel')">
        <StatCard
          :label="t('bookmarks.hero.totalLabel')"
          :value="totalLabel"
          value-kind="semantic"
        />
        <StatCard
          :label="t('bookmarks.hero.pinnedLabel')"
          :tone="pinnedCount > 0 ? 'accent' : 'default'"
          :value="pinnedLabel"
          value-kind="semantic"
        />
        <StatCard
          :label="t('bookmarks.hero.categoriesLabel')"
          :value="categoryLabel"
          value-kind="semantic"
        />
        <StatCard
          :label="t('bookmarks.hero.visibleLabel')"
          :value="visibleLabel"
          value-kind="semantic"
        />
      </dl>
    </BaseSurface>

    <BaseSkeleton v-if="!isInitialized" :label="t('home.bookmarks.loading')" />

    <template v-else>
      <div class="bookmarks-workspace__grid">
        <aside class="bookmarks-workspace__side" :aria-label="t('bookmarks.composer.panelLabel')">
          <BookmarkComposer ref="composer" />
        </aside>

        <div class="bookmarks-workspace__main">
          <BookmarkControls
            :active-category="activeCategory"
            :categories="categories"
            :has-uncategorized="hasUncategorized"
            :pinned-only="pinnedOnly"
            :search-query="searchQuery"
            @clear="clearAllFilters"
            @update-category="setActiveCategory"
            @update-pinned-only="setPinnedOnly"
            @update-search="setSearchQuery"
          />

          <BaseError
            v-if="persistenceError"
            :message="localizeBookmarkError(persistenceError, t) ?? ''"
            :title="t('bookmarks.error.persistenceTitle')"
          />

          <BaseEmpty
            v-if="!hasBookmarks"
            :action-label="t('bookmarks.form.addAction')"
            :description="t('bookmarks.empty.description')"
            :title="t('bookmarks.empty.title')"
            @action="focusComposer"
          />

          <BaseEmpty
            v-else-if="!workspaceHasVisibleBookmarks"
            :action-label="t('bookmarks.controls.clear')"
            :description="
              hasOnlyPinnedEmpty
                ? t('bookmarks.empty.pinnedDescription')
                : t('bookmarks.empty.filteredDescription')
            "
            :title="
              hasOnlyPinnedEmpty
                ? t('bookmarks.empty.pinnedTitle')
                : t('bookmarks.empty.filteredTitle')
            "
            @action="clearAllFilters"
          />

          <template v-else>
            <BookmarkSection
              v-if="visiblePinnedBookmarks.length > 0"
              :bookmarks="visiblePinnedBookmarks"
              :description="t('bookmarks.section.pinnedDescription')"
              :title="t('bookmarks.section.pinned')"
              tone="pinned"
            />

            <BookmarkSection
              v-if="visibleSavedBookmarks.length > 0"
              :bookmarks="visibleSavedBookmarks"
              :description="
                filtersActive
                  ? t('bookmarks.section.filteredDescription')
                  : t('bookmarks.section.savedDescription')
              "
              :title="t('bookmarks.section.saved')"
            />
          </template>
        </div>
      </div>
    </template>
  </div>
</template>

<style scoped>
.bookmarks-workspace {
  display: grid;
  gap: var(--section-gap);
}

.bookmarks-hero {
  display: grid;
  gap: var(--space-5);
  background: var(--color-surface-raised);
}

.bookmarks-hero__copy {
  min-width: 0;
  max-width: 46rem;
}

.bookmarks-hero__eyebrow {
  color: var(--color-accent-text);
  font-size: var(--font-size-caption);
  font-weight: var(--font-weight-semibold);
}

.bookmarks-hero__title {
  margin-top: var(--space-2);
  color: var(--color-text-primary);
  font-size: var(--font-size-page-title);
  font-weight: var(--font-weight-semibold);
  line-height: var(--line-height-tight);
}

.bookmarks-hero__description {
  max-width: 42rem;
  margin-top: var(--space-3);
  color: var(--color-text-secondary);
  font-size: var(--font-size-body-small);
  line-height: 1.65;
}

.bookmarks-hero__actions {
  display: flex;
  flex-wrap: wrap;
  gap: var(--space-3);
  margin-top: var(--space-5);
}

.bookmarks-hero__metrics {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: var(--space-2);
}

.bookmarks-workspace__grid {
  display: grid;
  gap: var(--space-5);
  align-items: start;
}

.bookmarks-workspace__side,
.bookmarks-workspace__main {
  min-width: 0;
}

.bookmarks-workspace__side {
  order: 2;
}

.bookmarks-workspace__main {
  display: grid;
  gap: var(--space-5);
  order: 1;
}

@media (min-width: 64rem) {
  .bookmarks-hero {
    grid-template-columns: minmax(0, 1.35fr) minmax(20rem, 0.65fr);
    align-items: end;
  }

  .bookmarks-workspace__grid {
    grid-template-columns: minmax(18rem, 0.42fr) minmax(0, 1fr);
  }

  .bookmarks-workspace__side {
    order: 1;
    position: sticky;
    top: calc(var(--top-nav-height) + var(--space-4));
  }

  .bookmarks-workspace__main {
    order: 2;
  }
}

@media (max-width: 40rem) {
  .bookmarks-workspace {
    gap: var(--space-4);
  }

  .bookmarks-hero {
    gap: var(--space-4);
  }

  .bookmarks-hero__title {
    margin-top: var(--space-1);
  }

  .bookmarks-hero__description {
    margin-top: var(--space-2);
    line-height: 1.5;
  }

  .bookmarks-hero__actions {
    gap: var(--space-2);
    margin-top: var(--space-3);
  }

  .bookmarks-hero__metrics {
    gap: var(--space-1);
  }

  .bookmarks-workspace__grid,
  .bookmarks-workspace__main {
    gap: var(--space-4);
  }
}
</style>

<script setup lang="ts">
import { computed, onMounted } from 'vue'
import { storeToRefs } from 'pinia'
import { RouterLink } from 'vue-router'
import BaseSkeleton from '@/components/base/BaseSkeleton.vue'
import { useBookmarksStore } from '@/modules/bookmarks/stores/bookmarks'
import { formatBookmarkUrl } from '@/modules/bookmarks/utils/bookmarkUrl'

const bookmarksStore = useBookmarksStore()
const {
  hasBookmarks,
  isInitialized,
  persistenceError,
  summaryBookmarks,
} = storeToRefs(bookmarksStore)
const { initializeBookmarks } = bookmarksStore

const visibleBookmarks = computed(() => summaryBookmarks.value.slice(0, 3))

onMounted(() => {
  initializeBookmarks()
})
</script>

<template>
  <section aria-labelledby="home-bookmarks-title">
    <div class="mb-4 flex flex-wrap items-end justify-between gap-3">
      <div>
        <h2
          id="home-bookmarks-title"
          class="text-section-title text-balance text-[var(--color-text-primary)]"
        >
          Reference shelf
        </h2>
        <p class="mt-2 text-sm leading-6 text-pretty text-[var(--color-text-secondary)]">
          A quiet view of useful links saved in this browser.
        </p>
      </div>
      <RouterLink
        class="interactive-surface inline-flex min-h-11 items-center rounded-[var(--radius-sm)] px-3 text-sm font-medium text-[var(--color-accent-text)] hover:bg-[var(--color-accent-wash)]"
        :to="{ name: 'bookmarks' }"
      >
        Open Bookmarks
        <span class="ml-2" aria-hidden="true">&rarr;</span>
      </RouterLink>
    </div>

    <BaseSkeleton v-if="!isInitialized" label="Loading your bookmark summary" />

    <div
      v-else-if="persistenceError"
      class="rounded-[var(--radius-md)] border border-[var(--color-danger)] bg-[var(--color-danger-soft)] p-4"
      role="alert"
    >
      <p class="text-sm font-semibold text-[var(--color-text-primary)]">
        Saved bookmark data needs attention
      </p>
      <p class="mt-1 max-w-2xl text-sm leading-6 text-pretty text-[var(--color-text-primary)]">
        {{ persistenceError }}
      </p>
      <RouterLink
        class="interactive-surface mt-3 inline-flex min-h-11 items-center rounded-[var(--radius-sm)] px-3 text-sm font-medium text-[var(--color-accent-text)] hover:bg-[var(--color-surface-raised)]"
        :to="{ name: 'bookmarks' }"
      >
        Review in Bookmarks
        <span class="ml-2" aria-hidden="true">&rarr;</span>
      </RouterLink>
    </div>

    <article
      v-else-if="hasBookmarks"
      class="grid overflow-hidden rounded-[var(--radius-lg)] border border-[var(--color-border)] bg-[var(--color-surface-raised)] lg:grid-cols-[minmax(15rem,0.55fr)_minmax(0,1.45fr)]"
    >
      <div class="bg-[var(--color-accent-wash)] p-6 sm:p-8">
        <p class="text-caption font-medium text-[var(--color-accent-text)]">
          Saved locally
        </p>
        <h3 class="mt-2 text-lg font-semibold text-balance text-[var(--color-text-primary)]">
          Useful links, close at hand
        </h3>
        <p class="mt-3 max-w-md text-sm leading-6 text-pretty text-[var(--color-text-secondary)]">
          Pinned references appear first. Home shows only the title, address, and category you
          saved.
        </p>
      </div>

      <ul
        class="divide-y divide-[var(--color-border-soft)] lg:border-l lg:border-[var(--color-border-soft)]"
        aria-label="Saved bookmark summary"
      >
        <li
          v-for="bookmark in visibleBookmarks"
          :key="bookmark.id"
          class="min-w-0"
        >
          <a
            class="interactive-surface flex min-h-11 min-w-0 flex-col gap-3 px-5 py-4 hover:bg-[var(--color-surface)] focus-visible:outline-offset-[-3px] sm:flex-row sm:items-start sm:justify-between"
            :href="bookmark.url"
            rel="noopener noreferrer"
            target="_blank"
          >
            <div class="min-w-0">
              <div class="flex flex-wrap items-center gap-x-2 gap-y-1">
                <span class="font-semibold text-[var(--color-text-primary)]">
                {{ bookmark.title }}
                </span>
                <span
                  v-if="bookmark.pinned"
                  class="text-caption font-medium text-[var(--color-accent-text)]"
                >
                  Pinned
                </span>
                <span
                  v-if="bookmark.category"
                  class="text-caption text-[var(--color-text-secondary)]"
                >
                  {{ bookmark.category }}
                </span>
              </div>
              <p
                class="mt-1 max-w-full break-words text-caption leading-5 text-[var(--color-text-secondary)]"
              >
                {{ formatBookmarkUrl(bookmark.url) }}
              </p>
            </div>
            <span class="shrink-0 text-caption font-medium text-[var(--color-accent-text)]">
              Open in new tab
              <span aria-hidden="true">&nearr;</span>
            </span>
          </a>
        </li>
      </ul>
    </article>

    <article
      v-else
      class="rounded-[var(--radius-lg)] border border-dashed border-[var(--color-border)] bg-[var(--color-surface)] p-6 sm:p-8"
    >
      <h3 class="text-section-title text-balance text-[var(--color-text-primary)]">
        Connect your reference shelf
      </h3>
      <p class="mt-2 max-w-xl text-sm leading-6 text-pretty text-[var(--color-text-secondary)]">
        Save a link in Bookmarks to connect this reference shelf.
      </p>
      <RouterLink
        class="interactive-surface mt-4 inline-flex min-h-11 items-center rounded-[var(--radius-sm)] border border-[var(--color-accent)] bg-[var(--color-accent)] px-4 text-sm font-medium text-[var(--color-text-inverse)] hover:bg-[var(--color-accent-hover)]"
        :to="{ name: 'bookmarks' }"
      >
        Open Bookmarks
      </RouterLink>
    </article>
  </section>
</template>

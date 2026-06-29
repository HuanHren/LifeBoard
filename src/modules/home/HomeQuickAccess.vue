<script setup lang="ts">
import { computed } from 'vue'
import { RouterLink } from 'vue-router'
import BaseError from '@/components/base/BaseError.vue'
import BaseIcon from '@/components/base/BaseIcon.vue'
import BaseSkeleton from '@/components/base/BaseSkeleton.vue'
import BaseSurface from '@/components/base/BaseSurface.vue'
import type { TranslationKey } from '@/i18n/keys'
import { useI18n } from '@/i18n/useI18n'
import type { Bookmark } from '@/modules/bookmarks/types/bookmarks'
import type { ToolDefinition, ToolId } from '@/modules/tools/types/tools'

interface Props {
  bookmarks: Bookmark[]
  tools: ToolDefinition[]
  bookmarksInitialized: boolean
  bookmarksError: string | null
}

const props = defineProps<Props>()
const { t } = useI18n()

const hasQuickAccess = computed(() => props.bookmarks.length > 0 || props.tools.length > 0)
const toolShortLabels: Record<ToolId, TranslationKey> = {
  json: 'tools.definition.json.short',
  timestamp: 'tools.definition.timestamp.short',
  whitespace: 'tools.definition.whitespace.short',
  deduplicate: 'tools.definition.deduplicate.short',
  case: 'tools.definition.case.short',
  counter: 'tools.definition.counter.short',
}

function displayBookmarkHost(url: string) {
  try {
    return new URL(url).hostname.replace(/^www\./, '')
  } catch {
    return t('home.quick.bookmarkAddressFallback')
  }
}
</script>

<template>
  <section aria-labelledby="home-quick-title">
    <div class="mb-4 flex flex-wrap items-end justify-between gap-3">
      <div>
        <p class="text-caption font-semibold text-[var(--color-accent-text)]">
          {{ t('home.quick.eyebrow') }}
        </p>
        <h2 id="home-quick-title" class="mt-1 text-section-title text-[var(--color-text-primary)]">
          {{ t('home.quick.title') }}
        </h2>
      </div>
    </div>

    <div class="home-quick-grid">
      <BaseSurface as="article" padding="none" variant="plain">
        <div class="home-quick-header">
          <BaseIcon name="bookmarks" size="sm" />
          <h3 class="text-sm font-semibold text-[var(--color-text-primary)]">
            {{ t('home.quick.bookmarksTitle') }}
          </h3>
          <RouterLink
            class="interactive-surface ml-auto rounded-[var(--radius-sm)] px-2 py-1 text-caption font-medium text-[var(--color-accent-text)] hover:bg-[var(--color-accent-wash)]"
            :to="{ name: 'bookmarks' }"
          >
            {{ t('home.bookmarks.open') }}
          </RouterLink>
        </div>

        <BaseSkeleton v-if="!bookmarksInitialized" class="m-4" :label="t('home.bookmarks.loading')" />

        <BaseError
          v-else-if="bookmarksError"
          class="m-4"
          :action-label="t('home.bookmarks.review')"
          :message="bookmarksError"
          :title="t('home.bookmarks.errorTitle')"
        />

        <ul
          v-else-if="bookmarks.length > 0"
          class="divide-y divide-[var(--color-border-soft)]"
          :aria-label="t('home.bookmarks.listLabel')"
        >
          <li v-for="bookmark in bookmarks" :key="bookmark.id">
            <a
              class="interactive-surface home-bookmark-link"
              :href="bookmark.url"
              rel="noopener noreferrer"
              target="_blank"
            >
              <span class="home-bookmark-link__mark" aria-hidden="true">
                {{ bookmark.title.slice(0, 1).toLocaleUpperCase() }}
              </span>
              <span class="min-w-0">
                <span class="block truncate text-sm font-medium text-[var(--color-text-primary)]">
                  {{ bookmark.title }}
                </span>
                <span class="mt-1 block truncate text-caption text-[var(--color-text-secondary)]">
                  {{ displayBookmarkHost(bookmark.url) }}
                  <span v-if="bookmark.category"> · {{ bookmark.category }}</span>
                </span>
              </span>
              <span class="sr-only">{{ t('home.bookmarks.openNewTab') }}</span>
            </a>
          </li>
        </ul>

        <div v-else class="home-quick-empty">
          <p class="text-sm font-medium text-[var(--color-text-primary)]">
            {{ t('home.bookmarks.emptyTitle') }}
          </p>
          <p class="mt-1 text-caption text-[var(--color-text-secondary)]">
            {{ t('home.bookmarks.emptyDescription') }}
          </p>
        </div>
      </BaseSurface>

      <BaseSurface as="article" padding="none" variant="plain">
        <div class="home-quick-header">
          <BaseIcon name="tools" size="sm" />
          <h3 class="text-sm font-semibold text-[var(--color-text-primary)]">
            {{ t('home.quick.toolsTitle') }}
          </h3>
          <RouterLink
            class="interactive-surface ml-auto rounded-[var(--radius-sm)] px-2 py-1 text-caption font-medium text-[var(--color-accent-text)] hover:bg-[var(--color-accent-wash)]"
            :to="{ name: 'tools' }"
          >
            {{ t('home.tools.open') }}
          </RouterLink>
        </div>

        <div class="home-tool-shortcuts" :aria-label="t('home.tools.listLabel')">
          <RouterLink
            v-for="tool in tools"
            :key="tool.id"
            class="interactive-surface home-tool-shortcut"
            :to="{ name: 'tools', query: { tool: tool.id } }"
          >
            <BaseIcon name="tools" size="sm" />
            <span class="min-w-0">
              <span class="block truncate text-sm font-semibold text-[var(--color-text-primary)]">
                {{ tool.shortTitle }}
              </span>
              <span class="mt-1 block text-caption text-[var(--color-text-secondary)]">
                {{ t(toolShortLabels[tool.id]) }}
              </span>
            </span>
          </RouterLink>
        </div>
      </BaseSurface>
    </div>

    <p v-if="!hasQuickAccess" class="sr-only">
      {{ t('home.quick.empty') }}
    </p>
  </section>
</template>

<style scoped>
.home-quick-grid {
  display: grid;
  grid-template-columns: minmax(0, 1fr);
  gap: 1rem;
}

.home-quick-header {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 1rem 1.25rem;
  border-bottom: 1px solid var(--color-border-soft);
  color: var(--color-accent-text);
}

.home-bookmark-link,
.home-tool-shortcut {
  display: grid;
  min-height: 3.75rem;
  align-items: center;
  gap: 0.75rem;
  padding: 0.85rem 1.25rem;
}

.home-bookmark-link {
  grid-template-columns: auto minmax(0, 1fr);
}

.home-bookmark-link__mark {
  display: inline-flex;
  width: 2rem;
  height: 2rem;
  align-items: center;
  justify-content: center;
  border-radius: var(--radius-sm);
  background: var(--color-surface-muted);
  color: var(--color-text-secondary);
  font-size: 0.75rem;
  font-weight: 700;
}

.home-tool-shortcuts {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 0;
}

.home-tool-shortcut {
  grid-template-columns: auto minmax(0, 1fr);
  border-bottom: 1px solid var(--color-border-soft);
}

.home-quick-empty {
  padding: 1rem 1.25rem 1.25rem;
}

@media (min-width: 768px) and (max-width: 1180px) {
  .home-quick-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}

@media (max-width: 480px) {
  .home-tool-shortcuts {
    grid-template-columns: 1fr;
  }
}
</style>

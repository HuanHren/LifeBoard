<script setup lang="ts">
import { computed, shallowRef, useTemplateRef } from 'vue'
import BaseButton from '@/components/base/BaseButton.vue'
import BaseInput from '@/components/base/BaseInput.vue'
import BaseNotice from '@/components/base/BaseNotice.vue'
import BaseSurface from '@/components/base/BaseSurface.vue'
import FormField from '@/components/base/FormField.vue'
import SectionHeader from '@/components/base/SectionHeader.vue'
import { useI18n } from '@/i18n/useI18n'
import {
  BOOKMARK_CATEGORY_MAX_LENGTH,
  BOOKMARK_NOTE_MAX_LENGTH,
  BOOKMARK_TITLE_MAX_LENGTH,
  BOOKMARK_URL_MAX_LENGTH,
} from '@/modules/bookmarks/constants/bookmarks'
import { useBookmarksStore } from '@/modules/bookmarks/stores/bookmarks'
import type {
  BookmarkDraft,
  BookmarkValidation,
} from '@/modules/bookmarks/types/bookmarks'
import {
  hasBookmarkValidationErrors,
  prepareBookmarkDraft,
} from '@/modules/bookmarks/utils/bookmarkValidation'
import { localizeBookmarkError } from '@/modules/bookmarks/utils/bookmarksI18n'

const { t } = useI18n()
const bookmarksStore = useBookmarksStore()
const title = shallowRef('')
const url = shallowRef('')
const category = shallowRef('')
const note = shallowRef('')
const errors = shallowRef<BookmarkValidation>({
  title: null,
  url: null,
  category: null,
  note: null,
})
const announcement = shallowRef('')
const titleInput = useTemplateRef<{ focus: () => void }>('titleInput')

const titleDescribedBy = computed(() =>
  errors.value.title ? 'bookmark-title-helper bookmark-title-error' : 'bookmark-title-helper',
)
const urlDescribedBy = computed(() =>
  errors.value.url ? 'bookmark-url-helper bookmark-url-error' : 'bookmark-url-helper',
)
const categoryDescribedBy = computed(() =>
  errors.value.category
    ? 'bookmark-category-helper bookmark-category-error'
    : 'bookmark-category-helper',
)
const noteDescribedBy = computed(() =>
  errors.value.note ? 'bookmark-note-helper bookmark-note-error' : 'bookmark-note-helper',
)

function submitBookmark() {
  const draft: BookmarkDraft = {
    title: title.value,
    url: url.value,
    category: category.value || null,
    note: note.value || null,
  }
  const prepared = prepareBookmarkDraft(draft)
  errors.value = prepared.validation

  if (hasBookmarkValidationErrors(prepared.validation)) {
    announcement.value = t('bookmarks.composer.announcement.checkForm')
    return
  }

  if (!bookmarksStore.addBookmark(prepared.draft)) {
    announcement.value = t('bookmarks.composer.announcement.notSaved')
    return
  }

  title.value = ''
  url.value = ''
  category.value = ''
  note.value = ''
  errors.value = { title: null, url: null, category: null, note: null }
  announcement.value = t('bookmarks.composer.announcement.added')
}

function focusTitle() {
  titleInput.value?.focus()
}

defineExpose({ focusTitle })
</script>

<template>
  <form
    class="bookmark-composer"
    :aria-label="t('bookmarks.composer.panelLabel')"
    novalidate
    @submit.prevent="submitBookmark"
  >
    <BaseSurface as="div" class="bookmark-composer__surface" padding="md" variant="raised">
    <SectionHeader
      class="bookmark-composer__header"
      :description="t('bookmarks.composer.description')"
      :title="t('bookmarks.composer.title')"
    />

    <div class="bookmark-composer__grid">
      <FormField
        id="bookmark-title"
        :description="t('bookmarks.composer.titleHelper')"
        :error="localizeBookmarkError(errors.title, t)"
        :label="t('bookmarks.form.titleLabel')"
      >
        <template #default="{ ariaDescribedby, ariaInvalid }">
        <BaseInput
          id="bookmark-title"
          ref="titleInput"
          v-model="title"
          :aria-describedby="ariaDescribedby || titleDescribedBy"
          :aria-invalid="ariaInvalid === 'true' ? 'true' : undefined"
          autocomplete="off"
          :maxlength="BOOKMARK_TITLE_MAX_LENGTH"
          name="bookmark-title"
          :placeholder="t('bookmarks.form.titlePlaceholder')"
          type="text"
        />
        </template>
      </FormField>

      <FormField
        id="bookmark-url"
        :description="t('bookmarks.composer.urlHelper')"
        :error="localizeBookmarkError(errors.url, t)"
        :label="t('bookmarks.form.urlLabel')"
      >
        <template #default="{ ariaDescribedby, ariaInvalid }">
        <BaseInput
          id="bookmark-url"
          v-model="url"
          :aria-describedby="ariaDescribedby || urlDescribedBy"
          :aria-invalid="ariaInvalid === 'true' ? 'true' : undefined"
          autocomplete="url"
          :maxlength="BOOKMARK_URL_MAX_LENGTH + 1"
          name="bookmark-url"
          :placeholder="t('bookmarks.form.urlPlaceholder')"
          type="url"
        />
        </template>
      </FormField>

      <FormField
        id="bookmark-category"
        :description="t('bookmarks.composer.categoryHelper')"
        :error="localizeBookmarkError(errors.category, t)"
        :label="t('bookmarks.form.categoryLabel')"
      >
        <template #default="{ ariaDescribedby, ariaInvalid }">
        <BaseInput
          id="bookmark-category"
          v-model="category"
          :aria-describedby="ariaDescribedby || categoryDescribedBy"
          :aria-invalid="ariaInvalid === 'true' ? 'true' : undefined"
          autocomplete="off"
          :maxlength="BOOKMARK_CATEGORY_MAX_LENGTH"
          name="bookmark-category"
          :placeholder="t('bookmarks.form.categoryPlaceholder')"
          type="text"
        />
        </template>
      </FormField>

      <BaseButton class="w-full lg:mt-7 lg:w-auto" type="submit" variant="primary">
        {{ t('bookmarks.form.addAction') }}
      </BaseButton>
    </div>

    <details class="bookmark-composer__details">
      <summary>{{ t('bookmarks.composer.noteToggle') }}</summary>
      <div class="mt-3 space-y-2">
        <label class="block text-sm font-semibold" for="bookmark-note">
          {{ t('bookmarks.form.noteLabel') }}
        </label>
        <textarea
          id="bookmark-note"
          v-model="note"
          :aria-describedby="noteDescribedBy"
          :aria-invalid="errors.note ? 'true' : 'false'"
          class="min-h-24 w-full resize-y rounded-[var(--radius-sm)] border border-[var(--color-control-border)] bg-[var(--color-surface-inset)] px-3 py-2 text-[var(--color-text-primary)] placeholder:text-[var(--color-text-tertiary)] hover:border-[var(--color-accent)]"
          :maxlength="BOOKMARK_NOTE_MAX_LENGTH"
          name="bookmark-note"
          :placeholder="t('bookmarks.form.notePlaceholder')"
          rows="3"
        />
        <p id="bookmark-note-helper" class="text-caption text-[var(--color-text-secondary)]">
          {{ t('bookmarks.composer.noteHelper', { count: BOOKMARK_NOTE_MAX_LENGTH }) }}
        </p>
        <BaseNotice
          v-if="errors.note"
          id="bookmark-note-error"
          tone="danger"
          role="alert"
        >
          {{ localizeBookmarkError(errors.note, t) }}
        </BaseNotice>
      </div>
    </details>

    <p class="sr-only" aria-live="polite">{{ announcement }}</p>
    </BaseSurface>
  </form>
</template>

<style scoped>
.bookmark-composer {
  min-width: 0;
}

.bookmark-composer__surface,
.bookmark-composer__header {
  margin-bottom: var(--space-4);
}

.bookmark-composer__grid {
  display: grid;
  gap: var(--space-4);
}

.bookmark-composer__details {
  margin-top: var(--space-4);
}

.bookmark-composer__details summary {
  min-height: 2.75rem;
  cursor: pointer;
  border-radius: var(--radius-sm);
  color: var(--color-accent-text);
  font-size: var(--font-size-label);
  font-weight: var(--font-weight-medium);
  line-height: 2.75rem;
}

@media (min-width: 64rem) {
  .bookmark-composer__grid {
    grid-template-columns: minmax(0, 1fr);
  }
}
</style>

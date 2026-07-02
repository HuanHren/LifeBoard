<script setup lang="ts">
import { computed, ref } from 'vue'
import { RouterLink } from 'vue-router'
import BaseIcon, { type BaseIconName } from '@/components/base/BaseIcon.vue'
import type { TranslationKey } from '@/i18n/keys'
import { useI18n } from '@/i18n/useI18n'
import { useLandingScrollNarrative } from '@/modules/landing/composables/useLandingScrollNarrative'
import { landingNavigationItems } from '@/shared/constants/navigation'

type DemoKey = 'weather' | 'todos' | 'tools'

interface StoryStep {
  key: string
  eyebrowKey: TranslationKey
  titleKey: TranslationKey
  descriptionKey: TranslationKey
  icon: BaseIconName
}

interface DemoItem {
  key: DemoKey
  labelKey: TranslationKey
  titleKey: TranslationKey
  descriptionKey: TranslationKey
  icon: BaseIconName
}

const { t } = useI18n()
const landingRoot = ref<HTMLElement | null>(null)
const activeDemo = ref<DemoKey>('weather')
const sampleTaskDone = ref(false)

const { isReducedMotion, motionState } = useLandingScrollNarrative(landingRoot)

const storySteps: StoryStep[] = [
  {
    key: 'weather',
    eyebrowKey: 'landing.story.weather.eyebrow',
    titleKey: 'landing.story.weather.title',
    descriptionKey: 'landing.story.weather.description',
    icon: 'weather',
  },
  {
    key: 'todos',
    eyebrowKey: 'landing.story.todos.eyebrow',
    titleKey: 'landing.story.todos.title',
    descriptionKey: 'landing.story.todos.description',
    icon: 'todos',
  },
  {
    key: 'bookmarks',
    eyebrowKey: 'landing.story.bookmarks.eyebrow',
    titleKey: 'landing.story.bookmarks.title',
    descriptionKey: 'landing.story.bookmarks.description',
    icon: 'bookmarks',
  },
  {
    key: 'tools',
    eyebrowKey: 'landing.story.tools.eyebrow',
    titleKey: 'landing.story.tools.title',
    descriptionKey: 'landing.story.tools.description',
    icon: 'tools',
  },
]

const demoItems: DemoItem[] = [
  {
    key: 'weather',
    labelKey: 'navigation.weather.label',
    titleKey: 'landing.demo.weather.title',
    descriptionKey: 'landing.demo.weather.description',
    icon: 'weather',
  },
  {
    key: 'todos',
    labelKey: 'navigation.todos.label',
    titleKey: 'landing.demo.todos.title',
    descriptionKey: 'landing.demo.todos.description',
    icon: 'todos',
  },
  {
    key: 'tools',
    labelKey: 'navigation.tools.label',
    titleKey: 'landing.demo.tools.title',
    descriptionKey: 'landing.demo.tools.description',
    icon: 'tools',
  },
]

const activeDemoItem = computed(() =>
  demoItems.find((item) => item.key === activeDemo.value) ?? demoItems[0],
)
</script>

<template>
  <div
    ref="landingRoot"
    class="commercial-landing"
    :data-motion-state="motionState"
    :data-reduced-motion="isReducedMotion"
  >
    <section class="landing-hero" aria-labelledby="landing-title">
      <div class="landing-hero__content">
        <p class="landing-hero__kicker">{{ t('landing.hero.kicker') }}</p>
        <h1 id="landing-title" class="landing-hero__title">
          {{ t('landing.hero.title') }}
        </h1>
        <p class="landing-hero__description">
          {{ t('landing.hero.description') }}
        </p>
        <div class="landing-hero__actions" aria-label="LifeBoard entry actions">
          <RouterLink
            :to="{ name: 'workspace' }"
            class="interactive-surface landing-button landing-button--primary"
          >
            {{ t('landing.cta.enterWorkspace') }}
          </RouterLink>
          <a class="interactive-surface landing-button landing-button--secondary" href="#landing-story">
            {{ t('landing.cta.explore') }}
          </a>
        </div>
      </div>

      <div class="landing-hero__visual" aria-hidden="true">
        <div class="landing-device">
          <div class="landing-device__bar">
            <span />
            <span />
            <span />
          </div>
          <div class="landing-device__weather">
            <span>{{ t('navigation.weather.label') }}</span>
            <strong>24°C</strong>
          </div>
          <div class="landing-device__grid">
            <span />
            <span />
            <span />
            <span />
          </div>
        </div>
      </div>
    </section>

    <section
      id="landing-story"
      class="landing-story"
      aria-labelledby="landing-story-title"
      data-landing-story
    >
      <div class="landing-section-heading">
        <p class="landing-section-heading__kicker">{{ t('landing.story.kicker') }}</p>
        <h2 id="landing-story-title">{{ t('landing.story.title') }}</h2>
        <p>{{ t('landing.story.description') }}</p>
      </div>

      <div class="landing-story__grid">
        <div class="landing-story__scene" data-landing-scene>
          <div class="landing-story__progress" aria-hidden="true">
            <span data-story-progress />
          </div>
          <div class="landing-scene" aria-hidden="true">
            <span class="landing-scene__orbit" data-scene-orbit />
            <article class="landing-scene-card landing-scene-card--weather" data-scene-weather>
              <span>{{ t('navigation.weather.label') }}</span>
              <strong>24°C</strong>
              <p>{{ t('landing.scene.weather') }}</p>
            </article>
            <article class="landing-scene-card landing-scene-card--todos" data-scene-todos>
              <span>{{ t('navigation.todos.label') }}</span>
              <strong>{{ t('landing.scene.todosMetric') }}</strong>
              <p>{{ t('landing.scene.todos') }}</p>
            </article>
            <article class="landing-scene-card landing-scene-card--bookmarks" data-scene-bookmarks>
              <span>{{ t('navigation.bookmarks.label') }}</span>
              <strong>{{ t('landing.scene.bookmarksMetric') }}</strong>
              <p>{{ t('landing.scene.bookmarks') }}</p>
            </article>
            <article class="landing-scene-card landing-scene-card--tools" data-scene-tools>
              <span>{{ t('navigation.tools.label') }}</span>
              <strong>{{ t('landing.scene.toolsMetric') }}</strong>
              <p>{{ t('landing.scene.tools') }}</p>
            </article>
          </div>
        </div>

        <div class="landing-story__steps">
          <article
            v-for="step in storySteps"
            :key="step.key"
            class="landing-story-step"
          >
            <span class="landing-story-step__icon" aria-hidden="true">
              <BaseIcon :name="step.icon" />
            </span>
            <p>{{ t(step.eyebrowKey) }}</p>
            <h3>{{ t(step.titleKey) }}</h3>
            <span>{{ t(step.descriptionKey) }}</span>
          </article>
        </div>
      </div>
    </section>

    <section class="landing-entry" aria-labelledby="landing-entry-title">
      <div class="landing-section-heading landing-section-heading--compact">
        <p class="landing-section-heading__kicker">{{ t('landing.entry.kicker') }}</p>
        <h2 id="landing-entry-title">{{ t('landing.entry.title') }}</h2>
        <p>{{ t('landing.entry.description') }}</p>
      </div>

      <div class="landing-entry__grid">
        <RouterLink
          v-for="item in landingNavigationItems"
          :key="item.key"
          :to="item.to"
          class="interactive-surface landing-entry__item"
        >
          <span class="landing-entry__icon" aria-hidden="true">
            <BaseIcon :name="item.icon" />
          </span>
          <span>
            <span class="landing-entry__title">{{ t(item.labelKey) }}</span>
            <span class="landing-entry__description">{{ t(item.descriptionKey) }}</span>
          </span>
        </RouterLink>
      </div>
    </section>

    <section class="landing-demo" aria-labelledby="landing-demo-title">
      <div class="landing-section-heading landing-section-heading--compact">
        <p class="landing-section-heading__kicker">{{ t('landing.demo.kicker') }}</p>
        <h2 id="landing-demo-title">{{ t('landing.demo.title') }}</h2>
        <p>{{ t('landing.demo.description') }}</p>
      </div>

      <div class="landing-demo__panel">
        <div class="landing-demo__tabs" role="tablist" :aria-label="t('landing.demo.tabLabel')">
          <button
            v-for="item in demoItems"
            :id="`landing-demo-tab-${item.key}`"
            :key="item.key"
            class="interactive-surface landing-demo__tab"
            :class="{ 'is-active': activeDemo === item.key }"
            type="button"
            role="tab"
            :aria-selected="activeDemo === item.key"
            :aria-controls="`landing-demo-panel-${item.key}`"
            @click="activeDemo = item.key"
          >
            <BaseIcon :name="item.icon" size="sm" />
            <span>{{ t(item.labelKey) }}</span>
          </button>
        </div>

        <article
          :id="`landing-demo-panel-${activeDemoItem.key}`"
          class="landing-demo__content"
          role="tabpanel"
          :aria-labelledby="`landing-demo-tab-${activeDemoItem.key}`"
        >
          <div>
            <p class="landing-demo__eyebrow">{{ t(activeDemoItem.labelKey) }}</p>
            <h3>{{ t(activeDemoItem.titleKey) }}</h3>
            <p>{{ t(activeDemoItem.descriptionKey) }}</p>
          </div>

          <div v-if="activeDemo === 'weather'" class="landing-demo-weather" aria-hidden="true">
            <span />
            <strong>24°C</strong>
            <p>{{ t('landing.demo.weather.card') }}</p>
          </div>

          <div v-else-if="activeDemo === 'todos'" class="landing-demo-todos">
            <label class="landing-demo-check">
              <input v-model="sampleTaskDone" type="checkbox">
              <span>{{ t('landing.demo.todos.sample') }}</span>
            </label>
            <p>{{ sampleTaskDone ? t('landing.demo.todos.done') : t('landing.demo.todos.open') }}</p>
          </div>

          <div v-else class="landing-demo-tools">
            <label for="landing-word-sample">{{ t('landing.demo.tools.inputLabel') }}</label>
            <textarea
              id="landing-word-sample"
              :placeholder="t('landing.demo.tools.placeholder')"
              rows="4"
            />
          </div>
        </article>
      </div>
    </section>

    <section class="landing-final" aria-labelledby="landing-final-title">
      <p class="landing-section-heading__kicker">{{ t('landing.final.kicker') }}</p>
      <h2 id="landing-final-title">{{ t('landing.final.title') }}</h2>
      <p>{{ t('landing.final.description') }}</p>
      <div class="landing-final__actions">
        <RouterLink
          :to="{ name: 'workspace' }"
          class="interactive-surface landing-button landing-button--primary"
        >
          {{ t('landing.cta.enterWorkspace') }}
        </RouterLink>
        <RouterLink
          :to="{ name: 'weather' }"
          class="interactive-surface landing-button landing-button--secondary"
        >
          {{ t('landing.final.weatherAction') }}
        </RouterLink>
      </div>
    </section>
  </div>
</template>

<style scoped>
.commercial-landing {
  overflow: clip;
  background:
    radial-gradient(circle at 12% 8%, color-mix(in oklch, var(--color-accent-soft) 72%, transparent) 0 18rem, transparent 28rem),
    linear-gradient(180deg, var(--color-background) 0%, var(--color-canvas) 46%, var(--color-surface) 100%);
}

.landing-hero,
.landing-story,
.landing-entry,
.landing-demo,
.landing-final {
  width: min(100%, var(--content-wide-max-width));
  margin-inline: auto;
  padding-inline: var(--page-inline);
}

.landing-hero {
  display: grid;
  min-height: calc(100dvh - var(--top-nav-height));
  grid-template-columns: minmax(0, 1fr);
  gap: clamp(2rem, 5vw, 5rem);
  align-items: center;
  padding-block: clamp(3.5rem, 8vw, 7rem);
}

.landing-hero__content {
  max-width: 48rem;
}

.landing-hero__kicker,
.landing-section-heading__kicker,
.landing-demo__eyebrow {
  color: var(--color-accent-text);
  font-size: var(--font-size-label);
  font-weight: var(--font-weight-semibold);
}

.landing-hero__title {
  margin: var(--space-4) 0 0;
  color: var(--color-text-primary);
  font-size: clamp(3rem, 9vw, 7rem);
  font-weight: var(--font-weight-semibold);
  letter-spacing: 0;
  line-height: 0.98;
}

.landing-hero__description {
  max-width: 43rem;
  margin: var(--space-5) 0 0;
  color: var(--color-text-secondary);
  font-size: clamp(1rem, 1.6vw, 1.25rem);
  line-height: 1.75;
}

.landing-hero__actions,
.landing-final__actions {
  display: flex;
  flex-wrap: wrap;
  gap: var(--space-3);
  margin-top: var(--space-8);
}

.landing-button {
  display: inline-flex;
  min-height: 2.875rem;
  align-items: center;
  justify-content: center;
  border-radius: var(--radius-sm);
  padding: 0 var(--space-5);
  font-size: var(--font-size-label);
  font-weight: var(--font-weight-semibold);
}

.landing-button--primary {
  background: var(--color-primary);
  color: var(--color-primary-foreground);
}

.landing-button--secondary {
  border: 1px solid var(--color-border);
  background: var(--color-surface-raised);
  color: var(--color-text-primary);
}

.landing-button:hover {
  transform: translateY(-1px);
}

.landing-hero__visual {
  min-width: 0;
}

.landing-device,
.landing-story__scene,
.landing-demo__panel,
.landing-final {
  border: 1px solid var(--color-border-soft);
  border-radius: var(--radius-lg);
  background: color-mix(in oklch, var(--color-surface-raised) 92%, transparent);
  box-shadow: var(--shadow-raised);
}

.landing-device {
  position: relative;
  overflow: hidden;
  min-height: 28rem;
  padding: var(--space-5);
}

.landing-device::before {
  position: absolute;
  inset: 18% -8% auto auto;
  width: 18rem;
  height: 18rem;
  border-radius: var(--radius-pill);
  background: color-mix(in oklch, var(--color-accent-soft) 58%, transparent);
  content: "";
}

.landing-device__bar {
  display: flex;
  gap: var(--space-2);
}

.landing-device__bar span {
  width: 0.625rem;
  height: 0.625rem;
  border-radius: var(--radius-pill);
  background: var(--color-border);
}

.landing-device__weather {
  position: relative;
  display: flex;
  align-items: end;
  justify-content: space-between;
  margin-top: var(--space-12);
  color: var(--color-text-primary);
}

.landing-device__weather strong {
  font-size: clamp(3.5rem, 9vw, 6rem);
  line-height: 1;
}

.landing-device__grid {
  position: relative;
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: var(--space-3);
  margin-top: var(--space-10);
}

.landing-device__grid span {
  min-height: 5.25rem;
  border: 1px solid var(--color-border-soft);
  border-radius: var(--radius-md);
  background: var(--color-surface-inset);
}

.landing-section-heading {
  max-width: 49rem;
  margin-bottom: var(--space-8);
}

.landing-section-heading--compact {
  max-width: 42rem;
}

.landing-section-heading h2,
.landing-final h2 {
  margin: var(--space-3) 0 0;
  color: var(--color-text-primary);
  font-size: clamp(2rem, 4vw, 4rem);
  font-weight: var(--font-weight-semibold);
  line-height: 1.05;
}

.landing-section-heading p:last-child,
.landing-final > p:last-of-type {
  margin: var(--space-4) 0 0;
  color: var(--color-text-secondary);
  font-size: var(--font-size-body);
  line-height: 1.75;
}

.landing-story,
.landing-entry,
.landing-demo,
.landing-final {
  padding-block: clamp(4rem, 8vw, 7rem);
}

.landing-story__grid {
  display: grid;
  gap: var(--space-6);
}

.landing-story__scene {
  position: relative;
  overflow: hidden;
  min-height: 28rem;
  padding: var(--space-4);
}

.landing-story__progress {
  height: 0.25rem;
  overflow: hidden;
  border-radius: var(--radius-pill);
  background: var(--color-surface-inset);
}

.landing-story__progress span {
  display: block;
  width: 100%;
  height: 100%;
  transform: scaleX(0.16);
  transform-origin: left center;
  border-radius: inherit;
  background: var(--color-accent);
}

.landing-scene {
  position: relative;
  min-height: 25rem;
  isolation: isolate;
}

.landing-scene__orbit {
  position: absolute;
  inset: 16% 10% auto auto;
  width: 14rem;
  height: 14rem;
  border: 1px solid var(--color-border-soft);
  border-radius: var(--radius-pill);
  background: color-mix(in oklch, var(--color-accent-wash) 68%, transparent);
  z-index: -1;
}

.landing-scene-card {
  position: absolute;
  display: grid;
  gap: var(--space-2);
  width: min(18rem, 78vw);
  border: 1px solid var(--color-border-soft);
  border-radius: var(--radius-md);
  background: var(--color-surface-elevated);
  padding: var(--space-4);
  color: var(--color-text-primary);
  box-shadow: var(--shadow-soft);
}

.landing-scene-card span,
.landing-scene-card p {
  color: var(--color-text-secondary);
  font-size: var(--font-size-caption);
}

.landing-scene-card strong {
  font-size: var(--font-size-numeric-large);
  line-height: 1;
}

.landing-scene-card--weather {
  top: 12%;
  left: 6%;
}

.landing-scene-card--todos {
  top: 40%;
  left: 26%;
}

.landing-scene-card--bookmarks {
  top: 66%;
  left: 9%;
}

.landing-scene-card--tools {
  top: 88%;
  left: 34%;
}

.landing-story-step {
  display: grid;
  gap: var(--space-3);
  min-height: 16rem;
  align-content: center;
  border-top: 1px solid var(--color-border-soft);
  padding-block: var(--space-8);
}

.landing-story-step__icon,
.landing-entry__icon {
  display: inline-flex;
  width: 2.75rem;
  height: 2.75rem;
  align-items: center;
  justify-content: center;
  border-radius: var(--radius-sm);
  background: var(--color-primary-soft);
  color: var(--color-accent-text);
}

.landing-story-step p {
  margin: 0;
  color: var(--color-accent-text);
  font-size: var(--font-size-label);
  font-weight: var(--font-weight-semibold);
}

.landing-story-step h3 {
  margin: 0;
  color: var(--color-text-primary);
  font-size: clamp(1.5rem, 3vw, 2.5rem);
  font-weight: var(--font-weight-semibold);
  line-height: 1.1;
}

.landing-story-step span {
  color: var(--color-text-secondary);
  line-height: 1.7;
}

.landing-entry__grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(min(100%, 14rem), 1fr));
  gap: var(--space-3);
}

.landing-entry__item {
  display: flex;
  min-height: 6rem;
  align-items: center;
  gap: var(--space-3);
  border: 1px solid var(--color-border-soft);
  border-radius: var(--radius-md);
  background: var(--color-surface-raised);
  padding: var(--space-4);
}

.landing-entry__item:hover,
.landing-demo__tab:hover,
.landing-demo__tab.is-active {
  border-color: var(--color-border);
  background: var(--color-surface-interactive);
}

.landing-entry__title,
.landing-entry__description {
  display: block;
}

.landing-entry__title {
  color: var(--color-text-primary);
  font-size: var(--font-size-label);
  font-weight: var(--font-weight-semibold);
}

.landing-entry__description {
  margin-top: 0.25rem;
  color: var(--color-text-secondary);
  font-size: var(--font-size-caption);
  line-height: 1.45;
}

.landing-demo__panel {
  overflow: hidden;
}

.landing-demo__tabs {
  display: flex;
  flex-wrap: wrap;
  gap: var(--space-2);
  border-bottom: 1px solid var(--color-border-soft);
  padding: var(--space-4);
}

.landing-demo__tab {
  display: inline-flex;
  min-height: 2.75rem;
  align-items: center;
  gap: var(--space-2);
  border: 1px solid var(--color-border-soft);
  border-radius: var(--radius-sm);
  background: var(--color-surface-raised);
  color: var(--color-text-primary);
  padding: 0 var(--space-3);
  font-size: var(--font-size-label);
  font-weight: var(--font-weight-medium);
}

.landing-demo__tab.is-active {
  color: var(--color-accent-text);
}

.landing-demo__content {
  display: grid;
  gap: var(--space-6);
  padding: var(--space-5);
}

.landing-demo__content h3 {
  margin: var(--space-2) 0;
  color: var(--color-text-primary);
  font-size: var(--font-size-section-title);
  font-weight: var(--font-weight-semibold);
}

.landing-demo__content p {
  color: var(--color-text-secondary);
}

.landing-demo-weather,
.landing-demo-todos,
.landing-demo-tools {
  border: 1px solid var(--color-border-soft);
  border-radius: var(--radius-md);
  background: var(--color-surface-inset);
  padding: var(--space-4);
}

.landing-demo-weather {
  display: grid;
  gap: var(--space-3);
}

.landing-demo-weather span {
  width: 5rem;
  height: 5rem;
  border-radius: var(--radius-pill);
  background: var(--color-warning-soft);
}

.landing-demo-weather strong {
  color: var(--color-text-primary);
  font-size: var(--font-size-numeric-large);
}

.landing-demo-check {
  display: flex;
  align-items: center;
  gap: var(--space-3);
  color: var(--color-text-primary);
  font-weight: var(--font-weight-medium);
}

.landing-demo-check input {
  width: 1.25rem;
  height: 1.25rem;
  accent-color: var(--color-accent);
}

.landing-demo-tools {
  display: grid;
  gap: var(--space-2);
}

.landing-demo-tools label {
  color: var(--color-text-primary);
  font-size: var(--font-size-label);
  font-weight: var(--font-weight-semibold);
}

.landing-demo-tools textarea {
  width: 100%;
  resize: vertical;
  border: 1px solid var(--color-control-border);
  border-radius: var(--radius-sm);
  background: var(--color-surface-raised);
  color: var(--color-text-primary);
  padding: var(--space-3);
}

.landing-final {
  max-width: calc(var(--content-wide-max-width) - (var(--page-inline) * 2));
  margin-block: clamp(2rem, 6vw, 5rem);
  padding: clamp(2rem, 5vw, 4rem);
}

@media (min-width: 64rem) {
  .landing-hero {
    grid-template-columns: minmax(0, 1.08fr) minmax(22rem, 0.92fr);
  }

  .landing-story__grid {
    grid-template-columns: minmax(21rem, 0.82fr) minmax(0, 1fr);
    align-items: start;
  }

  .landing-story__scene {
    min-height: calc(100dvh - var(--top-nav-height) - var(--space-8));
  }

  .landing-story-step {
    min-height: 64vh;
  }

  .landing-demo__content {
    grid-template-columns: minmax(0, 1fr) minmax(18rem, 0.8fr);
    align-items: center;
  }
}

@media (max-width: 63.99rem), (prefers-reduced-motion: reduce) {
  .landing-story__scene {
    position: relative;
  }

  .landing-scene {
    display: grid;
    gap: var(--space-3);
    min-height: 0;
  }

  .landing-scene-card {
    position: relative;
    inset: auto;
    width: 100%;
  }

  .landing-scene__orbit {
    display: none;
  }

  .landing-story__progress span {
    transform: scaleX(1);
  }
}

@media (max-width: 40rem) {
  .landing-hero,
  .landing-story,
  .landing-entry,
  .landing-demo,
  .landing-final {
    padding-block: var(--space-12);
  }

  .landing-hero__title {
    font-size: clamp(2.625rem, 15vw, 4.25rem);
  }

  .landing-button,
  .landing-hero__actions,
  .landing-final__actions {
    width: 100%;
  }
}
</style>

<script setup lang="ts">
import { computed, ref } from 'vue'
import { RouterLink, type RouteLocationRaw } from 'vue-router'
import BaseIcon, { type BaseIconName } from '@/components/base/BaseIcon.vue'
import type { TranslationKey } from '@/i18n/keys'
import { useI18n } from '@/i18n/useI18n'
import { useLandingScrollNarrative } from '@/modules/landing/composables/useLandingScrollNarrative'

type DemoKey = 'weather' | 'todos' | 'tools'
type StoryKey = 'weather' | 'workspace' | 'todos' | 'countdown' | 'tools' | 'bookmarks'

interface StoryStep {
  key: StoryKey
  eyebrowKey: TranslationKey
  titleKey: TranslationKey
  descriptionKey: TranslationKey
  icon: BaseIconName
}

interface EntryItem {
  key: string
  labelKey: TranslationKey
  descriptionKey: TranslationKey
  icon: BaseIconName
  to: RouteLocationRaw
  priority: 'primary' | 'secondary' | 'compact'
}

interface DemoItem {
  key: DemoKey
  labelKey: TranslationKey
  titleKey: TranslationKey
  descriptionKey: TranslationKey
  actionKey: TranslationKey
  icon: BaseIconName
  to: RouteLocationRaw
}

interface WeatherHour {
  timeKey: TranslationKey
  temp: string
  conditionKey: TranslationKey
}

const { t } = useI18n()
const landingRoot = ref<HTMLElement | null>(null)
const activeDemo = ref<DemoKey>('weather')
const sampleTaskDone = ref(false)
const toolSample = ref('Morning meeting notes\nBuy train tickets\nRead weather before leaving')
const heroTitleLines = [
  'landing.hero.titleLineOne',
  'landing.hero.titleLineTwo',
] satisfies TranslationKey[]

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
    key: 'workspace',
    eyebrowKey: 'landing.story.workspace.eyebrow',
    titleKey: 'landing.story.workspace.title',
    descriptionKey: 'landing.story.workspace.description',
    icon: 'home',
  },
  {
    key: 'todos',
    eyebrowKey: 'landing.story.todos.eyebrow',
    titleKey: 'landing.story.todos.title',
    descriptionKey: 'landing.story.todos.description',
    icon: 'todos',
  },
  {
    key: 'countdown',
    eyebrowKey: 'landing.story.countdown.eyebrow',
    titleKey: 'landing.story.countdown.title',
    descriptionKey: 'landing.story.countdown.description',
    icon: 'todos',
  },
  {
    key: 'tools',
    eyebrowKey: 'landing.story.tools.eyebrow',
    titleKey: 'landing.story.tools.title',
    descriptionKey: 'landing.story.tools.description',
    icon: 'tools',
  },
  {
    key: 'bookmarks',
    eyebrowKey: 'landing.story.bookmarks.eyebrow',
    titleKey: 'landing.story.bookmarks.title',
    descriptionKey: 'landing.story.bookmarks.description',
    icon: 'bookmarks',
  },
]

const entryItems: EntryItem[] = [
  {
    key: 'workspace',
    labelKey: 'navigation.workspace.label',
    descriptionKey: 'landing.entry.workspace',
    icon: 'home',
    to: { name: 'workspace' },
    priority: 'primary',
  },
  {
    key: 'weather',
    labelKey: 'navigation.weather.label',
    descriptionKey: 'landing.entry.weather',
    icon: 'weather',
    to: { name: 'weather' },
    priority: 'secondary',
  },
  {
    key: 'todos',
    labelKey: 'navigation.todos.label',
    descriptionKey: 'landing.entry.todos',
    icon: 'todos',
    to: { name: 'todos' },
    priority: 'compact',
  },
  {
    key: 'bookmarks',
    labelKey: 'navigation.bookmarks.label',
    descriptionKey: 'landing.entry.bookmarks',
    icon: 'bookmarks',
    to: { name: 'bookmarks' },
    priority: 'compact',
  },
  {
    key: 'tools',
    labelKey: 'navigation.tools.label',
    descriptionKey: 'landing.entry.tools',
    icon: 'tools',
    to: { name: 'tools' },
    priority: 'compact',
  },
]

const demoItems: DemoItem[] = [
  {
    key: 'weather',
    labelKey: 'navigation.weather.label',
    titleKey: 'landing.demo.weather.title',
    descriptionKey: 'landing.demo.weather.description',
    actionKey: 'landing.demo.weather.action',
    icon: 'weather',
    to: { name: 'weather' },
  },
  {
    key: 'todos',
    labelKey: 'navigation.todos.label',
    titleKey: 'landing.demo.todos.title',
    descriptionKey: 'landing.demo.todos.description',
    actionKey: 'landing.demo.todos.action',
    icon: 'todos',
    to: { name: 'todos' },
  },
  {
    key: 'tools',
    labelKey: 'navigation.tools.label',
    titleKey: 'landing.demo.tools.title',
    descriptionKey: 'landing.demo.tools.description',
    actionKey: 'landing.demo.tools.action',
    icon: 'tools',
    to: { name: 'tools' },
  },
]

const activeDemoItem = computed(() =>
  demoItems.find((item) => item.key === activeDemo.value) ?? demoItems[0],
)

const weatherHours: WeatherHour[] = [
  {
    timeKey: 'landing.demo.weather.hourMorning',
    temp: '23°',
    conditionKey: 'landing.demo.weather.trendMorning',
  },
  {
    timeKey: 'landing.demo.weather.hourNoon',
    temp: '26°',
    conditionKey: 'landing.demo.weather.trendNoon',
  },
  {
    timeKey: 'landing.demo.weather.hourAfternoon',
    temp: '25°',
    conditionKey: 'landing.demo.weather.trendAfternoon',
  },
  {
    timeKey: 'landing.demo.weather.hourEvening',
    temp: '21°',
    conditionKey: 'landing.demo.weather.trendEvening',
  },
]

const toolStats = computed(() => {
  const text = toolSample.value
  const trimmed = text.trim()
  const lines = trimmed ? trimmed.split(/\r?\n/).length : 0
  const words = trimmed ? trimmed.split(/\s+/).filter(Boolean).length : 0

  return {
    characters: text.length,
    lines,
    words,
  }
})

function selectDemo(key: DemoKey) {
  activeDemo.value = key
}

function handleDemoTabKeydown(event: KeyboardEvent, currentIndex: number) {
  if (!['ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(event.key)) return

  event.preventDefault()

  let nextIndex = currentIndex
  if (event.key === 'ArrowLeft') nextIndex = currentIndex === 0 ? demoItems.length - 1 : currentIndex - 1
  if (event.key === 'ArrowRight') nextIndex = currentIndex === demoItems.length - 1 ? 0 : currentIndex + 1
  if (event.key === 'Home') nextIndex = 0
  if (event.key === 'End') nextIndex = demoItems.length - 1

  activeDemo.value = demoItems[nextIndex].key
  requestAnimationFrame(() => {
    document.getElementById(`landing-demo-tab-${demoItems[nextIndex].key}`)?.focus()
  })
}
</script>

<template>
  <div
    ref="landingRoot"
    class="commercial-landing"
    :data-motion-state="motionState"
    :data-reduced-motion="isReducedMotion"
  >
    <section class="landing-hero" aria-labelledby="landing-title">
      <div class="landing-hero__weather-field" aria-hidden="true">
        <span class="landing-sun" />
        <span class="landing-cloud landing-cloud--one" />
        <span class="landing-cloud landing-cloud--two" />
        <span class="landing-mist landing-mist--one" />
        <span class="landing-mist landing-mist--two" />
      </div>

      <div class="landing-hero__content">
        <p class="landing-hero__kicker">{{ t('landing.hero.kicker') }}</p>
        <h1 id="landing-title" class="landing-hero__title">
          <span v-for="line in heroTitleLines" :key="line">{{ t(line) }}</span>
        </h1>
        <p class="landing-hero__description">
          {{ t('landing.hero.description') }}
        </p>
        <div class="landing-hero__actions" :aria-label="t('landing.hero.actionsLabel')">
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
            {{ t('landing.cta.viewWeather') }}
          </RouterLink>
        </div>
      </div>

      <div class="landing-hero__visual">
        <div class="landing-weather-card" aria-hidden="true">
          <div class="landing-weather-card__sky">
            <span class="landing-weather-card__sun" />
            <span class="landing-weather-card__cloud" />
          </div>
          <div class="landing-weather-card__body">
            <div>
              <p>{{ t('landing.preview.weatherNow') }}</p>
              <strong>24°C</strong>
            </div>
            <span>{{ t('landing.preview.weatherDetail') }}</span>
          </div>
        </div>

        <div class="landing-workspace-preview" aria-hidden="true">
          <div class="landing-workspace-preview__top">
            <span>{{ t('navigation.workspace.label') }}</span>
            <span>{{ t('landing.preview.today') }}</span>
          </div>
          <div class="landing-workspace-preview__grid">
            <section class="preview-panel preview-panel--weather">
              <span>{{ t('navigation.weather.label') }}</span>
              <strong>24°C</strong>
              <p>{{ t('landing.preview.weatherDetail') }}</p>
            </section>
            <section class="preview-panel preview-panel--focus">
              <span>{{ t('landing.preview.focusTitle') }}</span>
              <p>{{ t('landing.preview.focusTask') }}</p>
              <p>{{ t('landing.preview.focusSecond') }}</p>
            </section>
            <section class="preview-panel preview-panel--countdown">
              <span>{{ t('landing.preview.countdownTitle') }}</span>
              <strong>{{ t('landing.preview.countdownMetric') }}</strong>
            </section>
            <section class="preview-panel preview-panel--tools">
              <span>{{ t('navigation.tools.label') }}</span>
              <p>{{ t('landing.preview.toolsLine') }}</p>
            </section>
            <section class="preview-panel preview-panel--bookmarks">
              <span>{{ t('navigation.bookmarks.label') }}</span>
              <p>{{ t('landing.preview.bookmarkLine') }}</p>
            </section>
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
            <span class="landing-scene__sun" data-scene-orbit />
            <span class="landing-scene__cloud landing-scene__cloud--one" />
            <span class="landing-scene__cloud landing-scene__cloud--two" />

            <article class="landing-scene-card landing-scene-card--weather" data-scene-weather>
              <span>{{ t('navigation.weather.label') }}</span>
              <strong>24°C</strong>
              <p>{{ t('landing.scene.weather') }}</p>
            </article>

            <article class="landing-scene-card landing-scene-card--workspace" data-scene-workspace>
              <span>{{ t('navigation.workspace.label') }}</span>
              <p>{{ t('landing.scene.workspace') }}</p>
              <dl class="landing-scene-workspace">
                <div>
                  <dt>{{ t('landing.scene.workspaceWeatherLabel') }}</dt>
                  <dd>{{ t('landing.scene.workspaceWeatherValue') }}</dd>
                </div>
                <div>
                  <dt>{{ t('landing.scene.workspaceFocusLabel') }}</dt>
                  <dd>{{ t('landing.scene.workspaceFocusValue') }}</dd>
                </div>
                <div>
                  <dt>{{ t('landing.scene.workspaceToolLabel') }}</dt>
                  <dd>{{ t('landing.scene.workspaceToolValue') }}</dd>
                </div>
              </dl>
            </article>

            <article class="landing-scene-card landing-scene-card--todos" data-scene-todos>
              <span>{{ t('navigation.todos.label') }}</span>
              <p>{{ t('landing.scene.todos') }}</p>
            </article>

            <article class="landing-scene-card landing-scene-card--countdown" data-scene-countdown>
              <span>{{ t('landing.scene.countdownMetric') }}</span>
              <p>{{ t('landing.scene.countdown') }}</p>
            </article>

            <article class="landing-scene-card landing-scene-card--tools" data-scene-tools>
              <span>{{ t('navigation.tools.label') }}</span>
              <p>{{ t('landing.scene.tools') }}</p>
            </article>

            <article class="landing-scene-card landing-scene-card--bookmarks" data-scene-bookmarks>
              <span>{{ t('navigation.bookmarks.label') }}</span>
              <p>{{ t('landing.scene.bookmarks') }}</p>
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
          v-for="item in entryItems"
          :key="item.key"
          :to="item.to"
          class="interactive-surface landing-entry__item"
          :class="`landing-entry__item--${item.priority}`"
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
      <div class="landing-section-heading landing-section-heading--center">
        <p class="landing-section-heading__kicker">{{ t('landing.demo.kicker') }}</p>
        <h2 id="landing-demo-title">{{ t('landing.demo.title') }}</h2>
        <p>{{ t('landing.demo.description') }}</p>
      </div>

      <div class="landing-demo__panel">
        <div class="landing-demo__tabs-wrap">
          <div class="landing-demo__tabs" role="tablist" :aria-label="t('landing.demo.tabLabel')">
            <button
              v-for="(item, index) in demoItems"
              :id="`landing-demo-tab-${item.key}`"
              :key="item.key"
              class="interactive-surface landing-demo__tab"
              :class="{ 'is-active': activeDemo === item.key }"
              type="button"
              role="tab"
              :aria-selected="activeDemo === item.key"
              :aria-controls="`landing-demo-panel-${item.key}`"
              @click="selectDemo(item.key)"
              @keydown="handleDemoTabKeydown($event, index)"
            >
              <BaseIcon :name="item.icon" size="sm" />
              <span>{{ t(item.labelKey) }}</span>
            </button>
          </div>
        </div>

        <article
          :id="`landing-demo-panel-${activeDemoItem.key}`"
          class="landing-demo__content"
          role="tabpanel"
          :aria-labelledby="`landing-demo-tab-${activeDemoItem.key}`"
        >
          <div class="landing-demo__copy">
            <p class="landing-demo__eyebrow">{{ t(activeDemoItem.labelKey) }}</p>
            <h3>{{ t(activeDemoItem.titleKey) }}</h3>
            <p>{{ t(activeDemoItem.descriptionKey) }}</p>
            <RouterLink
              :to="activeDemoItem.to"
              class="interactive-surface landing-demo__link"
            >
              {{ t(activeDemoItem.actionKey) }}
            </RouterLink>
          </div>

          <div v-if="activeDemo === 'weather'" class="landing-demo-weather">
            <div class="landing-demo-weather__sky">
              <span aria-hidden="true" />
              <i aria-hidden="true" />
              <div class="landing-demo-weather__current">
                <p>{{ t('landing.demo.weather.now') }}</p>
                <strong>24°C</strong>
                <span>{{ t('landing.demo.weather.condition') }}</span>
              </div>
            </div>
            <div class="landing-demo-weather__body">
              <dl class="landing-demo-weather__facts">
                <div>
                  <dt>{{ t('landing.demo.weather.highLow') }}</dt>
                  <dd>27° / 18°</dd>
                </div>
                <div>
                  <dt>{{ t('landing.demo.weather.humidity') }}</dt>
                  <dd>52%</dd>
                </div>
                <div>
                  <dt>{{ t('landing.demo.weather.wind') }}</dt>
                  <dd>8 km/h</dd>
                </div>
              </dl>
              <div class="landing-demo-weather__trend">
                <p>{{ t('landing.demo.weather.trendTitle') }}</p>
                <ol>
                  <li v-for="hour in weatherHours" :key="hour.timeKey">
                    <span>{{ t(hour.timeKey) }}</span>
                    <strong>{{ hour.temp }}</strong>
                    <small>{{ t(hour.conditionKey) }}</small>
                  </li>
                </ol>
              </div>
            </div>
          </div>

          <div v-else-if="activeDemo === 'todos'" class="landing-demo-todos">
            <label class="landing-demo-check">
              <input v-model="sampleTaskDone" type="checkbox">
              <span>{{ t('landing.demo.todos.sample') }}</span>
            </label>
            <ul>
              <li>{{ sampleTaskDone ? t('landing.demo.todos.done') : t('landing.demo.todos.open') }}</li>
              <li>{{ t('landing.demo.todos.second') }}</li>
              <li>{{ t('landing.demo.todos.third') }}</li>
            </ul>
          </div>

          <div v-else class="landing-demo-tools">
            <label for="landing-word-sample">{{ t('landing.demo.tools.inputLabel') }}</label>
            <textarea
              id="landing-word-sample"
              v-model="toolSample"
              :placeholder="t('landing.demo.tools.placeholder')"
              rows="5"
            />
            <dl class="landing-demo-tools__stats">
              <div>
                <dt>{{ t('landing.demo.tools.characters') }}</dt>
                <dd>{{ toolStats.characters }}</dd>
              </div>
              <div>
                <dt>{{ t('landing.demo.tools.words') }}</dt>
                <dd>{{ toolStats.words }}</dd>
              </div>
              <div>
                <dt>{{ t('landing.demo.tools.lines') }}</dt>
                <dd>{{ toolStats.lines }}</dd>
              </div>
            </dl>
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
          {{ t('landing.cta.viewWeather') }}
        </RouterLink>
      </div>
    </section>
  </div>
</template>

<style scoped>
.commercial-landing {
  overflow: clip;
  background:
    radial-gradient(circle at 72% 8%, oklch(0.86 0.07 150 / 0.42) 0 13rem, transparent 24rem),
    linear-gradient(180deg, oklch(0.965 0.018 148) 0%, var(--color-background) 38%, var(--color-surface) 100%);
}

:root[data-theme="dark"] .commercial-landing {
  background:
    radial-gradient(circle at 70% 7%, oklch(0.48 0.08 150 / 0.28) 0 14rem, transparent 27rem),
    linear-gradient(180deg, oklch(0.17 0.025 220) 0%, var(--color-background) 44%, var(--color-canvas) 100%);
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
  position: relative;
  display: grid;
  min-height: calc(100dvh - var(--top-nav-height));
  grid-template-columns: minmax(0, 1fr);
  gap: clamp(1.5rem, 4vw, 4rem);
  align-items: center;
  padding-block: clamp(2.25rem, 5.4vw, 5.75rem);
  isolation: isolate;
}

.landing-hero__weather-field {
  position: absolute;
  inset: 0;
  z-index: -1;
  overflow: hidden;
  pointer-events: none;
}

.landing-sun {
  position: absolute;
  top: 5%;
  right: 11%;
  width: clamp(8rem, 15vw, 14rem);
  height: clamp(8rem, 15vw, 14rem);
  border-radius: var(--radius-pill);
  background:
    radial-gradient(circle at 38% 36%, oklch(0.98 0.055 92) 0 18%, oklch(0.84 0.12 86 / 0.82) 19% 42%, transparent 68%);
}

.landing-cloud,
.landing-mist {
  position: absolute;
  border-radius: var(--radius-pill);
  background: oklch(0.99 0.01 150 / 0.76);
}

:root[data-theme="dark"] .landing-cloud,
:root[data-theme="dark"] .landing-mist {
  background: oklch(0.72 0.024 210 / 0.18);
}

.landing-cloud--one {
  top: 21%;
  right: 4%;
  width: clamp(13rem, 28vw, 25rem);
  height: clamp(4rem, 8vw, 7rem);
  box-shadow:
    -4rem -1.25rem 0 0 oklch(0.99 0.01 150 / 0.6),
    -8rem 1.5rem 0 -1.5rem oklch(0.99 0.01 150 / 0.46);
}

.landing-cloud--two {
  bottom: 15%;
  left: 2%;
  width: clamp(12rem, 25vw, 22rem);
  height: clamp(3rem, 6vw, 5rem);
  opacity: 0.38;
}

.landing-mist--one,
.landing-mist--two {
  right: 3%;
  left: 48%;
  height: 1px;
  background: color-mix(in oklch, var(--color-border-soft) 65%, transparent);
}

.landing-mist--one {
  top: 58%;
}

.landing-mist--two {
  top: 64%;
}

.landing-hero__content {
  max-width: 43rem;
}

.landing-hero__kicker,
.landing-section-heading__kicker,
.landing-demo__eyebrow {
  color: var(--color-accent-text);
  font-size: var(--font-size-label);
  font-weight: var(--font-weight-semibold);
}

.landing-hero__title {
  max-width: 10em;
  margin: var(--space-4) 0 0;
  color: var(--color-text-primary);
  font-size: clamp(2.45rem, 4.15vw, 3.65rem);
  font-weight: var(--font-weight-semibold);
  letter-spacing: 0;
  line-height: 1.06;
  text-wrap: normal;
}

.landing-hero__title span {
  display: block;
}

.landing-hero__description {
  max-width: 40rem;
  margin: var(--space-5) 0 0;
  color: var(--color-text-secondary);
  font-size: clamp(1rem, 1.35vw, 1.1875rem);
  line-height: 1.78;
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
  background: color-mix(in oklch, var(--color-surface-raised) 84%, transparent);
  color: var(--color-text-primary);
}

.landing-button:hover {
  transform: translateY(-1px);
}

.landing-hero__visual {
  position: relative;
  min-width: 0;
  min-height: clamp(24rem, 40vw, 38rem);
}

.landing-weather-card,
.landing-workspace-preview,
.landing-story__scene,
.landing-demo__panel,
.landing-final {
  border: 1px solid var(--color-border-soft);
  border-radius: var(--radius-lg);
  background: color-mix(in oklch, var(--color-surface-raised) 92%, transparent);
}

.landing-weather-card {
  position: absolute;
  z-index: 2;
  top: 0;
  right: 0;
  width: min(22rem, 86%);
  overflow: hidden;
  box-shadow: var(--shadow-raised);
}

.landing-weather-card__sky {
  position: relative;
  min-height: 9rem;
  background:
    linear-gradient(160deg, oklch(0.8 0.07 220), oklch(0.9 0.06 155));
}

:root[data-theme="dark"] .landing-weather-card__sky {
  background:
    linear-gradient(160deg, oklch(0.33 0.06 230), oklch(0.24 0.05 170));
}

.landing-weather-card__sun {
  position: absolute;
  top: 1.3rem;
  right: 2rem;
  width: 4.8rem;
  height: 4.8rem;
  border-radius: var(--radius-pill);
  background: oklch(0.91 0.11 85);
}

.landing-weather-card__cloud {
  position: absolute;
  right: 4.5rem;
  bottom: 2rem;
  width: 8.5rem;
  height: 2.75rem;
  border-radius: var(--radius-pill);
  background: oklch(0.99 0.008 150 / 0.82);
  box-shadow: -2.5rem 0.7rem 0 -0.55rem oklch(0.99 0.008 150 / 0.7);
}

.landing-weather-card__body {
  display: flex;
  align-items: end;
  justify-content: space-between;
  gap: var(--space-4);
  padding: var(--space-4);
}

.landing-weather-card__body p,
.landing-weather-card__body span {
  margin: 0;
  color: var(--color-text-secondary);
  font-size: var(--font-size-caption);
}

.landing-weather-card__body strong {
  display: block;
  color: var(--color-text-primary);
  font-size: clamp(2.6rem, 5vw, 4.5rem);
  line-height: 0.95;
}

.landing-workspace-preview {
  position: absolute;
  right: 6%;
  bottom: 0;
  width: min(39rem, 96%);
  overflow: hidden;
  box-shadow: 0 0.75rem 1.5rem oklch(0.42 0.018 260 / 0.12);
}

.landing-workspace-preview__top {
  display: flex;
  align-items: center;
  justify-content: space-between;
  border-bottom: 1px solid var(--color-border-soft);
  padding: var(--space-3) var(--space-4);
  color: var(--color-text-secondary);
  font-size: var(--font-size-caption);
}

.landing-workspace-preview__grid {
  display: grid;
  grid-template-columns: 1.1fr 0.9fr;
  gap: var(--space-3);
  padding: var(--space-4);
}

.preview-panel {
  display: grid;
  gap: var(--space-2);
  min-height: 6rem;
  border: 1px solid var(--color-border-soft);
  border-radius: var(--radius-md);
  background: var(--color-surface);
  padding: var(--space-3);
}

.preview-panel span {
  color: var(--color-text-tertiary);
  font-size: var(--font-size-caption);
}

.preview-panel strong {
  color: var(--color-text-primary);
  font-size: var(--font-size-numeric-large);
}

.preview-panel p {
  margin: 0;
  color: var(--color-text-secondary);
  font-size: var(--font-size-caption);
  line-height: 1.45;
}

.preview-panel--weather {
  min-height: 9rem;
  background:
    radial-gradient(circle at 82% 20%, oklch(0.91 0.1 85) 0 2.2rem, transparent 2.3rem),
    linear-gradient(145deg, oklch(0.91 0.055 155), var(--color-surface));
}

.preview-panel--focus {
  grid-row: span 2;
}

.preview-panel--tools,
.preview-panel--bookmarks {
  min-height: 4.75rem;
}

.landing-section-heading {
  max-width: 49rem;
  margin-bottom: var(--space-8);
}

.landing-section-heading--compact {
  max-width: 42rem;
}

.landing-section-heading--center {
  max-width: 48rem;
  margin-inline: auto;
  text-align: center;
}

.landing-section-heading h2,
.landing-final h2 {
  margin: var(--space-3) 0 0;
  color: var(--color-text-primary);
  font-size: clamp(2rem, 4vw, 3.75rem);
  font-weight: var(--font-weight-semibold);
  line-height: 1.08;
}

.landing-section-heading p:last-child,
.landing-final > p:last-of-type {
  margin: var(--space-4) 0 0;
  color: var(--color-text-secondary);
  font-size: var(--font-size-body);
  line-height: 1.72;
}

.landing-story,
.landing-entry,
.landing-demo,
.landing-final {
  padding-block: clamp(2.75rem, 5.4vw, 5rem);
}

.landing-story__grid {
  display: grid;
  gap: var(--space-6);
}

.landing-story__scene {
  position: relative;
  overflow: hidden;
  min-height: 30rem;
  padding: var(--space-4);
  box-shadow: var(--shadow-soft);
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
  min-height: 28rem;
  isolation: isolate;
}

.landing-scene__sun {
  position: absolute;
  top: 2rem;
  right: 2rem;
  width: 8rem;
  height: 8rem;
  border-radius: var(--radius-pill);
  background: oklch(0.9 0.11 86 / 0.72);
  z-index: -1;
}

.landing-scene__cloud {
  position: absolute;
  border-radius: var(--radius-pill);
  background: color-mix(in oklch, var(--color-surface-elevated) 80%, transparent);
  z-index: -1;
}

.landing-scene__cloud--one {
  top: 7rem;
  right: 5rem;
  width: 12rem;
  height: 3.5rem;
}

.landing-scene__cloud--two {
  bottom: 3rem;
  left: 2rem;
  width: 13rem;
  height: 3rem;
  opacity: 0.65;
}

.landing-scene-card {
  position: absolute;
  display: grid;
  gap: var(--space-2);
  width: min(19rem, 78vw);
  border: 1px solid var(--color-border-soft);
  border-radius: var(--radius-md);
  background: var(--color-surface-elevated);
  padding: var(--space-4);
  color: var(--color-text-primary);
  box-shadow: var(--shadow-soft);
}

.landing-scene-card span,
.landing-scene-card p {
  margin: 0;
  color: var(--color-text-secondary);
  font-size: var(--font-size-caption);
  line-height: 1.45;
}

.landing-scene-card strong {
  font-size: var(--font-size-numeric-large);
  line-height: 1;
}

.landing-scene-card--weather {
  top: 8%;
  left: 7%;
  min-height: 8.5rem;
  background:
    radial-gradient(circle at 84% 26%, oklch(0.91 0.1 86) 0 2rem, transparent 2.1rem),
    var(--color-surface-elevated);
}

.landing-scene-card--workspace {
  top: 27%;
  right: 5%;
  width: min(30rem, 60%);
}

.landing-scene-workspace {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: var(--space-2);
  margin-top: var(--space-2);
  margin-bottom: 0;
}

.landing-scene-workspace div {
  display: grid;
  gap: 0.25rem;
  border-radius: var(--radius-sm);
  background: color-mix(in oklch, var(--color-primary-soft) 62%, transparent);
  padding: var(--space-2);
}

.landing-scene-workspace dt {
  color: var(--color-text-tertiary);
  font-size: 0.6875rem;
  line-height: 1.2;
}

.landing-scene-workspace dd {
  margin: 0;
  color: var(--color-text-primary);
  font-size: var(--font-size-caption);
  font-weight: var(--font-weight-semibold);
  line-height: 1.25;
}

.landing-scene-card--todos {
  top: 58%;
  left: 6%;
}

.landing-scene-card--countdown {
  top: 68%;
  left: 35%;
}

.landing-scene-card--tools {
  top: 72%;
  right: 7%;
}

.landing-scene-card--bookmarks {
  top: 83%;
  left: 20%;
}

.landing-story-step {
  display: grid;
  gap: var(--space-3);
  min-height: 13.5rem;
  align-content: center;
  border-top: 1px solid var(--color-border-soft);
  padding-block: var(--space-7, 1.75rem);
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
  font-size: clamp(1.35rem, 2.5vw, 2.25rem);
  font-weight: var(--font-weight-semibold);
  line-height: 1.12;
}

.landing-story-step span {
  color: var(--color-text-secondary);
  line-height: 1.65;
}

.landing-entry__grid {
  display: grid;
  grid-template-columns: repeat(6, minmax(0, 1fr));
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

.landing-entry__item--primary {
  grid-column: span 3;
  min-height: 10rem;
  align-items: end;
  background:
    radial-gradient(circle at 88% 18%, var(--color-accent-soft) 0 4.5rem, transparent 4.75rem),
    var(--color-surface-raised);
}

.landing-entry__item--secondary {
  grid-column: span 3;
  min-height: 8.5rem;
}

.landing-entry__item--compact {
  grid-column: span 2;
}

.landing-entry__item:hover,
.landing-demo__tab:hover,
.landing-demo__tab.is-active {
  border-color: var(--color-border);
  background-color: var(--color-surface-interactive);
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
  box-shadow: var(--shadow-soft);
}

.landing-demo__tabs-wrap {
  display: flex;
  justify-content: center;
  border-bottom: 1px solid var(--color-border-soft);
  padding: var(--space-4);
}

.landing-demo__tabs {
  display: inline-flex;
  max-width: 100%;
  gap: var(--space-2);
  overflow-x: auto;
  border: 1px solid var(--color-border-soft);
  border-radius: var(--radius-md);
  background: var(--color-surface);
  padding: var(--space-1);
  scrollbar-width: thin;
}

.landing-demo__tab {
  display: inline-flex;
  min-height: 2.5rem;
  align-items: center;
  gap: var(--space-2);
  border: 1px solid transparent;
  border-radius: var(--radius-sm);
  background: transparent;
  color: var(--color-text-secondary);
  padding: 0 var(--space-3);
  font-size: var(--font-size-label);
  font-weight: var(--font-weight-medium);
  white-space: nowrap;
}

.landing-demo__tab.is-active {
  border-color: var(--color-border-soft);
  background: var(--color-surface-raised);
  color: var(--color-accent-text);
}

.landing-demo__content {
  display: grid;
  gap: var(--space-6);
  padding: clamp(1.25rem, 3vw, 2.25rem);
}

.landing-demo__copy h3 {
  margin: var(--space-2) 0;
  color: var(--color-text-primary);
  font-size: var(--font-size-section-title);
  font-weight: var(--font-weight-semibold);
}

.landing-demo__copy p {
  color: var(--color-text-secondary);
}

.landing-demo__link {
  display: inline-flex;
  min-height: 2.5rem;
  align-items: center;
  justify-content: center;
  margin-top: var(--space-4);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-sm);
  padding: 0 var(--space-3);
  color: var(--color-text-primary);
  font-size: var(--font-size-label);
  font-weight: var(--font-weight-semibold);
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
  overflow: hidden;
  padding: 0;
}

.landing-demo-weather__sky {
  position: relative;
  min-height: 12rem;
  background:
    linear-gradient(150deg, oklch(0.78 0.07 220), oklch(0.9 0.06 154));
}

.landing-demo-weather__sky > span {
  position: absolute;
  top: 2rem;
  right: 3rem;
  width: 4.5rem;
  height: 4.5rem;
  border-radius: var(--radius-pill);
  background: oklch(0.91 0.11 86);
}

.landing-demo-weather__sky > i {
  position: absolute;
  right: 4.8rem;
  bottom: 2.2rem;
  width: 8rem;
  height: 2.5rem;
  border-radius: var(--radius-pill);
  background: oklch(0.99 0.01 150 / 0.76);
}

.landing-demo-weather__current {
  position: absolute;
  bottom: var(--space-4);
  left: var(--space-4);
  display: grid;
  gap: 0.25rem;
  color: oklch(0.18 0.018 258);
}

.landing-demo-weather__current p,
.landing-demo-weather__current span {
  margin: 0;
  font-size: var(--font-size-caption);
  font-weight: var(--font-weight-medium);
}

.landing-demo-weather__current strong {
  font-size: clamp(3.25rem, 8vw, 4.75rem);
  line-height: 0.9;
}

.landing-demo-weather__body {
  display: grid;
  gap: var(--space-4);
  padding: var(--space-4);
}

.landing-demo-weather__facts {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: var(--space-2);
  margin: 0;
}

.landing-demo-weather__facts div,
.landing-demo-weather__trend li {
  border: 1px solid var(--color-border-soft);
  border-radius: var(--radius-sm);
  background: var(--color-surface-raised);
  padding: var(--space-3);
}

.landing-demo-weather__facts dt,
.landing-demo-weather__trend span,
.landing-demo-weather__trend small {
  color: var(--color-text-secondary);
  font-size: var(--font-size-caption);
}

.landing-demo-weather__facts dd {
  margin: var(--space-1) 0 0;
  color: var(--color-text-primary);
  font-weight: var(--font-weight-semibold);
}

.landing-demo-weather__trend {
  display: grid;
  gap: var(--space-2);
}

.landing-demo-weather__trend p {
  margin: 0;
  color: var(--color-text-primary);
  font-size: var(--font-size-label);
  font-weight: var(--font-weight-semibold);
}

.landing-demo-weather__trend ol {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: var(--space-2);
  margin: 0;
  padding: 0;
  list-style: none;
}

.landing-demo-weather__trend li {
  display: grid;
  gap: 0.25rem;
}

.landing-demo-weather__trend strong {
  color: var(--color-text-primary);
  font-size: var(--font-size-numeric-medium);
  line-height: 1;
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

.landing-demo-todos ul {
  display: grid;
  gap: var(--space-2);
  margin: var(--space-4) 0 0;
  padding: 0;
  list-style: none;
}

.landing-demo-todos li {
  border: 1px solid var(--color-border-soft);
  border-radius: var(--radius-sm);
  background: var(--color-surface-raised);
  padding: var(--space-3);
  color: var(--color-text-secondary);
  font-size: var(--font-size-label);
}

.landing-demo-tools {
  display: grid;
  gap: var(--space-3);
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

.landing-demo-tools__stats {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: var(--space-2);
  margin: 0;
}

.landing-demo-tools__stats div {
  border: 1px solid var(--color-border-soft);
  border-radius: var(--radius-sm);
  background: var(--color-surface-raised);
  padding: var(--space-3);
}

.landing-demo-tools__stats dt {
  color: var(--color-text-tertiary);
  font-size: var(--font-size-caption);
}

.landing-demo-tools__stats dd {
  margin: var(--space-1) 0 0;
  color: var(--color-text-primary);
  font-size: var(--font-size-numeric-medium);
  font-weight: var(--font-weight-semibold);
}

.landing-final {
  max-width: calc(var(--content-wide-max-width) - (var(--page-inline) * 2));
  margin-block: clamp(2rem, 6vw, 5rem);
  padding: clamp(2rem, 5vw, 4rem);
}

@media (min-width: 64rem) {
  .landing-hero {
    grid-template-columns: minmax(0, 0.9fr) minmax(28rem, 1.1fr);
  }

  .landing-story__grid {
    grid-template-columns: minmax(0, 1.48fr) minmax(19rem, 0.72fr);
    align-items: start;
    gap: clamp(1.5rem, 3vw, 3rem);
  }

  .landing-story__scene {
    min-height: min(42rem, calc(100dvh - var(--top-nav-height) - var(--space-5)));
    padding: clamp(1rem, 2vw, 1.5rem);
  }

  .landing-story-step {
    min-height: 34vh;
  }

  .landing-demo__content {
    grid-template-columns: minmax(0, 0.82fr) minmax(20rem, 1fr);
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

  .landing-scene-workspace {
    grid-template-columns: 1fr;
  }

  .landing-scene__sun,
  .landing-scene__cloud {
    display: none;
  }

  .landing-story__progress span {
    transform: scaleX(1);
  }
}

@media (max-width: 56.24rem) {
  .landing-entry__grid {
    grid-template-columns: 1fr;
  }

  .landing-entry__item,
  .landing-entry__item--primary,
  .landing-entry__item--secondary,
  .landing-entry__item--compact {
    grid-column: auto;
    min-height: 5.75rem;
  }
}

@media (max-width: 48rem) {
  .landing-hero {
    gap: var(--space-8);
  }

  .landing-hero__visual {
    min-height: 29rem;
  }

  .landing-weather-card,
  .landing-workspace-preview {
    position: relative;
    right: auto;
    width: 100%;
  }

  .landing-workspace-preview {
    margin-top: var(--space-4);
  }

  .landing-workspace-preview__grid {
    grid-template-columns: 1fr;
  }

  .preview-panel--focus {
    grid-row: auto;
  }
}

@media (max-width: 40rem) {
  .landing-hero,
  .landing-story,
  .landing-entry,
  .landing-demo,
  .landing-final {
    padding-block: var(--space-10);
  }

  .landing-hero__title {
    max-width: 10.5em;
    font-size: clamp(1.95rem, 8.9vw, 2.65rem);
    line-height: 1.09;
  }

  .landing-hero__description {
    font-size: var(--font-size-body-small);
    line-height: 1.68;
  }

  .landing-hero__actions {
    width: 100%;
    gap: var(--space-2);
    margin-top: var(--space-6);
  }

  .landing-hero__actions .landing-button--primary,
  .landing-final__actions .landing-button,
  .landing-final__actions {
    width: 100%;
  }

  .landing-hero__actions .landing-button--secondary {
    width: auto;
    min-height: 2.5rem;
    border-color: transparent;
    background: transparent;
    color: var(--color-accent-text);
    padding-inline: 0;
  }

  .landing-demo-weather__facts,
  .landing-demo-weather__trend ol {
    grid-template-columns: 1fr;
  }

  .landing-demo-tools__stats {
    grid-template-columns: 1fr;
  }
}
</style>

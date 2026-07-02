import { nextTick, onBeforeUnmount, onMounted, ref, type Ref } from 'vue'

type GsapContext = {
  revert: () => void
}

const DESKTOP_MOTION_QUERY = '(min-width: 64rem) and (prefers-reduced-motion: no-preference)'

export function useLandingScrollNarrative(root: Ref<HTMLElement | null>) {
  const motionState = ref<'static' | 'loading' | 'ready'>('static')
  const isReducedMotion = ref(false)
  const isDesktopMotion = ref(false)
  let context: GsapContext | null = null
  let mediaQuery: MediaQueryList | null = null

  function cleanup() {
    context?.revert()
    context = null
    motionState.value = 'static'
  }

  async function initialize() {
    cleanup()
    await nextTick()

    const rootElement = root.value
    if (!rootElement || !mediaQuery?.matches) return

    motionState.value = 'loading'

    const [{ gsap }, { ScrollTrigger }] = await Promise.all([
      import('gsap'),
      import('gsap/ScrollTrigger'),
    ])

    if (!root.value || !mediaQuery?.matches) {
      motionState.value = 'static'
      return
    }

    gsap.registerPlugin(ScrollTrigger)

    context = gsap.context(() => {
      const timeline = gsap.timeline({
        defaults: { ease: 'none' },
        scrollTrigger: {
          trigger: '[data-landing-story]',
          start: 'top top+=72',
          end: '+=2200',
          scrub: 0.8,
          pin: '[data-landing-scene]',
          anticipatePin: 1,
          invalidateOnRefresh: true,
        },
      })

      timeline
        .to('[data-scene-weather]', { yPercent: -16, scale: 0.92 }, 0)
        .fromTo(
          '[data-scene-workspace]',
          { yPercent: 18, scale: 0.96 },
          { yPercent: -18, scale: 1, autoAlpha: 1 },
          0.12,
        )
        .to('[data-scene-todos]', { yPercent: -42, autoAlpha: 1 }, 0.3)
        .to('[data-scene-bookmarks]', { yPercent: -58, autoAlpha: 1 }, 0.46)
        .to('[data-scene-tools]', { yPercent: -78, autoAlpha: 1 }, 0.62)
        .to('[data-scene-orbit]', { rotate: 18, scale: 0.9 }, 0)
        .to('[data-story-progress]', { scaleX: 1 }, 0)
    }, rootElement)

    ScrollTrigger.refresh()
    motionState.value = 'ready'
  }

  function handleMotionChange(event: MediaQueryListEvent | MediaQueryList) {
    isDesktopMotion.value = event.matches
    isReducedMotion.value = window.matchMedia('(prefers-reduced-motion: reduce)').matches

    if (event.matches) {
      void initialize()
    } else {
      cleanup()
    }
  }

  onMounted(() => {
    mediaQuery = window.matchMedia(DESKTOP_MOTION_QUERY)
    handleMotionChange(mediaQuery)
    mediaQuery.addEventListener('change', handleMotionChange)
  })

  onBeforeUnmount(() => {
    mediaQuery?.removeEventListener('change', handleMotionChange)
    cleanup()
  })

  return {
    isDesktopMotion,
    isReducedMotion,
    motionState,
  }
}

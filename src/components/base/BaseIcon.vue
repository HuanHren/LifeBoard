<script setup lang="ts">
export type BaseIconName =
  | 'home'
  | 'weather'
  | 'todos'
  | 'tools'
  | 'bookmarks'
  | 'settings'
  | 'sun'
  | 'moon'
  | 'system'
  | 'search'
  | 'close'
  | 'check'
  | 'warning'

interface Props {
  name: BaseIconName
  size?: 'sm' | 'md' | 'lg'
}

withDefaults(defineProps<Props>(), {
  size: 'md',
})
</script>

<template>
  <svg
    aria-hidden="true"
    class="base-icon"
    :class="`base-icon--${size}`"
    fill="none"
    stroke="currentColor"
    stroke-linecap="round"
    stroke-linejoin="round"
    stroke-width="1.8"
    viewBox="0 0 24 24"
  >
    <path v-if="name === 'home'" d="M4 10.5 12 4l8 6.5V20a1 1 0 0 1-1 1h-5v-6h-4v6H5a1 1 0 0 1-1-1z" />
    <g v-else-if="name === 'weather'">
      <path d="M8.8 18h7.4a3.8 3.8 0 0 0 .6-7.55A5.3 5.3 0 0 0 6.5 11.7 3.2 3.2 0 0 0 8.8 18Z" />
      <path d="M7.8 5.2 6.9 3.5M3.7 9.4 2 8.8M12 4V2" />
    </g>
    <g v-else-if="name === 'todos'">
      <path d="M5 6.5h14M5 12h14M5 17.5h14" />
      <path d="m3 6.5.7.7L5.2 5.7M3 12l.7.7 1.5-1.5M3 17.5l.7.7 1.5-1.5" />
    </g>
    <g v-else-if="name === 'tools'">
      <path d="m14.5 5 4.5 4.5-9.8 9.8H4.7v-4.5z" />
      <path d="m13 6.5 4.5 4.5M5 5h5M7.5 2.5v5" />
    </g>
    <g v-else-if="name === 'bookmarks'">
      <path d="M6 4.8A1.8 1.8 0 0 1 7.8 3h8.4A1.8 1.8 0 0 1 18 4.8V21l-6-3.5L6 21z" />
      <path d="M9 7h6" />
    </g>
    <g v-else-if="name === 'settings'">
      <path d="M12 15.2a3.2 3.2 0 1 0 0-6.4 3.2 3.2 0 0 0 0 6.4Z" />
      <path d="M19.4 15a1.7 1.7 0 0 0 .3 1.9l.1.1-2.1 2.1-.1-.1a1.7 1.7 0 0 0-1.9-.3 1.7 1.7 0 0 0-1 1.5v.2h-3v-.2a1.7 1.7 0 0 0-1-1.5 1.7 1.7 0 0 0-1.9.3l-.1.1-2.1-2.1.1-.1A1.7 1.7 0 0 0 7 15a1.7 1.7 0 0 0-1.5-1H5.3v-3h.2A1.7 1.7 0 0 0 7 10a1.7 1.7 0 0 0-.3-1.9l-.1-.1 2.1-2.1.1.1a1.7 1.7 0 0 0 1.9.3 1.7 1.7 0 0 0 1-1.5v-.2h3v.2a1.7 1.7 0 0 0 1 1.5 1.7 1.7 0 0 0 1.9-.3l.1-.1L19.8 8l-.1.1A1.7 1.7 0 0 0 19.4 10a1.7 1.7 0 0 0 1.5 1h.2v3h-.2a1.7 1.7 0 0 0-1.5 1Z" />
    </g>
    <g v-else-if="name === 'sun'">
      <path d="M12 16a4 4 0 1 0 0-8 4 4 0 0 0 0 8Z" />
      <path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4" />
    </g>
    <path v-else-if="name === 'moon'" d="M20 14.5A7.5 7.5 0 0 1 9.5 4a7.5 7.5 0 1 0 10.5 10.5Z" />
    <g v-else-if="name === 'system'">
      <rect height="12" rx="2" width="16" x="4" y="5" />
      <path d="M9 21h6M12 17v4" />
    </g>
    <g v-else-if="name === 'search'">
      <circle cx="11" cy="11" r="6" />
      <path d="m16 16 4 4" />
    </g>
    <path v-else-if="name === 'close'" d="m6 6 12 12M18 6 6 18" />
    <path v-else-if="name === 'check'" d="m5 12 4 4 10-10" />
    <g v-else-if="name === 'warning'">
      <path d="M12 4 3 20h18z" />
      <path d="M12 9v4M12 17h.01" />
    </g>
  </svg>
</template>

<style scoped>
.base-icon {
  display: inline-block;
  flex: none;
}

.base-icon--sm {
  width: 1rem;
  height: 1rem;
}

.base-icon--md {
  width: 1.25rem;
  height: 1.25rem;
}

.base-icon--lg {
  width: 1.5rem;
  height: 1.5rem;
}
</style>

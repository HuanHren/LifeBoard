import {
  onScopeDispose,
  shallowRef,
  toValue,
  type MaybeRefOrGetter,
} from 'vue'
import type { CopyStatus } from '@/modules/tools/types/tools'

export function useClipboardFeedback(content: MaybeRefOrGetter<string>) {
  const copyStatus = shallowRef<CopyStatus>('idle')
  const copyError = shallowRef<string | null>(null)
  let resetTimer: ReturnType<typeof setTimeout> | null = null

  function clearResetTimer() {
    if (resetTimer !== null) {
      clearTimeout(resetTimer)
      resetTimer = null
    }
  }

  function scheduleReset() {
    clearResetTimer()
    resetTimer = setTimeout(() => {
      copyStatus.value = 'idle'
      copyError.value = null
    }, 2_000)
  }

  async function copy() {
    const value = toValue(content)

    if (!value || typeof navigator === 'undefined' || !navigator.clipboard?.writeText) {
      copyStatus.value = 'error'
      copyError.value = 'Copy failed. Select the output and copy it manually.'
      return false
    }

    copyStatus.value = 'copying'
    copyError.value = null

    try {
      await navigator.clipboard.writeText(value)
      copyStatus.value = 'copied'
      scheduleReset()
      return true
    } catch {
      copyStatus.value = 'error'
      copyError.value = 'Copy failed. Select the output and copy it manually.'
      return false
    }
  }

  onScopeDispose(clearResetTimer)

  return {
    copyStatus,
    copyError,
    copy,
  }
}

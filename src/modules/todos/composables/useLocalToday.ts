import { onScopeDispose, shallowRef } from 'vue'
import { getLocalDateString } from '@/modules/todos/utils/todoDates'

export function useLocalToday() {
  const today = shallowRef(getLocalDateString())
  let timer: ReturnType<typeof setTimeout> | null = null

  function scheduleNextDay() {
    if (typeof window === 'undefined') {
      return
    }

    const now = new Date()
    const nextDay = new Date(now)
    nextDay.setHours(24, 0, 0, 50)

    timer = window.setTimeout(() => {
      today.value = getLocalDateString()
      scheduleNextDay()
    }, nextDay.getTime() - now.getTime())
  }

  scheduleNextDay()

  onScopeDispose(() => {
    if (timer !== null) {
      clearTimeout(timer)
    }
  })

  return today
}

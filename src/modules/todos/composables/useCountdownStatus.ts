import { computed, toValue, type MaybeRefOrGetter } from 'vue'
import type { CountdownStatus } from '@/modules/todos/types/todos'
import { differenceInCalendarDays } from '@/modules/todos/utils/todoDates'

export function useCountdownStatus(
  targetDate: MaybeRefOrGetter<string>,
  today: MaybeRefOrGetter<string>,
) {
  return computed<CountdownStatus>(() => {
    const difference = differenceInCalendarDays(toValue(targetDate), toValue(today))

    if (difference === 0) {
      return { difference, label: 'Today', state: 'today' }
    }

    if (difference > 0) {
      return {
        difference,
        label: `${difference} ${difference === 1 ? 'day' : 'days'} remaining`,
        state: 'future',
      }
    }

    const elapsed = Math.abs(difference)
    return {
      difference,
      label: `Reached ${elapsed} ${elapsed === 1 ? 'day' : 'days'} ago`,
      state: 'reached',
    }
  })
}

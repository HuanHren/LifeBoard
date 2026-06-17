import { computed, toValue, type MaybeRefOrGetter } from 'vue'
import { useI18n } from '@/i18n/useI18n'
import type { CountdownStatus } from '@/modules/todos/types/todos'
import { differenceInCalendarDays } from '@/modules/todos/utils/todoDates'

export function useCountdownStatus(
  targetDate: MaybeRefOrGetter<string>,
  today: MaybeRefOrGetter<string>,
) {
  const { t } = useI18n()

  return computed<CountdownStatus>(() => {
    const difference = differenceInCalendarDays(toValue(targetDate), toValue(today))

    if (difference === 0) {
      return {
        difference,
        label: t('todos.countdowns.status.today'),
        state: 'today',
      }
    }

    if (difference > 0) {
      return {
        difference,
        label: t(
          difference === 1
            ? 'todos.countdowns.status.remainingOne'
            : 'todos.countdowns.status.remainingMany',
          { count: difference },
        ),
        state: 'future',
      }
    }

    const elapsed = Math.abs(difference)
    return {
      difference,
      label: t(
        elapsed === 1
          ? 'todos.countdowns.status.reachedOne'
          : 'todos.countdowns.status.reachedMany',
        { count: elapsed },
      ),
      state: 'reached',
    }
  })
}

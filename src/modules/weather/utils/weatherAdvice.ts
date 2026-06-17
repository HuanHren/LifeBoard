import { ADVICE_THRESHOLDS } from '@/modules/weather/constants/weather'
import type {
  AdviceItem,
  CurrentConditions,
  DailyForecastItem,
  HourlyForecastItem,
  WeatherAdvice,
} from '@/modules/weather/types/weather'
import {
  isFreezingPrecipitationCode,
  isHeavyPrecipitationCode,
  isThunderstormCode,
} from '@/modules/weather/utils/weatherCodes'

interface AdviceContext {
  current: CurrentConditions
  hourly: HourlyForecastItem[]
  daily: DailyForecastItem[]
}

function maximum(values: number[]) {
  return values.length > 0 ? Math.max(...values) : 0
}

function minimum(values: number[]) {
  return values.length > 0 ? Math.min(...values) : 0
}

function sum(values: number[]) {
  return values.reduce((total, value) => total + value, 0)
}

function availableNumbers(values: Array<number | null>) {
  return values.filter((value): value is number => value !== null)
}

function createUmbrellaAdvice(context: AdviceContext): AdviceItem {
  const next6 = context.hourly.slice(0, 6)
  const next12 = context.hourly.slice(0, 12)
  const sixHourProbability = maximum(next6.map((item) => item.precipitationProbability))
  const twelveHourProbability = maximum(next12.map((item) => item.precipitationProbability))
  const sixHourPrecipitation = sum(next6.map((item) => item.precipitation))
  const twelveHourPrecipitation = sum(next12.map((item) => item.precipitation))

  if (
    context.current.precipitation > 0.1 ||
    sixHourProbability >= ADVICE_THRESHOLDS.umbrellaTakeProbability ||
    sixHourPrecipitation >= ADVICE_THRESHOLDS.umbrellaTakePrecipitation
  ) {
    return {
      kind: 'umbrella',
      title: 'Umbrella',
      summary: 'Taking an umbrella would be sensible.',
      detail: 'Rain is occurring or has a meaningful chance during the next several hours.',
      level: 'caution',
    }
  }

  if (
    twelveHourProbability >= ADVICE_THRESHOLDS.umbrellaConsiderProbability ||
    twelveHourPrecipitation >= ADVICE_THRESHOLDS.umbrellaConsiderPrecipitation
  ) {
    return {
      kind: 'umbrella',
      title: 'Umbrella',
      summary: 'Consider carrying a compact umbrella.',
      detail: 'Some precipitation is possible later, although the signal is not strong.',
      level: 'consider',
    }
  }

  return {
    kind: 'umbrella',
    title: 'Umbrella',
    summary: 'An umbrella does not look necessary right now.',
    detail: 'The next 12 hours show little meaningful precipitation.',
    level: 'clear',
  }
}

function createClothingAdvice(context: AdviceContext): AdviceItem {
  const next12 = context.hourly.slice(0, 12)
  const apparentTemperatures = next12.map((item) => item.apparentTemperature)
  const low = minimum(apparentTemperatures)
  const high = maximum(apparentTemperatures)
  const current = context.current.apparentTemperature
  let summary = 'Light, comfortable clothing should suit the conditions.'
  let level: AdviceItem['level'] = 'clear'

  if (current <= ADVICE_THRESHOLDS.veryColdApparent) {
    summary = 'Wear an insulated outer layer and protect exposed skin.'
    level = 'caution'
  } else if (current <= ADVICE_THRESHOLDS.coolApparent) {
    summary = 'A warm layer or jacket would be useful.'
    level = 'consider'
  } else if (current <= ADVICE_THRESHOLDS.mildApparent) {
    summary = 'A light layer should be comfortable.'
  } else if (current >= ADVICE_THRESHOLDS.hotApparent) {
    summary = 'Choose breathable clothing and limit heat buildup.'
    level = 'caution'
  } else if (current >= ADVICE_THRESHOLDS.warmApparent) {
    summary = 'Light, breathable clothing should be comfortable.'
  }

  const modifiers: string[] = []

  if (
    context.current.windGusts !== null &&
    context.current.windGusts >= ADVICE_THRESHOLDS.strongGusts
  ) {
    modifiers.push('A wind-resistant layer may help.')
  }

  if (context.current.precipitation > 0.1) {
    modifiers.push('A water-resistant outer layer may be useful.')
  }

  if (high - low >= ADVICE_THRESHOLDS.largeTemperatureRange) {
    modifiers.push('Temperatures change enough that an extra layer may be useful.')
  }

  return {
    kind: 'clothing',
    title: 'Clothing',
    summary,
    detail: modifiers.join(' ') || `Feels like ${Math.round(current)}°C during the current conditions.`,
    level,
  }
}

function createOutdoorAdvice(context: AdviceContext): AdviceItem {
  const next6 = context.hourly.slice(0, 6)
  const hasThunderstorm = next6.some((item) => isThunderstormCode(item.condition.code))
  const hasFreezingPrecipitation = next6.some((item) =>
    isFreezingPrecipitationCode(item.condition.code),
  )
  const hasHeavyPrecipitation =
    next6.some((item) => isHeavyPrecipitationCode(item.condition.code)) ||
    maximum(next6.map((item) => item.precipitation)) >=
      ADVICE_THRESHOLDS.outdoorHeavyHourlyPrecipitation
  const maximumGust = maximum(availableNumbers(next6.map((item) => item.windGusts)))
  const minimumApparent = minimum(next6.map((item) => item.apparentTemperature))
  const maximumApparent = maximum(next6.map((item) => item.apparentTemperature))

  if (
    hasThunderstorm ||
    hasFreezingPrecipitation ||
    hasHeavyPrecipitation ||
    maximumGust >= ADVICE_THRESHOLDS.outdoorStrongGusts ||
    minimumApparent <= ADVICE_THRESHOLDS.outdoorColdExtreme ||
    maximumApparent >= ADVICE_THRESHOLDS.outdoorHeatExtreme
  ) {
    return {
      kind: 'outdoor',
      title: 'Outdoor plans',
      summary: 'Consider moving strenuous outdoor activity to another time.',
      detail: 'The near-term forecast includes conditions that may make exercise uncomfortable.',
      level: 'caution',
    }
  }

  const hasModerateRainRisk = maximum(
    next6.map((item) => item.precipitationProbability),
  ) >= ADVICE_THRESHOLDS.umbrellaConsiderProbability
  const hasElevatedUv =
    maximum(availableNumbers(next6.map((item) => item.uvIndex))) >=
    ADVICE_THRESHOLDS.elevatedUv
  const hasNotableWind = maximumGust >= ADVICE_THRESHOLDS.strongGusts

  if (hasModerateRainRisk || hasElevatedUv || hasNotableWind) {
    const cautions = [
      hasModerateRainRisk ? 'rain risk' : '',
      hasElevatedUv ? 'elevated UV' : '',
      hasNotableWind ? 'gusty wind' : '',
    ].filter(Boolean)

    return {
      kind: 'outdoor',
      title: 'Outdoor plans',
      summary: 'Outdoor activity may be suitable with a little preparation.',
      detail: `Keep an eye on ${cautions.join(', ')} during the next several hours.`,
      level: 'consider',
    }
  }

  return {
    kind: 'outdoor',
    title: 'Outdoor plans',
    summary: 'Conditions look generally suitable for going out.',
    detail: 'No major short-term weather limitation is apparent in the forecast.',
    level: 'clear',
  }
}

function createWeatherNotes(context: AdviceContext) {
  const next12 = context.hourly.slice(0, 12)
  const notes: string[] = []
  const maximumGust = maximum(availableNumbers(next12.map((item) => item.windGusts)))
  const temperatureValues = next12.map((item) => item.temperature)
  const temperatureRange = maximum(temperatureValues) - minimum(temperatureValues)
  const apparentDifference = Math.abs(
    context.current.temperature - context.current.apparentTemperature,
  )

  if (maximumGust >= ADVICE_THRESHOLDS.strongGusts) {
    notes.push(`Gusts may reach about ${Math.round(maximumGust)} km/h within 12 hours.`)
  }

  if (apparentDifference >= 4) {
    notes.push(
      `It currently feels about ${Math.round(apparentDifference)}° different from the measured temperature.`,
    )
  }

  if (temperatureRange >= ADVICE_THRESHOLDS.largeTemperatureRange) {
    notes.push(
      `Temperature may vary by about ${Math.round(temperatureRange)}° over the next 12 hours.`,
    )
  }

  return notes
}

export function createWeatherAdvice(context: AdviceContext): WeatherAdvice {
  return {
    items: [
      createUmbrellaAdvice(context),
      createClothingAdvice(context),
      createOutdoorAdvice(context),
    ],
    notes: createWeatherNotes(context),
  }
}

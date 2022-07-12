import { parse as _parse, format as _format } from 'date-fns';

declare type parseParams = [
    dateString: string,
    formatString: string,
    referenceDate: Date | number,
    options?: {
      locale?: Locale
      weekStartsOn?: 0 | 1 | 2 | 3 | 4 | 5 | 6
      firstWeekContainsDate?: 1 | 2 | 3 | 4 | 5 | 6 | 7
      useAdditionalWeekYearTokens?: boolean
      useAdditionalDayOfYearTokens?: boolean
    }
]

declare type formatParams = [
    date: Date | number,
    format: string,
    options?: {
      locale?: Locale
      weekStartsOn?: 0 | 1 | 2 | 3 | 4 | 5 | 6
      firstWeekContainsDate?: number
      useAdditionalWeekYearTokens?: boolean
      useAdditionalDayOfYearTokens?: boolean
    }
]

type Locale = {
  code?: string
  formatDistance?: (...args: Array<any>) => any
  formatRelative?: (...args: Array<any>) => any
  localize?: {
    ordinalNumber: (...args: Array<any>) => any
    era: (...args: Array<any>) => any
    quarter: (...args: Array<any>) => any
    month: (...args: Array<any>) => any
    day: (...args: Array<any>) => any
    dayPeriod: (...args: Array<any>) => any
  }
  formatLong?: {
    date: (...args: Array<any>) => any
    time: (...args: Array<any>) => any
    dateTime: (...args: Array<any>) => any
  }
  match?: {
    ordinalNumber: (...args: Array<any>) => any
    era: (...args: Array<any>) => any
    quarter: (...args: Array<any>) => any
    month: (...args: Array<any>) => any
    day: (...args: Array<any>) => any
    dayPeriod: (...args: Array<any>) => any
  }
  options?: {
    weekStartsOn?: 0 | 1 | 2 | 3 | 4 | 5 | 6
    firstWeekContainsDate?: 1 | 2 | 3 | 4 | 5 | 6 | 7
  }
}

export function parse(...parameters: parseParams): Date {
  return _parse(...parameters);
}

export function format(...parameters: formatParams): string {
  return _format(...parameters);
}

/** Datas relativas em pt-BR (RN-10). `always` preserva o formato "há 2 dias". */
const relativeFormatter = new Intl.RelativeTimeFormat('pt-BR', { numeric: 'always' })

/** `Intl.DateTimeFormat` lança em data inválida; UTC mantém o fallback determinístico. */
const absoluteFormatter = new Intl.DateTimeFormat('pt-BR', { timeZone: 'UTC' })

const MINUTE = 60;
const HOUR = MINUTE * 60;
const DAY = HOUR * 24;
const WEEK = DAY * 7;
const MONTH = DAY * 30;
const YEAR = DAY * 365;

export function relativeDate(value: string, now: Date = new Date()): string {
  const timestamp = new Date(value).getTime()

  if (Number.isNaN(timestamp)) {
    return 'Data indisponível';
  }

  const elapsedSeconds = (now.getTime() - timestamp) / 1000;

  if (elapsedSeconds > YEAR) {
    return absoluteFormatter.format(new Date(value));
  }

  if (elapsedSeconds < MINUTE) {
    return relativeFormatter.format(-Math.round(elapsedSeconds), 'second');
  }

  if (elapsedSeconds < HOUR) {
    return relativeFormatter.format(-Math.round(elapsedSeconds / MINUTE), 'minute');
  }

  if (elapsedSeconds < DAY) {
    return relativeFormatter.format(-Math.round(elapsedSeconds / HOUR), 'hour');
  }

  if (elapsedSeconds < WEEK) {
    return relativeFormatter.format(-Math.round(elapsedSeconds / DAY), 'day');
  }

  if (elapsedSeconds < MONTH) {
    return relativeFormatter.format(-Math.round(elapsedSeconds / WEEK), 'week');
  }

  return relativeFormatter.format(-Math.round(elapsedSeconds / MONTH), 'month');
}

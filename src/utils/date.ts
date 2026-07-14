export function formatDateToDisplay(dateStr: string): string {
  if (!dateStr) return '';
  if (dateStr.includes('Ago') || dateStr.includes('Ene') || dateStr.includes('Feb') || dateStr.includes('Mar') || dateStr.includes('Abr') || dateStr.includes('May') || dateStr.includes('Jun') || dateStr.includes('Jul') || dateStr.includes('Sep') || dateStr.includes('Oct') || dateStr.includes('Nov') || dateStr.includes('Dic')) {
    return dateStr;
  }
  const dateParts = dateStr.split('-');
  if (dateParts.length === 3) {
    const d = new Date(Number(dateParts[0]), Number(dateParts[1]) - 1, Number(dateParts[2]));
    if (isNaN(d.getTime())) return dateStr;
    const months = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];
    return `${d.getDate()} ${months[d.getMonth()]}`;
  }
  return dateStr;
}

export function getDayOfWeekInSpanish(dateStr: string): string {
  const dateParts = dateStr.split('-');
  if (dateParts.length === 3) {
    const d = new Date(Number(dateParts[0]), Number(dateParts[1]) - 1, Number(dateParts[2]));
    if (isNaN(d.getTime())) return 'Lunes';
    const days = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];
    return days[d.getDay()];
  }
  return 'Lunes';
}

export interface Countdown {
  hours: number;
  minutes: number;
  seconds: number;
  targetDate: Date;
}

// Computes the remaining time until the next occurrence of `targetTimeStr` (HH:MM),
// rolling over to tomorrow if that time has already passed today relative to `now`.
export function calculateCountdown(targetTimeStr: string, now: Date): Countdown {
  const [targetHour, targetMin] = targetTimeStr.split(':').map(Number);

  const targetDate = new Date(now);
  targetDate.setHours(targetHour, targetMin, 0, 0);

  if (now.getTime() > targetDate.getTime()) {
    targetDate.setDate(targetDate.getDate() + 1);
  }

  const diffMs = targetDate.getTime() - now.getTime();
  const diffSecs = Math.floor(diffMs / 1000);

  const hours = Math.floor(diffSecs / 3600);
  const minutes = Math.floor((diffSecs % 3600) / 60);
  const seconds = diffSecs % 60;

  return { hours, minutes, seconds, targetDate };
}

export function createSeededRandom(seed: number) {
  let state = seed
  return () => {
    state = (state * 1664525 + 1013904223) >>> 0
    return state / 0x100000000
  }
}

export function pick<T>(rand: () => number, items: T[]): T {
  return items[Math.floor(rand() * items.length)]
}

export function pickN<T>(rand: () => number, items: T[], count: number): T[] {
  const copy = [...items]
  const result: T[] = []
  for (let i = 0; i < count && copy.length > 0; i++) {
    const idx = Math.floor(rand() * copy.length)
    result.push(copy.splice(idx, 1)[0])
  }
  return result
}

export function randomInt(rand: () => number, min: number, max: number): number {
  return Math.floor(rand() * (max - min + 1)) + min
}

export function randomPrice(rand: () => number, min = 199, max = 4999): number {
  const raw = randomInt(rand, min, max)
  return Math.round(raw / 10) * 10 - 1
}

export function formatDate(daysAgo: number): string {
  const d = new Date()
  d.setDate(d.getDate() - daysAgo)
  return d.toISOString().split('T')[0]
}

export function formatDateTime(daysAgo: number, hour = 10): string {
  const d = new Date()
  d.setDate(d.getDate() - daysAgo)
  d.setHours(hour, randomInt(() => 0.5, 0, 59), 0, 0)
  return d.toISOString()
}

export const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'] as const

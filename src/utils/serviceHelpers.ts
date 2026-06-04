/** Simulated network latency for mock services */
export const simulateDelay = (ms: number) =>
  new Promise<void>((resolve) => {
    setTimeout(resolve, ms)
  })

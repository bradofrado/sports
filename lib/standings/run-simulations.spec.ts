import { describe, expect, it } from 'vitest'
import {
  runBYU1LossScenario,
  runNumContendersSimulation,
} from './run-simulation'

describe('run-simulations', () => {
  it('should run num contenders simulation', async () => {
    const byuId = 32
    await runNumContendersSimulation(byuId, [0, 1, 2, 3, 4, 6])
    expect(true).toBeTruthy()
  })

  it('should run 1 loss simulation', async () => {
    await runBYU1LossScenario()
    expect(true).toBeTruthy()
  })
})

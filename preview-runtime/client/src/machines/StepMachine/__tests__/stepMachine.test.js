import { interpret } from 'xstate'
import { createStepMachine, getInitialContext } from '../'

const services = []
const start = () => {
  const machine = createStepMachine()
    .withConfig({ actions: { persist: () => {} } })
    .withContext(getInitialContext())
  const service = interpret(machine).start()
  services.push(service)
  return service
}
afterEach(() => {
  services.splice(0).forEach(service => service.stop())
  localStorage.clear()
})

describe('native step machine', () => {
  it('keeps the publication step without a selection', () => {
    const service = start()
    expect(service.state.matches('pending.pub')).toBe(true)
    service.send('NEXT')
    expect(service.state.matches('pending.pub')).toBe(true)
  })

  it('advances an uncurated publication through the native SET_PUB event', () => {
    const service = start()
    service.send({ type: 'SET_PUB', pub: {
      uniquename: 'FBrf0001234', curationStatus: null, type: { name: 'paper' },
    } })
    service.send('NEXT')
    expect(service.state.matches('pending.author')).toBe(true)
  })

  it('retains a free citation with a null publication through the native event', () => {
    const service = start()
    service.send({ type: 'SET_CITATION', citation: 'A custom user entered citation.' })
    expect(service.state.context.submission.citation).toBe('A custom user entered citation.')
    expect(service.state.context.submission.publication).toBeNull()
  })

  it('does not advance a curated publication', () => {
    const service = start()
    service.send({ type: 'SET_PUB', pub: {
      uniquename: 'FBrf0001234', curationStatus: 'curated', type: { name: 'paper' },
    } })
    service.send('NEXT')
    expect(service.state.matches('pending.pub')).toBe(true)
  })
})

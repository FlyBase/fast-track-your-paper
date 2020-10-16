import { interpret } from 'xstate'
import { ftypSteps } from '../'

const ftypStepsWithPub = ftypSteps
  .withConfig({
    actions: {
      persist: () => {},
    },
  })
  .withContext({
    ...ftypSteps.context,
    submission: {
      publication: {
        fbrf: 'FBrf0001234',
      },
    },
  })

const ftypStepsWithCitation = ftypSteps
  .withConfig({
    actions: {
      persist: () => {},
    },
  })
  .withContext({
    ...ftypSteps.context,
    submission: {
      citation: 'A custom user entered citation.',
    },
  })

describe('stepMachine', () => {
  it('Should not leave because hasPublication is false', () => {
    const stepService = interpret(ftypSteps).start()
    expect(stepService.state.value).toEqual('pub')
    stepService.send('NEXT')
    expect(stepService.state.value).toEqual('pub')
  })

  it('Should leave because hasPublication is true', () => {
    let stepService = interpret(ftypStepsWithPub).start()
    expect(stepService.state.value).toEqual('pub')
    stepService.send('NEXT')
    expect(stepService.state.value).toEqual('author')

    stepService = interpret(ftypStepsWithCitation).start()
    expect(stepService.state.value).toEqual('pub')
    stepService.send('NEXT')
    expect(stepService.state.value).toEqual('author')
  })
})

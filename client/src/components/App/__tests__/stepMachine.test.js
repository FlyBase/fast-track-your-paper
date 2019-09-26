import { interpret } from 'xstate'
import { ftypSteps } from '../stepMachine'

const ftypStepsWithPub = ftypSteps.withContext({
  hasPublication: true
  }
)

describe('stepMachine', () => {
  it('Should not leave because hasPublication is false', () =>{
    const stepService = interpret(ftypSteps).start()
    expect(stepService.state.value).toEqual('pub')
    stepService.send('NEXT')
    expect(stepService.state.value).toEqual('pub')
  })

  it('Should leave because hasPublication is true', () =>{
    const stepService = interpret(ftypStepsWithPub).start()
    expect(stepService.state.value).toEqual('pub')
    stepService.send('NEXT')
    expect(stepService.state.value).toEqual('author')
  })

})
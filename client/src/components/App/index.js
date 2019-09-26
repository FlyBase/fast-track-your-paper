import React from 'react'
import { useMachine } from '@xstate/react'
import { Router } from '@reach/router'
import { ftypSteps } from './stepMachine'
import PubStep from 'components/PubStep'
import AuthorStep from 'components/AuthorStep'

function App() {
  const [current, send] = useMachine(ftypSteps)
  console.log(current)
  return (
    <div>
      <h1>Fast Track Your Paper!</h1>
      <h2>Current step is {current.value}</h2>
      <Router>
        <PubStep path="pub" />
        <AuthorStep path="author"/>
      </Router>
      <nav>
        <button onClick={() => send('PREV')}>Prev</button>
        <button onClick={() => send('NEXT')}>Next</button>
      </nav>
    </div>
  )
}

export default App

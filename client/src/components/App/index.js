import React from 'react'
import { BrowserRouter as Router, Route } from 'react-router-dom'
import StepContainer from 'components/StepContainer'

function App() {
  return (
    <div>
      <h3>Fast-Track Your Paper!</h3>
      <Router>
        <Route exact path="/" component={StepContainer} />
        <Route path="/:fbrf/:email" component={EmailSubmission} />
      </Router>
    </div>
  )
}

const EmailSubmission = () => (
  <div>This is where the email link handling will go</div>
)

export default App

import React from 'react'
import { BrowserRouter as Router, Route } from 'react-router-dom'
import StepContainer from 'components/StepContainer'
import FtypAdmin from 'components/FtypAdmin'

function App() {
  return (
    <div>
      <Router>
        <Route exact path="/" component={StepContainer} />
        <Route path="/admin" component={FtypAdmin} />
        <Route path="/:fbrf/:email" component={EmailSubmission} />
      </Router>
    </div>
  )
}

const EmailSubmission = () => (
  <div>This is where the email link handling will go</div>
)

export default App

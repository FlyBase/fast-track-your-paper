import React from 'react'
import { BrowserRouter as Router, Route, Switch } from 'react-router-dom'
import StepContainer from 'components/StepContainer'
import FtypAdmin from 'components/FtypAdmin'
import SubmissionView from '../SubmissionView'

function App({ basename }) {
  return (
    <div>
      <Router basename={basename}>
        <Switch>
          <Route exact path="/">
            <StepContainer />
          </Route>
          <Route path="/admin/:fbrf">
            <SubmissionView />
          </Route>
          <Route path="/admin">
            <FtypAdmin />
          </Route>
          <Route path="/:fbrf/:email">
            <StepContainer />
          </Route>
        </Switch>
      </Router>
    </div>
  )
}

export default App

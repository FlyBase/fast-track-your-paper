import 'react-app-polyfill/ie11'
import 'react-app-polyfill/stable'

import React from 'react'
import ReactDOM from 'react-dom'

import ApolloClient from 'apollo-boost'
import { ApolloContext } from 'contexts/index'

// Initialize error capturing.
import * as Sentry from '@sentry/browser'
import * as serviceWorker from './serviceWorker'

// Import FTYP
import './index.css'
import App from 'components/App'

// Initialize Sentry bug capture client.
Sentry.init({
  dsn: process.env.REACT_APP_SENTRY_DSN,
  environment: process.env.NODE_ENV,
})

// Run accessibility checks in development mode.
if (process.env.NODE_ENV !== 'production') {
  const axe = require('react-axe')
  axe(React, ReactDOM, 1000)
}

/*
 *  Initialize the Apollo client and context objects.
 *  The context is used to pass this down to any deeply
 *  nested components that need access to the GraphQL client
 *  without having to prop drill it down.
 */
const client = new ApolloClient({ uri: '/graphql' })

ReactDOM.render(
  <ApolloContext.Provider value={client}>
    <App />
  </ApolloContext.Provider>,
  document.getElementById('root')
)

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://bit.ly/CRA-PWA
serviceWorker.unregister()

import 'react-app-polyfill/stable'

import React from 'react'
import ReactDOM from 'react-dom'

// Initialize error capturing.
import * as Sentry from '@sentry/browser'
import * as serviceWorker from './serviceWorker'

// Import FTYP
import './index.css'
import App from 'components/App'

Sentry.init({
  dsn: 'https://404718b179a3430d9afe12bad7b4321d@sentry.io/1462359',
  environment: process.env.NODE_ENV,
})

ReactDOM.render(<App />, document.getElementById('root'))

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://bit.ly/CRA-PWA
serviceWorker.unregister()

import React from 'react'

import { useStateFromProp } from '../../hooks/useStateFromProp'

const OptForm = ({ show = false, children = null }) => {
  const [isVisible] = useStateFromProp(show)
  return <>{isVisible && children}</>
}

export default OptForm

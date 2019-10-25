import React from 'react'

import { useStateFromProp } from '../../hooks/useStateFromProp'

const OptForm = ({ show = false, children = null }) => {
  const [isVisible, setIsVisible] = useStateFromProp(show)
  return <>{isVisible && children}</>
}

export default OptForm

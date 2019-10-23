import React, { useState, useEffect } from 'react'

const OptForm = ({ show = false, children = null }) => {
  const [isVisible, setIsVisible] = useState(show)
  useEffect( () => setIsVisible(show), [show] )
  return (
    <>
      {isVisible && (children) }
    </>
  )
}

export default OptForm

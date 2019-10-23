import React, { useState, useEffect } from 'react'
import './index.css'

const IconHelp = ({ global = true, message = '', children = null }) => {
  const [isVisible, setIsVisible] = useState(global)      /* true: all help messages shown at page load */
  useEffect( () => setIsVisible(global), [global] )
  return (
    <>
      <a onClick={() => setIsVisible(!isVisible)}>&nbsp;<i class="fa fa-question-circle"></i></a>
      {isVisible && (
        <div className="small text-info message"><em>{message}{children}</em></div>
      )}
    </>
  )
}

export default IconHelp

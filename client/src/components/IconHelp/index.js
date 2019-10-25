import React from 'react'
import './index.css'

import { useStateFromProp } from '../../hooks/useStateFromProp'

const IconHelp = ({ initial = true, message = '', children = null }) => {
  const [isVisible, setIsVisible] = useStateFromProp( initial )
  return (
    <>
      <a onClick={() => setIsVisible(!isVisible)}>
        &nbsp;<i class="fa fa-question-circle"></i>
      </a>
      {isVisible && (
        <div className="small text-info message">
          <em>
            {message}
            {children}
          </em>
        </div>
      )}
    </>
  )
}

export default IconHelp

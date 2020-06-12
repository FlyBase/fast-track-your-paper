import React from 'react'
import PropTypes from 'prop-types'
import { useClipboard } from 'use-clipboard-copy'

const CopyIcon = <i className="fa fa-copy" />

const CopyText = ({ text, buttonLabel = CopyIcon, buttonClass = '' }) => {
  const clipboard = useClipboard({
    onError: () => console.log('Failed to copy text to clipboard.'),
    copiedTimeout: 1500,
  })

  if (text) {
    const handleClick = () => clipboard.copy(text)
    return (
      <>
        <button
          type="button"
          title="Copy to clipboard"
          className={buttonClass}
          onClick={handleClick}>
          {buttonLabel}
        </button>
        {clipboard.copied ? 'Copied' : null}
      </>
    )
  }
  return null
}

CopyText.propTypes = {
  text: PropTypes.string,
}

export default CopyText

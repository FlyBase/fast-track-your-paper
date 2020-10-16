import React from 'react'
import PropTypes from 'prop-types'

const GeneSearchMessage = ({ searchCount = 0, filteredCount = 0 }) => {
  if (searchCount !== 0 && filteredCount === 0) {
    return <b>All matching genes already added to your list.</b>
  } else if (searchCount === 0) {
    return <b>No matching genes found.</b>
  }
  return null
}

GeneSearchMessage.propTypes = {
  searchCount: PropTypes.number,
  filteredCount: PropTypes.number,
}
export default GeneSearchMessage

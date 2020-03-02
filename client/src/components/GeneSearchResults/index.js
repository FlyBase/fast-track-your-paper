import React from 'react'
import PropTypes from 'prop-types'

const GeneSearchResults = ({ genes = [], onGeneClick = () => {} }) => (
  <ul>
    {genes.map(g => (
      <li key={g.id} onClick={() => onGeneClick(g)}>{`${g.id} ${g.symbol}`}</li>
    ))}
  </ul>
)

GeneSearchResults.propTypes = {
  genes: PropTypes.arrayOf(PropTypes.string),
  onGeneClick: PropTypes.func,
}
export default GeneSearchResults

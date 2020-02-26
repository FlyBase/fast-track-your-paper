import React from 'react'
import PropTypes from 'prop-types'

const GeneSearchResults = ({genes}) => (
  <ul>
    {genes.map((g) => (
      <li key={g.id}>
        {`${g.id} ${g.symbol}`}
      </li>)
    )}
  </ul>
)
export default GeneSearchResults


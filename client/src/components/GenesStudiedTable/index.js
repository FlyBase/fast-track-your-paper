import React from 'react'
import PropTypes from 'prop-types'
import GeneStudiedRow from 'components/GenesStudiedRow'

import './index.css'

const GenesStudiedTable = ({
  showAbs = false,
  genes = [],
  onGeneDelete = () => {},
  onAbClick = () => {},
}) => {
  let abcell = showAbs ? '' : 'abcell'

  return (
    <table
      className="table table-striped table-hover table-condensed"
      style={{ borderBottom: '1px solid #ccc', marginTop: '1em' }}>
      <thead>
        <tr>
          <th>Genes studied in this publication</th>
        </tr>
        <tr className="info">
          <th>Gene</th>
          <td className={abcell}>
            monoclonal
            <br />
            antibody
          </td>
          <td className={abcell}>
            polyclonal
            <br />
            antibody
          </td>
          <td>
            delete
            <br />
            gene
          </td>
        </tr>
      </thead>
      <tbody>
        {genes.map((gene) => (
          <GeneStudiedRow
            key={gene.id}
            abcell={abcell}
            gene={gene}
            onAbClick={onAbClick}
            onDelete={onGeneDelete}
          />
        ))}
      </tbody>
    </table>
  )
}
GenesStudiedTable.propTypes = {
  showAbs: PropTypes.bool,
  genes: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.string.isRequired,
      symbol: PropTypes.string,
    })
  ),
  onGeneDelete: PropTypes.func,
  onAbClick: PropTypes.func,
}

export default GenesStudiedTable

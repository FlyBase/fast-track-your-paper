import React from 'react'
import PropTypes from 'prop-types'

const Input = ({ gene = {}, antibody = 'none', onAbClick, ...props }) => (
  <input
    type="checkbox"
    name={`${gene.id}_ab`}
    defaultChecked={gene?.antibody ?? 'none' === antibody}
    onChange={() => onAbClick({ gene, antibody })}
    {...props}
  />
)

const GeneStudiedRow = ({
  gene,
  abcell = '',
  onDelete = () => {},
  onAbClick = () => {},
}) => (
  <tr>
    <th>
      <a href={`/reports/${gene.id}`} target="_blank" rel="noopener noreferrer">
        {gene.symbol}
      </a>
    </th>
    <td className={abcell}>
      <Input
        gene={gene}
        onAbClick={onAbClick}
        antibody="monoclonal"
        title="Monoclonal antibody"
      />
    </td>
    <td className={abcell}>
      <Input
        gene={gene}
        onAbClick={onAbClick}
        antibody="polyclonal"
        title="Polyclonal antibody"
      />
    </td>
    <td>
      <button onClick={() => onDelete(gene)} title="Remove gene">
        <i className="fa fa-close"></i>
      </button>
    </td>
  </tr>
)

GeneStudiedRow.propTypes = {
  gene: PropTypes.shape({
    id: PropTypes.string.isRequired,
    symbol: PropTypes.string.isRequired,
    synonyms: PropTypes.arrayOf(PropTypes.string),
    antibody: PropTypes.oneOf(['none', 'monoclonal', 'polyclonal']),
  }).isRequired,
}

export default GeneStudiedRow

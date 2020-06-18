import React from 'react'
import PropTypes from 'prop-types'
import styled from 'styled-components/macro'

const Input = ({ gene = {}, antibody = 'none', onAbClick, ...props }) => (
  <input
    type="checkbox"
    name={`${gene.id}_ab`}
    defaultChecked={(gene?.antibody ?? []).includes(antibody)}
    onChange={(evt) =>
      onAbClick({ gene, antibody, isChecked: evt.target.checked })
    }
    {...props}
  />
)

const Label = styled.span`
  font-weight: normal;
`

const GeneStudiedRow = ({
  gene,
  abcell = '',
  onDelete = () => {},
  onAbClick = () => {},
  isSelected = false,
  onSelect = () => {},
}) => {
  let statusLabel
  let rowClass
  switch (gene.status) {
    case 'updated':
      rowClass = 'success'
      statusLabel = <Label> (Gene updated from: {gene.submittedId}) </Label>
      break
    case 'split':
      rowClass = 'warning'
      statusLabel = <Label> (Gene split from: {gene.submittedId}) </Label>
      break
    default:
      rowClass = ''
      statusLabel = null
  }

  return (
    <tr className={rowClass}>
      <th>
        <input
          type="checkbox"
          checked={isSelected}
          onChange={() => onSelect(!isSelected, gene)}
        />
      </th>
      <th>
        <a
          href={`/reports/${gene.id}`}
          target="_blank"
          rel="noopener noreferrer">
          {gene.symbol}
        </a>
        {statusLabel}
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
      <td style={{ textAlign: 'center' }}>
        <button onClick={() => onDelete(gene)} title="Remove gene">
          <i className="fa fa-trash"></i>
        </button>
      </td>
    </tr>
  )
}

GeneStudiedRow.propTypes = {
  gene: PropTypes.shape({
    id: PropTypes.string.isRequired,
    symbol: PropTypes.string.isRequired,
    synonyms: PropTypes.arrayOf(PropTypes.string),
    antibody: PropTypes.arrayOf(
      PropTypes.oneOf(['none', 'monoclonal', 'polyclonal'])
    ),
  }).isRequired,
}

export default GeneStudiedRow

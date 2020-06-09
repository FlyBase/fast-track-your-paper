import React, { useState } from 'react'
import PropTypes from 'prop-types'
import GeneStudiedRow from 'components/GenesStudiedRow'

import './index.css'
import GeneSelectionControls from '../GeneSelectionControls'

const GenesStudiedTable = ({
  showAbs = false,
  genes = [],
  onGeneDelete = () => {},
  onAbClick = () => {},
  children,
}) => {
  let abcell = showAbs ? '' : 'abcell'

  const [selectedGenes, setSelectedGenes] = useState(new Set())
  const allGenesSelected = selectedGenes.size === genes.length
  const numGenesUpdated =
    genes.filter((gene) => gene.status === 'updated').length ?? 0

  const handleGeneSelect = (isSelected, gene) => {
    const copySelectedGenes = new Set(selectedGenes)
    if (isSelected) {
      copySelectedGenes.add(gene)
    } else {
      copySelectedGenes.delete(gene)
    }
    setSelectedGenes(copySelectedGenes)
  }

  /**
   * Function for toggling all genes on / off.
   */
  const handleSelectAll = () => {
    // If all genes are already on deselect all.
    if (allGenesSelected) {
      setSelectedGenes(new Set())
    }
    // Select all genes.
    else {
      setSelectedGenes(new Set(genes))
    }
  }

  const handleSelectUpdated = () => {
    setSelectedGenes(new Set(genes.filter((gene) => gene.status === 'updated')))
  }

  return (
    <table className="table table-striped table-hover table-condensed">
      {showAbs ? (
        <colgroup>
          <col style={{ width: '10px' }} />
          <col />
          <col span="2" style={{ width: '8em' }} />
          <col style={{ width: '6em' }} />
        </colgroup>
      ) : (
        <colgroup>
          <col style={{ width: '10px' }} />
          <col />
          <col style={{ width: '6em' }} />
        </colgroup>
      )}
      <thead>
        <tr>
          <th />
          <th>Genes studied in this publication</th>
          <th colSpan={showAbs ? '4' : '2'}>{children}</th>
        </tr>
        <tr className="info">
          <th />
          <th>
            Gene
            <GeneSelectionControls
              numGenes={genes.length}
              numSelected={selectedGenes.size}
              numUpdated={numGenesUpdated}
              onSelectAll={handleSelectAll}
              onSelectUpdated={handleSelectUpdated}
              onDelete={() => onGeneDelete([...selectedGenes])}
            />
          </th>
          <th className={abcell}>monoclonal antibody</th>
          <th className={abcell}>polyclonal antibody</th>
          <th style={{ textAlign: 'center' }}>remove gene</th>
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
            isSelected={selectedGenes.has(gene)}
            onSelect={handleGeneSelect}
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

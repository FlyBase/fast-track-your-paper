import React, { useEffect, useReducer } from 'react'
import PropTypes from 'prop-types'
import GeneStudiedRow from 'components/GenesStudiedRow'

import './index.css'
import GeneSelectionControls from '../GeneSelectionControls'

import { initialState, reducer } from './reducer'

const GenesStudiedTable = ({
  showAbs = false,
  genes = [],
  onGeneDelete = () => {},
  onAbClick = () => {},
  children,
}) => {
  const [state, dispatch] = useReducer(reducer, initialState)
  useEffect(() => {
    dispatch({ type: 'SET_GENES', payload: genes })
  }, [genes, dispatch])

  let abcell = showAbs ? '' : 'abcell'

  const { counts, selectedGenes } = state

  const handleGeneSelect = (isSelected, gene) => {
    const copySelectedGenes = new Set(selectedGenes)
    if (isSelected) {
      copySelectedGenes.add(gene)
    } else {
      copySelectedGenes.delete(gene)
    }
    dispatch({ type: 'SET_SELECTED', payload: copySelectedGenes })
  }

  /**
   * Function for toggling all genes on / off.
   */
  const handleSelectAll = () => {
    // If all genes are already on deselect all.
    if (counts.genes.total === counts.genes.selected) {
      dispatch({ type: 'SET_SELECTED' })
    }
    // Select all genes.
    else {
      dispatch({ type: 'SET_SELECTED', payload: genes })
    }
  }

  const handleSelectUpdated = () => {
    if (counts.updated.total === counts.updated.selected) {
      dispatch({
        type: 'SET_SELECTED',
        payload: [...selectedGenes].filter((gene) => gene.status !== 'updated'),
      })
    } else {
      const updatedGenes = [...genes].filter(
        (gene) => gene.status === 'updated'
      )
      const newlySelected = [...selectedGenes, ...updatedGenes]
      dispatch({ type: 'SET_SELECTED', payload: newlySelected })
    }
  }

  const handleSelectSplit = () => {
    if (counts.split.total === counts.split.selected) {
      dispatch({
        type: 'SET_SELECTED',
        payload: [...selectedGenes].filter((gene) => gene.status !== 'split'),
      })
    } else {
      const splitGenes = [...genes].filter((gene) => gene.status === 'split')
      const newlySelected = [...selectedGenes, ...splitGenes]
      dispatch({ type: 'SET_SELECTED', payload: newlySelected })
    }
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
              counts={counts}
              onSelectAll={handleSelectAll}
              onSelectUpdated={handleSelectUpdated}
              onSelectSplit={handleSelectSplit}
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

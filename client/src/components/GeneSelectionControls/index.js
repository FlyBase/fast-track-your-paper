import React from 'react'
import Button from 'react-bootstrap/lib/Button'
import Glyphicon from 'react-bootstrap/lib/Glyphicon'

import styles from './index.module.css'
const GeneSelectionControls = ({
  numGenes = 0,
  numSelected = 0,
  numUpdated = 0,
  numSplit = 0,
  onSelectAll = () => {},
  onSelectUpdated = () => {},
  onSelectSplit = () => {},
  onDelete = () => {},
}) => {
  const allSelected = numGenes === numSelected ?? false
  return (
    <div className={styles.container}>
      <Button
        bsSize="xsmall"
        type="button"
        onClick={onSelectAll}
        disabled={numGenes === 0 ? 'disabled' : ''}>
        {allSelected ? 'Deselect All' : 'Select All'}
      </Button>
      <Button
        bsSize="xsmall"
        type="button"
        onClick={onSelectUpdated}
        disabled={numUpdated === 0 ? 'disabled' : ''}>
        Select Updated
      </Button>
      <Button
        bsSize="xsmall"
        type="button"
        onClick={onSelectSplit}
        disabled={numSplit === 0 ? 'disabled' : ''}>
        Select Gene Splits
      </Button>
      <Button
        bsStyle="danger"
        bsSize="xsmall"
        type="button"
        onClick={onDelete}
        disabled={numGenes === 0 || numSelected === 0 ? 'disabled' : ''}>
        <Glyphicon glyph="trash" /> Delete Selected
      </Button>
    </div>
  )
}

export default GeneSelectionControls

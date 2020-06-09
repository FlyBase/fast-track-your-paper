import React from 'react'

import styles from './index.module.css'
const GeneSelectionControls = ({
  numGenes = 0,
  numSelected = 0,
  numUpdated = 0,
  onSelectAll = () => {},
  onSelectUpdated = () => {},
  onDelete = () => {},
}) => {
  const allSelected = numGenes === numSelected ?? false
  return (
    <div className={styles.container}>
      <button
        className="btn btn-default btn-xs"
        type="button"
        onClick={onSelectAll}
        disabled={numGenes === 0 ? 'disabled' : ''}>
        {allSelected ? 'Deselect All' : 'Select All'}
      </button>
      <button
        className="btn btn-default btn-xs"
        type="button"
        onClick={onSelectUpdated}
        disabled={numUpdated === 0 ? 'disabled' : ''}>
        Select Updated
      </button>
      <button
        className="btn btn-default btn-xs"
        type="button"
        onClick={onDelete}
        disabled={numGenes === 0 || numSelected === 0 ? 'disabled' : ''}>
        Delete Selected
      </button>
    </div>
  )
}

export default GeneSelectionControls

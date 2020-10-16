import React from 'react'
import Button from 'react-bootstrap/lib/Button'
import Glyphicon from 'react-bootstrap/lib/Glyphicon'

import styles from './index.module.css'
const GeneSelectionControls = ({
  counts = {},
  onSelectAll = () => {},
  onSelectUpdated = () => {},
  onSelectSplit = () => {},
  onDelete = () => {},
}) => {
  const isAllSelected = {
    genes: counts?.genes?.total === counts?.genes?.selected,
    split:
      counts?.split?.total > 0 &&
      counts?.split?.total === counts?.split?.selected,
    updated:
      counts?.updated?.total > 0 &&
      counts?.updated?.total === counts?.updated?.selected,
  }
  return (
    <div className={styles.container}>
      <Button
        bsSize="xsmall"
        type="button"
        onClick={onSelectAll}
        disabled={counts?.genes?.total === 0}>
        {isAllSelected.genes ? 'Deselect All' : 'Select All'}
      </Button>
      <Button
        bsSize="xsmall"
        bsStyle="success"
        type="button"
        onClick={onSelectUpdated}
        disabled={counts?.updated?.total === 0}>
        {isAllSelected.updated ? 'Deselect Updated' : 'Select Updated'}
      </Button>
      <Button
        bsSize="xsmall"
        bsStyle="warning"
        type="button"
        onClick={onSelectSplit}
        disabled={counts?.split?.total === 0}>
        {isAllSelected.split ? 'Deselect Gene Splits' : 'Select Gene Splits'}
      </Button>
      <Button
        bsStyle="danger"
        bsSize="xsmall"
        type="button"
        onClick={onDelete}
        disabled={counts?.genes.total === 0 || counts?.genes?.selected === 0}>
        <Glyphicon glyph="trash" /> Delete Selected
      </Button>
    </div>
  )
}

export default GeneSelectionControls

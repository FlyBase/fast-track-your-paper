import React from 'react'

import DataFlagCheckbox from 'components/DataFlagCheckbox'
import DataFlagTextArea from 'components/DataFlagTextArea'

const DatasetFlag = ({
  children,
  showAllHelp = false,
  disabled = false,
  values = {},
  ...props
}) => (
  <div className="form-horizontal well well-sm" style={{ marginLeft: '2em' }}>
    <div className="form-group">
      <div className="col-sm-12">
        <p className="form-control-static">
          <b>Optional</b>{' '}
          <em>please give us more information about your dataset:</em>
        </p>
      </div>
      <div className="col-sm-12">
        <DataFlagCheckbox name="dataset_pheno" disabled={disabled}>
          Phenotypic screen (e.g. a particular phenotype is assessed in multiple
          RNAi or UAS or deficiency lines)
        </DataFlagCheckbox>
      </div>
      <div className="col-sm-12">
        <DataFlagCheckbox name="dataset_accessions" disabled={disabled}>
          Data repository ID (e.g. GSE000001, SRP0000001, PXD000001,
          E-MTAB-0001, PRJNA000001)
        </DataFlagCheckbox>
      </div>
      {values.dataset_accessions && (
        <div className="col-sm-12">
          <DataFlagTextArea
            name="dataset_accession_numbers"
            rows="2"
            placeholder="Optional: Please enter relevant accession numbers, separated by commas"
            disabled={disabled}
          />
        </div>
      )}
    </div>
  </div>
)

export default DatasetFlag

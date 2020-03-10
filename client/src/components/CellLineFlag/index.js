import React from 'react'

import DataFlagCheckbox from 'components/DataFlagCheckbox'
import DataFlagTextArea from 'components/DataFlagTextArea'
import IconHelp from 'components/IconHelp'

const textAreaStyle = {
  resize: 'none',
  width: '50%',
  display: 'inline-block',
}

const CellLineFlag = ({
  children,
  showAllHelp = false,
  disabled = false,
  ...props
}) => {
  return (
    <div className="form-horizontal well well-sm" style={{ marginLeft: '2em' }}>
      <div className="form-group">
        <div className="col-sm-12">
          <p className="form-control-static">
            <b>Optional</b>{' '}
            <em>
              please give us more information about the cell line(s) used:
            </em>
          </p>
        </div>
        <div className="col-sm-5 col-md-4 col-lg-3">
          <DataFlagCheckbox
            name="stable_line"
            showAllHelp={showAllHelp}
            disabled={disabled}
            helpMessage="Your publication reports the creation of a new stable Drosophila melanogaster cell line.">
            Stable line generated
          </DataFlagCheckbox>
        </div>
        <div className="col-sm-7">
          <DataFlagCheckbox
            name="commercial_line"
            showAllHelp={showAllHelp}
            disabled={disabled}
            helpMessage="Your publication reports the use of a commercially purchased Drosophila melanogaster cell line.">
            Commercially purchased cell line
          </DataFlagCheckbox>
        </div>
        <div className="col-sm-12">
          <p className="form-control-static">
            <em>Please provide the name and source for each cell line:</em>
            <IconHelp
              initial={showAllHelp}
              message="Enter corresponding cell line names and sources on separate aligned rows."
            />
          </p>
        </div>
        <div className="col-sm-12">
          <DataFlagTextArea
            name="cell_line_names"
            rows="3"
            placeholder="Enter cell line name(s) by placing each on its own line; e.g.&#10;S2-DGRC&#10;S2-cdi-GFP"
            disabled={disabled}
            style={textAreaStyle}
          />

          <DataFlagTextArea
            name="cell_line_sources"
            rows="3"
            placeholder="Enter corresponding cell line source(s) by placing each on its own line; e.g.&#10;DGRC&#10;this study"
            disabled={disabled}
            style={textAreaStyle}
          />
        </div>
      </div>
    </div>
  )
}

export default CellLineFlag

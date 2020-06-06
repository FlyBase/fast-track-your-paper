import React from 'react'

import DataFlagCheckbox from 'components/DataFlagCheckbox'
import DataFlagTextArea from 'components/DataFlagTextArea'
import DataFlagTxtInput from 'components/DataFlagTxtInput'
import IconHelp from 'components/IconHelp'

import './index.css'

const textAreaStyle = {
  resize: 'none',
  width: '50%',
  display: 'inline-block',
}
const textInputStyle = {
  width: '100%',
  display: 'inline-block',
}

const CellLineFlag = ({
  children,
  showAllHelp = false,
  disabled = false,
  ...props
}) => {
  let cellLineInputRows = [];
  for( let i=1; i<=10; i++ ) {
    cellLineInputRows.push(
      <div className="form-group" style={{marginBottom:0}}>
        <label className="col-xs-1 control-label">
          {i}
        </label>
        <div className="col-xs-4">
          <DataFlagTxtInput
            name={"cell_line_name_"+i}
            placeholder="e.g. S2-DGRC, S2-cdi-GFP"
            disabled={disabled}
            style={textInputStyle}
          />
        </div>
        <div className="col-xs-6">
          <DataFlagTxtInput
            name={"cell_line_source_"+i}
            placeholder="e.g. DGRC, this study"
            disabled={disabled}
            style={textInputStyle}
          />
        </div>
        <div className="col-xs-1"></div>
      </div>
    )
  }
  return (
    <div className="form-horizontal well well-sm" id="CellLinesForm" style={{ marginLeft: '2em' }}>

      <div className="form-group">

        <div className="col-sm-12">
          <p className="form-control-static">
            <b>Optional</b>&emsp;
            <em>
              please give us more information about the cell line(s) used:
            </em>
          </p>
        </div>

      </div>

      <div className="form-group">

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

      </div>

      <div className="form-group">

        <div className="col-sm-12">
          <p className="form-control-static">
            <em>Please provide the name and source for each cell line:</em>
            <IconHelp
              initial={showAllHelp}
              message="Enter corresponding cell line names and sources on the same row."
            />
          </p>
        </div>

      </div>

      <div className="form-group">

        <div className="col-xs-1">&nbsp;</div>
        <div className="col-xs-4">
          <p className="form-control-static">
            <b>Cell Line Name</b>
          </p>
        </div>
        <div className="col-xs-6">
          <p className="form-control-static">
            <b>Cell Line Source</b>
          </p>
        </div>
        <div className="col-xs-1">&nbsp;</div>

      </div>

      {cellLineInputRows}

    </div>
  )
}

export default CellLineFlag

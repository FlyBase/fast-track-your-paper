import React from 'react'

import DataFlagTextArea from 'components/DataFlagTextArea'

const DiseaseTextArea = ({ children, ...props }) => {
  return (
    <div className="form-group">
      <div className="col-md-6 col-lg-5">
        <div className="small text-info" style={{ margin: '0 2em' }}>
          <em>
            Please enter the name(s) of the relevant disease(s) in the text
            area. Separate multiple diseases by placing each on a different
            line; i.e.:
            <pre>
              heart disease
              <br />
              Parkinson&rsquo;s disease
            </pre>
          </em>
        </div>
      </div>
      <div className="col-md-6 col-lg-7">
        <DataFlagTextArea
          {...props}
          rows="4"
          placeholder="Enter disease name(s) by placing each on its own line"></DataFlagTextArea>
      </div>
    </div>
  )
}

export default DiseaseTextArea

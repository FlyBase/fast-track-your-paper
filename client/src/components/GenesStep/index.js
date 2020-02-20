import React, { useState } from 'react'
import IconHelp from '../IconHelp'
import GenesStudiedTable from '../GenesStudiedTable'

const GenesStep = ({ service, geens, children }) => {
  const [showAllHelp, setShowAllHelp] = useState(false)
  const [showAntibodyCells, setShowAntibodyCells] = useState(false)
  const genesStudied = []
  return (
    <>
      <div className="container">
        <form>
          <div id="genesStepPanel" className="panel panel-primary">
            <div className="panel-heading">
              <h3 className="panel-title">Associate Genes</h3>
            </div>
            <div className="panel-body">

              <div className="form-group">

                <div className="col-sm-8 control-label">

                  <div className="radio">
                    <label>
                      <input type="radio" name="input-method" id="optionsRadios1" value="option1" checked />
                      Use the FTYP gene search form to find one or a few genes
                    </label>
                    <IconHelp
                      initial={showAllHelp}
                      message="You will be selecting genes from search results to be connected to this publication."
                    />
                  </div>
                  <div className="radio">
                    <label>
                      <input type="radio" name="input-method" id="optionsRadios2" value="option2" />
                      Use the FTYP gene bulk upload form to submit a text file of gene IDs
                    </label>
                    <IconHelp
                      initial={showAllHelp}
                      message="You will be selecting genes from search results to be connected to this publication."
                    />
                  </div>
                  <div className="radio">
                    <label>
                      <input type="radio" name="input-method" id="optionsRadios3" value="option3" />
                      No genes studied in this publication
                    </label>
                    <IconHelp
                      initial={showAllHelp}
                      message="You will be selecting genes from search results to be connected to this publication."
                    />
                  </div>

                </div>

                  <label for="showAb" className="col-sm-4 control-label">
                    Antibodies generated
                    <input id="showAb" name="showAb" type="checkbox" onClick={() => setShowAntibodyCells(!showAntibodyCells)} />
                  </label>

              </div>

            </div>
            <GenesStudiedTable showAbs={showAntibodyCells} genes={genesStudied} />
            <br />
            {children}
          </div>
        </form>
      </div>
    </>
  )
}

export default GenesStep

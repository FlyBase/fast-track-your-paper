import React, { useContext, useState } from 'react'
import { useService } from '@xstate/react'
import IconHelp from '../IconHelp'

import { ApolloContext } from 'contexts'
import GenesStudiedTable from '../GenesStudiedTable'
import GeneSearchInput from 'components/GeneSearchInput'
import GeneSearchResults from 'components/GeneSearchResults'

const GenesStep = ({ service, children }) => {
  // Get the GraphQL client from the apollo context object.
  // https://reactjs.org/docs/hooks-reference.html#usecontext
  const client = useContext(ApolloContext)
  const [current, send] = useService(service)
  const [showAllHelp, setShowAllHelp] = useState(false)
  const [showAntibodyCells, setShowAntibodyCells] = useState(false)

  const { geneResults = [] } = current.context

  /*
  Function to handle when a user types in the input field.
   */
  const handleOnChange = gene => {
    send('SUBMIT', { gene, client })
  }

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
                      <input
                        type="radio"
                        name="input-method"
                        id="optionsRadios1"
                        value="option1"
                        defaultChecked={true}
                      />
                      Use the FTYP gene search form to find one or a few genes
                    </label>
                    <IconHelp
                      initial={showAllHelp}
                      message="You will be selecting genes from search results to be connected to this publication."
                    />
                  </div>
                  <div className="radio">
                    <label>
                      <input
                        type="radio"
                        name="input-method"
                        id="optionsRadios2"
                        value="option2"
                      />
                      Use the FTYP gene bulk upload form to submit a text file
                      of gene IDs
                    </label>
                    <IconHelp
                      initial={showAllHelp}
                      message="You will be selecting genes from search results to be connected to this publication."
                    />
                  </div>
                  <div className="radio">
                    <label>
                      <input
                        type="radio"
                        name="input-method"
                        id="optionsRadios3"
                        value="option3"
                      />
                      No genes studied in this publication
                    </label>
                    <IconHelp
                      initial={showAllHelp}
                      message="You will be selecting genes from search results to be connected to this publication."
                    />
                  </div>
                </div>

                <label htmlFor="showAb" className="col-sm-4 control-label">
                  Antibodies generated
                  <input
                    id="showAb"
                    name="showAb"
                    type="checkbox"
                    onClick={() => setShowAntibodyCells(!showAntibodyCells)}
                  />
                </label>
              </div>
            </div>
            <GeneSearchInput onChange={handleOnChange}>
              <GeneSearchResults genes={geneResults} />
              <GenesStudiedTable showAbs={showAntibodyCells} />
            </GeneSearchInput>
            <br />
            {children}
          </div>
        </form>
      </div>
    </>
  )
}

export default GenesStep

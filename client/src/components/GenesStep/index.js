import React, { useContext, useState } from 'react'
import { useService } from '@xstate/react'
import IconHelp from '../IconHelp'
import differenceBy from 'lodash.differenceby'

import { ApolloContext } from 'contexts'
import GenesStudiedTable from 'components/GenesStudiedTable'
import GeneSearchInput from 'components/GeneSearchInput'
import GeneSearchResults from 'components/GeneSearchResults'
import GeneSearchMessage from 'components/GeneSearchMessage'

const GenesStep = ({ service, children }) => {
  // Get the GraphQL client from the apollo context object.
  // https://reactjs.org/docs/hooks-reference.html#usecontext
  const client = useContext(ApolloContext)
  const [current, send] = useService(service)
  const [showAllHelp, setShowAllHelp] = useState(false)
  const [showAntibodyCells, setShowAntibodyCells] = useState(false)
  const [genesStudied, setGenesStudied] = useState([])

  const { geneResults = [] } = current.context

  const filteredGeneResults = differenceBy(geneResults, genesStudied, 'id')

  /*
  Function to handle when a user types in the input field.
   */
  const handleOnChange = (gene = '') => {
    if (gene === '') {
      send('CLEAR')
    } else {
      send('SUBMIT', { gene, client })
    }
  }

  const addToGenesStudied = (gene = {}) => {
    setGenesStudied([...genesStudied, gene])
  }

  const removeFromGenesStudied = (gene = {}) => {
    const geneIndex = genesStudied.findIndex(
      geneStudied => geneStudied.id === gene.id
    )
    if (geneIndex !== -1) {
      const copyOfGenesStudied = [...genesStudied]
      copyOfGenesStudied.splice(geneIndex, 1)
      setGenesStudied(copyOfGenesStudied)
    }
  }

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
              {current.matches('search.loaded') && (
                <>
                  <GeneSearchResults
                    genes={filteredGeneResults}
                    onGeneClick={addToGenesStudied}
                  />
                  <GeneSearchMessage
                    searchCount={geneResults.length}
                    filteredCount={filteredGeneResults.length}
                  />
                </>
              )}
              <GenesStudiedTable
                genes={genesStudied}
                onGeneDelete={removeFromGenesStudied}
                showAbs={showAntibodyCells}
              />
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

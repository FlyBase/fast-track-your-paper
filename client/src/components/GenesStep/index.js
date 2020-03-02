import React, { useContext, useState, useEffect } from 'react'
import { useService } from '@xstate/react'
import IconHelp from '../IconHelp'
import differenceBy from 'lodash.differenceby'

import { ApolloContext } from 'contexts'
import GenesStudiedTable from 'components/GenesStudiedTable'
import GeneSearchInput from 'components/GeneSearchInput'
import GeneSearchResults from 'components/GeneSearchResults'
import GeneSearchMessage from 'components/GeneSearchMessage'

const GenesStep = ({ service, children, genes:savedGenes = [] }) => {
  // Get the GraphQL client from the apollo context object.
  // https://reactjs.org/docs/hooks-reference.html#usecontext
  const client = useContext(ApolloContext)
  // Initialize gene step machine from the parent machine.
  const [current, send] = useService(service)
  // Show all help subtext.
  const [showAllHelp, setShowAllHelp] = useState(false)
  // Show antibody columns in genes studied table.
  const [showAntibodyCells, setShowAntibodyCells] = useState(false)
  // Keep local array of genes studied that is pre-populated from saved data.
  const [genesStudied, setGenesStudied] = useState(savedGenes)

  // Get the gene search results from the current machine context.
  const { geneResults = [] } = current.context
  // Filter results so we do not show genes that have already been added to the
  // studied table.
  const filteredGeneResults = differenceBy(geneResults, genesStudied, 'id')

  /**
   * Every time the genesStudied array changes, send an event to synchronize
   * the list with the submission in the parent machine.
   *
   * This keeps the local and global submission state in sync.
   */
  useEffect(() => {
    send('SET_GENES_STUDIED', { genes: genesStudied })
  }, [ genesStudied ])

  /**
   * Function to handle when a user types in the input field.
   * @param gene <string> - The users gene input.
   */
  const handleOnChange = (gene = '') => {
    if (gene === '') {
      // Clear results if they have cleared the input field.
      send('CLEAR')
    } else {
      // Send gene input and the GraphQL client.
      send('SUBMIT', { gene, client })
    }
  }

  /**
   * Event handler to add a gene from the search results to the list of
   * genes studied.
   *
   * @param gene <object> - The gene object that was clicked on.
   */
  const addToGenesStudied = (gene = {}) => {
    // Append gene to list and update the local state.
    setGenesStudied([...genesStudied, gene])
  }

  /**
   * Event handler to remove a gene from the list of genes studied.
   * Once removed, it will again appear in the search results if applicable.
   * @param gene <object> - Gene object to remove from the studied list.
   */
  const removeFromGenesStudied = (gene = {}) => {
    // Get the array index of the gene to remove.
    const geneIndex = genesStudied.findIndex(
      geneStudied => geneStudied.id === gene.id
    )
    if (geneIndex !== -1) {
      // Copy array to avoid mutating state directly.
      const copyOfGenesStudied = [...genesStudied]
      // Remove gene from array copy.
      copyOfGenesStudied.splice(geneIndex, 1)
      // Set the copy as the new list in state.
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

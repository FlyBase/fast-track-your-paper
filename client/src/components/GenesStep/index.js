import React, { useState, useEffect } from 'react'
// eslint-disable-next-line
import styled from 'styled-components/macro'
import useLocalstorage from '@rooks/use-localstorage'
import { useMachine, useService } from '@xstate/react'
import IconHelp from 'components/IconHelp'
import differenceBy from 'lodash.differenceby'
import unionBy from 'lodash.unionby'
import cloneDeep from 'lodash.clonedeep'
import Alert from 'react-bootstrap/lib/Alert'

import { useApolloClient } from '@apollo/client'

import GenesStudiedTable from 'components/GenesStudiedTable'
import GeneSearchInput from 'components/GeneSearchInput'
import GeneSearchResults from 'components/GeneSearchResults'
import GeneSearchMessage from 'components/GeneSearchMessage'
import GeneBatchForm from 'components/GeneBatchForm'
import GeneBatchResults from 'components/GeneBatchResults'
import GeneDeleteModal from 'components/GeneDeleteModal'
import { getHydratedMachine } from '../StepContainer'

const GenesStep = ({
  service,
  children,
  genes: savedGenes = [],
  showAntibodies = true,
}) => {
  // Get the GraphQL client from the apollo context object.
  // https://reactjs.org/docs/hooks-reference.html#usecontext
  const client = useApolloClient()
  // Initialize gene step machine from the parent machine.
  const [current, send] = useService(service)

  const [currentParent] = useMachine(getHydratedMachine())
  const selectedPublicationType =
    currentParent.context.submission.publication.type.name
  const IS_REVIEW = selectedPublicationType === 'review'

  // Show all help subtext.
  const [showAllHelp, setShowAllHelp] = useState(false)
  // Show antibody columns in genes studied table.
  const [showAntibodyCells, setShowAntibodyCells] = useLocalstorage(
    'show-antibodies',
    showAntibodies
  )
  // Keep local array of genes studied that is pre-populated from saved data.
  const [genesStudied, setGenesStudied] = useState(savedGenes)
  const [showGeneDelete, setShowGeneDelete] = useState(false)

  // Get the gene search results from the current machine context.
  const {
    geneResults = [],
    totalCount,
    validIds = [],
    updatedIds = [],
    splitIds = [],
    invalidIds = [],
  } = current.context
  // Filter results so we do not show genes that have already been added to the
  // studied table.

  const filteredGeneResults = differenceBy(geneResults, genesStudied, 'id')

  /**
   * Event handler to add genes to the list of genes studied.
   *
   * @param genes [<object>|<array>] - The gene object or an array of genes that are to be added.
   *
   */
  const addToGenesStudied = (genes = {}) => {
    if (Array.isArray(genes)) {
      // Append genes from batch upload to list and update the local state.
      setGenesStudied(unionBy(genes, genesStudied, 'id'))
    } else {
      // Append gene to list and update the local state.
      setGenesStudied(unionBy([genes], genesStudied, 'id'))
    }
  }

  /**
   * Event handler to remove a gene from the list of genes studied.
   * Once removed, it will again appear in the search results if applicable.
   * @param gene <object> - Gene object to remove from the studied list.
   */
  const removeFromGenesStudied = (gene = {}) => {
    const genesToRemove = new Set(Array.isArray(gene) ? gene : [gene])
    const copyOfGenesStudied = new Set(genesStudied)
    genesToRemove.forEach((g) => copyOfGenesStudied.delete(g))
    setGenesStudied([...copyOfGenesStudied])
  }

  /**
   * Every time the genesStudied array changes, send an event to synchronize
   * the list with the submission in the parent machine.
   *
   * This keeps the local and global submission state in sync.
   */
  useEffect(() => {
    send('SET_GENES_STUDIED', { genes: genesStudied })
  }, [genesStudied, send])

  /**
   * When the validIds or updatedIds arrays change, update the genesStudied
   * local state.
   */
  useEffect(() => {
    const validAndUpdatedIds = [...updatedIds, ...validIds]
    if (validAndUpdatedIds.length > 0) {
      addToGenesStudied(validAndUpdatedIds)
    }
    // TODO Figure out how best to handle this with useCallback
    // eslint-disable-next-line
  }, [validIds, updatedIds])

  /**
   * Function to handle when a user types in the input field.
   * @param gene <string> - The users gene input.
   */
  const handleOnChange = (gene = '') => {
    if (gene === '') {
      // Clear results if they have cleared the input field.
      send('CLEAR')
    } else {
      // Send gene input, the GraphQL client, and limit results to top 20.
      send('SUBMIT', { gene, limit: 20, client })
    }
  }

  /**
   * This function is used to handle the onSubmit of the GeneBatchForm component.
   * It is passed an object that contains all the fields of the batch upload form.
   * @param idField
   */
  const handleOnUpload = (ids = []) => {
    if (ids.length !== 0) {
      send('VALIDATE', { ids, client })
    }
  }

  /**
   * Event handler to update the antibody information of a gene in the
   * genes studied list.
   *
   * @param gene <object> - The gene object from the studied list that the user
   *                        has updated antibody information for.
   * @param antibody <string> - The new antibody information to update the gene with.
   *                            e.g. none, monoclonal, polyclonal
   * @param isChecked <boolean> - Whether or not the antibody is checked or not.
   */
  const setGeneAntibody = ({
    gene = {},
    antibody = 'none',
    isChecked = false,
  }) => {
    // Create a copy of the genes studied list with updated antibody information.
    const copyOfGenesStudied = genesStudied.map((geneStudied) => {
      let localGeneCopy = cloneDeep(geneStudied)
      // Update antibody information
      if (gene?.id === localGeneCopy.id) {
        if (isChecked && 'antibody' in localGeneCopy) {
          const abSet = new Set(localGeneCopy.antibody)
          abSet.add(antibody)
          localGeneCopy.antibody = [...abSet]
        } else if (isChecked && !('antibody' in localGeneCopy)) {
          localGeneCopy.antibody = [antibody]
        } else {
          // Delete antibody if it exists and isChecked is false.
          const abSet = new Set(localGeneCopy.antibody)
          abSet.delete(antibody)
          if (abSet.size === 0 && 'antibody' in localGeneCopy) {
            delete localGeneCopy.antibody
          } else {
            localGeneCopy.antibody = [...abSet]
          }
        }
      }
      // Return unmodified gene.
      return localGeneCopy
    })
    // Set the state to the newly updated list.
    setGenesStudied(copyOfGenesStudied)
  }

  return (
    <div className="container">
      <div id="genesStepPanel" className="panel panel-primary">
        <div className="panel-heading">
          <h3 className="panel-title">
            {IS_REVIEW
              ? 'Which genes are the focus of this review?'
              : 'Which genes are studied in this publication?'}
            <button
              type="button"
              className="pull-right btn btn-default btn-xs"
              onClick={() => setShowAllHelp(!showAllHelp)}>
              {showAllHelp ? 'Hide' : 'Show'} All Help Messages
            </button>
          </h3>
        </div>
        <div className="panel-body">
          <div className="form-group">
            {!IS_REVIEW && (
              <p className="help-block">
                Please add any genes investigated in your publication below. If
                you have conducted a genome-wide study or large screen involving
                many genes, please only add genes that were further functionally
                validated in your study and tick &lsquo;Large-scale
                dataset&rsquo; in the previous step.
              </p>
            )}
            {IS_REVIEW && (
              <p className="help-block">
                Please add any Drosophila melanogaster genes that are the focus
                of your review below; your review will be added to the reference
                list of these gene reports.
              </p>
            )}
          </div>
          <div className="form-group">
            <div className="col-sm-12 control-label">
              <div className="radio">
                <label>
                  <input
                    type="radio"
                    name="input-method"
                    id="optionsRadios1"
                    value="option1"
                    checked={current.matches('search')}
                    onChange={() => send('SEARCH')}
                  />
                  Use the FTYP gene search form to find{' '}
                  <b>one or a few genes</b>
                </label>
                <IconHelp
                  initial={showAllHelp}
                  message={`You will be selecting genes from search results to be connected to this ${
                    IS_REVIEW ? 'review' : 'publication'
                  }.`}
                />
              </div>
              <div className="radio">
                <label>
                  <input
                    type="radio"
                    name="input-method"
                    id="optionsRadios2"
                    value="option2"
                    checked={current.matches('batch')}
                    onChange={() => send('BATCH')}
                  />
                  Use the FTYP gene bulk upload form to submit{' '}
                  <b>a large list of FlyBase gene IDs</b> (<i>e.g.</i>,
                  FBgn0000490)
                </label>
                <IconHelp
                  initial={showAllHelp}
                  message={`You will be entering a list of FlyBase gene identifiers (FBgn) to be connected to this ${
                    IS_REVIEW ? 'review' : 'publication'
                  }.`}
                />
              </div>

              <div className="radio">
                <GeneDeleteModal
                  show={showGeneDelete}
                  handleClose={(e, action) => {
                    if (action === 'delete') {
                      send('NONE')
                    }
                    setShowGeneDelete(false)
                  }}
                />
                <label>
                  <input
                    type="radio"
                    name="input-method"
                    id="optionsRadios3"
                    value="option3"
                    checked={current.matches('none')}
                    onChange={() => {
                      if (genesStudied.length === 0) {
                        send('NONE')
                      } else {
                        setShowGeneDelete(true)
                      }
                    }}
                  />
                  {IS_REVIEW && (
                    <>
                      <b>No genes</b> focused on in this review
                    </>
                  )}
                  {!IS_REVIEW && (
                    <>
                      <b>No genes</b> studied in this publication
                    </>
                  )}
                </label>
                <IconHelp
                  initial={showAllHelp}
                  message={`You confirm that there should be no genes connected to this ${
                    IS_REVIEW ? 'review' : 'publication'
                  }.`}
                />
              </div>
            </div>

            <div className="col-sm-4"></div>
          </div>
        </div>
        {/* end panel body */}

        {current.matches('search') && (
          <GeneSearchInput onChange={handleOnChange}>
            {current.matches('search.loaded') && (
              <>
                <GeneSearchResults
                  genes={filteredGeneResults}
                  onGeneClick={addToGenesStudied}
                  totalCount={totalCount}
                  onDismiss={() => send('CLEAR')}
                />
                <GeneSearchMessage
                  searchCount={geneResults.length}
                  filteredCount={filteredGeneResults.length}
                />
              </>
            )}
          </GeneSearchInput>
        )}
        {current.matches('batch') && (
          <div
            css={`
              display: flex;
              flex-flow: row wrap;
              justify-content: space-evenly;
              form {
                flex: 0 1 400px;
              }
            `}>
            <span className="help-block">
              <span className="text-info">
                Only FBgn IDs can be uploaded here; please use the{' '}
                <a href="/convert/id">ID validator</a> if you need to convert
                your list to FBgns first.
              </span>
            </span>
            <GeneBatchForm onSubmit={handleOnUpload} />
            <div
              css={`
                flex: 0 1 360px;
              `}>
              {current.matches({ batch: 'loaded' }) && (
                <GeneBatchResults
                  validIds={validIds}
                  invalidIds={invalidIds}
                  updatedIds={updatedIds}
                  splitIds={splitIds}
                  onAdd={addToGenesStudied}
                />
              )}
              {current.matches({ batch: 'loading' }) && <h3>Uploading...</h3>}
            </div>
          </div>
        )}
        {!current.matches('none') && (
          <GenesStudiedTable
            genes={genesStudied}
            onGeneDelete={removeFromGenesStudied}
            onAbClick={setGeneAntibody}
            showAbs={showAntibodyCells}>
            <div className="checkbox" style={{ float: 'right', margin: 0 }}>
              <label htmlFor="showAb" className="control-label">
                <input
                  id="showAb"
                  name="showAb"
                  type="checkbox"
                  onClick={() => setShowAntibodyCells(!showAntibodyCells)}
                  defaultChecked={showAntibodyCells}
                />
                <b>antibodies&nbsp;generated</b>
              </label>
            </div>
          </GenesStudiedTable>
        )}
        {genesStudied.length > 100 && (
          <Alert bsStyle="danger">
            <strong>More than 100 genes entered.</strong> Please tick ‘dataset’
            in the previous step if you used a method to investigate many genes
            at once, and only add genes that have been specifically investigated
            in your ${IS_REVIEW ? 'review' : 'publication'} here.
          </Alert>
        )}
        {children}
      </div>
      {/* end panel */}
    </div>
  )
}

export default GenesStep

import React from 'react'
import { useService } from '@xstate/react'
import PubSearchForm from 'components/PubSearchForm'
import ChosenPub from 'components/ChosenPub'
import PubResults from 'components/PubResults'
import Citation from 'components/Citation'

const NoPubWarning = () => (
  <h4 className="text-danger">Please select a publication to continue.</h4>
)

const PubStep = ({
  service,
  selectedPub = undefined,
  citation = undefined,
  children,
}) => {
  /**
   * Get the step machine service.
   *
   * States:
   * See src/machines/PubStepMachine/index.js for possible states.
   *
   * Actions:
   * See machine definition for valid
   * SUBMIT - Set search terms and fire off search.
   * CITATION - Switch to citation mode.
   * NOPUB_ERROR - Switch to state that indicates that no publication was
   * selected
   * CITATION.SUBMIT - Submit the citation to the parent machine.
   * GOTO.SEARCH - Go back to the pub search state.
   * SELECT_PUB - Select the pub, takes a pub object.
   */
  const [current, send] = useService(service)

  const { terms, totalPubs, pubs = [] } = current.context

  // Send the event with the selected pub to the pub service.
  const handlePubClick = (pub) => send('SELECT_PUB', { pub })

  return (
    <>
      <div className="col-xs-12">
        <div className="panel panel-primary">
          <div className="panel-heading">
            <h3 className="panel-title">Choose a Publication to Annotate</h3>
          </div>
          <div className="panel-body">
            {current.matches('nopub') && <NoPubWarning />}
            {!current.matches('citation') && <PubSearchForm send={send} />}
            {current.matches('citation') && <Citation send={send} />}
            {(selectedPub || citation) && (
              <>
                <ChosenPub pub={selectedPub} citation={citation} />
                {children}
              </>
            )}
            {/*
             * Show search results if the user has entered some search terms
             * and the state machine is in the 'search.loaded' state.
             */}
            {terms && current.matches({ search: 'loaded' }) && (
              <PubResults
                keywords={terms}
                pubs={pubs}
                totalPubs={totalPubs}
                onPubClick={handlePubClick}
                onCitationClick={() => send('CITATION')}
              />
            )}
          </div>{' '}
          {/* end .panel-body */}
        </div>{' '}
        {/* end .panel */}
      </div>
      {pubs.length !== 0 && children}
    </>
  )
}

export default PubStep

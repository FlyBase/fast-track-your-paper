import React from 'react'
import { useService } from '@xstate/react'
import PubSearchForm from 'components/PubSearchForm'
import ChosenPub from 'components/ChosenPub'
import PubResults from 'components/PubResults'

const PubStep = ({ service, selected = undefined }) => {
  const [current, send] = useService(service)

  const { terms, totalPubs, pubs = [] } = current.context

  // Send the event with the selected pub to the pub service.
  const handlePubClick = pub => send('SELECT_PUB', { pub })

  return (
    <div className="col-xs-12">
      <div className="panel panel-primary">
        <div className="panel-heading">
          <h3 className="panel-title">Choose a Publication to Annotate</h3>
        </div>
        <div className="panel-body">
          {!current.matches('citation') && <PubSearchForm send={send} />}
          {current.matches('citation') && (
            <>
              <div>Manual citation box here</div>
              <button onClick={() => send('GOTO.SEARCH')}>Cancel</button>
            </>
          )}
          {selected && <ChosenPub pub={selected} />}
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
        </div> {/* end .panel-body */}
      </div> {/* end .panel */}
    </div>
  )
}

export default PubStep

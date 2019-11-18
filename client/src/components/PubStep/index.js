import React, { useRef, useContext } from 'react'
import { useService } from '@xstate/react'
import ChosenPub from '../ChosenPub'
import SearchPubs from '../SearchPubs'
import IconHelp from '../IconHelp'

import { ApolloContext } from 'contexts'

const PubStep = ({ service, selected = undefined }) => {
  //console.log('PubStep', service)
  const [current, send] = useService(service)
  //console.log('PubStep', service)
  //console.log('PubStep.current', current, send)
  // Initialize DOM references to the form and input elements.
  // https://reactjs.org/docs/hooks-reference.html#useref
  const formEl = useRef(null)
  const inputEl = useRef(null)

  // Get the GraphQL client from the apollo context object.
  // https://reactjs.org/docs/hooks-reference.html#usecontext
  const client = useContext(ApolloContext)

  const { terms, totalPubs, pubs = [] } = current.context

  /*
  Function to handle when a user hits enter in the input field
  or hits the submit button.
   */
  const handleSubmit = e => {
    const currEl = e.currentTarget
    if (
      (inputEl.current === currEl && e.key === 'Enter') ||
      formEl.current === e.target
    ) {
      send('SUBMIT', { terms: inputEl.current.value, client })
      e.preventDefault()
    }
  }

  // Send the event with the selected pub to the pub service.
  const handlePubClick = pub => send('SELECT_PUB',{pub})

  return (
    <div className="col-xs-12">
      <div className="panel panel-primary">
        <div className="panel-heading">
          <h3 className="panel-title">Choose a Publication to Annotate</h3>
        </div>
        <div className="panel-body">
          <form
            ref={formEl}
            className="form-horizontal"
            onSubmit={handleSubmit}>
            <div className="col-sm-9">
              <input
                ref={inputEl}
                type="text"
                placeholder="enter key terms, author name, PubMed ID, etc."
                className="form-control"
                id="pub_search_keywords"
                onKeyPress={handleSubmit}
              />
            </div>

            <div className="col-sm-2">
              <button
                type="submit"
                className="btn btn-primary pull-right"
                id="pub_search">
                <i className="fa fa-search"></i>&nbsp;Search
              </button>
            </div>

            <IconHelp initial={false}>
              <br />
              Try searching with an author, a year and part of a journal title.
              For example, enter &ldquo;Adams 2000 Science&rdquo; (without the
              quotes). Or, try searching with a PubMed ID (PMID). For example,
              enter &ldquo;10731132&rdquo; (without the quotes).
              <br />
              The database searched by this tool contains only items classified
              by FlyBase as <b>papers</b> or <b>reviews</b>.
            </IconHelp>
          </form>

          {selected && <ChosenPub pub={selected} />}
          {/*
           * Show search results if the user has entered some search terms
           * and the state machine is in the 'search.loaded' state.
           */}
          {terms && current.matches({ search: 'loaded' }) && (
            <SearchPubs keywords={terms} pubs={pubs} totalPubs={totalPubs} onPubClick={handlePubClick} />
          )}
        </div>
        {/* end .panel-body */}
      </div>
      {/* end .panel */}
    </div> /* end .container */
  )
}

export default PubStep

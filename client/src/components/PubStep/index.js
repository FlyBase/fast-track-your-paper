import React, { useRef, useState } from 'react'
import ChosenPub from '../ChosenPub'
import SearchPubs from '../SearchPubs'
import IconHelp from '../IconHelp'

import { pubStepMachine } from 'machines/PubStepMachine'
import { useMachine } from '@xstate/react'

const PubStep = () => {
  const [current, send] = useMachine(pubStepMachine)
  // Initialize DOM references to the form and input elements.
  // https://reactjs.org/docs/hooks-reference.html#useref
  const formEl = useRef(null)
  const inputEl = useRef(null)

  const { totalPubs, pubs = [] } = current.context

  const [showChosen, setShowChosen] = useState(false)
  const [showResults, setShowResults] = useState(false)

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
      send('SUBMIT', { terms: inputEl.current.value })
      e.preventDefault()
      setShowResults(true)
    }
  }

  return (
    <div className="container">
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
                placeholder="enter key terms, author name, publication year, etc."
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
              quotes). Or, try searching with a PubMed ID (PMID).
              For example, enter &ldquo;10731132&rdquo; (without the quotes).
              <br />
              The database searched by this tool contains only items classified
              by FlyBase as <b>papers</b> or <b>reviews</b>.
            </IconHelp>
          </form>

          {showChosen && <ChosenPub />}
          {showResults && (
            <SearchPubs
              keywords={inputEl.current.value}
              pubs={pubs}
              totalPubs={totalPubs}
            />
          )}
        </div>{' '}
        {/* end .panel-body */}
      </div>{' '}
      {/* end .panel */}
    </div> /* end .container */
  )
}

export default PubStep

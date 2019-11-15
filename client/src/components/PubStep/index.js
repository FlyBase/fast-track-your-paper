import React, { useRef, useContext } from 'react'
import { useService } from '@xstate/react'

import SearchPubs from '../SearchPubs'
import IconHelp from '../IconHelp'

import { ApolloContext } from 'contexts'

const PubStep = ({ service }) => {
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

  const { totalPubs, pubs = [] } = current.context

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
              enter &ldquo;10731132&rdquo; (without the quotes). Also note that{' '}
              <a href="/static_pages/docs/wild_cards.html">wild cards</a> (*)
              can be added to your search terms.
              <br />
              The database searched by this tool contains only items classified
              by FlyBase as <b>papers</b> or <b>reviews</b>.
            </IconHelp>
          </form>

          <SearchPubs keywords={'Kaufmann'} />
          {pubs.length > 0 && (
            <div>
              <ul>
                {pubs.map(p => (
                  <li>
                    {p.uniquename} {p.miniref} {p.title}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default PubStep

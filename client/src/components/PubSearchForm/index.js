import React, { useRef } from 'react'
import { useApolloClient } from '@apollo/client'
import IconHelp from 'components/IconHelp'

const PubSearchForm = ({ send = () => {} }) => {
  // Initialize DOM references to the form and input elements.
  // https://reactjs.org/docs/hooks-reference.html#useref
  const formEl = useRef(null)
  const inputEl = useRef(null)

  // Get the GraphQL client from the apollo context object.
  // https://reactjs.org/docs/hooks-reference.html#usecontext
  const client = useApolloClient()

  /*
  Function to handle when a user hits enter in the input field
  or hits the submit button.
   */
  const handleSubmit = (e) => {
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
    <form ref={formEl} className="form-horizontal" onSubmit={handleSubmit}>
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
        Try searching with an author, a year and part of a journal title. For
        example, enter &ldquo;Adams 2000 Science&rdquo; (without the quotes).
        Or, try searching with a PubMed ID (PMID). For example, enter
        &ldquo;10731132&rdquo; (without the quotes).
        <br />
        The database searched by this tool contains only items classified as{' '}
        <b>papers</b> or <b>reviews</b>.
      </IconHelp>
    </form>
  )
}

export default PubSearchForm

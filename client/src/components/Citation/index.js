import React, { useRef } from 'react'
import IconHelp from '../IconHelp'

const Citation = ( { send } ) => {
  const textareaEl = useRef(null)

  const handleSubmit = e => {
    console.log('handleSubmit fired');
    send('CITATION.SUBMIT', { citation: textareaEl.current.value })
    e.preventDefault()
  }

  return (
    <div className="col-xs-12">
      <div className="well">

          <form className="form-horizontal">
            <div className="form-group">
              <div className="col-sm-11">
                <textarea className="form-control" ref={textareaEl} placeholder="enter citation"></textarea>
              </div>

              <IconHelp initial={false}>
                <br /><br />
                Please uniquely identify the publication. For example, enter a
                full citation with all bibliographic details included, a Digital
                Object Identifier (DOI) or a PubMed ID (PMID).
              </IconHelp>

            </div>
            <div className="form-group">
              <div className="col-sm-6">
                <button className="btn btn-primary" onClick={() => send('GOTO.SEARCH')}>Search Pubs</button>
              </div>
              <div className="col-sm-5">
                <button className="btn btn-primary pull-right" onClick={handleSubmit}>Submit Citation</button>
              </div>
            </div>
          </form>

      </div>
    </div>
  )
}

export default Citation

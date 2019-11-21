import React, { useRef } from 'react'
import IconHelp from '../IconHelp'

const Citation = () => {

  const formEl = useRef(null)
  const textareaEl = useRef(null)

  const handleSubmit = e => {
    const currEl = e.currentTarget
    if (
      (textareaEl.current === currEl && e.key === 'Enter') ||
      formEl.current === e.target
    ) {
      send('CITATION', { citation: textareaEl.current.value } )
      e.preventDefault()
    }
  }

  return (
    <div className="col-xs-12">
      <div className="panel panel-primary">
        <div className="panel-heading">
          <h3 className="panel-title">Enter Citation</h3>
        </div>
        <div className="panel-body">
          <form className="form" ref={formEl} onSubmit={handleSubmit}>
             <div className="form-group">
               <textarea className="form-control" ref={textareaEl} ></textarea>
               <IconHelp initial={false}>
                 <br />
                 Please uniquely identify the publication.  For example,
                 enter a full citation with all bibliographic details included,
                 a Digital Object Identifier (DOI) or a PubMed ID (PMID).
               </IconHelp>
             </div>
             <div className="form-group">
               <button>Search Pubs</button>
               <button>Submit Citation</button>
             </div>
          </form>
        </div>
      </div>
    </div>
  )

}

export default Citation
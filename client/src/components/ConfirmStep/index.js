import React from 'react'
import { flags2HTMLstring } from './flagText'

import './index.css'

const ConfirmStep = ({ submission = {}, send = () => {}, children }) => {
  let pubcite = submission.publication ? (
    <>
      <h4>
        Publication ({submission?.publication?.type?.name}):
        <button onClick={() => send('PUB')} className="btn btn-default">
          Edit
        </button>
      </h4>
      <p>
        <i>{submission?.publication?.title}</i>
      </p>
      <p>{submission?.publication?.miniref}</p>
    </>
  ) : (
    <>
      <h4>
        Citation:
        <button onClick={() => send('PUB')} className="btn btn-default">
          Edit
        </button>
      </h4>
      <p>{submission?.citation}</p>
      <p>
        You did not find this publication when you searched our bibliography.
      </p>
    </>
  )
  return (
    <>
      <h3>Confirmation</h3>
      <div className="well" id="confirmationPanel">
        {pubcite}
        <h4>
          Contact Information:
          <button onClick={() => send('AUTHOR')} className="btn btn-default">
            Edit
          </button>
        </h4>
        <p>
          {submission.contact.name} &lang;{submission.contact.email}&rang;
        </p>
        <p>
          You have indicated that you are{' '}
          {submission.contact.isAuthor || <b>not</b>} an author on this
          publication.
        </p>
        <h4>
          Types of data:
          <button onClick={() => send('FLAGS')} className="btn btn-default">
            Edit
          </button>
        </h4>
        <ul>
          {Object.keys(flags2HTMLstring).map((flag) => {
            if (submission.flags[flag]) {
              /* logic here to parse Boolean flags, text, and arrays */
              let dataFlag = flags2HTMLstring[flag]
              let listyle = {}
              if (dataFlag === '') {
                dataFlag =
                  '<b>' +
                  flag.replace(/_/g, ' ') +
                  '</b><pre style="margin:0; font-style:italic;">' +
                  submission.flags[flag] +
                  '</pre>'
                listyle = { listStyleType: 'none', margin: 0 }
              }
              if (flag.match(/dataset_/)) {
                /* dataset_pheno and dataset_accessions are both sub-Booleans; dataset_accession_numbers is a list, maybe? */
                listyle = {
                  listStyleType: 'none',
                  paddingLeft: '1em',
                  fontWeight: 'bold',
                }
              }
              if (typeof dataFlag == 'object') {
                dataFlag =
                  /*(submission.flags[flag].length) ? submission.flags[flag].join(', ') :*/ submission
                    .flags[flag]
                listyle = { listStyleType: 'none', paddingLeft: '1em' }
              }
              return (
                <li
                  key={flag}
                  style={listyle}
                  dangerouslySetInnerHTML={{ __html: dataFlag }}
                />
              )
            }
            return null
          })}
          {/*special handling for specific flag groups*/}
          {submission.flags.cell_line && (
            <li
              key="cell_line"
              dangerouslySetInnerHTML={{ __html: flags2HTMLstring.cell_line }}
            />
          )}
          {submission.flags.stable_line && (
            <li
              key="stable_line"
              dangerouslySetInnerHTML={{ __html: flags2HTMLstring.stable_line }}
            />
          )}
          {submission.flags.commercial_line && (
            <li
              key="commercial_line"
              dangerouslySetInnerHTML={{
                __html: flags2HTMLstring.commercial_line,
              }}
            />
          )}
          {(submission.flags.cell_line_names ||
            submission.flags.cell_line_sources) && (
            <li key="cell_line" style={{ listStyleType: 'none' }}>
              <h5>Cell Lines Used:</h5>
              <table className="table">
                <tr>
                  <th>Name</th>
                  <th>Source</th>
                </tr>
              </table>
            </li>
          )}
        </ul>
        <h4>
          Genes Studied ({submission.genes.length}):
          <button onClick={() => send('GENES')} className="btn btn-default">
            Edit
          </button>
        </h4>
        <ul id="confirmationGenesList" className="bg-warning">
          {submission.genes.map((gene) => {
            let ab = gene.antibody
              ? gene.antibody.join(' & ') + ' Ab generated'
              : ''
            return (
              <li key={gene.id}>
                {gene.symbol}
                <i>{ab}</i>
              </li>
            )
          })}
        </ul>
      </div>

      {children}
    </>
  )
}

export default ConfirmStep

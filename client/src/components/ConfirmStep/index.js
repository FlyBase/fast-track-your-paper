import React from 'react'
import { flags2HTMLstring } from './flagText'

import './index.css'

const ConfirmStep = ({ submission = {}, dispatch = () => {}, children }) => {
  let pubcite = submission.publication ? (
    <>
      <h4>
        Publication ({submission?.publication?.type?.name}):
        <button onClick={() => dispatch('PUB')} className="btn btn-default">
          Edit
        </button>
      </h4>
      <p className="text-primary" style={{ marginBottom: 0 }}>
        <i>{submission?.publication?.title}</i>
      </p>
      <p className="text-primary">{submission?.publication?.miniref}</p>
    </>
  ) : (
    <>
      <h4>
        Citation:
        <button onClick={() => dispatch('PUB')} className="btn btn-default">
          Edit
        </button>
      </h4>
      <p className="text-primary">{submission?.citation}</p>
      <p>
        You did not find this publication when you searched our bibliography.
      </p>
    </>
  )
  let madeAbs = '; no antibodies generated'
  for (let g = 0; g < submission.genes.length; g++) {
    if (submission.genes[g].antibody) madeAbs = ''
  }
  // console.log(submission.flags)
  return (
    <>
      <h3>Confirmation</h3>
      <div className="well" id="confirmationPanel">
        {pubcite}
        <h4>
          Contact Information:
          <button
            onClick={() => dispatch('AUTHOR')}
            className="btn btn-default">
            Edit
          </button>
        </h4>
        <p className="text-primary" style={{ marginBottom: 0 }}>
          {submission.contact.name} &lang;{submission.contact.email}&rang;
        </p>
        <p>
          You have indicated that you are{' '}
          {submission.contact.isAuthor || <b>not</b>} an author on this
          publication.
        </p>
        {submission?.publication?.type?.name !== 'review' && (
          <>
            <h4>
              Types of data:
              <button
                onClick={() => dispatch('FLAGS')}
                className="btn btn-default">
                Edit
              </button>
            </h4>
            <ul className="text-primary">
              {Object.keys(flags2HTMLstring).map((flag) => {
                if (submission.flags[flag]) {
                  /* logic here to parse Boolean flags, text, and arrays */
                  let dataFlagHTML = flags2HTMLstring[flag]
                  let listyle = {}
                  if (flag.match(/_line/)) {
                    /* handle these after the map */
                    return false
                  }
                  if (flag.match(/dataset/)) {
                    /* dataset_pheno and dataset_accessions are both sub-Booleans; dataset_accession_numbers is a list, maybe? */
                    /* handle these after the map */
                    /*if( submission.flags.dataset ) {
                  listyle = {
                    listStyleType: 'none',
                    paddingLeft: '1em',
                    fontWeight: 'bold',
                  }
                }*/
                    return false
                  }
                  if (flag.match(/_disease/)) {
                    if (!submission.flags.human_disease) {
                      return false
                    }
                    /* else handle normally below */
                  }
                  if (dataFlagHTML === '') {
                    dataFlagHTML = flag.match(/none/)
                      ? '<b>suggestions for data types to capture</b>'
                      : '<b>' + flag.replace(/_/g, ' ') + '</b>'
                    dataFlagHTML +=
                      '<pre style="margin:0; font-style:italic;">' +
                      submission.flags[flag] +
                      '</pre>'
                    listyle = { listStyleType: 'none', margin: 0 }
                  }
                  if (typeof dataFlagHTML == 'object') {
                    dataFlagHTML =
                      /*(submission.flags[flag].length) ? submission.flags[flag].join(', ') :*/ submission
                        .flags[flag]
                    listyle = { listStyleType: 'none', paddingLeft: '1em' }
                  }
                  return (
                    <li
                      key={flag}
                      dangerouslySetInnerHTML={{ __html: dataFlagHTML }}
                    />
                  )
                }
                return null
              })}
              {/* special handling for specific flag groups */}
              {/*   cell line flags   */}
              {submission.flags.cell_line && (
                <li
                  key="cell_line"
                  dangerouslySetInnerHTML={{
                    __html: flags2HTMLstring.cell_line,
                  }}
                />
              )}
              {submission.flags.cell_line && submission.flags.stable_line && (
                <li
                  key="stable_line"
                  dangerouslySetInnerHTML={{
                    __html: flags2HTMLstring.stable_line,
                  }}
                />
              )}
              {submission.flags.cell_line && submission.flags.commercial_line && (
                <li
                  key="commercial_line"
                  dangerouslySetInnerHTML={{
                    __html: flags2HTMLstring.commercial_line,
                  }}
                />
              )}
              {submission.flags.cell_line &&
                (submission.flags.cell_line_names ||
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
              {/*   dataset flags   */}
              {submission.flags.dataset && (
                <li
                  key="dataset"
                  dangerouslySetInnerHTML={{ __html: flags2HTMLstring.dataset }}
                />
              )}
              {submission.flags.dataset && submission.flags.dataset_pheno && (
                <li
                  className="datasetli"
                  key="dataset_pheno"
                  dangerouslySetInnerHTML={{
                    __html: '<b>' + flags2HTMLstring.dataset_pheno + '</b>',
                  }}
                />
              )}
              {submission.flags.dataset && submission.flags.dataset_accessions && (
                <li
                  className="datasetli"
                  key="dataset_accessions"
                  dangerouslySetInnerHTML={{
                    __html:
                      '<b>dataset repository IDs: </b>' +
                      submission.flags.dataset_accession_numbers,
                  }}
                />
              )}
            </ul>
          </>
        )}
        <h4>
          Genes Studied ({submission.genes.length}
          {madeAbs}):&emsp;
          <button onClick={() => dispatch('GENES')} className="btn btn-default">
            Edit
          </button>
        </h4>
        <ul id="confirmationGenesList" className="bg-info img-rounded">
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

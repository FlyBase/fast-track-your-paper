import React from 'react'
import IconHelp from '../IconHelp'

import './index.css'

const ResultMsg = ({ numPubs = 0, totalPubs = 0, keywords = '' }) => {
  if (numPubs === totalPubs) {
    return (
      <span>
        Showing {numPubs} results for &ldquo;{keywords}&rdquo;
      </span>
    )
  }
  return (
    <span>
      Showing first {numPubs} results of {totalPubs} results for &ldquo;
      {keywords}&rdquo;
    </span>
  )
}

const PubResults = ({
  keywords = '',
  pubs = [],
  totalPubs = 0,
  onPubClick = () => {},
  onCitationClick = () => {},
}) => {
  const handleOnPubClick = (e) => {
    const idx = e.currentTarget.getAttribute('data-pub-idx')
    const pub = pubs[idx]
    onPubClick(pub, e)
  }
  return (
    <div style={{ paddingTop: '1em' }}>
      <div className="row" style={{ marginTop: '1em' }}>
        <div className="col-sm-12">
          <div className="panel panel-info">
            <div className="panel-heading">
              {totalPubs === 0 && (
                <span className="text-warning">No matching records found</span>
              )}
              {totalPubs > 0 && (
                <>
                  <ResultMsg
                    numPubs={pubs.length}
                    totalPubs={totalPubs}
                    keywords={keywords}
                  />
                  <div style={{ float: 'right' }}>curated</div>
                </>
              )}
              <IconHelp initial={false}>
                <div className="well well-sm">
                  Search results from the FlyBase bibliography database may
                  include papers or reviews, but other publication types are
                  excluded here. Papers available for annotation{' '}
                  <b className="text-info">appear in blue</b>,{' '}
                  <b className="text-warning">reviews in gold</b>.
                  <br />
                  The 'curated' column indicates which publications in the
                  search results have already been annotated by FlyBase
                  curators, or by other Fast-Track contributors.
                  <br />
                  Publications which have already been curated cannot be
                  selected for further annotation in the Fast-Track Your Paper
                  tool.
                  <br />
                  If you would like to suggest changes to the annotations on a
                  paper which has already been curated, please make a{' '}
                  <a href="/contact/email?subject=comm">
                    Personal Communication to FlyBase
                  </a>
                  .
                </div>
              </IconHelp>
            </div>

            {pubs.length > 0 && (
              <div className="panel-table">
                <table
                  id="PubResultsTable"
                  className="table table-compact table-striped"
                  style={{ marginBottom: 0 }}>
                  <tbody>
                    {pubs.map((p, i) => (
                      <tr
                        key={`${p.uniquename}_${i}`}
                        role="button"
                        tabIndex="0"
                        data-pub-idx={i}
                        className={p.curationStatus ? 'disabled' : ''}
                        title={
                          p.curationStatus
                            ? 'This publication has been ' +
                              p.curationStatus +
                              ' curated.'
                            : ''
                        }
                        onClick={!p?.curationStatus ? handleOnPubClick : null}>
                        <td style={{ verticalAlign: 'middle' }}>{i + 1}</td>
                        <td
                          className={
                            p?.type?.name.match(/review|note/i)
                              ? 'text-warning'
                              : 'text-info'
                          }>
                          {/*<b>{p?.type?.name}</b>: */}
                          {p.miniref} <br />{' '}
                          {/*<b dangerouslySetInnerHTML={ { __html: p.title } } />*/}
                          <b>{p.title}</b>
                        </td>
                        <td>
                          {p.curationStatus ? (
                            <i className="fa fa-check"></i>
                          ) : (
                            <span></span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            <div className="panel-footer small">
              <strong>Can't find what you are looking for?</strong>
              <br />
              FlyBase only incorporates and curates papers that are "fully
              published." This means the paper must be available in its final,
              properly formatted version and have been assigned volume and page
              numbers. Publications that have not yet reached this stage will
              not be included in the FlyBase bibliography. Please wait until
              your paper is fully published before submitting it to FlyBase
              using the Fast-Track Your Paper tool.
              <br />
              If the above does not apply to you, you can still{' '}
              <button className="btn btn-sm btn-link" onClick={onCitationClick}>
                make a submission with a publication unknown to FlyBase.
              </button>{' '}
            </div>
          </div>{' '}
          {/* end .panel */}
        </div>
      </div>
    </div>
  )
}

export default PubResults

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
            <div className="panel-heading" style={{display:'flex',justifyContent:'space-between'}}>
              {totalPubs === 0 && (
                <span className="text-warning">No matching records found</span>
              )}
              {totalPubs > 0 && (
              <>
                <div style={{flex:'0 1 80%'}}>
                <ResultMsg
                  numPubs={pubs.length}
                  totalPubs={totalPubs}
                  keywords={keywords}
                />
                <IconHelp initial={false}>
                  <div className="well well-sm">
                    Search results from the FlyBase bibliography database may
                    include papers or reviews, but other publication types are
                    excluded here. Papers available for annotation{' '}
                    <b className="text-info">appear in blue</b>,{' '}
                    <b className="text-warning">reviews in gold</b>.
                  </div>
                </IconHelp>
                </div>
                <div>
                <div style={{ float: 'right' }}>already curated</div>
                <IconHelp initial={false} btnClasses="pull-right">
                  <div className="well well-sm" style={{clear:'both'}}>
                    A mark in the 'already curated' column indicates that a
                    publication in the search results has already been annotated
                    by FlyBase curators, or by other Fast-Track contributors.
                    Publications which have already been curated cannot be
                    selected for further annotation in the Fast-Track Your Paper
                    tool.
                    <br />
                    If you would like to suggest changes to the annotations on a
                    paper which has already been curated, please{' '}
                    <a href="/contact/email?subject=ftyp">
                      contact FlyBase
                    </a>
                    .
                  </div>
                </IconHelp>
                </div>
              </>
              )}
            </div>

            {pubs.length > 0 && (
              <div className="panel-table" style={{clear:'both'}}>
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
                        className={
                          p?.curationStatus || p?.hasSubmission
                            ? 'disabled'
                            : ''
                        }
                        title={
                          p.curationStatus
                            ? 'This publication has been ' +
                              p.curationStatus +
                              ' curated.'
                            : ''
                        }
                        onClick={
                          !(p?.curationStatus || p.hasSubmission)
                            ? handleOnPubClick
                            : null
                        }>
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
              FlyBase only incorporates and curates publications that are
              "fully published," meaning they have final volume and page
              numbers. Publications that have not yet reached this stage
              (including preprints) will not be included in the FlyBase
              bibliography.  Please wait until your paper is fully published
              before using this tool.  If your paper is recently
              published and you cannot find it, please check back again soon;
              the Fast-Track database is updated weekly.
            </div>
          </div>{' '}
          {/* end .panel */}
        </div>
      </div>
    </div>
  )
}

export default PubResults

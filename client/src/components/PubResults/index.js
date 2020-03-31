import React from 'react'
import IconHelp from '../IconHelp'

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
                  <div style={{ float: 'right' }}>
                    {' '}
                    curation
                    <br />
                    status{' '}
                  </div>
                </>
              )}
              <IconHelp initial={false}>
                <div className="well well-sm">
                  Search results from the FlyBase bibliography database may
                  include papers or reviews, but other publication types are
                  excluded here. Papers appear in blue, reviews in gold.
                  <br />
                  The 'curated' column indicates which publications in the
                  search results have already been evaluated by FlyBase
                  curators. Only those publications which have not yet been
                  processed are available for submission through the Fast-Track
                  Your Paper tool.
                </div>
              </IconHelp>
            </div>

            {pubs.length > 0 && (
              <div style={{ maxHeight: 300, overflowY: 'auto' }}>
                <table
                  className="table table-compact table-hover table-striped"
                  style={{ marginBottom: 0 }}>
                  <tbody>
                    {pubs.map((p, i) => (
                      <tr
                        key={`${p.uniquename}_${i}`}
                        role="button"
                        tabIndex="0"
                        data-pub-idx={i}
                        onClick={handleOnPubClick}>
                        <td style={{ verticalAlign: 'middle' }}>{i + 1}</td>
                        <td
                          className={
                            p?.type?.name.match(/review|note/i)
                              ? 'text-warning'
                              : 'text-info'
                          }>
                          <b>{p?.type?.name}</b>: {p.miniref} <br />{' '}
                          <b>{p.title}</b>
                        </td>
                        <td>
                          {p.curationStatus ? (
                            // <i className="fa fa-check"></i>
                            <span>{p.curationStatus}</span>
                          ) : (
                            <i className="fa fa-times"></i>
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
              FlyBase only incorporates and curates papers that are 'fully
              published'. This means the paper must be available in its final,
              properly formatted version and have been assigned volume and page
              numbers. Publications that have not yet reached this stage will
              not be included in the FlyBase bibliography. Please wait until
              your paper is fully published before submitting it to FlyBase
              using the Fast-Track Your Paper tool.
              <br />
              If the above does not apply to you, you can still{' '}
              <button
                className="btn btn-sm btn-link"
                onClick={onCitationClick}
                style={{
                  padding: 0,
                  borderWidth: 0,
                  verticalAlign: 'initial',
                }}>
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

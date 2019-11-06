import React, { useState } from 'react'
//import './index.css'
import IconHelp from '../IconHelp'

const SearchPubs = ({ keywords = '', pubs = [], totalPubs = 0 }) => {
  const [showSearchResultsPanel, setShowSearchResultsPanel] = useState(true)
  const [isVisible, setIsVisible] = useState(true)
  return (
    <div style={{ paddingTop: '1em' }}>
      <div className="row" style={{ marginTop: '1em' }}>
        <div className="col-sm-12">
          <div className="panel panel-info">
            <div className="panel-heading">
              {totalPubs ? (
                pubs.length == totalPubs ? (
                  <span>
                    Showing {pubs.length} results for &ldquo;{keywords}&rdquo;
                  </span>
                ) : (
                  <span>
                    Showing first {pubs.length} results of {totalPubs} results
                    for &ldquo;{keywords}&rdquo;
                  </span>
                )
              ) : (
                <span className="text-warning">No matching records found</span>
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
                      <tr>
                        <td style={{ verticalAlign: 'middle' }}>{i + 1}</td>
                        <td>
                          <a
                            className={
                              p.cvtermByTypeId.name == 'review'
                                ? 'text-warning'
                                : 'text-info'
                            }
                            href="">
                            <b>{p.cvtermByTypeId.name}</b>: {p.miniref} <br />{' '}
                            <b>{p.title}</b>
                          </a>
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
              If the above does not apply to you, you can{' '}
              <a id="submitUnknownPub">still make a submission</a> with a
              publication unknown to FlyBase.
            </div>
          </div>{' '}
          {/* end .panel */}
        </div>
      </div>
    </div>
  )
}

export default SearchPubs

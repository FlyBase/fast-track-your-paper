import React, { useState } from 'react'
//import './index.css'
import IconHelp from '../IconHelp'

const SearchPubs = ({ keywords = '' }) => {
  const [showSelectedPub, setShowSelectedPub] = useState(true)
  const [showSearchResultsPanel, setShowSearchResultsPanel] = useState(true)
  const [isVisible, setIsVisible] = useState(true)
  const numResults = 0
  return (
    <>
      <div className="row">
        <div className="col-sm-12">
          <a onClick={() => setShowSelectedPub(!showSelectedPub)}>toggle</a>
          {showSelectedPub && (
            <div className="well small">
              <p>
                <strong>The selected publication:</strong>
                /* miniref */
              </p>
              <p>
                <strong>Please note:</strong>
                The Fast-Track Your Paper tool accesses our &ldquo;live&rdquo;
                FlyBase references database in order to provide users with the
                most up-to-date information. Data in this internal database is
                3-12 weeks ahead of the data displayed on the current release of
                the FlyBase website. This means that a paper that is{' '}
                <i>unknown</i> or <i>uncurated</i> according to the FlyBase
                website may actually already be known to FlyBase and/or show a
                curated status when using the Fast-Track Your Paper tool.
              </p>
              <p>
                If you feel that there is an error, please{' '}
                <a href="http:/cgi-bin/mailto-fbhelp.html?selectedSubject=fasttrack">
                  contact FlyBase
                </a>
                .
              </p>
            </div>
          )}
        </div>
      </div>

      <div className="row">
        <div className="col-sm-12">
          <a onClick={() => setShowSearchResultsPanel(!showSearchResultsPanel)}>
            toggle
          </a>
          {showSearchResultsPanel && (
            <div className="panel panel-info">
              <div className="panel-heading">
                {numResults ? (
                  <span>
                    Showing {numResults} results for &ldquo;{keywords}&rdquo;
                  </span>
                ) : (
                  <span className="text-warning">
                    No matching records found
                  </span>
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
                    processed are available for submission through the
                    Fast-Track Your Paper tool.
                  </div>
                </IconHelp>
              </div>
              <div className="panel-body"></div>
            </div>
          )}
        </div>
      </div>

      <div className="row">
        <div className="col-sm-12">
          <a onClick={() => setIsVisible(!isVisible)}>toggle</a>
          {isVisible && (
            <div className="well">
              <p className="small">{keywords}</p>
            </div>
          )}
        </div>
      </div>
    </>
  )
}

export default SearchPubs

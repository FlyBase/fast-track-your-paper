import React, { useState } from 'react'
//import './index.css'

const SearchPubs = ({ keywords = '' }) => {
  const [showSelectedPub, setShowSelectedPub] = useState(true)
  const [showPubSearchResultsPanel, setShowPubSearchResultsPanel] = useState(true)
  const [isVisible, setIsVisible] = useState(true)
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
              The Fast-Track Your Paper tool accesses our &ldquo;live&rdquo; FlyBase references database in order to provide users with the most up-to-date information.
              Data in this internal database is 3-12 weeks ahead of the data displayed on the current release of the FlyBase website.
              This means that a paper that is <i>unknown</i> or <i>uncurated</i> according to the FlyBase website
              may actually already be known to FlyBase and/or show a curated status when using the Fast-Track Your Paper tool.
            </p>
            <p>
              If you feel that there is an error, please <a href="http:/cgi-bin/mailto-fbhelp.html?selectedSubject=fasttrack">contact FlyBase</a>.
            </p>
          </div>

        )}
      </div>
    </div>

    <div className="row">
      <div className="col-sm-12">
      <a onClick={() => setShowPubSearchResultsPanel(!showPubSearchResultsPanel)}>toggle</a>
        { showPubSearchResultsPanel && (
          <div className="panel panel-info">
            <div className="panel-heading">{keywords}</div>
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
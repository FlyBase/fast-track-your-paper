import React from 'react'
import PropTypes from 'prop-types'

const ChosenPub = ({ pub, citation }) => {
  let cur_status_phrase_for = {
    bibl: 'has not been curated',
    skim: 'has been first-pass curated by FlyBase',
    user: 'has been first-pass curated using the FTYP tool',
    full: 'has been fully curated by FlyBase',
  }

  return (
    <div style={{ paddingTop: '1rem' }}>
      <div className="row">
        <div className="col-sm-12">
          <div className="well small">
            <p>
              {citation ? (
                <>
                  <strong>Publication citation entered:</strong>&emsp;
                  {citation}
                  <br />
                  You did not find this publication when you searched our
                  bibliography.
                </>
              ) : (
                <>
                  <strong>Publication selected:</strong>&emsp;
                  {pub.miniref}
                  <br />
                  {cur_status_phrase_for[pub.curationStatus]}.
                </>
              )}
            </p>
            <p>
              <strong>Please note:</strong>&ensp; The Fast-Track Your Paper tool
              accesses our &ldquo;live&rdquo; FlyBase references database in
              order to provide users with the most up-to-date information. Data
              in this internal database is 3-12 weeks ahead of the data
              displayed on the current release of the FlyBase website. This
              means that a paper that is <i>unknown</i> or <i>uncurated</i>{' '}
              according to the FlyBase website may actually already be known to
              FlyBase and/or show a curated status when using the Fast-Track
              Your Paper tool.
            </p>
            <p>
              If you feel that there is an error, please{' '}
              <a href="http:/cgi-bin/mailto-fbhelp.html?selectedSubject=fasttrack">
                contact FlyBase
              </a>
              .
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

ChosenPub.propTypes = {
  pub: PropTypes.object.isRequired,
}

export default ChosenPub

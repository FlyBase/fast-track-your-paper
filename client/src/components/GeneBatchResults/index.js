import React, { useState } from 'react'
import IconHelp from 'components/IconHelp'

import './index.css'

/**
 *  Component to display results of Batch ID uploading / validation.
 *
 *  This component gets 4 arrays of objects representing the different types
 *  of ID validation statuses.
 *
 *  Valid IDs - Submitted IDs are current and valid.
 *  Updated IDs - Submitted IDs were not current but updated without issue.
 *  Split IDs - Submitted IDs were not current and were split into two or more FBgn IDs.  Careful review
 *              by the user should be undertaken.
 *  Invalid IDs - IDs that are not valid FlyBase gene IDs (FBgn).
 *
 *  Each object in the array has the following structure.
 *
 *  {
 *    id: 'FBgn1234',
 *    submittedId: 'FBgn00001'
 *    status: 'current'
 *    symbol: 'dpp'
 *  }
 *
 *  Field descriptions:
 *
 *  id - Is the current FlyBase ID (if applicable).
 *  submittedId - What they uploaded.
 *  status - ID Validation status ('current','updated','split',null).
 *  symbol - Current FlyBase symbol (if applicable).
 *
 * @param validIds - Array of ID validation objects that are current.
 * @param updatedIds - Array of updated IDs that were cleanly updated.
 * @param splitIds - Array of IDs that have been split and should be review.
 * @param invalidIds - Array of IDs that are invalid.
 *
 */
const GeneBatchResults = ({
  validIds,
  updatedIds,
  splitIds,
  invalidIds,
  onAdd = () => {},
}) => {
  /**
   * TODO:
   * 1. Styling
   * 2. Allow user to review/view IDs (the submitted ID and the updated/split/invalid ID).
   * 3. Support export (button that copies to clipboard or file download).
   * 4. Add export to ID Validator for invalid entities.
   */
  const [showAllHelp] = useState(false)
  return (
    <div id="batch-results">
      <label
        htmlFor="ids"
        css={`
          margin: 0;
        `}>
        Uploaded Genes
      </label>
      <div className="panel panel-default">
        <div className="panel-body">
          <div>
            <div>Current:</div>
            <div>{validIds?.length ?? 0}</div>
            <div>{validIds?.length ? <i className="fa fa-check" /> : ''}</div>
          </div>
          <div>
            <div>
              Updated&nbsp;
              <IconHelp
                initial={showAllHelp}
                message="These obsolete gene IDs were unambiguously converted to a current ID."
              />
            </div>
            <div>{updatedIds?.length ?? 0} </div>
            <div>{updatedIds?.length ? <i className="fa fa-check" /> : ''}</div>
          </div>
          <div>
            <div>Splits:</div>
            <div>{splitIds?.length ?? 0} </div>
            <div>
              <Add ids={splitIds} handleOnClick={onAdd} />
            </div>
          </div>
          <div>
            <div>Invalid:</div>
            <div>{invalidIds?.length ?? 0}</div>
            <div></div>
          </div>
        </div>
      </div>
    </div>
  )
}

const Add = ({ ids = [], handleOnClick, ...props }) => {
  if (ids.length !== 0) {
    return (
      <button
        className="btn btn-xs"
        type="button"
        {...props}
        onClick={() => handleOnClick(ids)}>
        Add to List
      </button>
    )
  }

  return null
}

export default GeneBatchResults

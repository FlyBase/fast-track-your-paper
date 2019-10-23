import React from 'react'
import SearchPubs from '../SearchPubs'

const PubStep = () => (
  <div className="container">
    <div className="panel panel-primary">
      <div className="panel-heading">
        <h3 className="panel-title">Choose a Publication to Annotate</h3>
      </div>
      <div className="panel-body">

        <form className="form-horizontal">

          <div className="col-sm-9">
            <input type="text" className="form-control" id="pub_search_keywords" />
          </div>
          <div className="col-sm-3">
            <button class="btn btn-primary" id="pub_search">
              <i class="fa fa-search"></i>&nbsp;Search
            </button>
          </div>

        </form>

          <SearchPubs keywords={2018} />

      </div>
    </div>
  </div>
)

export default PubStep

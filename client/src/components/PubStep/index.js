import React from 'react'
import SearchPubs from '../SearchPubs'
import IconHelp from '../IconHelp'

const PubStep = () => (
  <div className="container">
    <div className="panel panel-primary">
      <div className="panel-heading">
        <h3 className="panel-title">Choose a Publication to Annotate</h3>
      </div>
      <div className="panel-body">

        <form className="form-horizontal">

          <div className="col-sm-9">
            <input
              type="text"
              className="form-control"
              id="pub_search_keywords"
            />
          </div>

          <div className="col-sm-2">
            <button class="btn btn-primary pull-right" id="pub_search">
              <i class="fa fa-search"></i>&nbsp;Search
            </button>
          </div>
          <IconHelp initial={false}>
            <br />
            Try searching with an author, a year and part of a journal title.
            For example, enter &ldquo;Adams 2000 Science&rdquo; (without the quotes).
            Or, try searching with a PubMed ID (PMID).  For example, enter &ldquo;10731132&rdquo; (without the quotes).
            Also note that <a href="/static_pages/docs/wild_cards.html">wild cards</a> (*) can be added to your search terms.
            <br />
            The database searched by this tool contains only items classified by FlyBase as <b>papers</b> or <b>reviews</b>.
          </IconHelp>
        </form>

        <SearchPubs keywords={'Kaufmann'} />

      </div>
    </div>
  </div>
)

export default PubStep

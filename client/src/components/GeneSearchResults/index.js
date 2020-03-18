import React from 'react'
import PropTypes from 'prop-types'

import './index.css'

/* g object
  id
  symbol
  species
  hl:
    id
    symbol
    annotationId
    name
    plainSymbol
*/
/*  dangerously set <a> inner HTML:
  <b dangerouslySetInnerHTML={ { __html: g.symbol } } />
    doesn't work right, because tags are not standard HTML, things like <up>,
    and this construction ignores/destroys them, which turns e(wᵃ) into e(wa).
*/
/*  straight rendering of gene symbols:
  <b>{g.symbol}</b>
    Shows, but does not render, things like <up> tags.
*/
const GeneSearchResults = ({
  genes = [],
  totalCount = 0,
  onGeneClick = () => {},
}) => (
  <div id="geneSearchSuggestions">
		<div id="geneSearchSuggestionsContainer">
			<ul>
				{genes.map(g => (
					<li key={g.id} onClick={() => onGeneClick(g)}>
						<a href={`/reports/${g.id}`} target="_blank">
							<b dangerouslySetInnerHTML={{ __html: g.symbol }} />
						</a>
						&emsp;
						<span dangerouslySetInnerHTML={{ __html: g.hl.name }} />
						&emsp;
						<i dangerouslySetInnerHTML={{ __html: (g.hl.synonyms) ? g.hl.synonyms.join(', ') : '' }} />
					</li>
				))}
			</ul>
			<span id="geneSearchSuggestionsSummary">Showing {genes.length} of {totalCount} matches.</span>
		</div>
  </div>
)

GeneSearchResults.propTypes = {
  genes: PropTypes.arrayOf(PropTypes.object),
  totalCount: PropTypes.number,
  onGeneClick: PropTypes.func,
}
export default GeneSearchResults

import React, { useRef } from 'react'
import PropTypes from 'prop-types'
import GeneSearchHit from 'components/GeneSearchHit'
import { useOnClickOutside } from '../../hooks/useOnClickOutside'

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
/*
            <a href={`/reports/${g.id}`} target="_blank">
              <b dangerouslySetInnerHTML={{ __html: g.symbol }} />
            </a>
            &emsp;
            <span dangerouslySetInnerHTML={{ __html: g.hl.name }} />
            &emsp;
            <i
              dangerouslySetInnerHTML={{
                __html: g.hl.synonyms ? g.hl.synonyms.join(', ') : '',
              }}
            />
*/
const GeneSearchResults = ({
  genes = [],
  totalCount = 0,
  onGeneClick = () => {},
  onDismiss = () => {},
  z = '',
}) => {
  const ref = useRef()

  useOnClickOutside(ref, onDismiss)

  return (
    <div ref={ref} id="geneSearchSuggestions">
      <div id="geneSearchSuggestionsContainer">
        <button
          onClick={onDismiss}
          style={{ display: 'block', border: 'none' }}>
          <i
            id="geneSearchSuggestionsDismiss"
            className="fa fa-times-circle"></i>
        </button>
        <div id="geneSearchSuggestionsSummary" className="bg-info">
          Showing {genes.length} of {totalCount} matches.&emsp;
        </div>
        <ul>
          <li className="bg-warning" style={{ color: 'white !' }}>
            <GeneSearchHit
              g={{
                symbol: '<i>Symbol</i>',
                hl: {
                  synonyms: ['<b>Synonyms</b>'],
                  name: '<b><i>Name</i></b>',
                },
              }}
            />
          </li>
          {genes.map((g) => {
            z = z ? '' : 'z'
            let zclass = z
            return (
              <li key={g.id} onClick={() => onGeneClick(g)} className={zclass}>
                <GeneSearchHit g={g} />
              </li>
            )
          })}
        </ul>
      </div>
    </div>
  )
}

GeneSearchResults.propTypes = {
  genes: PropTypes.arrayOf(PropTypes.object),
  totalCount: PropTypes.number,
  onGeneClick: PropTypes.func,
}
export default GeneSearchResults

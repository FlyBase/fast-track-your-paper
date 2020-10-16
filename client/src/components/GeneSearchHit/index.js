import React from 'react'
import PropTypes from 'prop-types'

/* g object
		hl: {
			id: "FBgn#######"
			symbol: "<b>text</b>"
			annotationId: "CG#####"
			name: "<b>name</b>"
			plainSymbol: "<b>text</b>"
			synonyms: []
		}
		id: "FBgn#######"
		symbol: "symb"
		species: "Dmel"
		_typename: "SearchGeneIdentifiersRecord"
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
const GeneSearchHit = ({ g = {} }) => {
  const synonymCell = (g = {}) => {
    let syns = g.hl.synonyms
    let synlist = []
    if (syns) {
      for (let i = 0; i < syns.length; i++) {
        if (syns[i].match(/<b/)) synlist.push(syns[i])
      }
    }
    return <i dangerouslySetInnerHTML={{ __html: synlist.join(', ') }} />
  }

  return (
    <>
      <b className="text-info" dangerouslySetInnerHTML={{ __html: g.symbol }} />
      <span dangerouslySetInnerHTML={{ __html: g.hl.name }} />
      {synonymCell(g)}
    </>
  )
}

GeneSearchHit.propTypes = {
  g: PropTypes.object,
}
export default GeneSearchHit

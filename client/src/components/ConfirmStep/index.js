import React from 'react'

import './index.css'

const flags2HTMLstring = {
  no_flags: 'You indicated no curation flags',
  new_allele:
    'generation of a new classical allele or chromosomal aberration in a Drosophila genome',
  new_transgene: 'generation of a new transgenic construct',
  physical_interaction:
    'physical interactions involving <i>D. melanogaster</i> proteins or RNA',
  human_disease: 'experimental data for a Drosophila model of human disease',
  human_disease_text: '',
  cell_line: 'use or creation of a stable <i>D. melanogaster</i> cell line',
  stable_line: 'creation of a new stable <i>D. melanogaster</i> cell line',
  commercial_line:
    'use of a commercially purchased <i>D. melanogaster</i> cell line',
  cell_line_names: '',
  cell_line_sources: '',
  initial_characterization: 'initial characterization of a Drosophila gene',
  gene_rename:
    'suggestion for a new gene symbol or name for an existing Gene Report in FlyBase',
  expression_wild_type:
    'novel or comprehensive temporal or spatial expression data for <i>D. melanogaster</i> gene(s) in a wild-type background',
  phenotypic_analysis:
    'novel or comprehensive phenotypic data of one or more <i>D. melanogaster</i> genes',
  chemical_phenotypes:
    'in vivo experiments that either induce or test a mutant phenotype by chemical or drug treatment',
  dmel_model_change:
    'new experimental data relevant to the model of transcript or polypeptide structure for a <i>D. melanogaster</i> gene',
  mapping_of_features:
    'features that can be mapped to the <i>D. melanogaster</i> genome',
  cis_regulatory:
    'new experimental data defining cis-regulatory elements of <i>D. melanogaster</i> genes at the sequence level',
  anatomical_data:
    'novel anatomical description of new or existing wild-type Drosophila body parts',
  new_technique: 'a new technique, reagent or resource',
  dataset: 'high-throughput or large-scale data',
  dataset_pheno: 'phenotypic screen',
  dataset_accessions: 'data repository',
  dataset_accession_numbers: '',
  new_pathway_member:
    'evidence that a gene is a new member or direct regulator of a receptor signaling pathway',
}

const ConfirmStep = ({ submission = {}, children }) => {
  let pubcite = submission.publication ? (
    <>
      <h4>
        Publication ({submission.publication.type.name}):
        <button className="btn btn-default">Edit</button>
      </h4>
      <p>
        <i>submission.publication.title</i> submission.publication.miniref
      </p>
    </>
  ) : (
    <>
      <h4>
        Citation:
        <button className="btn btn-default">Edit</button>
      </h4>
      <p>{submission.citation}</p>
      <p>
        You did not find this publication when you searched our bibliography.
      </p>
    </>
  )
  let madeAbs = '; no antibodies generated';
  for( let g=0; g<submission.genes.length; g++ ) {
      if( submission.genes[g].antibody ) madeAbs = '';
  }
  return (
    <>
      <h3>Confirmation</h3>
      <div className="well" id="confirmationPanel">
        {pubcite}
        <h4>
          Contact Information:
          <button className="btn btn-default">Edit</button>
        </h4>
        <p>
          {submission.contact.name} &lang;{submission.contact.email}&rang;
        </p>
        <p>
          You have indicated that you are{' '}
          {submission.contact.isAuthor || <b>not</b>} an author on this
          publication.
        </p>
        <h4>
          Types of data:
          <button className="btn btn-default">Edit</button>
        </h4>
        <ul>
          {Object.keys(flags2HTMLstring).map((flag) => {
            if (submission.flags[flag]) {
              /* logic here to parse Boolean flags, text, and arrays */
              let dataFlag = flags2HTMLstring[flag]
              let listyle = {}
              if ( flag.match(/_line/) ) {
                /* handle these after the map */
                return false;
              }
              if ( flag.match(/dataset/) ) {
                /* dataset_pheno and dataset_accessions are both sub-Booleans; dataset_accession_numbers is a list, maybe? */
                /* handle these after the map */
                /*if( submission.flags.dataset ) {
									listyle = {
										listStyleType: 'none',
										paddingLeft: '1em',
										fontWeight: 'bold',
									}
                }*/
                return false;
              }
              if ( flag.match(/_disease/) ) {
                if( !submission.flags.human_disease ) {
                  return false;
                }
                {/* else handle normally below */}
              }
              if (dataFlag === '') {
                dataFlag =
                  '<b>' +
                  flag.replace(/_/g, ' ') +
                  '</b><pre style="margin:0; font-style:italic;">' +
                  submission.flags[flag] +
                  '</pre>'
                listyle = { listStyleType: 'none', margin: 0 }
              }
              if (typeof dataFlag == 'object') {
                dataFlag =
                  /*(submission.flags[flag].length) ? submission.flags[flag].join(', ') :*/ submission
                    .flags[flag]
                listyle = { listStyleType: 'none', paddingLeft: '1em' }
              }
              return (
                <li
                  key={flag}
                  style={listyle}
                  dangerouslySetInnerHTML={{ __html: dataFlag }}
                />
              )
            }
          })}
          {/* special handling for specific flag groups */}
          {/*   cell line flags   */}
          { submission.flags.cell_line && <li key="cell_line" dangerouslySetInnerHTML={{ __html: flags2HTMLstring.cell_line }} /> }
          { submission.flags.cell_line && submission.flags.stable_line && <li key="stable_line" dangerouslySetInnerHTML={{ __html: flags2HTMLstring.stable_line }} /> }
          { submission.flags.cell_line && submission.flags.commercial_line && <li key="commercial_line" dangerouslySetInnerHTML={{ __html: flags2HTMLstring.commercial_line }} /> }
          { submission.flags.cell_line && (submission.flags.cell_line_names || submission.flags.cell_line_sources) &&
            <li key="cell_line" style={{listStyleType: 'none'}}>
              <h5>Cell Lines Used:</h5>
              <table className="table">
                <tr><th>Name</th><th>Source</th></tr>
              </table>
            </li>
          }
          {/*   dataset flags   */}
          { submission.flags.dataset && <li key="dataset" dangerouslySetInnerHTML={{ __html: flags2HTMLstring.dataset }} /> }
          { submission.flags.dataset && submission.flags.dataset_pheno &&
            <li className="datasetli" key="dataset_pheno" dangerouslySetInnerHTML={{ __html: "<b>"+flags2HTMLstring.dataset_pheno+"</b>" }} />}
          { submission.flags.dataset && submission.flags.dataset_accessions &&
            <li className="datasetli" key="dataset_accessions" dangerouslySetInnerHTML={{ __html: "<b>dataset repository IDs: </b>"+submission.flags.dataset_accession_numbers }} />}
        </ul>
        <h4>
          Genes Studied ({submission.genes.length}{madeAbs}):
          <button className="btn btn-default">Edit</button>
        </h4>
        <ul id="confirmationGenesList" className='bg-warning'>
          {submission.genes.map((gene) => {
          	let ab = (gene.antibody) ? gene.antibody.join(' & ')+' Ab generated' : '';
            return (
              <li key={gene.id}>
                {gene.symbol}
                <i>{ab}</i>
              </li>
            )
          })}
        </ul>
      </div>

      {children}
    </>
  )
}
/*<pre>{JSON.stringify(submission, null, 2)}</pre>*/

export default ConfirmStep

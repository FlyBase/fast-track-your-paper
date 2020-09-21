import React, { useState } from 'react'
import { Formik, Form } from 'formik'
import { Persist } from 'formik-persist'

import DataFlagCheckbox from 'components/DataFlagCheckbox'
import DataFlagTextArea from 'components/DataFlagTextArea'
import DiseaseTextArea from 'components/DiseaseTextArea'
import CellLineFlag from 'components/CellLineFlag'
import DatasetFlag from 'components/DatasetFlag'
import { DataFlagsSchema } from './validation'

const FlagsStep = ({ flags, setFlags, bagRef, isReview = false, children }) => {
  const [showAllHelp, setShowAllHelp] = useState(false)
  return (
    <div className="container">
      <div className="panel panel-primary">
        <div className="panel-heading">
          <h3 className="panel-title">
            Data Types
            <button
              type="button"
              className="pull-right btn btn-default btn-xs"
              onClick={() => setShowAllHelp(!showAllHelp)}>
              {showAllHelp ? 'Hide' : 'Show'} All Help Messages
            </button>
          </h3>
        </div>
        <div className="panel-body">
          <Formik
            enableReinitialize={true}
            initialValues={{
              new_allele: flags?.new_allele ?? false,
              new_transgene: flags?.new_transgene ?? false,
              physical_interaction: flags?.physical_interaction ?? false,
              human_disease: flags?.human_disease ?? false,
              human_disease_text: flags?.human_disease_text ?? '',
              cell_line: flags?.cell_line ?? false,
              stable_line: flags?.stable_line ?? false,
              commercial_line: flags?.commercial_line ?? false,
              cell_lines: flags?.cell_lines ?? [],
              initial_characterization: flags?.initial_characterization ?? '',
              gene_rename: flags?.gene_rename ?? false,
              expression_wild_type: flags?.expression_wild_type ?? false,
              phenotypic_analysis: flags?.phenotypic_analysis ?? false,
              chemical_phenotypes: flags?.chemical_phenotypes ?? false,
              dmel_model_change: flags?.dmel_model_change ?? false,
              mapping_of_features: flags?.mapping_of_features ?? false,
              cis_regulatory: flags?.cis_regulatory ?? false,
              anatomical_data: flags?.anatomical_data ?? false,
              new_technique: flags?.new_technique ?? false,
              dataset: flags?.dataset ?? false,
              dataset_pheno: flags?.dataset ?? false,
              dataset_accessions: flags?.dataset_accessions ?? false,
              dataset_accession_numbers: flags?.dataset_accession_numbers ?? '',
              new_pathway_member: flags?.new_pathway_member ?? false,
              no_flags: flags?.no_flags ?? false,
            }}
            /**
             * See https://github.com/jaredpalmer/formik/issues/1603#issuecomment-575669249
             * for details
             */
            innerRef={bagRef}
            validationSchema={DataFlagsSchema}
            onSubmit={(values, actions) => {
              setFlags({ flags: { ...values } })
            }}>
            {({ values, values: { no_flags: noneApply } }) => (
              <Form>
                {isReview && (
                  <h4
                    className="alert alert-warning"
                    style={{ marginBottom: '1em' }}>
                    The publication you have chosen is classified as a{' '}
                    <b>review</b> by FlyBase.
                    <br />
                    FlyBase only curates a few types of data for reviews; the
                    form below will only accept information about these types.
                  </h4>
                )}

                <label>None</label>
                <div className="form-group">
                  <DataFlagCheckbox
                    name="no_flags"
                    showAllHelp={showAllHelp}
                    helpMessage="Your publication reports other kinds of data than those listed here. Letting us know will help us improve curation efficiency.">
                    None of these data-types apply
                  </DataFlagCheckbox>
                </div>

                <div className="well well-sm text-info">
                  <em>
                    The following data types (new allele, new transgene,
                    physical interaction, disease) are currently subject to
                    text-mining in an effort to detect their presence in your
                    publication. If a data type is detected by text-mining, it
                    has been pre-selected below. Please correct any incorrectly
                    added or missing data types contained in your publication.
                  </em>
                </div>

                <label>Drosophila Reagents</label>
                <div className="form-group" id="Drosophila_Reagents">
                  <DataFlagCheckbox
                    name="new_allele"
                    showAllHelp={showAllHelp}
                    disabled={noneApply}
                    helpMessage="Your publication describes the generation of a new classical allele or chromosomal aberration in a Drosophila genome; e.g. an EMS or CRISPR-induced mutation, P-element excision or insertion, chromosomal deletion or duplication.">
                    New allele (non-transgenic) or aberration (<i>e.g.</i> a
                    deletion)
                  </DataFlagCheckbox>
                  <DataFlagCheckbox
                    name="new_transgene"
                    showAllHelp={showAllHelp}
                    disabled={noneApply}
                    helpMessage="Your publication describes the generation of a new transgenic construct; this applies to any Drosophila gene or a &lsquo;foreign&rsquo; gene such as GAL4 or a human gene; e.g. UAS transgenes,  genomic rescue transgenes, RNAi transgenes.">
                    New transgene
                  </DataFlagCheckbox>
                </div>

                <label>Physical Interactions</label>
                <div className="form-group" id="Physical_Interactions">
                  <DataFlagCheckbox
                    name="physical_interaction"
                    showAllHelp={showAllHelp}
                    disabled={noneApply}
                    helpMessage="Your publication reports physical interactions involving D. melanogaster proteins or RNA; e.g. yeast two-hybrid, co-immunoprecipitation (Co-IP), GST pull down, miRNA luciferase assays. If you have a protein:DNA interaction, please use the &ldquo;cis-regulatory elements&rdquo; flag instead.">
                    Physical interaction
                  </DataFlagCheckbox>
                </div>

                <label>Human Disease</label>
                <div className="form-horizontal">
                  <div className="form-group" id="Human_Disease">
                    <div className="col-sm-12">
                      <DataFlagCheckbox
                        name="human_disease"
                        showAllHelp={showAllHelp}
                        disabled={noneApply}
                        helpMessage="Your publication reports experimental data for a Drosophila model of human disease (e.g. mutation of Drosophila genes, introduction of human genes into flies, chemical exposure, infection or environmental change).">
                        Description or use of Drosophila model of human disease
                      </DataFlagCheckbox>
                    </div>
                  </div>

                  {values.human_disease && (
                    <DiseaseTextArea
                      name="human_disease_text"
                      disabled={noneApply}
                    />
                  )}
                </div>

                <div className="well well-sm text-info">
                  <em>
                    The following data types are not currently text-mined;
                    please tick boxes to add any relevant data types contained
                    in your publication.
                  </em>
                </div>

                <label>Drosophila Reagents</label>
                <div className="form-group" id="Drosophila_Reagents_II">
                  <DataFlagCheckbox
                    name="cell_line"
                    showAllHelp={showAllHelp}
                    disabled={noneApply}
                    helpMessage="Your publication reports the use or creation of a stable Drosophila melanogaster cell line.">
                    Drosophila cell line used
                  </DataFlagCheckbox>
                </div>

                {values.cell_line && (
                  <CellLineFlag
                    showAllHelp={showAllHelp}
                    disabled={noneApply}
                  />
                )}

                <label>Gene Characterization</label>
                <div className="form-group">
                  <DataFlagCheckbox
                    name="initial_characterization"
                    showAllHelp={showAllHelp}
                    disabled={noneApply}
                    helpMessage="Your publication reports the initial characterization of a Drosophila gene; e.g. a previously unstudied CG number gene, or novel characterization of a Drosophila gene; e.g. a novel function is ascribed to a gene that has been studied in other contexts.">
                    Initial or novel characterization
                  </DataFlagCheckbox>
                  <DataFlagCheckbox
                    name="gene_rename"
                    showAllHelp={showAllHelp}
                    disabled={noneApply}
                    helpMessage="Your publication suggests a new gene symbol or name for an existing Gene Report in FlyBase; e.g. you suggest the rename of a CG number.">
                    Gene rename
                  </DataFlagCheckbox>
                </div>

                <label>Expression</label>
                <div className="form-group">
                  <DataFlagCheckbox
                    name="expression_wild_type"
                    showAllHelp={showAllHelp}
                    disabled={noneApply}
                    helpMessage="Your publication reports novel or comprehensive temporal or spatial expression data (e.g. tissue, developmental stage) for any D. melanogaster gene in a wild-type background; e.g. reporter gene analysis, antibody staining, In situ hybridization. Do not use this flag if the paper reports only subcellular localization.">
                    Expression analysis in a wild-type background
                  </DataFlagCheckbox>
                </div>

                <label>Phenotypes and Chemicals</label>
                <div className="form-group">
                  <DataFlagCheckbox
                    name="phenotypic_analysis"
                    showAllHelp={showAllHelp}
                    disabled={noneApply}
                    helpMessage="Your publication reports novel or comprehensive phenotypic data for one or more Drosophila melanogaster genes; e.g. based on mutant analysis, over-expression of a transgene, or genetic interactions.">
                    Novel or comprehensive phenotypic analysis
                  </DataFlagCheckbox>
                  <DataFlagCheckbox
                    name="chemical_phenotypes"
                    showAllHelp={showAllHelp}
                    disabled={noneApply}
                    helpMessage="Your publication describes in vivo experiments that either induce a mutant phenotype by chemical or drug treatment or that test whether a chemical or drug treatment can modify a mutant phenotype caused by genetic manipulation.">
                    Use of chemicals to investigate phenotypes
                  </DataFlagCheckbox>
                </div>

                <label>Genome Annotation Data</label>
                <div className="form-group" id="Genome_Annotation_Data">
                  <DataFlagCheckbox
                    name="dmel_model_change"
                    showAllHelp={showAllHelp}
                    disabled={noneApply}
                    helpMessage="Your publication includes new experimental data relevant to the model of transcript or polypeptide structure for a D. melanogaster gene; e.g. the discovery of new splice variants, additional exons/introns, corrections to the polypeptide.">
                    Evidence for changes to the current transcript or
                    polypeptide structure of a <i>D. melanogaster</i> gene
                  </DataFlagCheckbox>
                  <DataFlagCheckbox
                    name="mapping_of_features"
                    showAllHelp={showAllHelp}
                    disabled={noneApply}
                    helpMessage="Your publication reports features that can be mapped to the D. melanogaster genome; e.g. mapping at the sequence level of alleles, insertion sites, rescue fragments or aberration breakpoints. This includes any mutation made at an endogenous locus.">
                    Mapping of features (<i>e.g.</i> mutant alleles) to genome
                  </DataFlagCheckbox>
                  <DataFlagCheckbox
                    name="cis_regulatory"
                    showAllHelp={showAllHelp}
                    disabled={noneApply}
                    helpMessage="Your publication includes new experimental data defining cis-regulatory elements of D. melanogaster genes at the sequence level. e.g. enhancers, transcription factor binding sites, boundary elements or microRNA target sequences.">
                    Cis-regulatory elements defined
                  </DataFlagCheckbox>
                </div>

                <label>Anatomical Data</label>
                <div className="form-group" id="Anatomical_Data">
                  <DataFlagCheckbox
                    name="anatomical_data"
                    showAllHelp={showAllHelp}
                    disabled={noneApply}
                    helpMessage="Your publication reports a novel anatomical description of new or existing wild-type Drosophila body parts, including cell types and nervous system components.">
                    Characterization of new cell type or anatomical structure in{' '}
                    <i>D. melanogaster</i>
                  </DataFlagCheckbox>
                </div>

                <label>Technical advance or new resource</label>
                <div className="form-group" id="new_tech">
                  <DataFlagCheckbox
                    name="new_technique"
                    showAllHelp={showAllHelp}
                    disabled={noneApply}
                    helpMessage="This paper includes a technical advance, new reagent, or resource likely to be useful for other researchers.">
                    Technical advance or new resource
                  </DataFlagCheckbox>
                </div>

                <label>Large-scale Dataset</label>
                <div className="form-group" id="largescale_dataset">
                  <DataFlagCheckbox
                    name="dataset"
                    showAllHelp={showAllHelp}
                    disabled={noneApply}
                    helpMessage="Your publication contains high-throughput or large-scale data. This would include submissions with a data repository ID (e.g., GEO, EBI), genome-wide scans for sequence elements (e.g., regulatory motifs, SNPs), screens (e.g., RNAi, chemical libraries), interaction studies and clustering projects.">
                    Dataset
                  </DataFlagCheckbox>
                </div>

                {values.dataset && (
                  <DatasetFlag values={values} disabled={noneApply} />
                )}

                <label>Pathways</label>
                <div className="form-group" id="pathway_member">
                  <DataFlagCheckbox
                    name="new_pathway_member"
                    showAllHelp={showAllHelp}
                    disabled={noneApply}
                    helpMessage="Your publication contains evidence that a gene is a new member or direct regulator of a receptor signaling pathway.">
                    New member of receptor signaling pathway
                  </DataFlagCheckbox>
                </div>

                <label>None</label>
                <div className="form-group">
                  <DataFlagCheckbox
                    name="no_flags"
                    showAllHelp={showAllHelp}
                    helpMessage="Your publication reports other kinds of data than those listed here. Letting us know will help us improve curation efficiency.">
                    None of the above data types apply
                  </DataFlagCheckbox>
                </div>

                {/* can't figure out how to emulate what I did in the disease field */}
                { noneApply && (
                <textarea
                  className="form-control"
                  name="none_apply_text"
                  rows="4"
                  style={{marginBottom:'2em'}}
                  placeholder="Optional: if there important data types contained in your paper that have not been covered by the above flags, please briefly list them here."
                ></textarea>
                ) }

                {children}

                <Persist name="flag-step" />
              </Form>
            )}
          </Formik>
        </div>
      </div>
    </div>
  )
}

export default FlagsStep

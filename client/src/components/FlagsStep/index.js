import React, { useState } from 'react'
import IconHelp from '../IconHelp'
import OptForm from '../OptForm'

const FlagsStep = ({ service, flags, bagRef, children }) => {
  const [showAllHelp, setShowAllHelp] = useState(false)
  const [showDiseaseSubform, setShowDiseaseSubform] = useState(false)
  const [showCellLineSubform, setShowCellLineSubform] = useState(false)
  const [showDatasetSubform, setShowDatasetSubform] = useState(false)
  const [showAccessionsSubform, setShowAccessionsSubform] = useState(false)
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
          <form>
            <div className="well well-sm text-info">
              <em>
                The following data types (new allele, new transgene, physical
                interaction, disease) are currently subject to text-mining in an
                effort to detect their presence in your publication. If a data
                type is detected by text-mining, it has been pre-selected below.
                Please correct any incorrectly added or missing data types
                contained in your publication.
              </em>
            </div>

            <label>Drosophila Reagents</label>
            <div className="form-group" id="Drosophila_Reagents">
              <div className="checkbox">
                <label>
                  <input type="checkbox" id="new_allele" />
                  New allele (non-transgenic) or aberration (<i>e.g.</i> a
                  deletion)
                </label>
                <IconHelp
                  initial={showAllHelp}
                  message="Your publication describes the generation of a new classical allele or chromosomal aberration in a Drosophila genome; e.g. an EMS or CRISPR-induced mutation, P-element excision or insertion, chromosomal deletion or duplication."
                />
              </div>
              <div className="checkbox">
                <label>
                  <input type="checkbox" id="new_transgene" />
                  New transgene
                </label>
                <IconHelp
                  initial={showAllHelp}
                  message="Your publication describes the generation of a new transgenic construct; this applies to any Drosophila gene or a &lsquo;foreign&rsquo; gene such as GAL4 or a human gene; e.g. UAS transgenes,  genomic rescue transgenes, RNAi transgenes."
                />
              </div>
            </div>

            <label>Physical Interactions</label>
            <div className="form-group" id="Physical_Interactions">
              <div className="checkbox">
                <label>
                  <input type="checkbox" id="physical_interaction" />
                  Physical interaction
                </label>
                <IconHelp
                  initial={showAllHelp}
                  message="Your publication reports physical interactions involving D. melanogaster proteins or RNA; e.g. yeast two-hybrid, co-immunoprecipitation (Co-IP), GST pull down, miRNA luciferase assays. If you have a protein:DNA interaction, please use the &ldquo;cis-regulatory elements&rdquo; flag instead."
                />
              </div>
            </div>

            <label>Human Disease</label>
            <div className="form-horizontal">
              <div className="form-group" id="Human_Disease">
                <div className="col-sm-12">
                  <div className="checkbox">
                    <label>
                      <input
                        type="checkbox"
                        id=""
                        onClick={() =>
                          setShowDiseaseSubform(!showDiseaseSubform)
                        }
                      />
                      Description or use of Drosophila model of human disease
                    </label>
                    <IconHelp
                      initial={showAllHelp}
                      message="Your publication reports experimental data for a Drosophila model of human disease (e.g. mutation of Drosophila genes, introduction of human genes into flies, chemical exposure, infection or environmental change)."
                    />
                  </div>
                </div>
              </div>
              <OptForm show={showDiseaseSubform}>
                <div className="form-group">
                  <div className="col-md-6 col-lg-5">
                    <div
                      className="small text-info"
                      style={{ margin: '0 2em' }}>
                      <em>
                        Please enter the name(s) of the relevant disease(s) in
                        the text area. Separate multiple diseases by placing
                        each on a different line; i.e.:
                        <pre>
                          heart disease
                          <br />
                          Parkinson&rsquo;s disease
                        </pre>
                      </em>
                    </div>
                  </div>
                  <div className="col-md-6 col-lg-7">
                    <textarea
                      className="form-control"
                      id="disease_text"
                      rows="4"
                      placeholder="Enter disease name(s) by placing each on its own line"></textarea>
                  </div>
                </div>
              </OptForm>
            </div>

            <div className="well well-sm text-info">
              <em>
                The following data types are not currently text-mined; please
                tick boxes to add any relevant data types contained in your
                publication.
              </em>
            </div>

            <label>Drosophila Reagents</label>
            <div className="form-group" id="Drosophila_Reagents_II">
              <div className="checkbox">
                <label>
                  <input
                    type="checkbox"
                    id="cell_line"
                    onClick={() => setShowCellLineSubform(!showCellLineSubform)}
                  />
                  Drosophila cell line used
                </label>
                <IconHelp
                  initial={showAllHelp}
                  message="Your publication reports the use or creation of a stable Drosophila melanogaster cell line."
                />
              </div>
            </div>

            <OptForm show={showCellLineSubform}>
              <div
                className="form-horizontal well well-sm"
                style={{ marginLeft: '2em' }}>
                <div className="form-group">
                  <div className="col-sm-12">
                    <p className="form-control-static">
                      <b>Optional</b>{' '}
                      <em>
                        please give us more information about the cell line(s)
                        used:
                      </em>
                    </p>
                  </div>

                  <div className="col-sm-5 col-md-4 col-lg-3">
                    <div className="checkbox">
                      <label>
                        <input type="checkbox" id="stable_line" />
                        Stable line generated
                      </label>
                      <IconHelp
                        initial={showAllHelp}
                        message="Your publication reports the creation of a new stable Drosophila melanogaster cell line."
                      />
                    </div>
                  </div>

                  <div className="col-sm-7">
                    <div className="checkbox">
                      <label>
                        <input type="checkbox" id="commercial_line" />
                        Commercially purchased cell line
                      </label>
                      <IconHelp
                        initial={showAllHelp}
                        message="Your publication reports the use of a commercially purchased Drosophila melanogaster cell line."
                      />
                    </div>
                  </div>

                  <div className="col-sm-12">
                    <p className="form-control-static">
                      <em>
                        Please provide the name and source for each cell line:
                      </em>
                      <IconHelp
                        initial={showAllHelp}
                        message="Enter corresponding cell line names and sources on separate aligned rows."
                      />
                    </p>
                  </div>

                  <div className="col-sm-12">
                    <textarea
                      className="form-control"
                      id="cell_line_names"
                      rows="3"
                      style={{
                        resize: 'none',
                        width: '50%',
                        display: 'inline-block',
                      }}
                      placeholder="Enter cell line name(s) by placing each on its own line; e.g.&#10;S2-DGRC&#10;S2-cdi-GFP"></textarea>

                    <textarea
                      className="form-control"
                      id="cell_line_names"
                      rows="3"
                      style={{
                        resize: 'none',
                        width: '50%',
                        display: 'inline-block',
                      }}
                      placeholder="Enter corresponding cell line source(s) by placing each on its own line; e.g.&#10;DGRC&#10;this study"></textarea>
                  </div>
                </div>
              </div>
            </OptForm>

            <label>Gene Characterization</label>
            <div className="form-group" id="">
              <div className="checkbox">
                <label>
                  <input type="checkbox" id="initial_characterization" />
                  Initial or novel characterization
                </label>
                <IconHelp
                  initial={showAllHelp}
                  message="Your publication reports the initial characterization of a Drosophila gene; e.g. a previously unstudied CG number gene, or novel characterization of a Drosophila gene; e.g. a novel function is ascribed to a gene that has been studied in other contexts."
                />
              </div>
              <div className="checkbox">
                <label>
                  <input type="checkbox" id="gene_rename" />
                  Gene rename
                </label>
                <IconHelp
                  initial={showAllHelp}
                  message="Your publication suggests a new gene symbol or name for an existing Gene Report in FlyBase; e.g. you suggest the rename of a CG number."
                />
              </div>
            </div>

            <label>Expression</label>
            <div className="form-group" id="">
              <div className="checkbox">
                <label>
                  <input type="checkbox" id="expression_wild_type" />
                  Expression analysis in a wild-type background
                </label>
                <IconHelp
                  initial={showAllHelp}
                  message="Your publication reports novel or comprehensive temporal or spatial expression data (e.g. tissue, developmental stage) of any D. melanogaster gene in a wild-type background; e.g. reporter gene analysis, antibody staining, In situ hybridization. Do not use this flag if the paper reports only subcellular localization."
                />
              </div>
            </div>

            <label>Phenotypes and Chemicals</label>
            <div className="form-group" id="">
              <div className="checkbox">
                <label>
                  <input type="checkbox" id="phenotypic_analysis" />
                  Novel phenotypic analysis
                </label>
                <IconHelp
                  initial={showAllHelp}
                  message="Your publication reports novel or comprehensive phenotypic data of one or more Drosophila melanogaster genes; e.g. based on mutant analysis, over-expression of a transgene, or genetic interactions."
                />
              </div>
              <div className="checkbox">
                <label>
                  <input type="checkbox" id="chemical_phenotypes" />
                  Use of chemicals to investigate phenotypes
                </label>
                <IconHelp
                  initial={showAllHelp}
                  message="Your publication describes in vivo experiments that either induce a mutant phenotype by chemical or drug treatment or that test whether a chemical or drug treatment can modify a mutant phenotype caused by genetic manipulation."
                />
              </div>
            </div>

            <label>Genome Annotation Data</label>
            <div className="form-group" id="Genome_Annotation_Data">
              <div className="checkbox">
                <label>
                  <input type="checkbox" id="dmel_model_change" />
                  Evidence for changes to the current transcript or polypeptide
                  structure of a <i>D. melanogaster</i> gene
                </label>
                <IconHelp
                  initial={showAllHelp}
                  message="Your publication includes new experimental data relevant to the model of transcript or polypeptide structure for a D. melanogaster gene; e.g. the discovery of new splice variants, additional exons/introns, corrections to the polypeptide."
                />
              </div>
              <div className="checkbox">
                <label>
                  <input type="checkbox" id="mapping_of_features" />
                  Mapping of features (<i>e.g.</i> mutant alleles) to genome
                </label>
                <IconHelp
                  initial={showAllHelp}
                  message="Your publication reports features that can be mapped to the D. melanogaster genome; e.g. mapping at the sequence level of alleles, insertion sites, rescue fragments or aberration breakpoints. This includes any mutation made at an endogenous locus."
                />
              </div>
              <div className="checkbox">
                <label>
                  <input type="checkbox" id="cis_regulatory" />
                  Cis-regulatory elements defined
                </label>
                <IconHelp
                  initial={showAllHelp}
                  message="Your publication includes new experimental data defining cis-regulatory elements of D. melanogaster genes at the sequence level. e.g. enhancers, transcription factor binding sites, boundary elements or microRNA target sequences."
                />
              </div>
            </div>

            <label>Anatomical Data</label>
            <div className="form-group" id="Anatomical_Data">
              <div className="checkbox">
                <label>
                  <input type="checkbox" id="" />
                  Characterization of new cell type or anatomical structure in{' '}
                  <i>D. melanogaster</i>
                </label>
                <IconHelp
                  initial={showAllHelp}
                  message="Your publication reports a novel anatomical description of new or existing wild-type Drosophila body parts, including cell types and nervous system components."
                />
              </div>
            </div>

            <label>New technique/reagent/resource</label>
            <div className="form-group" id="new_tech">
              <div className="checkbox">
                <label>
                  <input type="checkbox" id="" />
                  New technique/reagent/resource
                </label>
                <IconHelp
                  initial={showAllHelp}
                  message="A major part of this paper describes a new technique, reagent or resource."
                />
              </div>
            </div>

            <label>Large-scale Dataset</label>
            <div className="form-group" id="largescale_dataset">
              <div className="checkbox">
                <label>
                  <input
                    type="checkbox"
                    id="dataset"
                    onClick={() => setShowDatasetSubform(!showDatasetSubform)}
                  />
                  Dataset
                </label>
                <IconHelp
                  initial={showAllHelp}
                  message="Your publication contains high-throughput or large-scale data. This would include submissions with a data repository ID (e.g., GEO, EBI), genome-wide scans for sequence elements (e.g., regulatory motifs, SNPs), screens (e.g., RNAi, chemical libraries), interaction studies and clustering projects."
                />
              </div>
            </div>

            <OptForm show={showDatasetSubform}>
              <div
                className="form-horizontal well well-sm"
                style={{ marginLeft: '2em' }}>
                <div className="form-group">
                  <div className="col-sm-12">
                    <p className="form-control-static">
                      <b>Optional</b>{' '}
                      <em>
                        please give us more information about your dataset:
                      </em>
                    </p>
                  </div>
                  <div className="col-sm-12">
                    <div className="checkbox">
                      <label>
                        <input type="checkbox" id="dataset_pheno" />
                        Phenotypic screen (e.g. a particular phenotype is
                        assessed in multiple RNAi or UAS or deficiency lines)
                      </label>
                    </div>
                  </div>
                  <div className="col-sm-12">
                    <div className="checkbox">
                      <label>
                        <input
                          type="checkbox"
                          id="dataset_accessions"
                          onClick={() =>
                            setShowAccessionsSubform(!showAccessionsSubform)
                          }
                        />
                        Data repository ID (e.g. GSE000001, SRP0000001,
                        PXD000001, E-MTAB-0001, PRJNA000001)
                      </label>
                    </div>
                  </div>
                  <OptForm show={showAccessionsSubform}>
                    <div className="col-sm-12">
                      <textarea
                        className="form-control"
                        id="dataset_accession_numbers"
                        rows="2"
                        placeholder="Optional: Please enter relevant accession numbers, separated by commas"></textarea>
                    </div>
                  </OptForm>
                </div>
              </div>
              {/* .well */}
            </OptForm>

            <label>Pathways</label>
            <div className="form-group" id="pathway_member">
              <div className="checkbox">
                <label>
                  <input type="checkbox" id="" />
                  New member of receptor signaling pathway
                </label>
                <IconHelp
                  initial={showAllHelp}
                  message="Your publication contains evidence that a gene is a new member or direct regulator of a receptor signaling pathway."
                />
              </div>
            </div>

            <label>None</label>
            <div className="form-group" id="">
              <div className="checkbox">
                <label>
                  <input type="checkbox" id="no_flag" />
                  None of the above data-types apply
                </label>
                <IconHelp
                  initial={showAllHelp}
                  message="Your publication reports other kinds of data than those listed above. Letting us know will help us improve curation efficiency."
                />
              </div>
            </div>
            {children}
          </form>
        </div>
      </div>
    </div>
  )
}

export default FlagsStep

import React from 'react'

const SubmitStep = ({ submission = {}, children }) => {
  const { name = '', email = '' } = submission?.contact
  const noSumGeneList = submission?.genes
    // Remove non-dmel or genes with summaries.
    .filter((gene) => !gene?.hasSummary && gene?.species === 'Dmel')
    .map((gene) => {
      const { id = '', symbol = '' } = gene
      const wufooURL = `https://flybase.wufoo.com/forms/flybase-gene-snapshot-form?Field37=${name}&Field4=${email}&Field31=${id}&Field3=${symbol}`
      return (
        <li>
          <a
            href={encodeURI(wufooURL)}
            target="_blank"
            rel="noopener noreferrer">
            <b>{symbol}</b> <i className="fa fa-external-link" />
          </a>
        </li>
      )
    })

  let FCAGinvite = (
    <div class="container">
      <div class="panel panel-primary">
        <div class="panel-heading">
          <h2 class="panel-title" style={{ fontSize: 24 }}>
            FCAG &ndash; the FlyBase Community Advisory Group
          </h2>
        </div>
        <div class="panel-body">
          If you would like to help shape FlyBase with survey feedback about
          various aspects of the website and database, please join FCAG, our{' '}
          <a href="https://wiki.flybase.org/wiki/FlyBase:Community_Advisory_Group">
            FlyBase Community Advisory Group
          </a>{' '}
          by filling in the registration form <a href="/static/fcag">here</a>.
        </div>
        <div class="panel-footer text-primary">
          If you or someone in your research group is already a member of FCAG,{' '}
          <b>thank you!</b> FlyBase benefits from your guidance and input.
        </div>
      </div>
    </div>
  )

  let sumInvite = (
    <div class="container">
      <div class="panel panel-primary">
        <div class="panel-heading">
          <h2 class="panel-title" style={{ fontSize: 24 }}>
            FlyBase Gene Snapshots
          </h2>
        </div>
        <div class="panel-body">
          Based on the genes associated with your recent publication, you've
          done work on some genes that do not currently have{' '}
          <a href="https://wiki.flybase.org/wiki/Gene_Snapshots">
            Gene Snapshots
          </a>
          . Would you like to contribute a Gene Snapshot for any or all of the
          following genes?
          <ul>{noSumGeneList}</ul>
        </div>
        <div class="panel-footer text-primary">
          Links will open a new tab/window containing a form hosted at wufoo.com
          for FlyBase.
        </div>
      </div>
    </div>
  )

  let pabMabsInvite = (
    <div class="container">
      <div class="panel panel-primary">
        <div class="panel-heading">
          <h2 class="panel-title" style={{ fontSize: 24 }}>
            Antibody reviews
          </h2>
        </div>
        <div class="panel-body">
          Please consider reviewing any antibodies tested and/or used in
          Drosophila over the course of the research described in this
          publication.{' '}
          <a href="/wiki/FlyBase:Antibodies#Review_antibodies_tested_in_Drosophila">
            Antibody reviews
          </a>
          , both positive and negative, help the research community save time
          and money when selecting antibodies for their studies.
        </div>
        <div class="panel-footer text-primary">
          The "Antibody reviews" link above goes to a FlyBase wiki page with
          information about pAbmAbs, an independent antibody review
          organization.
        </div>
      </div>
    </div>
  )

  return (
    <>
      <h1>Thank you!</h1>

      {true ? FCAGinvite : ''}

      {true ? pabMabsInvite : ''}

      {noSumGeneList.length ? sumInvite : ''}

      {children}
    </>
  )
}

export default SubmitStep

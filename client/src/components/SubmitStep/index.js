import React from 'react'

const SubmitStep = ({ submission = {}, children }) => {
  let noSumGeneList = []
  for (let n = 0; n < submission.genes.length; n++) {
    if (!submission.genes[n].hasSummary) {
      let gn = submission.genes[n]
      let wufooURL =
        'https://flybase.wufoo.com/forms/flybase-gene-snapshot-form'
      wufooURL += '?Field37=' + submission.contact.name
      wufooURL += '&Field4=' + submission.contact.email
      wufooURL += '&Field31=' + gn.id
      wufooURL += '&Field3=' + gn.symbol
      noSumGeneList.push(
        <li>
          <a
            href={encodeURI(wufooURL)}
            target="_blank"
            rel="noopener noreferrer">
            <b>{gn.symbol}</b> <i class="fa fa-external-link" />
          </a>
        </li>
      )
    }
  }

  let sumInvite = (
    <div class="container">
      <div class="panel panel-primary">
        <div class="panel-heading">
          <h3 class="panel-title">FlyBase Gene Snapshots</h3>
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
  return (
    <>

      {/** TODO: Add follow up statements based submission flags and genes. */}

      <h2>Thank you!</h2>

      <div class="container">
        <div class="panel panel-primary">
          <div class="panel-heading">
            <h3 class="panel-title">FCAG &ndash; the FlyBase Community Advisory Group</h3>
          </div>
          <div class="panel-body">
            If you would like to help shape FlyBase with survey feedback
            about various aspects of the website and database, please join FCAG,
            our <a href="https://wiki.flybase.org/wiki/FlyBase:Community_Advisory_Group">FlyBase Community Advisory Group</a> by
            filling in the registration form <a href="/static/fcag">here</a>.
          </div>
          <div class="panel-footer text-primary">
            If you or someone in your research group is already a member of
            FCAG, <b>thank you!</b> FlyBase benefits from your guidance and input.
          </div>
        </div>
      </div>

      {noSumGeneList.length ? sumInvite : ''}

      {children}

    </>
  )
}

export default SubmitStep

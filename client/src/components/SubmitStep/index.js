import React from 'react'
import { useParams, useHistory } from 'react-router-dom'
import { useQuery } from '@apollo/client'
import { loader } from 'graphql.macro'

// The GraphQL query to fetch the submission
const submissionQuery = loader('graphql/getSubmission.gql')

const SubmitStep = ({ submission = {}, result, children }) => {
  // not using any of these four constants yet
  const { fbrf } = useParams()
  const { loading, error, data } = useQuery(submissionQuery, {
    variables: { fbrf },
  })
  console.log(submission)
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
          <a href={encodeURI(wufooURL)} target="_blank">
            <b>{gn.symbol}</b> <i class="fa fa-external-link" />
          </a>
        </li>
      )
    }
  }
  console.log(noSumGeneList)
  let sumInvite = (
    <div class="container">
      <div class="panel panel-primary">
        <div class="panel-heading">
          <h3 class="panel-title">FlyBase Gene Snapshots</h3>
        </div>
        <div class="panel-body">
          Based on the genes associated with your recent publication, you've done
          work on some genes that do not currently have{' '}
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
      {noSumGeneList.length ? sumInvite : ''}
      {children}
    </>
  )
}

export default SubmitStep

import React from 'react'
import { useParams, useHistory } from 'react-router-dom'
import { useQuery } from '@apollo/client'
import { loader } from 'graphql.macro'

// The GraphQL query to fetch the submission
const submissionQuery = loader('graphql/getSubmission.gql')

const SubmissionView = () => {
  const { fbrf } = useParams()
  const history = useHistory()

  const { loading, error, data } = useQuery(submissionQuery, {
    variables: { fbrf },
  })

  if (loading) {
    return <h3>Loading...</h3>
  }

  if (error) {
    return (
      <div>
        <h3>Error:</h3>
        <p>{error}</p>
      </div>
    )
  }

  return (
    <div>
      <button type="button" onClick={() => history.goBack()}>
        Back
      </button>
      <pre>{JSON.stringify(data?.submission ?? {}, null, 4)}</pre>
    </div>
  )
}

export default SubmissionView

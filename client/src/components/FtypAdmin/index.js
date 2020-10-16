import React from 'react'
import { useQuery } from '@apollo/client'
import { loader } from 'graphql.macro'

import SubmissionTable from 'components/SubmissionTable'

// The GraphQL query to search all publication data.
const submissionsQuery = loader('graphql/listSubmissions.gql')

const FtypAdmin = () => {
  const { loading, error, data = {} } = useQuery(submissionsQuery)

  const submissions = data?.submissions?.nodes ?? []

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
      <h3>FTYP Admin - Submissions</h3>
      <SubmissionTable rows={submissions} />
    </div>
  )
}
export default FtypAdmin

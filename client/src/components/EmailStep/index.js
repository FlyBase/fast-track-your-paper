import React, { useEffect } from 'react'
import { useQuery } from '@apollo/client'
import { loader } from 'graphql.macro'
import ChosenPub from '../ChosenPub'

// The GraphQL query to fetch a single publication.
const GET_PUB = loader('graphql/getPub.gql')

/**
 * EmailStep component displays the publication information for the FBrf
 * ID that is used when coming in from a URL.  Upon mounting and/or
 * updates to the FBrf ID, a query is fired off to fetch the full publication
 * data from the GraphQL API.
 *
 * @param fbrf - The FBrf ID to fetch data for.
 * @param dispatch - The Xstate machine dispatch/send function.
 * @param children - The navigation buttons or other children components.
 */
const EmailStep = ({ fbrf, dispatch = () => {}, children }) => {
  /*
   * Fire off the query to fetch the FBrf data.
   * loading - A boolean indicating that the query is running.
   * error - Error object returned from query.
   * data - JSON results from query.
   *
   * see https://www.apollographql.com/docs/react/v3.0-beta/data/queries/
   */
  const { loading, error, data } = useQuery(GET_PUB, {
    variables: { fbrf },
  })

  // Extract the first pub returned from the query.
  const pub = data?.pubs?.nodes[0]

  /**
   * Set the pub data in the state machine once we have fetched
   * it from the GraphQL API.  This runs whenever the pub object
   * is updated.
   */
  useEffect(() => {
    if (pub) dispatch('SET_PUB', { pub })
  }, [pub, dispatch])

  // If the query is running show loading message.
  if (loading) return <p>Loading ...</p>
  // If the query has errored display the error.
  if (error) return <p>Error: {error.message}</p>

  // Display the pub when fetched.
  let pubDisplay = null
  if (pub?.curationStatus === 'bibl') {
    pubDisplay = <ChosenPub pub={pub} />
  } else {
    // The user sent an FBrf that doesn't exist or is not available for submission.
    pubDisplay = pub ? (
      <h3>
        This publication ({pub.miniref}) has already been curated, and is no
        longer available for submission.
      </h3>
    ) : (
      <h3>
        This publication (FlyBase ID {fbrf}) is not available for submission.
      </h3>
    )
  }
  return (
    <div>
      <div className="well">
        {pubDisplay}
        <h4>
          Thank you for your time; we at FlyBase appreciate your willingness to
          help.
        </h4>
      </div>
      {children}
    </div>
  )
}

export default EmailStep

// Check that the submission has an associated publication or citation.
export const hasPublication = (context, event) => {
  const { submission } = context
  return (
    event.hasPub ||
    (submission.publication && submission.publication.uniquename) ||
    submission.citation
  )
}

export const isReview = (context, event) => {
  return context?.submission?.publication?.type?.name === 'review'
}

export const isFromEmail = (context, event) => {
  const fbrf = context?.fbrf
  const email = context?.submission?.contact?.email
  return fbrf && email
}

export const isFlagsValid = (context, event) => {
  // Here we receive the formik bag object and check if it has validated.
  // API of object is https://formik.org/docs/api/formik
  return event?.form?.isValid ?? false
}

export const hasContact = (context, event) => {
  const {
    submission: {
      contact: { name, email },
    },
  } = context
  // Here we receive the formik bag object and check if it has validated.
  // API of object is https://formik.org/docs/api/formik
  const isFormValid = event?.form?.isValid ?? false
  return name && email && isFormValid
}

export const isConfirmed = (context) => context.confirmed

export const hasContactAndIsReview = (context, event) => {
  return hasContact(context, event) && isReview(context)
}

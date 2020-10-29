/**
 * Check that the submission has an associated publication or citation.
 * @param submission - The submission object to validate
 * @returns {boolean} - Whether or not the submission has a publication.
 */
export const hasPublication = (submission) => {
  return (
    (submission?.publication && submission?.publication?.uniquename) ||
    submission?.citation
  )
}

/**
 * Checks that the publication has been curated or not.
 *
 * @param publication - The publication object to validate
 * @returns {boolean} - Whether or not the publication has been curated.
 */
export const isCurated = (publication) => {
  return publication?.curationStatus !== null
}

/**
 * Is the publication a review or not.
 * @param publication - The publication to validate with an assigned type.
 * @returns {boolean} - Whether or not the publication is a review.
 */
export const isReview = (publication) => {
  return publication?.type?.name === 'review'
}

/**
 * Given a formik Bag object, checks if the form is in a valid state or
 * not.
 * @param formikBag - Formik Bag object (https://formik.org/docs/api/formik)
 * @returns {boolean} - Boolean indicating that the form is valid or not.
 */
export const isFormValid = (formikBag) => {
  return formikBag?.isValid ?? false
}

/**
 * Given a contact and contact form object validate that all are
 * set correctly.
 *
 * @param contact - Contact object with name and email.
 * @param formikBag - Formik Bag object (https://formik.org/docs/api/formik)
 * @returns {boolean} - Boolean indicating that the submission has a valid contact set.
 */
export const hasContact = (contact, formikBag) => {
  const { name, email } = contact
  return name && email && isFormValid(formikBag)
}

import React from 'react'
// eslint-disable-next-line
import styled from 'styled-components/macro'
import * as Yup from 'yup'
import { Form, Formik } from 'formik'
import GeneBatchInput from '../GeneBatchInput'

const fbgnRegex = /^FBgn\d+$/

const validationSchema = Yup.object().shape({
  ids: Yup.string()
    .required('FlyBase Gene IDs (FBgn) required')
    .test(
      'is-fbgn-list',
      'Only FlyBase gene IDs (FBgn) are supported',
      (value) => {
        if (value && value.length > 0) {
          const ids = value.split(/[\s,]+/)
          return ids.every((id) => id === '' || fbgnRegex.test(id))
        }
        return false
      }
    ),
})

const GeneBatchForm = ({ onSubmit, ...props }) => {
  return (
    <Formik
      initialValues={{ ids: '' }}
      validationSchema={validationSchema}
      onSubmit={(values) => console.log(values)}>
      <Form>
        <label htmlFor="ids">FlyBase Gene IDs (FBgn)</label>
        <GeneBatchInput name="ids" rows={10} />
        <button
          type="submit"
          css={`
            margin-top: 1rem;
          `}
          className="btn btn-default btn-lg">
          Upload
        </button>
      </Form>
    </Formik>
  )
}

export default GeneBatchForm

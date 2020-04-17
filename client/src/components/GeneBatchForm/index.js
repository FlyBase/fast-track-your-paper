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
  const preSubmit = ({ ids: idField }) => {
    try {
      // Convert string field into an array of IDs.
      const ids = idField.split(/[\s,]+/)
      // Pass IDs to user function.
      onSubmit(ids)
    } catch (error) {
      console.log(`Failed to split ID list: ${error}`)
    }
  }

  return (
    <Formik
      initialValues={{ ids: '' }}
      validationSchema={validationSchema}
      onSubmit={preSubmit}>
      <Form>
        <div>
          <label
            htmlFor="ids"
            css={`
              margin: 0;
            `}>
            FlyBase Gene IDs
          </label>
          <button
            type="submit"
            css={`
              float: right;
              font-weight: bold;
              padding: 2px 8px;
              margin: -2px 0 4px;
            `}
            className="btn btn-info">
            Upload
          </button>
        </div>
        <GeneBatchInput
          name="ids"
          placeholder="Copy and paste FlyBase FBgn IDs only.
IDs can be separated by commas, spaces, tabs, or returns."
          rows={10}
        />
      </Form>
    </Formik>
  )
}

export default GeneBatchForm

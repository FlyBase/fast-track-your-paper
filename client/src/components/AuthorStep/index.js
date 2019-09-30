import React from 'react'
import { ErrorMessage, Field, Formik } from 'formik'
import { AuthorSchema} from './validation'

const AuthorStep = () => (
  <>
    <div>Author step</div>
    <Formik
      initialValues={{
        name: '',
        email: '',
        isAuthor: true,
      }}
      validationSchema={AuthorSchema}
      onSubmit={(values, actions) => {
        console.log(values)
      }}
      render={props => (
        <form onSubmit={props.handleSubmit}>
          <Field name="name" />
          <ErrorMessage name="name" />
          <Field type="email" name="email" />
          <ErrorMessage name="email" />
          <Field type="email" name="email_verify" />
          <button type="submit">Submit contact information</button>
        </form>
      )}
    />
  </>
)

export default AuthorStep

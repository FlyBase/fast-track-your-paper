import React from 'react'
import { useService } from '@xstate/react'
import { ErrorMessage, Field, Formik, Form } from 'formik'
import { AuthorSchema } from './validation'

const AuthorStep = ({ service, contact, children }) => {
  const [current, send] = useService(service)
  return (
    <Formik
      initialValues={{
        // Use optional chaining and nullish coalescing to read in initialValues.
        name: contact?.name ?? '',
        email: contact?.email ?? '',
        email_verify: contact?.email ?? '',
        // Formik only supports string values for radio buttons, not
        // booleans/numbers because of DOM limitations.  Convert in your
        // onSubmit handler or as needed.
        isAuthor: (contact?.isAuthor ?? true) ? 'yes' : 'no',
      }}
      validationSchema={AuthorSchema}
      onSubmit={(values, actions) => {
        const { name, email, isAuthor } = values
        send('SUBMIT', { contact: { name, email, isAuthor: isAuthor === 'yes'}})
      }}
      render={props => (
        <Form className="form-horizontal">
          <div className="container">
            {current.matches('invalid') && <div className="text-danger">Invalid submission</div>}
            <div className="panel panel-primary">
              <div className="panel-heading">
                <h3 className="panel-title">Contact Information</h3>
              </div>
              <div className="panel-body">
                <div className="form-group">
                  <label htmlFor="name" className="col-sm-2 control-label">
                    Name
                  </label>
                  <div className="col-sm-10 col-lg-9">
                    <Field id="name" name="name" className="form-control" />
                  </div>
                  <div className="col-sm-2">
                    <ErrorMessage name="name" />
                  </div>
                </div>
                <div className="form-group">
                  <label htmlFor="email" className="col-sm-2 control-label">
                    Email
                  </label>
                  <div className="col-sm-10 col-lg-9">
                    <Field
                      id="email"
                      type="email"
                      name="email"
                      className="form-control"
                    />
                  </div>
                  <div className="col-sm-2">
                    <ErrorMessage name="email" />
                  </div>
                </div>
                <div className="form-group">
                  <label
                    htmlFor="email_verify"
                    className="col-sm-2 control-label">
                    Verify email
                  </label>
                  <div className="col-sm-10 col-lg-9">
                    <Field
                      id="email_verify"
                      type="email"
                      name="email_verify"
                      className="form-control"
                    />
                  </div>
                  <div className="col-sm-2">
                    <ErrorMessage name="email_verify" />
                  </div>
                </div>
                <div className="form-group">
                  <label className="control-label col-sm-5 col-md-4">
                    Are you an author on this publication?
                  </label>
                  <div className="col-sm-1"></div>
                  <label
                    className="radio-inline col-sm-1"
                    htmlFor="authorship_author">
                    <Field
                      id="authorship_author"
                      type="radio"
                      name="isAuthor"
                      value="yes"
                    />
                    yes
                  </label>
                  <label
                    className="radio-inline col-sm-1"
                    htmlFor="authorship_non">
                    <Field
                      id="authorship_non"
                      type="radio"
                      name="isAuthor"
                      value="no"
                    />
                    no
                  </label>
                </div>
              </div>
            </div>
          </div>
          {children}
        </Form>
      )}
    />
  )
}

export default AuthorStep

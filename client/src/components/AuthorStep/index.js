import React from 'react'
import { useService } from '@xstate/react'
import { ErrorMessage, Field, Formik, Form } from 'formik'
import { AuthorSchema } from './validation'

const AuthorStep = ({ service }) => {
  const [current, send] = useService(service)
  return (
    <>
      <div className="container">
        <div className="panel panel-primary">
          <div className="panel-heading">
            <h3 className="panel-title">Contact Information</h3>
          </div>
          <div className="panel-body">
            <Formik
              initialValues={{
                name: '',
                email: '',
                email_verify: '',
                // Formik only supports string values for radio buttons, not
                // booleans/numbers because of DOM limitations.  Convert in your
                // onSubmit handler or as needed.
                isAuthor: 'yes'
              }}
              validationSchema={AuthorSchema}
              onSubmit={(values, actions) => {
                console.log('in submit handler',values)
              }}
              render={props => (
                <Form className="form-horizontal">
                  <div className="form-group">
                    <label htmlFor="name" className="col-sm-2 control-label">
                      Name
                    </label>
                    <div className="col-sm-10 col-lg-9">
                      <Field name="name" className="form-control"/>
                    </div>
                    <div className="col-sm-2">
                      <ErrorMessage name="name"/>
                    </div>
                  </div>
                  <div className="form-group">
                    <label htmlFor="email" className="col-sm-2 control-label">
                      Email
                    </label>
                    <div className="col-sm-10 col-lg-9">
                      <Field id="email" type="email" name="email" className="form-control"/>
                    </div>
                    <div className="col-sm-2">
                      <ErrorMessage name="email"/>
                    </div>
                  </div>
                  <div className="form-group">
                    <label htmlFor="email_verify" className="col-sm-2 control-label">
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
                      <ErrorMessage name="email_verify"/>
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
                    <label className="radio-inline col-sm-1" htmlFor="authorship_non">
                      <Field
                        id="authorship_non"
                        type="radio"
                        name="isAuthor"
                        value="no"
                      />
                      no
                    </label>
                  </div>
                </Form>
              )}
            />
          </div>
        </div>
      </div>
    </>
  )
}

export default AuthorStep

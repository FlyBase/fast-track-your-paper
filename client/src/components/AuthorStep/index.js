import React from 'react'
import { ErrorMessage, Field, Formik } from 'formik'
import { AuthorSchema } from './validation'

const AuthorStep = () => (
  <>
    <div className="container">
      <div className="panel panel-primary">
        <div className="panel-heading">
          <h3 className="panel-title">Attribution</h3>
        </div>
        <div className="panel-body">
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
              <form className="form-horizontal" onSubmit={props.handleSubmit}>
                <div className="form-group">
                  <label for="" className="col-sm-2 control-label">
                    Name
                  </label>
                  <div className="col-sm-10 col-lg-9">
                    <Field name="name" className="form-control" />
                  </div>
                  <div className="col-sm-2">
                    <ErrorMessage name="name" />
                  </div>
                </div>
                <div className="form-group">
                  <label for="" className="col-sm-2 control-label">
                    Email
                  </label>
                  <div className="col-sm-10 col-lg-9">
                    <Field type="email" name="email" className="form-control" />
                  </div>
                  <div className="col-sm-2">
                    <ErrorMessage name="email" />
                  </div>
                </div>
                <div className="form-group">
                  <label for="" className="col-sm-2 control-label">
                    Verify email
                  </label>
                  <div className="col-sm-10 col-lg-9">
                    <Field
                      type="email"
                      name="email_verify"
                      className="form-control"
                    />
                  </div>
                  <div className="col-sm-2">
                    <ErrorMessage name="email" />
                  </div>
                </div>
                <div className="form-group">
                  <label className="control-label col-sm-5 col-md-4">
                    Are you an author on this publication?
                  </label>
                  <div className="col-sm-1"></div>
                  <label
                    className="radio-inline col-sm-1"
                    for="authorship_author">
                    <input
                      type="radio"
                      name="authorship"
                      id="authorship_author"
                      value="author"
                    />
                    yes
                  </label>
                  <label className="radio-inline col-sm-1" for="authorship_non">
                    <input
                      type="radio"
                      name="authorship"
                      id="authorship_non"
                      value="non"
                    />
                    no
                  </label>
                </div>
                <div className="form-group">
                  <div className="col-sm-offset-8 col-sm-4">
                    <button type="submit" class="btn btn-primary pull-right">
                      <i class="fa fa-check"></i>Submit contact information
                    </button>
                  </div>
                </div>
              </form>
            )}
          />
        </div>
      </div>
    </div>
  </>
)

export default AuthorStep

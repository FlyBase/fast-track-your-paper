import * as Yup from 'yup'

export const AuthorSchema = Yup.object().shape({
  name: Yup.string().required('Name required').nullable(),
  email: Yup.string()
    .email('Invalid email')
    .required('Email required')
    .nullable(),
  email_verify: Yup.mixed()
    .oneOf([Yup.ref('email'), null], 'Emails do not match')
    .required('Email verification is required')
    .nullable(),
  isAuthor: Yup.mixed().oneOf(['yes', 'no']).required('Authorship required'),
})

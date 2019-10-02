import * as Yup from 'yup'

export const AuthorSchema = Yup.object().shape({
  name: Yup.string().required('Name required'),
  email: Yup.string()
    .email('Invalid email')
    .required('Email required'),
  email_verify: Yup.string()
    .email('Invalid email')
    .required('Email required'),
})

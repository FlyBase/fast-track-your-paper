import * as Yup from 'yup'

export const DataFlagsSchema = Yup.object().shape({
  human_disease: Yup.boolean(),
  human_disease_text: Yup.string().when('human_disease', {
    is: true,
    then: Yup.string().required(),
    otherwise: Yup.string().notRequired(),
  }),
  new_technique: Yup.boolean(),
  new_technique_text: Yup.string()
    .max(280, 'Please enter no more than 280 characters.')
    .when('new_technique', {
      is: true,
      then: Yup.string().required(),
      otherwise: Yup.string().notRequired(),
    }),
  no_flags: Yup.boolean(),
  none_apply_text: Yup.string().max(
    280,
    'Please enter no more than 280 characters.'
  ),
})

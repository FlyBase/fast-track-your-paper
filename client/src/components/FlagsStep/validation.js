import * as Yup from 'yup'

export const DataFlagsSchema = Yup.object().shape({
  human_disease: Yup.boolean(),
  // human_disease_text: Yup.string().required(),
  human_disease_text: Yup.string().when('human_disease', {
    is: true,
    then: Yup.string().required(),
    otherwise: Yup.string().notRequired(),
  }),
})

const Yup = require('yup');
const {makeWrapResolversPlugin} = require('graphile-utils');
const {GraphQLError} = require('graphql');


const AuthorSchema = Yup.object().shape({
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



const DataFlagsSchema = Yup.object().shape({
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

// Email confirmation is a browser-only field; isAuthor is normalized by StepMachine.
const ContactPayloadSchema = AuthorSchema.pick(['name', 'email']).shape({isAuthor: Yup.boolean().required()});
module.exports = makeWrapResolversPlugin({Mutation:{submitPaper:async (resolve, source, args, context, info)=>{
  const submission=args.input.submission;
  try {
    if (!submission || typeof submission!=='object' || Array.isArray(submission)) throw Error('envelope');
    const contact=await ContactPayloadSchema.validate(submission.contact);
    const flags=await DataFlagsSchema.validate(submission.flags);
    args={...args,input:{...args.input,submission:{...submission,contact,flags}}};
  } catch(error) { throw new GraphQLError('Invalid submission fields'); }
  return resolve(source,args,context,info);
}}});

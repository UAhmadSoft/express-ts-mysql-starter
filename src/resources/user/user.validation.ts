import Joi from 'joi';

const signUp = Joi.object({
  firstName: Joi.string().max(30).required(),
  lastName: Joi.string().max(30).required(),
  email: Joi.string().email().required(),
  password: Joi.string().min(8).required(),
  passwordConfirm: Joi.string().min(8).required(),
});

const create = Joi.object({
  firstName: Joi.string().max(30).required(),
  lastName: Joi.string().max(30).required(),
  email: Joi.string().email().required(),
  password: Joi.string().min(8).required(),
  passwordConfirm: Joi.string()
    .min(8)
    .required()
    .when('password', {
      is: Joi.exist(),
      then: Joi.valid(Joi.ref('password')),
    }),
});

const login = Joi.object({
  email: Joi.string().required(),
  password: Joi.string().required(),
});

const update = Joi.object({
  firstName: Joi.string().max(30),
  lastName: Joi.string().max(30),
  email: Joi.string().email(),
});

export default { signUp, login, update, create };

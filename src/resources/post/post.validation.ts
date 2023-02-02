import Joi from 'joi';

const create = Joi.object({
  content: Joi.string().required(),
});

const update = Joi.object({
  content: Joi.string().required(),
});

export default { create, update };

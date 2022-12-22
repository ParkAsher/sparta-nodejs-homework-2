const Joi = require("joi");

const postIdValidateSchema = Joi.number().required();

const postValidateSchema = Joi.object({
    title: Joi.string().required(),
    content: Joi.string().required()
});


module.exports = { postIdValidateSchema, postValidateSchema };

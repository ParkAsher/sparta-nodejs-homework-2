const Joi = require("joi");

const postIdValidateSchema = Joi.number().required();

const postValidateSchema = Joi.object({
    title: Joi.string().required(),
    content: Joi.string().required()
});

const commentIdValidateSchem = Joi.number().required();

const commentValidateSchma = Joi.object({
    content: Joi.string().required(),
});


module.exports = { postIdValidateSchema, postValidateSchema, commentIdValidateSchem, commentValidateSchma };

const express = require("express");
const router = express.Router();
const Joi = require("joi");

/* Custom Error */
const { UserExistError } = require("../lib/CustomError.js");

/* models */
const { User } = require("../models");

const getSignUpSchema = function (nickname) {
    return Joi.object({
        nickname: Joi.string()
            .min(3)
            .max(30)
            .pattern(new RegExp('[a-z|A-Z|0-9]$'))
            .required(),
        password: Joi.string()
            .min(4)
            .pattern(new RegExp("^((?!" + nickname + ").)*$"))
            .required(),
        confirm: Joi.ref('password')
    });
}
// const signUpSchema = Joi.object({
//     nickname: Joi.string()
//         .min(3)
//         .max(30)
//         .pattern(new RegExp('[a-z|A-Z|0-9]$'))
//         .required(),
//     password: Joi.string()
//         .min(4)
//         .pattern(new RegExp("^((?!" + Joi.ref('nickname') + ").)*$"))
//         .required(),
//     confirm: Joi.ref('password'),
// })

// 회원가입 API
router.post("/signup", async (req, res, next) => {
    try {
        const { nickname, password, confirm } = await getSignUpSchema(req.body.nickname).validateAsync(req.body);

        const existUsers = await User.findAll({
            where: { nickname },
        });
        if (existUsers.length) {
            const err = new UserExistError();
            next(err);
        }

        await User.create({ nickname, password, confirm });
        return res.status(201).json({ success: true, message: "회원가입에 성공하였습니다." })

    } catch (err) {
        next(err);
    }
})

module.exports = router;
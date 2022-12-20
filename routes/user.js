const express = require("express");
const router = express.Router();
const Joi = require("joi");
const jwt = require("jsonwebtoken");
const cookieParser = require("cookie-parser");

/* Custom Error */
const { UserExistError, UserNotExistError } = require("../lib/CustomError.js");

/* models */
const { User } = require("../models");

/* Joi Schema */
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
            throw err;
        }

        await User.create({ nickname, password, confirm });
        return res.status(201).json({ success: true, message: "회원가입에 성공하였습니다." })

    } catch (err) {
        next(err);
    }
})

// 로그인 API
router.post("/auth", async (req, res, next) => {
    try {
        const { nickname, password } = req.body;

        const user = await User.findOne({
            where: { nickname }
        });

        if (!user || password !== user.password) {
            const err = new UserNotExistError();
            throw err;
        }

        // 유저번호 + 유저닉네임, 1day
        const accessToken = jwt.sign(
            {
                userId: user.userId,
                nickname: user.nickname
            },
            "sparta-secret-key",
            { expiresIn: '1d' }
        )

        // Access Token in Cookie 
        res.cookie('accessToken', accessToken);

        return res.status(200).send({ success: true, accessToken })

    } catch (err) {
        next(err);
    }
})

module.exports = router;
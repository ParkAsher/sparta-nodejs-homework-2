const express = require("express");
const router = express.Router();
const Joi = require("joi");
const jwt = require("jsonwebtoken");

/* Custom Error */
const { UserNotExistError, TokenAlreadyExistError } = require("../lib/CustomError.js");

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
/**
 * @swagger
 * paths:
 *      /api/signup:
 *       post:
 *          description: 회원가입
 *          produces:
 *              - application/json
 *          parameters:
 *              - in: body
 *                name: body
 *                required: true
 *                schema:
 *                  type: object
 *                  properties:
 *                      nickname:
 *                          type: string
 *                      password:
 *                          type: string
 *                      confirm:
 *                          type: string
 */
router.post("/signup", async (req, res, next) => {
    try {
        // 이미 로그인되어 토큰이 발급되었다면?
        if (req.cookies.accessToken) {
            const err = new TokenAlreadyExistError();
            throw err;
        }
        console.log(req.body);
        const { nickname, password, confirm } = await getSignUpSchema(req.body.nickname).validateAsync(req.body);

        // const existUsers = await User.findAll({
        //     where: { nickname },
        // });
        // if (existUsers.length) {
        //     const err = new UserExistError();
        //     throw err;
        // }

        // nickname 이 unique면 sequelize error 를 return한다.
        await User.create({ nickname, password, confirm });
        return res.status(201).json({ success: true, message: "회원가입에 성공하였습니다." })

    } catch (err) {
        next(err);
    }
})

// 로그인 API
router.post("/auth", async (req, res, next) => {
    try {
        // 이미 로그인되어 토큰이 발급되었다면?
        if (req.cookies.accessToken) {
            const err = new TokenAlreadyExistError();
            throw err;
        }

        const { nickname, password } = req.body;

        const user = await User.findOne({
            where: { nickname }
        });

        if (!user || password !== user.password) {
            const err = new UserNotExistError();
            throw err;
        }

        // 유저 고유번호, 1day
        const accessToken = jwt.sign(
            {
                userId: user.userId
            },
            "sparta-secret-key",
            { expiresIn: '1d' }
        )

        // Access Token in Cookie 
        res.cookie('accessToken', accessToken);
        return res.status(200).json({ success: true, accessToken });

    } catch (err) {
        next(err);
    }
})

module.exports = router;
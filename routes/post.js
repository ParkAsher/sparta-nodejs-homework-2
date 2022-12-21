const express = require("express");
const router = express.Router();
const Joi = require("joi");

/* middleware */
const authMiddleware = require("../middlewares/AuthMiddleware.js");

/* models */
const { Post } = require("../models");

// 게시글 작성 API
router.post("/posts", authMiddleware, async (req, res, next) => {
    // Joi Schema
    const postSchema = Joi.object({
        title: Joi.string().required(),
        content: Joi.string().required()
    })

    try {
        const { userId } = res.locals.user.dataValues;
        const { title, content } = await postSchema.validateAsync(req.body);

        await Post.create({ title, content, userId });
        res.status(200).json({ success: true, message: "게시글 작성에 성공하였습니다." })

    } catch (err) {
        next(err);
    }
})


module.exports = router;
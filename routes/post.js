const express = require("express");
const router = express.Router();
const Joi = require("joi");
const { PostsNotExistError, PostNotExistError } = require("../lib/CustomError.js");

/* middleware */
const authMiddleware = require("../middlewares/AuthMiddleware.js");

/* models */
const { User, Post } = require("../models");

// 게시글 조회 API
router.get("/posts", async (req, res, next) => {
    try {
        // required: true -> Inner Join ,  false -> Left Outer Join
        const posts = await Post.findAll({
            include: [
                {
                    model: User,
                    attributes: ['nickname'],
                    required: true,
                }
            ],
        });
        if (posts.length === 0) {
            const err = new PostsNotExistError();
            throw err;
        }

        res.status(200).json({ success: true, posts });
    } catch (err) {
        next(err);
    }
})

// 게시글 작성 API
router.post("/post", authMiddleware, async (req, res, next) => {
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

// 게시글 상세 조회 API
router.get("/post/:postId", async (req, res, next) => {
    // Joi Schema
    const postIdSchema = Joi.number().required();

    try {
        const postId = await postIdSchema.validateAsync(req.params.postId);

        const post = await Post.findOne({
            where: { postId },
            include: [
                {
                    model: User,
                    attributes: ['nickname'],
                    required: true,
                }
            ],
        });
        if (!post) {
            const err = new PostNotExistError();
            throw err;
        }

        res.status(200).json({ success: true, post });
    } catch (err) {
        next(err);
    }
})


module.exports = router;
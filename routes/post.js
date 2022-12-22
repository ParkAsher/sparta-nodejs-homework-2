const express = require("express");
const router = express.Router();

/* middleware */
const authMiddleware = require("../middlewares/AuthMiddleware.js");

/* lib */
const { postIdValidateSchema, postValidateSchema } = require("../lib/JoiSchema.js");
const {
    PostsNotExistError,
    PostNotExistError,
    PostNotMatchAuthorError,
} = require("../lib/CustomError.js");

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
                    attributes: ["nickname"],
                    required: true,
                },
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
});

// 게시글 작성 API
router.post("/post", authMiddleware, async (req, res, next) => {
    try {
        const { userId } = res.locals.user.dataValues;
        const { title, content } = await postValidateSchema.validateAsync(req.body);

        await Post.create({ title, content, userId });
        res.status(200).json({ success: true, message: "게시글 작성에 성공하였습니다." });
    } catch (err) {
        next(err);
    }
});

// 게시글 상세 조회 API
router.get("/post/:postId", async (req, res, next) => {
    try {
        const postId = await postIdValidateSchema.validateAsync(req.params.postId);

        const post = await Post.findOne({
            where: { postId },
            include: [
                {
                    model: User,
                    attributes: ["nickname"],
                    required: true,
                },
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
});

// 게시글 수정 API
router.put("/post/:postId", authMiddleware, async (req, res, next) => {
    try {
        const postId = await postIdValidateSchema.validateAsync(req.params.postId);

        // 게시글 정보 불러오기
        const post = await Post.findOne({
            where: { postId },
        });
        // 해당 번호의 게시글이 존재하지 않음;
        if (!post) {
            const err = new PostNotExistError();
            throw err;
        }
        // 해당 게시글 작성자가 아니면 수정 X
        const { userId } = res.locals.user.dataValues; // 현재 로그인 되어있는 유저의 번호
        if (userId !== post.userId) {
            const err = new PostNotMatchAuthorError();
            throw err;
        }

        const { title, content } = await postValidateSchema.validateAsync(req.body);

        await Post.update({ title, content }, { where: { postId } });
        res.status(200).json({ success: true, message: "게시글을 수정하였습니다." });
    } catch (err) {
        next(err);
    }
});

// 게시글 삭제 API
router.delete("/post/:postId", authMiddleware, async (req, res, next) => {
    try {
        const postId = await postIdValidateSchema.validateAsync(req.params.postId);

        // 게시글 정보 불러오기
        const post = await Post.findOne({
            where: { postId },
        });
        // 해당 번호의 게시글이 존재하지 않음;
        if (!post) {
            const err = new PostNotExistError();
            throw err;
        }
        // 해당 게시글 작성자가 아니면 삭제 X
        const { userId } = res.locals.user.dataValues; // 현재 로그인 되어있는 유저의 번호
        if (userId !== post.userId) {
            const err = new PostNotMatchAuthorError();
            throw err;
        }

        await Post.destroy({
            where: { postId }
        });
        res.status(200).json({ success: true, message: "게시글을 삭제하였습니다." });
    } catch (err) {
        next(err);
    }
})

module.exports = router;

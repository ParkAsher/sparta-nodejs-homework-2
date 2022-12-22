const express = require("express");
const router = express.Router();

/* middleware */
const authMiddleware = require("../middlewares/AuthMiddleware.js");

/* lib */
const { postIdValidateSchema, commentValidateSchma, commentIdValidateSchem } = require("../lib/JoiSchema.js");
const { PostNotExistError, CommentNotExistError, CommentNotMatchAuthorError } = require("../lib/CustomError.js");

/* models */
const { User, Comment, Post } = require("../models");


// 댓글 작성 API
router.post("/post/:postId/comment", authMiddleware, async (req, res, next) => {
    try {
        const postId = await postIdValidateSchema.validateAsync(req.params.postId);

        // 게시글이 존재하는지
        const post = await Post.findOne({
            where: { postId }
        });
        // 존재하지 않을 때
        if (!post) {
            const err = new PostNotExistError();
            throw err;
        }

        const { userId } = res.locals.user.dataValues;      // 로그인 되어있는 유저의 번호
        const { content } = await commentValidateSchma.validateAsync(req.body);

        await Comment.create({ content, userId, postId });
        res.status(200).json({ success: true, message: "댓글을 작성하였습니다." });
    } catch (err) {
        next(err);
    }
})

// 댓글 목록 조회 API
router.get("/post/:postId/comments", async (req, res, next) => {
    try {
        const postId = await postIdValidateSchema.validateAsync(req.params.postId);

        // 게시글이 존재하는지
        const post = await Post.findOne({
            where: { postId }
        });
        // 존재하지 않을 때
        if (!post) {
            const err = new PostNotExistError();
            throw err;
        }

        const comments = await Comment.findAll({
            order: [['createdAt', 'DESC']],
            where: { postId },
            include: [
                {
                    model: User,
                    attributes: ["nickname"],
                    required: true,
                }
            ]
        });

        res.status(200).json({ success: true, comments });
    } catch (err) {
        next(err);
    }
})

// 댓글 삭제 API
router.delete("/comment/:commentId", authMiddleware, async (req, res, next) => {
    try {
        const commentId = await commentIdValidateSchem.validateAsync(req.params.commentId);

        // 해당하는 댓글이 존재하는지 검사
        const comment = await Comment.findOne({
            where: { commentId }
        });
        if (!comment) {
            const err = new CommentNotExistError();
            throw err;
        }

        // 로그인 된 유저가 댓글의 작성자인지 검사
        const { userId } = res.locals.user.dataValues;      // 로그인 되어있는 유저의 번호        
        if (userId !== comment.userId) {
            const err = new CommentNotMatchAuthorError();
            throw err;
        }

        await Comment.destroy({
            where: [{ commentId, userId }]
        });
        res.status(200).json({ success: true, message: "댓글을 삭제하였습니다." });
    } catch (err) {
        next(err);
    }
})

// 댓글 수정 API
router.put("/comment/:commentId", authMiddleware, async (req, res, next) => {
    try {
        const commentId = await commentIdValidateSchem.validateAsync(req.params.commentId);

        // 해당하는 댓글이 존재하는지 검사
        const comment = await Comment.findOne({
            where: { commentId }
        });
        if (!comment) {
            const err = new CommentNotExistError();
            throw err;
        }

        // 로그인 된 유저가 댓글의 작성자인지 검사
        const { userId } = res.locals.user.dataValues;      // 로그인 되어있는 유저의 번호        
        if (userId !== comment.userId) {
            const err = new CommentNotMatchAuthorError();
            throw err;
        }

        const { content } = await commentValidateSchma.validateAsync(req.body);

        await Comment.update({ content }, { where: [{ commentId }, { userId }] });
        res.status(200).json({ success: true, message: "댓글을 수정하였습니다." })
    } catch (err) {
        next(err);
    }
});

module.exports = router;
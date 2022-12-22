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
const { User, Post, Like } = require("../models");

// 게시글 목록 조회 API
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

// 게시글 좋아요 API
router.put("/post/:postId/like", authMiddleware, async (req, res, next) => {
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

        const { userId } = res.locals.user.dataValues; // 현재 로그인 되어있는 유저의 번호

        // 로그인 한 유저가 해당 게시글을 좋아요 한 적이 있는지?
        const isLike = await Like.findOne({
            where: [{ userId }, { postId }],
        });
        if (!isLike) {
            // 좋아요 한 적 없다면? 좋아요 해주자.
            // 1. post table 해당 게시글 좋아요 수 update + 1
            // 2. like table 유저번호, 게시글 번호 insert
            await Post.increment({ likes: 1 }, { where: { postId } });
            await Like.create({ userId, postId });
            res.status(200).json({ success: true, message: "게시글의 좋아요를 등록하였습니다." });
        } else {
            // 좋아요 한 적 있다면? 좋아요 취소해주자
            // 1. post table 해당 게시글 좋아요 수 update - 1
            // 2. like table 유저번호, 게시글 번호 delete
            await Post.decrement({ likes: 1 }, { where: { postId } });
            await Like.destroy({
                where: [{ userId }, { postId }]
            })
            res.status(200).json({ success: true, message: "게시글의 좋아요를 취소하였습니다." });
        }
    } catch (err) {
        next(err);
    }
})

// 내가 좋아요 누른 게시글 목록 API
router.get("/posts/like", authMiddleware, async (req, res, next) => {
    try {

        const { userId } = res.locals.user.dataValues; // 현재 로그인 되어있는 유저의 번호

        /*
            Likes table 에서 유저번호를 조건으로 
            게시글 번호를 매칭시켜 Posts table을 inner join,
            
            게시글 작성자 닉네임 뽑아오기 위해, Posts table의 userId 외래키를 매칭시켜,
            Users table과 inner join,
            
            뽑아올때, Posts table의 likes(좋아요수)를 order by DESC
        */
        const likePosts = await Like.findAll({
            where: { userId },
            attributes: [],
            include: [
                {
                    model: Post,
                    required: true,
                    include: [
                        {
                            model: User,
                            required: true,
                            attributes: ['nickname'],
                        }
                    ],

                },
            ],
            order: [[{ model: Post }, 'likes', 'DESC']],
            // [ 'likes', 'DESC' ] -> order by likes, desc
            // [ ['likes', 'DESC'] ] -> order by likes DESC
        });

        res.status(200).json({ success: true, likePosts });
    } catch (err) {
        next(err);
    }
})

module.exports = router;

const ErrorHandler = (err, req, res, next) => {
    console.log("Middleware Error Handling");
    console.log(err);

    // 토큰 유효성 검사 Middleware Error Handling
    if (err.name === "TokenNotExistError") {
        res.status(401).json({ success: false, errorMessage: "로그인이 필요합니다." });
        return;
    }

    // 이미 토큰이 발급되어 있을때 Error Handling
    if (err.name === "TokenAlreadyExistError") {
        res.status(400).json({ success: false, errorMessage: "이미 로그인이 되어있습니다." });
        return;
    }

    // 회원가입 API Error Handling
    if (req.route.path === "/signup") {
        // Joi
        if (err.name === "ValidationError") {
            res.status(412);
            if (err.details[0].path[0] === "nickname") {
                res.json({ success: false, errorMessage: "닉네임의 형식이 일치하지 않습니다." });
                return;
            }
            if (err.details[0].path[0] === "password") {
                if (err.details[0].type === "string.pattern.base") {
                    res.json({ success: false, errorMessage: "패스워드에 닉네임이 포함되어 있습니다." });
                    return;
                }
                res.json({ success: false, errorMessage: "패스워드 형식이 일치하지 않습니다." });
                return;
            }
            if (err.details[0].path[0] === "confirm") {
                res.json({ success: false, errorMessage: "패스워드가 일치하지 않습니다." });
                return;
            }
        }
        // 닉네임 중복
        if (err.name === "SequelizeUniqueConstraintError") {
            res.status(412).json({ success: false, errorMessage: "중복된 닉네임입니다." });
            return;
        }
        // else
        res.status(400).json({ success: false, errorMessage: "요청한 데이터 형식이 올바르지 않습니다." });
        return;
    }

    // 로그인 API Error Handling
    if (req.route.path === "/auth") {
        // 유저가 존재하지 않을때
        if (err.name === "UserNotExistError") {
            res.status(412).json({ success: false, errorMessage: "닉네임 또는 패스워드를 확인해주세요." });
            return;
        }
        // else
        res.status(400).json({ success: false, errorMessage: "로그인에 실패하였습니다." });
        return;
    }

    // 게시글 목록 조회 API Error Handling
    if (req.route.path === "/posts") {
        if (err.name === "PostsNotExistError") {
            res.status(400).json({ success: false, errorMessage: "게시글이 존재하지 않습니다." });
            return;
        }
        res.status(400).json({ success: false, errorMessage: "게시글 조회에 실패하였습니다." });
        return;
    }

    // 게시글 작성 API Error Handling
    if (req.route.path === "/post") {
        // Joi
        if (err.name === "ValidationError") {
            res.status(412);
            if (err.details[0].path[0] === "title") {
                res.json({ success: false, errorMessage: "게시글 제목의 형식이 일치하지 않습니다." });
                return;
            }
            if (err.details[0].path[0] === "content") {
                res.json({ success: false, errorMessage: "게시글 내용의 형식이 일치하지 않습니다." });
                return;
            }
        }
        // else
        res.status(400).json({ success: false, errorMessage: "게시글 작성에 실패하였습니다." });
        return;
    }

    if (req.route.path === "/post/:postId") {
        // 게시글 상세 조회 API Error Handling
        if (req.method === "GET") {
            // Joi
            if (err.name === "ValidationError") {
                res.status(400).json({ success: false, errorMessage: "게시글 번호 형식이 올바르지 않습니다." });
                return;
            }
            if (err.name === "PostNotExistError") {
                res.status(400).json({ success: false, errorMessage: "게시글이 존재하지 않습니다." });
                return;
            }
            // else
            res.status(400).json({ success: false, errorMessage: "게시글 조회에 실패하였습니다." });
            return;
        }
        // 게시글 수정 API Error Handling
        if (req.method === "PUT") {
            // Joi
            if (err.name === "ValidationError") {
                if (err.details[0].type === "number.base") {
                    res.status(412).json({ success: false, errorMessage: "게시글 번호 형식이 올바르지 않습니다." });
                    return;
                }
                if (err.details[0].path[0] === "title") {
                    res.status(412).json({ success: false, errorMessage: "게시글 제목의 형식이 일치하지 않습니다." });
                    return;
                }
                if (err.details[0].path[0] === "content") {
                    res.status(412).json({ success: false, errorMessage: "게시글 내용의 형식이 일치하지 않습니다." });
                    return;
                }
            }
            // 게시글 존재 x
            if (err.name === "PostNotExistError") {
                res.status(400).json({ success: false, errorMessage: "게시글이 존재하지 않습니다." });
                return;
            }
            // 게시글 작성자가 아닐때
            if (err.name === "PostNotMatchAuthorError") {
                res.status(400).json({ success: false, errorMessage: "게시글 작성자가 아닙니다." });
                return;
            }
            // else
            res.status(400).json({ success: false, errorMessage: "게시글 수정에 실패하였습니다." });
            return;
        }
        // 게시글 삭제 API Error Handling
        if (req.method === "DELETE") {
            // Joi
            if (err.name === "ValidationError") {
                if (err.details[0].type === "number.base") {
                    res.status(412).json({ success: false, errorMessage: "게시글 번호 형식이 올바르지 않습니다." });
                    return;
                }
            }
            // 게시글 존재 x
            if (err.name === "PostNotExistError") {
                res.status(404).json({ success: false, errorMessage: "게시글이 존재하지 않습니다." });
                return;
            }
            // 게시글 작성자가 아닐때
            if (err.name === "PostNotMatchAuthorError") {
                res.status(400).json({ success: false, errorMessage: "게시글 작성자가 아닙니다." });
                return;
            }
            // else
            res.status(400).json({ success: false, errorMessage: "게시글 삭제에 실패하였습니다." });
            return;
        }
    }

    // 게시글 좋아요 API Error Handling
    if (req.route.path === "/post/:postId/like") {
        // Joi
        if (err.name === "ValidationError") {
            if (err.details[0].type === "number.base") {
                res.status(412).json({ success: false, errorMessage: "게시글 번호 형식이 올바르지 않습니다." });
                return;
            }
        }
        // 게시글 존재 x
        if (err.name === "PostNotExistError") {
            res.status(404).json({ success: false, errorMessage: "게시글이 존재하지 않습니다." });
            return;
        }
        // else
        res.status(400).json({ success: false, errorMessage: "게시글 좋아요에 실패하였습니다." });
        return;
    }

    // 내가 좋아요 누른 게시글 목록 API Error Handling
    if (req.route.path === "/posts/like") {
        res.status(400).json({ success: false, errorMessage: "좋아요 한 게시글 조회에 실패하였습니다." });
        return;
    }

    // 댓글 작성 API Error Handling
    if (req.route.path === "/post/:postId/comment") {
        //Joi
        if (err.name === "ValidationError") {
            if (err.details[0].type === "number.base") {
                res.status(412).json({ success: false, errorMessage: "게시글 번호 형식이 올바르지 않습니다." });
                return;
            }
            if (err.details[0].path[0] === "content") {
                res.status(412).json({ success: false, errorMessage: "댓글 내용의 형식이 일치하지 않습니다." });
                return;
            }
        }
        // 게시글 존재 x
        if (err.name === "PostNotExistError") {
            res.status(404).json({ success: false, errorMessage: "게시글이 존재하지 않습니다." });
            return;
        }
    }

    // 댓글 목록 조회 API Error Handling
    if (req.route.path === "/post/:postId/comments") {
        //Joi
        if (err.name === "ValidationError") {
            if (err.details[0].type === "number.base") {
                res.status(412).json({ success: false, errorMessage: "게시글 번호 형식이 올바르지 않습니다." });
                return;
            }
        }
        // else
        res.status(400).json({ success: false, errorMessage: "댓글 조회에 실패하였습니다." });
        return;
    }

    if (req.route.path === "/comment/:commentId") {
        // 댓글 삭제 API Error Handling
        if (req.method === "DELETE") {
            //Joi
            if (err.name === "ValidationError") {
                res.status(412).json({ success: false, errorMessage: "댓글 번호 형식이 올바르지 않습니다." });
                return;
            }
            // 댓글 존재 x
            if (err.name === "CommentNotExistError") {
                res.status(404).json({ success: false, errorMessage: "댓글이 존재하지 않습니다." });
                return;
            }
            // 댓글 작성자가 아닐 때
            if (err.name === "CommentNotMatchAuthorError") {
                res.status(400).json({ success: false, errorMessage: "댓글 작성자가 아닙니다." });
                return;
            }
            // else
            res.status(400).json({ success: false, errorMessage: "댓글 삭제에 실패하였습니다." });
            return;
        }
        // 댓글 수정 API Error Handling
        if (req.method === "PUT") {
            //Joi
            if (err.name === "ValidationError") {
                if (err.details[0].type === "number.base") {
                    res.status(412).json({ success: false, errorMessage: "댓글 번호 형식이 올바르지 않습니다." });
                    return;
                }
                if (err.details[0].path[0] === "content") {
                    res.status(412).json({ success: false, errorMessage: "댓글 내용의 형식이 일치하지 않습니다." });
                    return;
                }
            }
            // 댓글 존재 x
            if (err.name === "CommentNotExistError") {
                res.status(404).json({ success: false, errorMessage: "댓글이 존재하지 않습니다." });
                return;
            }
            // 댓글 작성자가 아닐 때
            if (err.name === "CommentNotMatchAuthorError") {
                res.status(400).json({ success: false, errorMessage: "댓글 작성자가 아닙니다." });
                return;
            }
            // else
            res.status(400).json({ success: false, errorMessage: "댓글 수정에 실패하였습니다." });
            return;
        }
    }
};

module.exports = ErrorHandler;

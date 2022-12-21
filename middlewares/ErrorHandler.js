
const ErrorHandler = (err, req, res, next) => {
    console.log("Middleware Error Handling");

    // 토큰 유효성 검사 Middleware Error Handling
    if (err.name === "TokenNotExistError") return res.status(401).json({ success: false, errorMessage: "로그인이 필요합니다." });

    // 이미 토큰이 발급되어 있을때 Error Handling
    if (err.name === 'TokenAlreadyExistError') {
        return res.status(400).json({ success: false, errorMessage: "이미 로그인이 되어있습니다." });
    }

    // 회원가입 API Error Handling
    if (req.route.path === '/signup') {
        // Joi
        if (err.name === 'ValidationError') {
            res.status(412);
            if (err.details[0].path[0] === 'nickname') {
                res.json({ success: false, errorMessage: "닉네임의 형식이 일치하지 않습니다." });
                return;
            }
            if (err.details[0].path[0] === 'password') {
                if (err.details[0].type === 'string.pattern.base') {
                    res.json({ success: false, errorMessage: "패스워드에 닉네임이 포함되어 있습니다." });
                    return;
                }
                res.json({ success: false, errorMessage: "패스워드 형식이 일치하지 않습니다." });
                return;
            }
            if (err.details[0].path[0] === 'confirm') {
                res.json({ success: false, errorMessage: "패스워드가 일치하지 않습니다." });
                return;
            }
        }
        // 닉네임 중복
        if (err.name === 'SequelizeUniqueConstraintError') {
            res.status(412).json({ success: false, errorMessage: "중복된 닉네임입니다." });
            return;
        }

        // else 
        res.status(400).json({ success: false, errorMessage: "요청한 데이터 형식이 올바르지 않습니다." });
        return;
    }

    // 로그인 API Error Handling
    if (req.route.path === '/auth') {
        // 유저가 존재하지 않을때
        if (err.name === 'UserNotExistError') {
            res.status(412).json({ success: false, errorMessage: "닉네임 또는 패스워드를 확인해주세요." });
            return;
        }
        // else
        res.status(400).json({ success: false, errorMessage: "로그인에 실패하였습니다." });
        return;
    }

    // 게시글 작성 API Error Handling
    if (req.route.path === "/posts") {
        console.log(err);
        // Joi
        if (err.name === 'ValidationError') {
            res.status(412);
            if (err.details[0].path[0] === 'title') {
                res.json({ success: false, errorMessage: "게시글 제목의 형식이 일치하지 않습니다." });
                return;
            }
            if (err.details[0].path[0] === 'content') {
                res.json({ success: false, errorMessage: "게시글 내용의 형식이 일치하지 않습니다." });
                return;
            }
        }
        // else
        res.status(400).json({ success: false, errorMessage: "게시글 작성에 실패하였습니다." });
        return;
    }

}

module.exports = ErrorHandler;
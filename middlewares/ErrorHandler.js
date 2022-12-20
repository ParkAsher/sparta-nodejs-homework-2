
const ErrorHandler = (err, req, res, next) => {
    console.log("Middleware Error Handling");

    // 회원가입 API Error Handling
    if (req.route.path === '/signup') {
        // Joi
        if (err.name === 'ValidationError') {
            res.status(412);
            if (err.details[0].path[0] === 'nickname') {
                return res.json({ success: false, errorMessage: "닉네임의 형식이 일치하지 않습니다." });
            }
            if (err.details[0].path[0] === 'password') {
                if (err.details[0].type === 'string.pattern.base') {
                    return res.json({ success: false, errorMessage: "패스워드에 닉네임이 포함되어 있습니다." });
                }
                return res.json({ success: false, errorMessage: "패스워드 형식이 일치하지 않습니다." });
            }
            if (err.details[0].path[0] === 'confirm') {
                return res.json({ success: false, errorMessage: "패스워드가 일치하지 않습니다." })
            }
        }

        // User Exist
        if (err.name === 'UserExistError') {
            return res.status(412).json({ success: false, errorMessage: "중복된 닉네임입니다." })
        }

        // else 
        return res.status(400).json({ success: false, errorMessage: "요청한 데이터 형식이 올바르지 않습니다." })
    }

    // 로그인 API Error Handling
    if (req.route.path === '/auth') {

        // User Not Exist
        if (err.name === 'UserNotExistError') {
            return res.status(412).json({ success: false, errorMessage: "닉네임 또는 패스워드를 확인해주세요." });
        }

        return res.status(400).json({ success: false, errorMessage: "로그인에 실패하였습니다." });
    }

}

module.exports = ErrorHandler;
const jwt = require("jsonwebtoken");

/* models */
const { User } = require("../models");

/* Custom Error */
const { TokenNotExistError } = require("../lib/CustomError.js");

module.exports = async (req, res, next) => {

    try {
        const token = req.cookies.accessToken;
        if (!token) {
            const err = new TokenNotExistError();
            throw err;
        }

        const { userId } = jwt.verify(token, "sparta-secret-key");

        const user = await User.findByPk(userId);

        res.locals.user = user;
        next();

    } catch (err) {
        next(err);
    }
}
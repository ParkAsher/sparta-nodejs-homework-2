/* Custom Error */
class UserExistError extends Error {
    constructor(message) {
        super(message);
        this.name = "UserExistError";
    }
}

class UserNotExistError extends Error {
    constructor(message) {
        super(message);
        this.name = "UserNotExistError";
    }
}

module.exports = { UserExistError, UserNotExistError };
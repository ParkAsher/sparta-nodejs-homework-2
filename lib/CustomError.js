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

class TokenAlreadyExistError extends Error {
    constructor(message) {
        super(message);
        this.name = "TokenAlreadyExistError";
    }
}

class TokenNotExistError extends Error {
    constructor(message) {
        super(message);
        this.name = "TokenNotExistError";
    }
}

class PostsNotExistError extends Error {
    constructor(message) {
        super(message);
        this.name = "PostsNotExistError";
    }
}

module.exports = { UserExistError, UserNotExistError, TokenNotExistError, TokenAlreadyExistError, PostsNotExistError };
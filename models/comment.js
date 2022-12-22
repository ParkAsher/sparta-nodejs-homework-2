'use strict';
const {
    Model, DATE
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
    class Comment extends Model {
        /**
         * Helper method for defining associations.
         * This method is not a part of Sequelize lifecycle.
         * The `models/index` file will call this method automatically.
         */
        static associate(models) {
            // define association here
            models.Comment.belongsTo(models.Post, { foreignKey: "postId" });
            models.Comment.belongsTo(models.User, { foreignKey: "userId" });
        }
    }
    Comment.init({
        commentId: {
            primaryKey: true,
            allowNull: false,
            autoIncrement: true,
            type: DataTypes.INTEGER,
        },
        content: {
            allowNull: false,
            type: DataTypes.TEXT,
        }
    }, {
        sequelize,
        modelName: 'Comment',
    });
    return Comment;
};
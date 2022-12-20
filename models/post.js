'use strict';
const {
    Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
    class Post extends Model {
        /**
         * Helper method for defining associations.
         * This method is not a part of Sequelize lifecycle.
         * The `models/index` file will call this method automatically.
         */
        static associate(models) {
            // define association here
            models.Post.belongsTo(models.User, { foreignKey: 'userId' });
            models.Post.hasMany(models.Comment, { foreignKey: 'postId' });
        }
    }
    Post.init({
        postId: {
            primaryKey: true,
            autoIncrement: true,
            allowNull: false,
            type: DataTypes.INTEGER,
        },
        title: {
            allowNull: false,
            type: DataTypes.STRING,
        },
        content: {
            allowNull: false,
            type: DataTypes.TEXT,
        }
    }, {
        sequelize,
        modelName: 'Post',
    });
    return Post;
};
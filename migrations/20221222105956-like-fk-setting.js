'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
    async up(queryInterface, Sequelize) {
        /**
         * Add altering commands here.
         *
         * Example:
         * await queryInterface.createTable('users', { id: Sequelize.INTEGER });
         */
        // 좋아요 누른사람 외래키
        await queryInterface.addColumn("Likes", "userId", {
            allowNull: false,
            type: Sequelize.INTEGER,
        });
        await queryInterface.addConstraint("Likes", {
            fields: ['userId'],
            type: 'foreign key',
            name: "Users_Likes_id_fk",
            references: {
                table: "Users",
                field: "userId",
            },
            onDelete: "cascade",
            onUpdate: "cascade",
        });

        // 좋아요 누른 게시글 번호 외래키
        await queryInterface.addColumn("Likes", "postId", {
            allowNull: false,
            type: Sequelize.INTEGER,
        });
        await queryInterface.addConstraint("Likes", {
            fields: ['postId'],
            type: 'foreign key',
            name: "Posts_Likes_id_fk",
            references: {
                table: "Posts",
                field: "postId"
            },
            onDelete: "cascade",
            onUpdate: "cascade",
        });
    },

    async down(queryInterface, Sequelize) {
        /**
         * Add reverting commands here.
         *
         * Example:
         * await queryInterface.dropTable('users');
         */
        await queryInterface.removeColumn("Likes", "userId");
        await queryInterface.removeColumn("Likes", "postId");
    }
};

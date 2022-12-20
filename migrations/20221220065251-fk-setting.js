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
        // 게시글 작성자 외래키
        // await queryInterface.addColumn("Posts", "userId", {
        //     type: Sequelize.INTEGER,
        // });
        // await queryInterface.addConstraint("Posts", {
        //     fields: ['userId'],
        //     type: 'foreign key',
        //     name: "Users_Posts_id_fk",
        //     references: {
        //         table: "Users",
        //         field: "userId"
        //     },
        //     onDelete: "cascade",
        //     onUpdate: "cascade",
        // });

        // 댓글 작성자 외래키
        // await queryInterface.addColumn("Comments", "userId", {
        //     type: Sequelize.INTEGER,
        // });
        // await queryInterface.addConstraint("Comments", {
        //     fields: ['userId'],
        //     type: 'foreign key',
        //     name: 'Users_Comments_id_fk',
        //     references: {
        //         table: "Users",
        //         field: "userId",
        //     },
        //     onDelete: "cascade",
        //     onUpdate: "cascade",
        // });

        // 댓글 어느 게시글에 달렸는지 왜래키
        await queryInterface.addColumn("Comments", "postId", {
            type: Sequelize.INTEGER
        });
        await queryInterface.addConstraint("Comments", {
            fields: ['postId'],
            type: 'foreign key',
            name: 'Posts_Comments_id_fk',
            references: {
                table: "Posts",
                field: "postId",
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
        // await queryInterface.removeColumn("Posts", "userId");
        // await queryInterface.removeColumn("Comments", "userId");
        await queryInterface.removeColumn("Comments", "postId");
    }
};

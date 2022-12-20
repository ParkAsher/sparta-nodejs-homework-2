const express = require("express");
const app = express();
const port = 5000;

/* swagger */
const swaggerUi = require("swagger-ui-express");
const swaggerJsdoc = require("swagger-jsdoc");
const option = {
    definition: {
        openapi: '3.0.0',
        info: {
            title: 'nodejs-skill-homework',
            version: '1.0.0',
            description: 'API Test with Express.js'
        },
    },
    apis: ['./routes/*.js'],
};
const spec = swaggerJsdoc(option);
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(spec));

app.listen(port, () => {
    console.log(`App Listening on Port ${port}`);
})
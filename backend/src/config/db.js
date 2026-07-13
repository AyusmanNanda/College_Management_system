const { Pool } = require("pg");

const pool = new Pool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    port: Number(process.env.DB_PORT) || 5432,
    max: 10,
    ssl: process.env.DB_SSL === "true"
        ? {
            rejectUnauthorized: false
        }
        : false
});

module.exports = pool;

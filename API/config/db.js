const { Pool } = require('pg');

const pool = new Pool({
    user: 'postgres',
    host: 'localhost',
    database: 'Dados_Jacarei',
    password: '123',
    port: 5432,
});

module.exports = pool;

const pool = require('../config/db');
const { removeZCoordinate } = require('../utils/geoUtils');

// ------------------------- Função para buscar dados em formato GeoJSON -------------------------
async function buscarGeoJSON(tabela) {
    const colunasQuery = `
        SELECT column_name 
        FROM information_schema.columns 
        WHERE table_name = $1 AND column_name != 'geom';
    `;
    const colunasRes = await pool.query(colunasQuery, [tabela]);
    const colunas = colunasRes.rows.map(row => `"${row.column_name}"`);

    if (colunas.length === 0) {
        throw new Error(`A tabela "${tabela}" não possui colunas além de 'geom'`);
    }

    const selectColunas = colunas.join(', ');

    const query = `
        SELECT ${selectColunas}, ST_AsGeoJSON(ST_Transform(geom, 4326)) AS geom 
        FROM "${tabela}"
    `;

    const { rows } = await pool.query(query);

    const features = rows.map(row => {
        const properties = {};
        colunas.forEach(coluna => {
            const cleanColumn = coluna.replace(/"/g, '');
            properties[cleanColumn] = row[cleanColumn];
        });

        return {
            type: 'Feature',
            properties,
            geometry: removeZCoordinate(JSON.parse(row.geom))
        };
    });

    return {
        type: 'FeatureCollection',
        features
    };
}

// ------------------------- Lista todas as tabelas públicas -------------------------
async function listarTabelas() {
    const query = `
        SELECT table_name FROM information_schema.tables WHERE table_schema = 'public';
    `;
    const res = await pool.query(query);
    return res.rows.map(row => row.table_name);
}

module.exports = { buscarGeoJSON, listarTabelas };

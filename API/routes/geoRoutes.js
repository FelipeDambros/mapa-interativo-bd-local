const express = require('express');
const router = express.Router();
const { buscarGeoJSON, listarTabelas } = require('../services/geojsonService');
const { exportKMZ, exportSHP } = require('../controllers/exportController');

// ------------------------- Rota para retornar GeoJSON -------------------------
router.get('/geojson', async (req, res) => {
    const { tabela } = req.query;
    if (!tabela) return res.status(400).json({ erro: 'Parâmetro ?tabela= é obrigatório' });

    try {
        const geojson = await buscarGeoJSON(tabela);
        res.json(geojson);
    } catch (err) {
        res.status(500).json({ erro: 'Erro ao buscar GeoJSON' });
    }
});

// ------------------------- Rota para listar tabelas -------------------------
router.get('/tabelas', async (req, res) => {
    try {
        const tabelas = await listarTabelas();
        res.json(tabelas);
    } catch (err) {
        res.status(500).json({ erro: 'Erro ao listar tabelas' });
    }
});

// ------------------------- Rotas de exportação -------------------------
router.get('/export/kmz', exportKMZ);
router.get('/export/shp', exportSHP);

module.exports = router;

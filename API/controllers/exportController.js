// ------------------------- Exportação de arquivos -------------------------
const JSZip = require('jszip');
const tokml = require('tokml');
const shpwrite = require('shp-write');
const { buscarGeoJSON } = require('../services/geojsonService');
const { normalizeProperties, normalizarGeoJSON } = require('../utils/geoUtils');

// ------------------------- Essa parte cuida da exportação KMZ -------------------------
async function exportKMZ(req, res) {
    const { tabela } = req.query;
    if (!tabela) return res.status(400).json({ erro: 'Informe a tabela no parâmetro ?tabela=' });

    try {
        const geojson = await buscarGeoJSON(tabela);
        const kml = tokml(geojson);
        const zip = new JSZip();
        zip.file(`${tabela}.kml`, kml);
        const kmz = await zip.generateAsync({ type: "nodebuffer" });

        res.setHeader('Content-Type', 'application/vnd.google-earth.kmz');
        res.setHeader('Content-Disposition', `attachment; filename="${tabela}.kmz"`);
        res.end(kmz);
    } catch (err) {
        console.error(err);
        res.status(500).send('Erro ao exportar KMZ');
    }
}

// ------------------------- Essa parte cuida da exportação SHP -------------------------
// ------------------------- Essa parte cuida da exportação SHP -------------------------
async function exportSHP(req, res) {
    const { tabela } = req.query;
    if (!tabela) return res.status(400).json({ erro: 'Informe a tabela no parâmetro ?tabela=' });

    try {
        const geojsonOriginal = await buscarGeoJSON(tabela);
        const geojsonLimpo = normalizeProperties(normalizarGeoJSON(geojsonOriginal));

        // Verifica se há dados no GeoJSON
        if (!geojsonLimpo.features.length) {
            return res.status(400).send('GeoJSON vazio. Nada para exportar.');
        }

        let originalZip;
        try {
            // Gera o ZIP com os arquivos SHP
            originalZip = shpwrite.zip(geojsonLimpo);
        } catch (zipError) {
            console.error("Erro ao gerar o ZIP com shpwrite:", zipError);
            return res.status(500).send('Erro ao gerar arquivo SHP.');
        }

        let zip;
        try {
            // Tenta carregar o ZIP gerado
            zip = await JSZip.loadAsync(originalZip);
        } catch (loadError) {
            console.error("Erro ao carregar o ZIP gerado:", loadError);
            return res.status(500).send('Erro ao carregar arquivo ZIP.');
        }

        const renamedZip = new JSZip();

        for (const filename of Object.keys(zip.files)) {
            if (filename.endsWith('/')) continue;

            const file = zip.file(filename);
            if (!file) {
                console.warn(`Arquivo não encontrado no ZIP: ${filename}`);
                continue;
            }

            try {
                const ext = filename.split('.').pop();
                const newName = `${tabela}.${ext}`;
                const content = await file.async('nodebuffer');
                renamedZip.file(newName, content);
            } catch (err) {
                console.error(`Erro ao processar o arquivo ${filename}:`, err);
            }
        }

        const finalZipBuffer = await renamedZip.generateAsync({ type: 'nodebuffer' });

        res.setHeader('Content-Type', 'application/zip');
        res.setHeader('Content-Disposition', `attachment; filename="${tabela}.zip"`);
        res.end(finalZipBuffer);

    } catch (err) {
        console.error("Erro geral no export SHP:", err);
        res.status(500).send('Erro ao exportar SHP');
    }
}


module.exports = { exportKMZ, exportSHP };

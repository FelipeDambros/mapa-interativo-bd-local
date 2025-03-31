// Criar o mapa
const map = L.map('map').setView([-23.2805, -46.0135], 12); // Centraliza o mapa no ponto desejado

// Adicionar camada base (OpenStreetMap) 
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png').addTo(map);

// Modificar a atribuição do Leaflet
map.attributionControl.setPrefix('');
map.attributionControl.addAttribution('&copy; <a href="https://leafletjs.com/" target="_blank">Leaflet</a> | <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors |');

// URLs dos arquivos GeoJSON
const geojsonUrl1 = 'http://localhost:3000/geojson?tabela=PMJ_Limite_municipal';
const geojsonUrl3 = 'http://localhost:3000/geojson?tabela=Equipamentos_educacao';

// Estilo para limites municipais (polígonos)
const limiteMunicipalStyle = {
    color: "#232323",   
    weight: 2,          
    opacity: 1,         
    fillOpacity: 0      
};

// Estilo para equipamentos de educação (pontos)
const educacaoStyle = {
    pointToLayer: function (feature, latlng) {  // << Aqui definimos um estilo especial para pontos
        return L.circleMarker(latlng, {  // Criamos um marcador circular
            radius: 8, // Define o tamanho do círculo
            fillColor: "#0077ff", // Cor interna do círculo
            color: "#ffffff", // Cor da borda do círculo
            weight: 1, // Espessura da borda
            opacity: 1,
            fillOpacity: 0.9 // Transparência do preenchimento
        });
    }
};

// Função para carregar GeoJSONs com estilos
function loadGeoJSON(url, style, bringToBack = false) {
    fetch(url)
        .then(response => response.json())
        .then(data => {
            const layer = L.geoJSON(data, {
                style: typeof style.pointToLayer === "undefined" ? style : null,
                pointToLayer: style.pointToLayer || null,
                onEachFeature: function (feature, layer) {
                    if (feature.properties) {
                        let popupContent = '<b>Informações:</b><br>';
                        for (const key in feature.properties) {
                            popupContent += `<b>${key}</b>: ${feature.properties[key]}<br>`;
                        }
                        layer.bindPopup(popupContent);
                    }
                }
            }).addTo(map);

            if (bringToBack) layer.bringToBack(); // 👈 só funciona se o parâmetro for recebido
        })
        .catch(error => console.error('Erro ao carregar o GeoJSON:', error));
}

// Carregar os GeoJSONs com estilos personalizados
loadGeoJSON(geojsonUrl1, limiteMunicipalStyle, true); // Camada de polígonos
loadGeoJSON(geojsonUrl3, educacaoStyle);  // Camada de pontos com estilo embutido



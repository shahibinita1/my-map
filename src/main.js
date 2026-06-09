import * as Cesium from 'cesium';
import './style.css';

Cesium.Ion.defaultAccessToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJqdGkiOiI4ZWQyMGNkNC00MGI3LTQ2ODctOGQ4My1hMzZmODY2YTZmNDciLCJpZCI6NDQxMjc0LCJzdWIiOiJzaGFoaWJpbml0YSIsImlzcyI6Imh0dHBzOi8vYXBpLmNlc2l1bS5jb20iLCJhdWQiOiJVbnRpdGxlZCIsImlhdCI6MTc4MDgyMjczNX0.Am3vaFUmPM8oyhE9pYwD6Y1p8yItg2Dckl5CxmMics0';

const viewer = new Cesium.Viewer('cesiumContainer', {
  terrain: Cesium.Terrain.fromWorldTerrain(),
});

const tileset = await Cesium.Cesium3DTileset.fromIonAssetId(4904028);
viewer.scene.primitives.add(tileset);
await viewer.zoomTo(tileset);

const wmsLayer = new Cesium.WebMapServiceImageryProvider({
  url: 'https://ows.terrestris.de/osm/service',
  layers: 'OSM-WMS',
  parameters: { transparent: true, format: 'image/png' },
});
viewer.imageryLayers.addImageryProvider(wmsLayer);
// Click a building to highlight it and show its info
const infoBox = viewer.selectedEntity;
const handler = new Cesium.ScreenSpaceEventHandler(viewer.scene.canvas);
handler.setInputAction((click) => {
  const picked = viewer.scene.pick(click.position);
  if (Cesium.defined(picked) && picked.getProperty) {
    // Log all available properties of the clicked building
    const names = picked.getPropertyIds ? picked.getPropertyIds() : [];
    let info = 'Building properties:\n';
    names.forEach((n) => { info += `${n}: ${picked.getProperty(n)}\n`; });
    console.log(info);
    alert(info);
  }
}, Cesium.ScreenSpaceEventType.LEFT_CLICK);
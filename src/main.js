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
// ---------- Interactive control panel ----------

// Build a small floating panel of buttons
const panel = document.createElement('div');
panel.style.cssText = `
  position: absolute; top: 10px; left: 10px; z-index: 999;
  background: rgba(40,40,40,0.85); padding: 10px; border-radius: 8px;
  font-family: sans-serif; color: white; display: flex; flex-direction: column; gap: 6px;
`;
panel.innerHTML = `
  <button id="btnBuildings">Hide buildings</button>
  <button id="btnShadows">Enable sunlight & shadows</button>
  <button id="btnColor">Color by height</button>
  <button id="btnReset">Reset view</button>
`;
document.body.appendChild(panel);

// 1. Toggle buildings on/off
document.getElementById('btnBuildings').onclick = (e) => {
  tileset.show = !tileset.show;
  e.target.textContent = tileset.show ? 'Hide buildings' : 'Show buildings';
};

// 2. Toggle sunlight + shadows
let lighting = false;
document.getElementById('btnShadows').onclick = (e) => {
  lighting = !lighting;
  viewer.scene.globe.enableLighting = lighting;
  viewer.shadows = lighting;
  e.target.textContent = lighting ? 'Disable sunlight & shadows' : 'Enable sunlight & shadows';
};

// 3. Color buildings by height
let colored = false;
document.getElementById('btnColor').onclick = (e) => {
  colored = !colored;
  if (colored) {
    tileset.style = new Cesium.Cesium3DTileStyle({
      color: {
        conditions: [
          ['${Height} >= 50', 'color("red")'],
          ['${Height} >= 25', 'color("orange")'],
          ['${Height} >= 10', 'color("yellow")'],
          ['true', 'color("lightgreen")'],
        ],
      },
    });
    e.target.textContent = 'Reset color';
  } else {
    tileset.style = undefined;
    e.target.textContent = 'Color by height';
  }
};

// 4. Reset camera back to the buildings
document.getElementById('btnReset').onclick = () => {
  viewer.zoomTo(tileset);
};
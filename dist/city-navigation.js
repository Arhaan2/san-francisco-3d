import * as THREE from './vendor/three/three.module.js';

// Local geographic projection used by the Blender model and its glTF export.
export const geoToWorld = (lon, lat, elevation = 0) => [
  ((lon + 122.44) * 87900 - 3000) / 1000,
  elevation / 1000,
  -((lat - 37.76) * 111320 - 3500) / 1000,
];

export const LANDMARKS = [
  {
    id: 'golden-gate', name: 'Golden Gate Bridge', lon: -122.4783, lat: 37.8199,
    base: 0, height: 227, size: [60, 1966], rotation: .24,
    position: [-4, .52, -6.4], target: [-6.3, .125, -3.2], fov: 32,
    description: 'Two 227-metre towers carry the suspension cables across the Golden Gate. The 1,280-metre main span joins San Francisco to the Marin Headlands; the roadway clears the water by 67 metres.',
    source: 'https://www.goldengate.org/bridge/history-research/statistics-data/design-construction-stats/',
    sourceLabel: 'Golden Gate Bridge District · design and construction',
  },
  {
    id: 'ferry-building', name: 'Ferry Building', lon: -122.3936, lat: 37.7955,
    base: 2, height: 73, size: [204, 31], rotation: 1.93,
    offset: [.44, .16, -.43], aim: 35, fov: 38,
    description: 'Opened in 1898 as a transportation hub, the Ferry Building marks the city’s historic arrival by water. Its long arcades and central clock tower still anchor the Embarcadero, with a marketplace beneath the roof.',
    source: 'https://www.ferrybuildingmarketplace.com/about/', sourceLabel: 'Ferry Building Marketplace · history',
  },
  {
    id: 'transamerica', name: 'Transamerica Pyramid', lon: -122.4028, lat: 37.7952,
    base: 6, height: 260, size: [60, 60], rotation: .14,
    offset: [.38, .24, -.52], aim: 112, fov: 40,
    description: 'William Pereira’s Transamerica Pyramid was completed in 1972. Its sharply tapering profile, pale triangular façades and two narrow side wings give the Financial District one of its most recognizable silhouettes.',
    source: 'https://transamericapyramid.com/transamerica-pyramid', sourceLabel: 'Transamerica Pyramid · building story',
  },
  {
    id: 'salesforce', name: 'Salesforce Tower', lon: -122.3969, lat: 37.7899,
    base: 5, height: 326, size: [72, 72], rotation: -.65,
    offset: [.43, .31, -.49], aim: 155, fov: 42,
    description: 'Pelli Clarke & Partners designed this 326-metre tower with rounded corners and a tapering crown. Its curved glass silhouette rises above the neighboring Salesforce Transit Center and rooftop park.',
    source: 'https://pcparch.com/work/salesforce-tower', sourceLabel: 'Pelli Clarke & Partners · Salesforce Tower',
  },
  {
    id: 'coit-tower', name: 'Coit Tower', lon: -122.4058, lat: 37.8024,
    base: 82, height: 64, size: [29, 29],
    offset: [.24, .19, -.25], aim: 114, fov: 35,
    description: 'Completed in 1933, this Art Deco tower crowns Telegraph Hill in Pioneer Park. Arthur Brown Jr. and Henry Howard designed the building; its interior murals depict California life during the 1930s.',
    source: 'https://ohp.parks.ca.gov/ListedResources/Detail/N2384', sourceLabel: 'California State Parks · Coit Memorial Tower',
  },
  {
    id: 'palace-fine-arts', name: 'Palace of Fine Arts', lon: -122.4482, lat: 37.8029,
    base: 5, height: 50, size: [110, 90],
    offset: [.30, .17, .27], aim: 27, fov: 38,
    description: 'The monumental rotunda and colonnades were conceived for the 1915 Panama-Pacific Exposition. Their classical forms beside the lagoon remain a distinctive landmark in the Marina.',
    source: 'https://www.sfrecpark.org/Facilities/Facility/Details/Palace-of-Fine-Arts-423', sourceLabel: 'San Francisco Recreation and Parks · Palace of Fine Arts',
  },
  {
    id: 'city-hall', name: 'San Francisco City Hall', lon: -122.4187, lat: 37.7793,
    base: 16, height: 94, size: [122, 93], rotation: -.13,
    offset: [.32, .22, .34], aim: 55, fov: 38,
    description: 'Built from 1913 to 1915, City Hall centers the Civic Center with a monumental dome and four stories of civic rooms. It opened in time for the city’s Panama-Pacific International Exposition.',
    source: 'https://legacy.seaonc.org/structure/sf-city-hall/', sourceLabel: 'SEAONC Legacy Project · San Francisco City Hall',
  },
  {
    id: 'alcatraz', name: 'Alcatraz Island', lon: -122.423, lat: 37.8266,
    base: 28, height: 38, size: [160, 125], rotation: -.3,
    offset: [.55, .25, .48], aim: 40, fov: 37,
    description: 'Military fortifications, a lighthouse and prison buildings tell several chapters of the island’s history. Alcatraz operated as a federal penitentiary from 1934 to 1963 and later became a site of Native American activism.',
    source: 'https://www.nps.gov/places/cralcatraz.htm', sourceLabel: 'National Park Service · Alcatraz Island',
  },
];

export const NEIGHBORHOODS = [
  {
    id: 'north-beach', name: 'North Beach', lon: -122.4104, lat: 37.8005, elevation: 24.451,
    offset: [.41, .36, .49],
    description: 'Around Washington Square, North Beach brings together Italian-American cafés, wooden houses climbing Telegraph Hill, and the literary legacy of the Beat generation along Columbus Avenue.',
    source: 'https://www.sftravel.com/neighborhoods/north-beach', sourceLabel: 'San Francisco Travel · North Beach',
  },
  {
    id: 'chinatown', name: 'Chinatown', lon: -122.4075, lat: 37.7947, elevation: 32.617,
    offset: [.42, .38, .48],
    description: 'North America’s oldest Chinatown is a compact network of busy streets and small alleys. Grant Avenue’s ornate architecture and Waverly Place’s balconies sit close to Portsmouth Square, a long-standing gathering place.',
    source: 'https://www.sftravel.com/neighborhoods/visit-chinatown', sourceLabel: 'San Francisco Travel · Chinatown',
  },
  {
    id: 'mission', name: 'Mission District', lon: -122.4195, lat: 37.7595, elevation: 14.208,
    offset: [.22, .18, .28],
    description: 'Explore the low-rise blocks around Valencia and 19th streets. The Mission’s public murals tell stories of cultural heritage and community life, while nearby Mission Dolores connects the neighborhood to the city’s early history.',
    source: 'https://www.sftravel.com/neighborhoods/mission-district', sourceLabel: 'San Francisco Travel · Mission District',
  },
  {
    id: 'pacific-heights', name: 'Pacific Heights', lon: -122.4343, lat: 37.7921, elevation: 72.135,
    offset: [.23, .19, .27],
    description: 'Residential streets climb the ridge above the Marina, with long views across the bay. This view explores the blocks around Fillmore Street and the neighborhood’s varied domestic architecture.',
    source: 'https://www.sftravel.com/neighborhoods/pacific-heights', sourceLabel: 'San Francisco Travel · Pacific Heights',
  },
];

const TOUR_DURATION = 60;
// Durations total 60 seconds. Elevated transfer views stay above the bay.
const TOUR_LEGS = [
  { end: 4, place: 'golden-gate', position: [-4.0, .65, -5.7], target: [-6.3, .115, -3.2], fov: 36 },
  { end: 18, place: 'golden-gate', position: [-4.6, .48, -4.7], target: [-6.3, .115, -3.2], fov: 33 },
  { end: 26, place: 'ferry-building', position: [-1.5, 1.30, -4.5], target: [.42, .12, -.55], fov: 39 },
  { end: 34, place: 'ferry-building', position: [2.5, .29, -2.0], target: [.96, .08, -.41], fov: 30 },
  { end: 42, place: 'ferry-building', position: [1.85, .18, -1.12], target: [1.02, .043, -.44], fov: 34 },
  { end: 50, place: 'salesforce', position: [1.9, .51, -.93], target: [.61, .15, .10], fov: 34 },
  { end: 60, place: 'salesforce', position: [1.31, .38, -.68], target: [.57, .16, .10], fov: 35 },
];
const STILL_LEGS = [
  { ...TOUR_LEGS[0], end: 20 },
  { ...TOUR_LEGS[3], end: 40 },
  { ...TOUR_LEGS[6], end: 60 },
];

const vector = value => new THREE.Vector3().fromArray(value);
const positive = value => Number.isFinite(value) && value > 0;

function makeHitVolumes() {
  // These meshes are only raycast, never added to or rendered in the scene.
  const volumes = [];
  const material = new THREE.MeshBasicMaterial();
  const add = (place, center, dimensions, rotation = 0) => {
    const mesh = new THREE.Mesh(new THREE.BoxGeometry(...dimensions), material);
    mesh.position.fromArray(center);
    mesh.rotation.y = rotation;
    mesh.userData.placeId = place.id;
    mesh.updateMatrixWorld(true);
    volumes.push(mesh);
  };
  for (const place of LANDMARKS) {
    const center = geoToWorld(place.lon, place.lat, place.base + place.height / 2);
    if (place.id === 'golden-gate') {
      const origin = geoToWorld(place.lon, place.lat, 0);
      add(place, [origin[0], .067, origin[2]], [.045, .025, 1.966], .24);
      for (const sign of [-1, 1]) {
        add(place, [origin[0] + Math.sin(.24) * .64 * sign, .115,
          origin[2] + Math.cos(.24) * .64 * sign], [.055, .230, .045], .24);
      }
    } else if (place.id === 'ferry-building') {
      add(place, geoToWorld(place.lon, place.lat, 13), [.204, .025, .035], 1.93);
      add(place, geoToWorld(place.lon, place.lat, 40), [.027, .073, .027]);
    } else {
      add(place, center, [place.size[0]/1000, place.height/1000, place.size[1]/1000], place.rotation || 0);
    }
  }
  return { volumes, dispose() { for (const m of volumes) m.geometry.dispose(); material.dispose(); } };
}

function addInstancedBoxes(group, name, specs, material) {
  if (!specs.length) { material.dispose(); return; }
  const mesh = new THREE.InstancedMesh(new THREE.BoxGeometry(1, 1, 1), material, specs.length);
  mesh.name = name;
  const matrix = new THREE.Matrix4();
  const q = new THREE.Quaternion();
  const yAxis = new THREE.Vector3(0, 1, 0);
  for (let i = 0; i < specs.length; i++) {
    const s = specs[i];
    q.setFromAxisAngle(yAxis, s[6]);
    matrix.compose(new THREE.Vector3(s[0], s[1], s[2]), q, new THREE.Vector3(s[3], s[4], s[5]));
    mesh.setMatrixAt(i, matrix);
  }
  mesh.instanceMatrix.needsUpdate = true;
  mesh.computeBoundingSphere();
  group.add(mesh);
}

/** Builds only the selected neighborhood. All coordinates come from DataSF/DEM. */
export function buildNeighborhoodOverlay(data, { roofMaterial = null } = {}) {
  if (!data || !Array.isArray(data.buildings) || data.buildings.length > 2000) throw new Error('Invalid neighborhood data.');
  const group = new THREE.Group();
  group.name = `Neighborhood detail · ${data.id}`;
  group.userData = { source: data.source, interpretive: true, neighborhoodId: data.id };
  const wallPositions = [], wallColors = [], roofPositions = [], cornices = [], windows = [], sills = [];
  const palette = ['#aea797', '#b4a18d', '#aaafa6', '#b6b0a3', '#9e9690', '#ad9690', '#9da99f'].map(c => new THREE.Color(c));
  let newMasses = 0;
  const triangle = (array, a, b, c) => array.push(...a, ...b, ...c);
  for (let index = 0; index < data.buildings.length; index++) {
    const b = data.buildings[index], ring = b.ring;
    if (!Array.isArray(ring) || ring.length < 3 || ring.length > 400 || !positive(b.roof) || !Number.isFinite(b.base)) continue;
    if (!ring.every(p => p.length === 3 && p.every(Number.isFinite))) continue;
    const area = ring.reduce((s, a, i) => { const c = ring[(i+1)%ring.length]; return s+a[0]*c[2]-c[0]*a[2]; }, 0);
    const orientation = area > 0 ? 1 : -1;
    const color = palette[index % palette.length];
    if (!b.existing) {
      newMasses++;
      const contour = ring.map(p => new THREE.Vector2(p[0], p[2]));
      for (const face of THREE.ShapeUtils.triangulateShape(contour, [])) {
        const pts = face.map(i => [ring[i][0], b.roof, ring[i][2]]);
        // A positive X/Z triangle has a downward normal in Y-up coordinates.
        const cross = (pts[1][0]-pts[0][0])*(pts[2][2]-pts[0][2])-(pts[1][2]-pts[0][2])*(pts[2][0]-pts[0][0]);
        triangle(roofPositions, pts[0], pts[cross > 0 ? 2 : 1], pts[cross > 0 ? 1 : 2]);
      }
    }
    for (let i = 0; i < ring.length; i++) {
      const a = ring[i], c = ring[(i+1)%ring.length];
      const dx = c[0]-a[0], dz = c[2]-a[2], length = Math.hypot(dx, dz);
      if (length < .0004) continue;
      const topA = [a[0], b.roof, a[2]], topC = [c[0], b.roof, c[2]];
      if (!b.existing) {
        if (orientation > 0) {
          triangle(wallPositions, a, topC, c); triangle(wallPositions, a, topA, topC);
        } else {
          triangle(wallPositions, a, c, topC); triangle(wallPositions, a, topC, topA);
        }
        for (let k = 0; k < 6; k++) wallColors.push(color.r, color.g, color.b);
      }
      if (length < .002) continue;
      const angle = -Math.atan2(dz, dx);
      const nx = orientation * dz/length, nz = -orientation * dx/length;
      const mx = (a[0]+c[0])/2, mz = (a[2]+c[2])/2;
      if (cornices.length < 18000) {
        cornices.push([mx + nx*.00012, b.roof-.00018, mz+nz*.00012, length+.00015, .00036, .00045, angle]);
      }
      // Existing masses retain their aerial roofs and facade textures. A thin
      // cornice adds relief without placing a second wall over the original.
      if (b.existing || length < .004 || length > .090) continue;
      const floors = Math.min(9, Math.floor((b.roof-b.base-.001)/.0034));
      const bays = Math.min(22, Math.floor(length/.0031));
      for (let floor = 0; floor < floors && windows.length < 24000; floor++) {
        for (let bay = 0; bay < bays && windows.length < 24000; bay++) {
          const t = (bay+.5)/bays;
          const y = b.base+.0020+floor*.0034;
          if (y+.0009 > b.roof-.0005) continue;
          const x = a[0]+dx*t+nx*.00006, z = a[2]+dz*t+nz*.00006;
          const width = Math.min(.00145, length/bays*.52);
          windows.push([x, y, z, width, .00175, .00012, angle]);
          sills.push([x+nx*.00008, y-.00091, z+nz*.00008, width+.00022, .00017, .00032, angle]);
        }
      }
    }
  }
  const addGeometry = (name, positions, material, colors, aerialUV = false) => {
    if (!positions.length) { material.dispose(); return; }
    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
    if (colors) geometry.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3));
    if (aerialUV) {
      const uv = [];
      for (let i = 0; i < positions.length; i += 3) {
        const x = positions[i]*1000+3000, y = -positions[i+2]*1000+3500;
        uv.push((x+8790)/17580, 1-(y+7792.4)/20037.6);
      }
      geometry.setAttribute('uv', new THREE.Float32BufferAttribute(uv, 2));
    }
    geometry.computeVertexNormals(); geometry.computeBoundingSphere();
    const mesh = new THREE.Mesh(geometry, material); mesh.name = name; group.add(mesh);
  };
  addGeometry('DataSF · restored low-rise walls', wallPositions, new THREE.MeshStandardMaterial({ vertexColors: true, roughness: .88 }), wallColors);
  addGeometry('DataSF · restored low-rise roofs', roofPositions, roofMaterial?.clone() || new THREE.MeshStandardMaterial({ color: '#777b77', roughness: .94 }), null, !!roofMaterial?.map);
  addInstancedBoxes(group, 'Interpretive cornices', cornices, new THREE.MeshStandardMaterial({ color: '#aaa79e', roughness: .84 }));
  addInstancedBoxes(group, 'Interpretive windows', windows, new THREE.MeshStandardMaterial({ color: '#263b42', roughness: .36, metalness: .22 }));
  addInstancedBoxes(group, 'Interpretive window sills', sills, new THREE.MeshStandardMaterial({ color: '#b4afa1', roughness: .8 }));
  group.userData.stats = { buildings: data.buildings.length, newMasses, cornices: cornices.length, windows: windows.length };
  return group;
}

function disposeGroup(group) {
  if (!group) return;
  group.removeFromParent();
  group.traverse(object => {
    object.geometry?.dispose();
    const materials = Array.isArray(object.material) ? object.material : [object.material];
    materials.forEach(material => material?.dispose());
    if (object.isInstancedMesh) object.dispose();
  });
  group.userData.ownedTextures?.forEach(texture => texture.dispose());
}

// Copy only existing terrain triangles: this decal exactly follows the loaded
// terrain and remains depth-tested beneath buildings. The GLB is untouched.
export function buildNeighborhoodGround(model, bounds, texture) {
  const positions = [], uv = [], normals = [];
  let sourceMaterial = null;
  model?.updateMatrixWorld?.(true);
  model?.traverse?.(object => {
    if (!object.isMesh || !object.geometry?.attributes.position || Array.isArray(object.material)) return;
    if (!object.material?.name?.replace(/[^a-z]/gi, '').toLowerCase().includes('realaerialterrain')) return;
    sourceMaterial = object.material;
    const geometry = object.geometry, attribute = geometry.attributes.position, indices = geometry.index;
    const world = new Float32Array(attribute.count*3), point = new THREE.Vector3();
    const worldNormals=new Float32Array(attribute.count*3), normalMatrix=new THREE.Matrix3().getNormalMatrix(object.matrixWorld);
    for (let i=0; i<attribute.count; i++) {
      point.fromBufferAttribute(attribute, i).applyMatrix4(object.matrixWorld);
      world[i*3]=point.x; world[i*3+1]=point.y; world[i*3+2]=point.z;
      if(geometry.attributes.normal)point.fromBufferAttribute(geometry.attributes.normal,i).applyNormalMatrix(normalMatrix);
      else point.set(0,1,0);
      worldNormals[i*3]=point.x;worldNormals[i*3+1]=point.y;worldNormals[i*3+2]=point.z;
    }
    const count = indices?.count || attribute.count;
    for (let i=0; i<count; i+=3) {
      const ids = [0,1,2].map(k => (indices ? indices.getX(i+k) : i+k)*3);
      const xs = ids.map(k=>world[k]), zs = ids.map(k=>world[k+2]);
      if (Math.max(...xs)<bounds[0] || Math.min(...xs)>bounds[2] || Math.max(...zs)<bounds[1] || Math.min(...zs)>bounds[3]) continue;
      for (const k of ids) {
        positions.push(world[k],world[k+1],world[k+2]);
        normals.push(worldNormals[k],worldNormals[k+1],worldNormals[k+2]);
        uv.push((world[k]-bounds[0])/(bounds[2]-bounds[0]),(world[k+2]-bounds[1])/(bounds[3]-bounds[1]));
      }
    }
  });
  if (!positions.length || !sourceMaterial) return null;
  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute('position',new THREE.Float32BufferAttribute(positions,3));
  geometry.setAttribute('uv',new THREE.Float32BufferAttribute(uv,2));
  geometry.setAttribute('normal',new THREE.Float32BufferAttribute(normals,3)); geometry.computeBoundingSphere();
  const material = sourceMaterial.clone();
  material.map=texture; material.color.set('#ffffff'); material.transparent=true; material.opacity=1;
  material.depthWrite=false; material.polygonOffset=true; material.polygonOffsetFactor=-2; material.polygonOffsetUnits=-2; material.alphaTest=.01;
  const mesh = new THREE.Mesh(geometry,material); mesh.name='NAIP · selected neighborhood ground'; mesh.renderOrder=1;
  return mesh;
}

/** Optional data is fetched only after selection; setup itself never needs a network request. */
export function setupNavigation(api, { notify = () => {} } = {}) {
  const { scene, camera, controls, renderer } = api;
  const canvas = renderer.domElement;
  const el = id => document.getElementById(id);
  const ui = {
    start: el('start-tour'), pause: el('pause-tour'), stop: el('stop-tour'), status: el('tour-status'),
    landmarks: el('landmark-select'), neighborhoods: el('neighborhood-select'),
    detail: el('place-detail'), title: el('place-title'), description: el('place-description'),
    source: el('place-source'), close: el('close-place'), explore: el('explore-controls'),
  };
  const media = window.matchMedia('(prefers-reduced-motion: reduce)');
  const listeners = [];
  const listen = (target, type, fn, options) => {
    target?.addEventListener(type, fn, options);
    listeners.push(() => target?.removeEventListener(type, fn, options));
  };
  const hit = makeHitVolumes();
  const raycaster = new THREE.Raycaster();
  const pointer = new THREE.Vector2();
  const initialCursor = canvas.style.cursor;
  let overlay = null, overlayRequest = null, selectionSequence = 0;
  const dataCache = new Map();
  let selectedPlace = null, detailTrigger = null, disposed = false;
  let status = 'idle', elapsed = 0, generation = 0, currentLeg = -1, lastPhase = '', lastSecond = -1;
  let tourLegs = TOUR_LEGS, stillWait = null, down = null;

  async function enhanceAerial(group, data) {
    if (!data.imagery?.url || !Array.isArray(data.imagery.boundsXZ)) return;
    try {
      const texture = await new THREE.TextureLoader().loadAsync(new URL(`./assets/neighborhoods/${data.imagery.url}`,import.meta.url).href);
      if (disposed || overlay !== group) { texture.dispose(); return; }
      texture.colorSpace=THREE.SRGBColorSpace; texture.flipY=false;
      texture.anisotropy=Math.min(8,renderer.capabilities?.getMaxAnisotropy?.() || 1); texture.needsUpdate=true;
      group.userData.ownedTextures=[texture];
      const bounds=data.imagery.boundsXZ;
      const roof=group.children.find(object=>object.name==='DataSF · restored low-rise roofs');
      if (roof) {
        const position=roof.geometry.attributes.position, uv=[];
        for(let i=0;i<position.count;i++) uv.push((position.getX(i)-bounds[0])/(bounds[2]-bounds[0]),(position.getZ(i)-bounds[1])/(bounds[3]-bounds[1]));
        roof.geometry.setAttribute('uv',new THREE.Float32BufferAttribute(uv,2));
        roof.material.map=texture; roof.material.color.set('#ffffff'); roof.material.needsUpdate=true;
      }
      const ground=buildNeighborhoodGround(api.model?.scene || api.model,bounds,texture);
      if(ground)group.add(ground);
      group.userData.stats.localAerial=true;
      group.userData.stats.groundTriangles=ground ? ground.geometry.attributes.position.count/3 : 0;
    } catch { /* Existing roof and ground imagery remain available. */ }
  }

  const say = message => { try { notify(message); } catch { /* Optional host notification. */ } };
  const phaseName = placeId => placeId === 'golden-gate' ? 'Golden Gate' : placeId === 'ferry-building' ? 'Waterfront' : 'Downtown';
  function updateTourUI(message) {
    const viewer = el('viewer');
    if (viewer) viewer.dataset.tourState = status;
    if (ui.start) { ui.start.textContent = status === 'paused' ? 'Resume tour' : status === 'complete' ? 'Replay tour' : 'Start 60-second tour'; ui.start.disabled = status === 'running'; }
    if (ui.pause) { ui.pause.hidden = status !== 'running'; ui.pause.disabled = status !== 'running'; }
    if (ui.stop) { ui.stop.hidden = status === 'idle' || status === 'complete'; ui.stop.disabled = status === 'idle' || status === 'complete'; }
    if (ui.status) {
      // Progress is readable without making a screen reader announce every second.
      ui.status.setAttribute('aria-live', 'off');
      ui.status.textContent = message || (status === 'running' ? `${lastPhase} · ${Math.min(60, Math.floor(elapsed))} / 60 sec${media.matches ? ' · still views' : ''}`
        : status === 'paused' ? `Paused at ${Math.floor(elapsed)} seconds · explore freely`
          : status === 'complete' ? 'Tour complete · continue exploring' : 'Golden Gate → waterfront → downtown');
    }
  }
  const cancelFlight = () => {
    if (typeof api.cancelFlight === 'function') api.cancelFlight();
    else api.flyTo(camera.position.toArray(), controls.target.toArray(), camera.fov, 0);
  };
  function interruptPlayback() {
    generation++;
    const waiting = stillWait; stillWait = null; waiting?.resolve(false);
    cancelFlight();
  }
  function pauseTour(reason = '') {
    if (status !== 'running') return;
    status = 'paused'; interruptPlayback();
    updateTourUI(reason || undefined);
    say(reason || 'Tour paused. Explore freely, or resume the tour.');
  }
  function stopTour() {
    const wasActive = status === 'running' || status === 'paused';
    status = 'idle'; elapsed = 0; currentLeg = -1; lastPhase = ''; lastSecond = -1;
    if (wasActive) interruptPlayback();
    updateTourUI();
    // Deliberately preserve camera, time of day, and animation preferences.
  }
  const clearOverlay = () => {
    selectionSequence++; overlayRequest?.abort(); overlayRequest = null;
    disposeGroup(overlay); overlay = null;
  };
  function clearNeighborhood() {
    clearOverlay();
    if (ui.neighborhoods) ui.neighborhoods.value = '';
    if (NEIGHBORHOODS.some(place => place.id === selectedPlace)) {
      selectedPlace = null;
      if (ui.detail) ui.detail.hidden = true;
    }
  }
  const clearPresetSelection = () => {
    document.querySelectorAll('[data-camera]').forEach(button => {
      button.classList.remove('active'); button.setAttribute('aria-pressed', 'false');
    });
  };
  function showPlace(place, trigger) {
    const moveFocus = (trigger === ui.landmarks || trigger === ui.neighborhoods) && document.activeElement === trigger;
    selectedPlace = place.id;
    if (trigger) detailTrigger = trigger;
    if (ui.title) ui.title.textContent = place.name;
    if (ui.description) ui.description.textContent = place.description;
    if (ui.source) { ui.source.href = place.source; ui.source.textContent = place.sourceLabel; ui.source.target = '_blank'; ui.source.rel = 'noopener noreferrer'; }
    if (ui.detail) ui.detail.hidden = false;
    if (ui.explore) ui.explore.open = false;
    if (moveFocus) {
      const focusTarget = ui.title || ui.close;
      if (focusTarget === ui.title) focusTarget.setAttribute('tabindex', '-1');
      focusTarget?.focus({ preventScroll: true });
    }
  }
  function closePlace() {
    if (ui.detail) ui.detail.hidden = true;
    if (detailTrigger?.isConnected) {
      const closedDisclosure = detailTrigger.closest('details:not([open])');
      const returnTarget = closedDisclosure?.querySelector('summary') || detailTrigger;
      returnTarget.focus({ preventScroll: true });
    }
  }
  async function selectLandmark(id, { fly = true, announce = true, trigger = ui.landmarks } = {}) {
    const place = LANDMARKS.find(item => item.id === id);
    if (!place || disposed) return false;
    stopTour(); clearOverlay(); clearPresetSelection();
    if (ui.landmarks) ui.landmarks.value = id;
    if (ui.neighborhoods) ui.neighborhoods.value = '';
    showPlace(place, trigger);
    if (announce) say(`${place.name} selected.`);
    if (fly) {
      const base = geoToWorld(place.lon, place.lat, 0);
      const target = place.target || [base[0], (place.aim || place.base+place.height*.5)/1000, base[2]];
      const position = place.position || [base[0]+place.offset[0], place.offset[1], base[2]+place.offset[2]];
      await api.flyTo(position, target, place.fov, media.matches ? 0 : 1800);
    }
    return true;
  }
  async function selectNeighborhood(id, { trigger = ui.neighborhoods, fly = true, announce = true } = {}) {
    const place = NEIGHBORHOODS.find(item => item.id === id);
    if (!place || disposed) return false;
    stopTour(); clearOverlay(); clearPresetSelection();
    const request = selectionSequence;
    if (ui.neighborhoods) ui.neighborhoods.value = id;
    if (ui.landmarks) ui.landmarks.value = '';
    showPlace(place, trigger);
    const center = geoToWorld(place.lon, place.lat, place.elevation);
    const target = [center[0], center[1]+.023, center[2]];
    if (fly) api.flyTo([center[0]+place.offset[0], center[1]+place.offset[1], center[2]+place.offset[2]], target, 43, media.matches ? 0 : 2000);
    if (announce) say(`Exploring ${place.name}.`);
    try {
      let data = dataCache.get(id);
      if (!data) {
        overlayRequest = new AbortController();
        const response = await fetch(new URL(`./assets/neighborhoods/${id}.json`, import.meta.url), { signal: overlayRequest.signal });
        if (!response.ok) throw new Error(`Neighborhood data: ${response.status}`);
        data = await response.json(); dataCache.set(id, data);
      }
      if (disposed || request !== selectionSequence) return false;
      let roofMaterial = null;
      (api.model?.scene || api.model)?.traverse?.(object => {
        const materials = Array.isArray(object.material) ? object.material : [object.material];
        for (const material of materials) {
          if (material?.name?.replace(/[^a-z]/gi, '').toLowerCase().includes('realaerialroofs')) roofMaterial = material;
        }
      });
      overlay = buildNeighborhoodOverlay(data, { roofMaterial }); scene.add(overlay);
      void enhanceAerial(overlay,data);
      if (ui.description) ui.description.textContent = `${place.description} Facade details are an architectural interpretation of mapped building footprints.`;
      return true;
    } catch (error) {
      if (announce && error.name !== 'AbortError' && request === selectionSequence) say(`${place.name} is ready to explore. Extra building detail could not load; the city view remains available.`);
      return false;
    }
  }
  async function playTour(token) {
    for (let i = 0; i < tourLegs.length; i++) {
      const leg = tourLegs[i];
      if (leg.end <= elapsed + .001) continue;
      if (token !== generation || status !== 'running' || disposed) return;
      currentLeg = i;
      const phase = phaseName(leg.place);
      if (lastPhase !== phase) { lastPhase = phase; say(`Tour: ${phase}.`); }
      showPlace(LANDMARKS.find(place => place.id === leg.place));
      updateTourUI();
      const result = await api.flyTo(leg.position, leg.target, leg.fov, media.matches ? 0 : Math.max(0, leg.end-elapsed)*1000);
      if (token !== generation || status !== 'running' || disposed) return;
      if (result?.cancelled) { pauseTour('Tour paused · camera control returned to you'); return; }
      if (media.matches && elapsed < leg.end) {
        const continued = await new Promise(resolve => { stillWait = { end: leg.end, resolve }; });
        if (!continued || token !== generation || status !== 'running') return;
      }
      elapsed = leg.end;
    }
    if (token === generation && status === 'running') {
      elapsed = TOUR_DURATION; status = 'complete'; currentLeg = -1; updateTourUI(); say('Tour complete. Continue exploring the city.');
    }
  }
  function startTour() {
    if (disposed || status === 'running') return;
    const resuming = status === 'paused';
    if (!resuming) { elapsed = 0; lastPhase = ''; lastSecond = -1; }
    clearOverlay();
    clearPresetSelection();
    if (ui.neighborhoods) ui.neighborhoods.value = '';
    if (ui.landmarks) ui.landmarks.value = '';
    cancelFlight();
    tourLegs = media.matches ? STILL_LEGS : TOUR_LEGS;
    status = 'running'; const token = ++generation;
    updateTourUI();
    void playTour(token).catch(() => { if (token === generation) pauseTour('Tour paused · choose a view to continue exploring'); });
  }
  function manualInput() { pauseTour('Tour paused · explore freely, or resume'); }
  const offTick = api.addTick((_seconds, delta) => {
    if (status !== 'running' || disposed) return;
    elapsed = Math.min(TOUR_DURATION, elapsed + Math.max(0, Math.min(Number(delta) || 0, 1)));
    if (stillWait && elapsed >= stillWait.end) { const waiting = stillWait; stillWait = null; waiting.resolve(true); }
    const second = Math.floor(elapsed);
    if (second !== lastSecond) { lastSecond = second; updateTourUI(); }
  });

  for (const [select, entries, prompt] of [[ui.landmarks, LANDMARKS, 'Choose a landmark'], [ui.neighborhoods, NEIGHBORHOODS, 'Choose a neighborhood']]) {
    if (!select) continue;
    select.replaceChildren(new Option(prompt, ''), ...entries.map(place => new Option(place.name, place.id)));
  }
  listen(ui.landmarks, 'change', () => { if (ui.landmarks.value) void selectLandmark(ui.landmarks.value); });
  listen(ui.neighborhoods, 'change', () => { if (ui.neighborhoods.value) void selectNeighborhood(ui.neighborhoods.value); else clearNeighborhood(); });
  listen(ui.start, 'click', startTour); listen(ui.pause, 'click', () => pauseTour()); listen(ui.stop, 'click', stopTour);
  listen(ui.close, 'click', closePlace);
  listen(controls, 'start', manualInput);
  listen(canvas, 'wheel', manualInput, { passive: true, capture: true });
  listen(canvas, 'keydown', event => { if (['ArrowUp','ArrowDown','ArrowLeft','ArrowRight','+','-'].includes(event.key)) manualInput(); });
  for (const button of document.querySelectorAll('[data-camera]')) listen(button, 'click', () => {
    // Runs before the viewer starts its new preset flight.
    stopTour(); clearNeighborhood(); selectedPlace = null;
    if (ui.landmarks) ui.landmarks.value = '';
    if (ui.detail) ui.detail.hidden = true;
  }, true);
  listen(document, 'visibilitychange', () => { if (document.hidden) pauseTour('Tour paused while this tab is hidden'); });
  listen(document, 'keydown', event => { if (event.key === 'Escape' && ui.detail && !ui.detail.hidden) closePlace(); });
  listen(media, 'change', () => pauseTour('Motion preference changed · resume for the updated tour'));

  function pick(clientX, clientY, verifyOcclusion) {
    const rect = canvas.getBoundingClientRect();
    if (!rect.width || !rect.height) return null;
    pointer.set((clientX-rect.left)/rect.width*2-1, -(clientY-rect.top)/rect.height*2+1);
    raycaster.setFromCamera(pointer, camera);
    const found = raycaster.intersectObjects(hit.volumes, false)[0];
    if (!found) return null;
    if (verifyOcclusion) {
      const model = api.model?.scene || api.model;
      if (model?.isObject3D) {
        const surface = raycaster.intersectObject(model, true)[0];
        if (surface && surface.distance < found.distance-.045) return null;
      }
    }
    return found.object.userData.placeId;
  }
  listen(canvas, 'pointerdown', event => {
    manualInput();
    if (event.isPrimary === false || (event.button !== undefined && event.button !== 0)) { down = null; return; }
    down = { id: event.pointerId, x: event.clientX, y: event.clientY, moved: false, touch: event.pointerType === 'touch' };
  }, true);
  listen(canvas, 'pointermove', event => {
    if (down && (event.pointerId === down.id || event.pointerId === undefined)) {
      if (Math.hypot(event.clientX-down.x, event.clientY-down.y) > (down.touch ? 10 : 6)) down.moved = true;
    } else if (event.pointerType !== 'touch') canvas.style.cursor = pick(event.clientX, event.clientY, false) ? 'pointer' : initialCursor;
  });
  listen(canvas, 'pointerup', event => {
    const start = down; down = null;
    if (!start || start.moved || (event.pointerId !== start.id && event.pointerId !== undefined)) return;
    if (Math.hypot(event.clientX-start.x, event.clientY-start.y) > (start.touch ? 10 : 6)) return;
    const id = pick(event.clientX, event.clientY, true);
    if (id) void selectLandmark(id, { fly: false, trigger: canvas });
  });
  listen(canvas, 'pointercancel', () => { down = null; });
  listen(canvas, 'pointerleave', () => { if (!down) canvas.style.cursor = initialCursor; });
  updateTourUI();

  return {
    startTour, pauseTour, stopTour, selectLandmark, selectNeighborhood, clearNeighborhood,
    getState: () => ({ status, elapsed, duration: TOUR_DURATION, currentLeg, phase: lastPhase,
      selectedPlace, neighborhood: overlay?.userData.neighborhoodId || null, detail: overlay?.userData.stats || null,
      reducedMotion: media.matches }),
    dispose() {
      stopTour(); disposed = true; clearOverlay(); offTick?.(); listeners.forEach(remove => remove()); hit.dispose(); canvas.style.cursor = initialCursor;
    },
  };
}

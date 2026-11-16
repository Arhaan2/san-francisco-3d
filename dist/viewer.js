import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { DRACOLoader } from 'three/addons/loaders/DRACOLoader.js';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';
import { createCityEnvironment } from './city-environment.js';

const presets={
 peninsula:{fov:42,position:[8.5,11,-11.5],target:[-3.7,.01,2.5]},
 waterfront:{fov:20,position:[2.8,.048,-2.15],target:[.54,.125,-.17]},
 skyline:{fov:30,position:[-.7,.24,-1.35],target:[.5,.14,.1]},
 bridge:{fov:32,position:[-4,.52,-6.4],target:[-6.3,.125,-3.2]}
};

export async function startViewer({onProgress=()=>{},notify=()=>{}}={}){
 const host=document.getElementById('canvas-host'),viewer=document.getElementById('viewer');
 if(!host||!viewer)throw new Error('The 3D viewer container is missing.');
 const renderer=new THREE.WebGLRenderer({antialias:true,alpha:false,powerPreference:'high-performance',logarithmicDepthBuffer:true,preserveDrawingBuffer:true});
 renderer.setPixelRatio(Math.min(devicePixelRatio,innerWidth<700?1.25:1.75));renderer.outputColorSpace=THREE.SRGBColorSpace;renderer.toneMapping=THREE.ACESFilmicToneMapping;renderer.toneMappingExposure=.95;
 renderer.domElement.tabIndex=0;renderer.domElement.setAttribute('aria-label','Interactive San Francisco model. Drag to orbit, scroll or pinch to zoom, arrow keys to pan.');renderer.domElement.setAttribute('role','img');host.appendChild(renderer.domElement);
 const scene=new THREE.Scene();scene.background=new THREE.Color('#9fb6c5');scene.fog=new THREE.FogExp2('#9fb6c5',.017);
 const camera=new THREE.PerspectiveCamera(42,1,.01,120);camera.position.fromArray(presets.peninsula.position);
 const controls=new OrbitControls(camera,renderer.domElement);controls.target.fromArray(presets.peninsula.target);controls.enableDamping=true;controls.dampingFactor=.075;controls.minDistance=.025;controls.maxDistance=45;controls.maxPolarAngle=Math.PI*.49;controls.screenSpacePanning=true;controls.listenToKeyEvents(renderer.domElement);controls.keyPanSpeed=12;
 const hemi=new THREE.HemisphereLight(0xc9e7ff,0x68746e,1.3);scene.add(hemi);
 const sun=new THREE.DirectionalLight(0xffe7c2,2);sun.position.set(6,3.5,-7.5);scene.add(sun);
 const pmrem=new THREE.PMREMGenerator(renderer),room=new RoomEnvironment(),environment=pmrem.fromScene(room,.03);scene.environment=environment.texture;scene.environmentIntensity=.35;room.dispose();pmrem.dispose();
 const loader=new GLTFLoader(),draco=new DRACOLoader();draco.setDecoderPath(new URL('./vendor/three/draco/',import.meta.url).href);draco.setDecoderConfig({type:'wasm'});draco.setWorkerLimit(2);loader.setDRACOLoader(draco);
 let loaded;
 try{loaded=await loader.loadAsync(new URL('./assets/san-francisco.glb',import.meta.url).href,e=>onProgress(e.lengthComputable?e.loaded/e.total*100:null))}
 catch(error){controls.dispose();environment.dispose();renderer.dispose();renderer.domElement.remove();throw error}
 finally{draco.dispose()}
 const model=loaded.scene;scene.add(model);
 const city=createCityEnvironment({scene,renderer,model,hemi,sun,initialHour:17.5});
 const reduce=matchMedia('(prefers-reduced-motion: reduce)'),ticks=new Set();
 let cameraTween=null,visible=true,raf=0,lastFrame=0,activeSeconds=0,contextLost=false,animationRequested=true;
 city.setAnimationEnabled(!reduce.matches);

 function refreshVisibility(){
  // Read the live canvas bounds: an observer entry can describe the old mobile
  // layout when a resize or fullscreen transition has already moved the viewer.
  const box=host.getBoundingClientRect();
  const next=box.width>0&&box.height>0&&box.bottom>0&&box.right>0&&box.top<innerHeight&&box.left<innerWidth;
  if(next!==visible){visible=next;lastFrame=0}
  if(!visible||document.hidden){cancelAnimationFrame(raf);raf=0;lastFrame=0}
  return visible;
 }
 function resize(){const box=host.getBoundingClientRect();refreshVisibility();if(box.width<=0||box.height<=0)return;renderer.setSize(box.width,box.height);camera.aspect=box.width/box.height;camera.updateProjectionMatrix();schedule()}
 const resizeObserver=new ResizeObserver(resize);resizeObserver.observe(host);
 function cancelFlight(){if(cameraTween){const pending=cameraTween;cameraTween=null;pending.resolve({cancelled:true})}}
 function flyTo(position,target,fov=camera.fov,duration=1600){
  if(!Array.isArray(position)||!Array.isArray(target)||position.length!==3||target.length!==3||![...position,...target,Number(fov),Number(duration)].every(Number.isFinite))throw new TypeError('Camera coordinates, field of view and duration must be finite numbers.');
  cancelFlight();
  const toPosition=new THREE.Vector3().fromArray(position),toTarget=new THREE.Vector3().fromArray(target),toFov=THREE.MathUtils.clamp(Number(fov),12,75);
  if(reduce.matches||duration<=0){camera.position.copy(toPosition);controls.target.copy(toTarget);camera.fov=toFov;camera.updateProjectionMatrix();controls.update();schedule();return Promise.resolve({cancelled:false})}
  return new Promise(resolve=>{cameraTween={elapsed:0,duration:Math.max(.001,Number(duration)/1000),fromFov:camera.fov,toFov,fromPosition:camera.position.clone(),fromTarget:controls.target.clone(),toPosition,toTarget,resolve};schedule()});
 }
 function selectPreset(key){
  const p=presets[key];if(!p)return;
  document.querySelectorAll('[data-camera]').forEach(button=>{const active=button.dataset.camera===key;button.classList.toggle('active',active);button.setAttribute('aria-pressed',String(active))});
  flyTo(p.position,p.target,p.fov);
 }
 document.querySelectorAll('[data-camera]').forEach(button=>button.addEventListener('click',()=>selectPreset(button.dataset.camera)));
 controls.addEventListener('start',cancelFlight);
 controls.addEventListener('change',schedule);
 reduce.addEventListener('change',()=>{
  city.setAnimationEnabled(animationRequested&&!reduce.matches);
  if(reduce.matches&&cameraTween){const pending=cameraTween;cameraTween=null;camera.position.copy(pending.toPosition);controls.target.copy(pending.toTarget);camera.fov=pending.toFov;camera.updateProjectionMatrix();pending.resolve({cancelled:false})}
  schedule();
 });
 renderer.domElement.addEventListener('webglcontextlost',event=>{
  event.preventDefault();contextLost=true;cancelAnimationFrame(raf);raf=0;cancelFlight();const failure=document.getElementById('viewer-failure');if(failure)failure.hidden=false;
  notify('3D paused because the graphics context was lost. Reload the page to restart it; the renders remain available.');
 });
 const observer=new IntersectionObserver(()=>{refreshVisibility();schedule()},{threshold:0});observer.observe(host);
 document.addEventListener('visibilitychange',()=>{lastFrame=0;refreshVisibility();schedule()});

 const fullscreenButton=document.getElementById('fullscreen');
 let expanded=false,expansionPlaceholder=null,previousOverflow='';
 function updateFullscreenButton(){if(!fullscreenButton)return;const active=expanded||document.fullscreenElement===viewer;fullscreenButton.textContent=active?'Exit full screen':'Full screen';fullscreenButton.setAttribute('aria-label',active?'Exit expanded 3D viewer':'Expand 3D viewer');fullscreenButton.setAttribute('aria-pressed',String(active));}
 function setExpanded(active){
  if(expanded===active)return;expanded=active;
  if(active){previousOverflow=document.body.style.overflow;expansionPlaceholder=document.createElement('div');expansionPlaceholder.style.height=viewer.getBoundingClientRect().height+'px';expansionPlaceholder.setAttribute('aria-hidden','true');viewer.before(expansionPlaceholder);viewer.classList.add('viewer-expanded');document.body.style.overflow='hidden'}
  else{viewer.classList.remove('viewer-expanded');expansionPlaceholder?.remove();expansionPlaceholder=null;document.body.style.overflow=previousOverflow;fullscreenButton?.focus({preventScroll:true})}
  updateFullscreenButton();requestAnimationFrame(resize);
 }
 fullscreenButton?.addEventListener('click',async()=>{
  if(expanded){setExpanded(false);return}
  if(document.fullscreenElement===viewer){try{await document.exitFullscreen()}catch{notify('Use Escape or your browser controls to leave full screen.')}return}
  if(!viewer.requestFullscreen){setExpanded(true);return}
  try{await viewer.requestFullscreen()}catch{setExpanded(true)}
 });
 document.addEventListener('fullscreenchange',()=>{updateFullscreenButton();requestAnimationFrame(resize)});
 document.addEventListener('keydown',event=>{if(expanded&&event.key==='Escape'){event.preventDefault();setExpanded(false)}});
 updateFullscreenButton();

 function schedule(){if(!visible)refreshVisibility();if(!raf&&visible&&!document.hidden&&!contextLost)raf=requestAnimationFrame(animate)}
 function animate(now){
  raf=0;if(!visible||document.hidden||contextLost){lastFrame=0;return}
  const delta=lastFrame?Math.min(Math.max((now-lastFrame)/1000,0),.1):0;lastFrame=now;activeSeconds+=delta;
  for(const tick of ticks){try{tick(activeSeconds,delta)}catch(error){ticks.delete(tick);console.error('City animation callback:',error)}}
  if(cameraTween){
   const flight=cameraTween;flight.elapsed+=delta;const t=Math.min(flight.elapsed/flight.duration,1),eased=t*t*(3-2*t);
   camera.position.lerpVectors(flight.fromPosition,flight.toPosition,eased);controls.target.lerpVectors(flight.fromTarget,flight.toTarget,eased);camera.fov=THREE.MathUtils.lerp(flight.fromFov,flight.toFov,eased);camera.updateProjectionMatrix();
   if(t===1){cameraTween=null;flight.resolve({cancelled:false})}
  }
  controls.update();city.update(delta,camera);renderer.render(scene,camera);schedule();
 }
 resize();controls.update();city.update(0,camera);renderer.render(scene,camera);schedule();renderer.domElement.focus({preventScroll:true});viewer.dataset.loaded='true';
 const api={
  scene,camera,controls,renderer,model,flyTo,
  setTimeOfDay(hours){const result=city.setTimeOfDay(hours);schedule();return result},
  getTimeOfDay:()=>city.getTimeOfDay(),
  addTick(fn){if(typeof fn!=='function')throw new TypeError('An animation callback is required.');ticks.add(fn);schedule();return()=>ticks.delete(fn)},
  setAnimationEnabled(value){animationRequested=Boolean(value);city.setAnimationEnabled(animationRequested&&!reduce.matches);schedule();return city.getAnimationEnabled()},
  getAnimationEnabled:()=>city.getAnimationEnabled(),
  cancelFlight,
  get isFlying(){return cameraTween!==null},
  get isVisible(){return visible&&!document.hidden},
  environment:city
 };
 return api;
}

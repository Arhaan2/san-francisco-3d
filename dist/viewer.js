import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { DRACOLoader } from 'three/addons/loaders/DRACOLoader.js';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';

const presets={
 peninsula:{fov:42,position:[8.5,11,-11.5],target:[-3.7,.01,2.5]},
 waterfront:{fov:20,position:[2.8,.048,-2.15],target:[.54,.125,-.17]},
 skyline:{fov:30,position:[-.7,.24,-1.35],target:[.5,.14,.1]},
 bridge:{fov:32,position:[-4,.52,-6.4],target:[-6.3,.125,-3.2]}
};
export async function startViewer({onProgress,notify}){
 const host=document.getElementById('canvas-host'),viewer=document.getElementById('viewer');
 const renderer=new THREE.WebGLRenderer({antialias:true,alpha:false,powerPreference:'high-performance',logarithmicDepthBuffer:true});
 renderer.setPixelRatio(Math.min(devicePixelRatio,innerWidth<700?1.25:1.75));renderer.outputColorSpace=THREE.SRGBColorSpace;renderer.toneMapping=THREE.ACESFilmicToneMapping;renderer.toneMappingExposure=.95;
 renderer.domElement.tabIndex=0;renderer.domElement.setAttribute('aria-label','Interactive San Francisco model. Drag to orbit, scroll or pinch to zoom, arrow keys to pan.');renderer.domElement.setAttribute('role','img');host.appendChild(renderer.domElement);
 const scene=new THREE.Scene();scene.background=new THREE.Color('#9fb6c5');scene.fog=new THREE.FogExp2('#9fb6c5',.017);
 const camera=new THREE.PerspectiveCamera(42,1,.01,120);camera.position.fromArray(presets.peninsula.position);
 const controls=new OrbitControls(camera,renderer.domElement);controls.target.fromArray(presets.peninsula.target);controls.enableDamping=true;controls.dampingFactor=.075;controls.minDistance=.025;controls.maxDistance=45;controls.maxPolarAngle=Math.PI*.49;controls.screenSpacePanning=true;controls.listenToKeyEvents(renderer.domElement);controls.keyPanSpeed=12;
 const hemi=new THREE.HemisphereLight(0xc9e7ff,0x68746e,1.3);scene.add(hemi);const sun=new THREE.DirectionalLight(0xffe7c2,2.0);sun.position.set(6,3.5,-7.5);scene.add(sun);
 const pmrem=new THREE.PMREMGenerator(renderer);const env=new RoomEnvironment();const environment=pmrem.fromScene(env,.03);scene.environment=environment.texture;scene.environmentIntensity=.35;env.dispose();pmrem.dispose();
 const loader=new GLTFLoader();const draco=new DRACOLoader();draco.setDecoderPath(new URL('./vendor/three/draco/',import.meta.url).href);draco.setDecoderConfig({type:'wasm'});draco.setWorkerLimit(2);loader.setDRACOLoader(draco);
 const model=await loader.loadAsync(new URL('./assets/san-francisco.glb',import.meta.url).href,e=>onProgress(e.lengthComputable?e.loaded/e.total*100:null));
 model.scene.traverse(object=>{if(!object.isMesh)return;const materials=Array.isArray(object.material)?object.material:[object.material];for(const material of materials){if(material?.name==='WEB | Pacific blue'){material.roughness=.8;material.metalness=0;material.envMapIntensity=0;material.needsUpdate=true}}});
 scene.add(model.scene);draco.dispose();
 let cameraTween=null,visible=true,raf=0;
 const reduce=matchMedia('(prefers-reduced-motion: reduce)');
 function resize(){const box=host.getBoundingClientRect();renderer.setSize(box.width,box.height);camera.aspect=box.width/box.height;camera.updateProjectionMatrix()}
 const resizeObserver=new ResizeObserver(resize);resizeObserver.observe(host);resize();
 function selectPreset(key){const p=presets[key];if(!p)return;document.querySelectorAll('[data-camera]').forEach(b=>{const active=b.dataset.camera===key;b.classList.toggle('active',active);b.setAttribute('aria-pressed',String(active))});if(reduce.matches){camera.position.fromArray(p.position);controls.target.fromArray(p.target);camera.fov=p.fov;camera.updateProjectionMatrix();cameraTween=null}else cameraTween={start:performance.now(),fromFov:camera.fov,toFov:p.fov,fromPosition:camera.position.clone(),fromTarget:controls.target.clone(),toPosition:new THREE.Vector3().fromArray(p.position),toTarget:new THREE.Vector3().fromArray(p.target)};}
 document.querySelectorAll('[data-camera]').forEach(button=>button.addEventListener('click',()=>selectPreset(button.dataset.camera)));
 controls.addEventListener('start',()=>{cameraTween=null});
 renderer.domElement.addEventListener('webglcontextlost',e=>{e.preventDefault();cancelAnimationFrame(raf);document.getElementById('viewer-failure').hidden=false;notify('3D paused because the graphics context was lost. The renders remain available.')});
 const observer=new IntersectionObserver(entries=>{visible=entries[0].isIntersecting},{threshold:0});observer.observe(viewer);
 const fullscreenButton=document.getElementById('fullscreen');
 let expanded=false,expansionPlaceholder=null,previousOverflow='';
 function updateFullscreenButton(){const active=expanded||document.fullscreenElement===viewer;fullscreenButton.textContent=active?'Exit full screen':'Full screen';fullscreenButton.setAttribute('aria-label',active?'Exit expanded 3D viewer':'Expand 3D viewer');fullscreenButton.setAttribute('aria-pressed',String(active));}
 function setExpanded(active){if(expanded===active)return;expanded=active;if(active){previousOverflow=document.body.style.overflow;expansionPlaceholder=document.createElement('div');expansionPlaceholder.style.height=viewer.getBoundingClientRect().height+'px';expansionPlaceholder.setAttribute('aria-hidden','true');viewer.before(expansionPlaceholder);viewer.classList.add('viewer-expanded');document.body.style.overflow='hidden';}else{viewer.classList.remove('viewer-expanded');expansionPlaceholder?.remove();expansionPlaceholder=null;document.body.style.overflow=previousOverflow;fullscreenButton.focus({preventScroll:true});}updateFullscreenButton();requestAnimationFrame(resize);}
 fullscreenButton.addEventListener('click',async()=>{if(expanded){setExpanded(false);return;}if(document.fullscreenElement===viewer){try{await document.exitFullscreen();}catch{notify('Use Escape or your browser controls to leave full screen.');}return;}if(!viewer.requestFullscreen){setExpanded(true);return;}try{await viewer.requestFullscreen();}catch{setExpanded(true);}});
 document.addEventListener('fullscreenchange',()=>{updateFullscreenButton();requestAnimationFrame(resize);});
 document.addEventListener('keydown',event=>{if(expanded&&event.key==='Escape'){event.preventDefault();setExpanded(false);}});
 updateFullscreenButton();
 function animate(now){raf=requestAnimationFrame(animate);if(!visible||document.hidden)return;if(cameraTween){const t=Math.min((now-cameraTween.start)/1000,1);const eased=t*t*(3-2*t);camera.position.lerpVectors(cameraTween.fromPosition,cameraTween.toPosition,eased);controls.target.lerpVectors(cameraTween.fromTarget,cameraTween.toTarget,eased);camera.fov=THREE.MathUtils.lerp(cameraTween.fromFov,cameraTween.toFov,eased);camera.updateProjectionMatrix();if(t===1)cameraTween=null}controls.update();renderer.render(scene,camera)}
 controls.update();renderer.render(scene,camera);raf=requestAnimationFrame(animate);renderer.domElement.focus({preventScroll:true});viewer.dataset.loaded='true';
}

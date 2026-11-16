import * as THREE from 'three';

// Distances in this scene are kilometres. The clock is an art-directed solar
// cycle, not a timetable or an astronomical calculation for a particular date.
const clamp=THREE.MathUtils.clamp;
const smooth=(a,b,x)=>{const t=clamp((x-a)/(b-a),0,1);return t*t*(3-2*t)};
const DAY_PALETTE=[
 [0,'#06111f','#15293b'],[5,'#101a32','#333349'],[6.5,'#547f9a','#d9b28a'],
 [8,'#6095b4','#cfdee2'],[12,'#508bad','#c2d8df'],[16,'#5689a7','#d2d9d2'],
 [17.5,'#5e829f','#eac09b'],[18.5,'#344565','#c18d83'],[19.5,'#1c3152','#5a6b83'],
 [21,'#0a1b2d','#20374c'],[24,'#06111f','#15293b']
].map(([hour,top,horizon])=>({hour,top:new THREE.Color(top),horizon:new THREE.Color(horizon)}));

const SKY_VERTEX=`
 varying vec3 sfDirection;
 #include <common>
 #include <logdepthbuf_pars_vertex>
 void main(){
  sfDirection=position;
  gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.0);
  #include <logdepthbuf_vertex>
 }`;
const SKY_FRAGMENT=`
 uniform vec3 sfTop,sfHorizon,sfSunColor,sfSunDirection;
 uniform float sfNight,sfSunVisibility,sfTime;
 varying vec3 sfDirection;
 #include <common>
 #include <logdepthbuf_pars_fragment>
 float hash21(vec2 p){return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5453);}
 float noise21(vec2 p){vec2 i=floor(p),f=fract(p);f=f*f*(3.0-2.0*f);return mix(mix(hash21(i),hash21(i+vec2(1,0)),f.x),mix(hash21(i+vec2(0,1)),hash21(i+vec2(1,1)),f.x),f.y);}
 void main(){
  #include <logdepthbuf_fragment>
  vec3 d=normalize(sfDirection);
  float altitude=max(d.y,0.0);
  vec3 color=mix(sfHorizon,sfTop,pow(altitude,.48));
  vec2 cloudUV=d.xz/max(d.y+.25,.12)*2.4+vec2(sfTime*.00012,sfTime*.000035);
  float cloud=noise21(cloudUV)*.65+noise21(cloudUV*2.07)*.35;
  cloud=smoothstep(.51,.77,cloud)*smoothstep(-.025,.18,d.y);
  color=mix(color,mix(sfHorizon,vec3(.88,.91,.93),.28),cloud*.17*(1.0-sfNight*.85));
  float sunDot=dot(d,normalize(sfSunDirection));
  color+=sfSunColor*pow(max(sunDot,0.0),32.0)*.16*sfSunVisibility;
  color+=sfSunColor*smoothstep(.99980,.99991,sunDot)*2.5*sfSunVisibility;
  vec2 starUV=vec2(atan(d.z,d.x),asin(clamp(d.y,-1.0,1.0)))*430.0;
  vec2 cell=floor(starUV),p=fract(starUV)-.5;
  float star=step(.996,hash21(cell))*exp(-dot(p,p)*100.0);
  color+=vec3(.55,.65,.8)*star*sfNight*smoothstep(.12,.45,d.y)*.7;
  gl_FragColor=vec4(color,1.0);
  #include <tonemapping_fragment>
  #include <colorspace_fragment>
 }`;

function addWorldPosition(shader){
 if(shader.vertexShader.includes('varying vec3 sfWorldPosition;'))return;
 shader.vertexShader='varying vec3 sfWorldPosition;\n'+shader.vertexShader;
 shader.vertexShader=shader.vertexShader.replace('#include <project_vertex>','#include <project_vertex>\nsfWorldPosition=(modelMatrix*vec4(transformed,1.0)).xyz;');
 shader.fragmentShader='varying vec3 sfWorldPosition;\n'+shader.fragmentShader;
}
function program(material,key,edit){
 const previous=material.onBeforeCompile;
 material.onBeforeCompile=function(shader,renderer){previous?.call(this,shader,renderer);edit(shader)};
 material.customProgramCacheKey=()=>key;
 material.needsUpdate=true;
}
function hashName(name){let h=0;for(const c of name)h=(h*31+c.charCodeAt(0))>>>0;return h%997}

function setupCityMaterials(model,uniforms){
 const materials=new Set();
 model.traverse(o=>{if(o.isMesh)for(const m of Array.isArray(o.material)?o.material:[o.material])if(m)materials.add(m)});
 const luminous=[];
 for(const m of materials){
  if(m.name==='WEB | Pacific blue'){
   m.roughness=.57;m.metalness=.04;m.envMapIntensity=.2;
   program(m,'sf-water-v3',shader=>{
    addWorldPosition(shader);shader.uniforms.sfTime=uniforms.time;
    shader.fragmentShader='uniform float sfTime;\n'+shader.fragmentShader;
    shader.fragmentShader=shader.fragmentShader.replace('#include <normal_fragment_maps>',`#include <normal_fragment_maps>
     vec2 p=sfWorldPosition.xz;
     float a=sin(p.x*830.0+p.y*320.0+sfTime*.8);
     float b=sin(p.x*370.0-p.y*940.0+sfTime*1.15);
     float c=sin(p.x*1470.0+p.y*1120.0-sfTime*1.7);
     float distanceFade=1.0/(1.0+distance(sfWorldPosition,cameraPosition)*.45);
     vec3 waterNormal=normalize(vec3((a*.035+c*.012)*distanceFade,1.0,(b*.035+c*.012)*distanceFade));
     normal=normalize(mat3(viewMatrix)*waterNormal);`);
   });
  }else if(m.name.startsWith('WEB | facade')&&m.map){
   program(m,'sf-facade-lights-v4',shader=>{
    shader.uniforms.sfNight=uniforms.night;shader.uniforms.sfSeed={value:hashName(m.name)};
    shader.fragmentShader=`uniform float sfNight,sfSeed;\nfloat sfRoomHash(vec2 p){return fract(sin(dot(p,vec2(127.1,311.7))+sfSeed)*43758.5453);}\n`+shader.fragmentShader;
    shader.fragmentShader=shader.fragmentShader.replace('#include <emissivemap_fragment>',`#include <emissivemap_fragment>
     #ifdef USE_MAP
      float windowMask=1.0-smoothstep(.035,.055,dot(diffuseColor.rgb,vec3(.2126,.7152,.0722)));
      vec2 room=floor(vMapUv);
      float occupied=step(.935,sfRoomHash(room));
      vec3 lampColor=mix(vec3(1.0,.54,.21),vec3(.69,.79,1.0),step(.84,sfRoomHash(room+13.7)));
      totalEmissiveRadiance+=lampColor*windowMask*occupied*sfNight*.38;
     #endif`);
   });
  }else if(/WEB \| Hero \| (Reflective glass|Bronze glazing)/.test(m.name)){
   program(m,'sf-tower-lights-v4',shader=>{
    addWorldPosition(shader);shader.uniforms.sfNight=uniforms.night;
    shader.fragmentShader=`uniform float sfNight;\nfloat sfTowerHash(vec3 p){return fract(sin(dot(p,vec3(127.1,311.7,74.7)))*43758.5453);}\n`+shader.fragmentShader;
    shader.fragmentShader=shader.fragmentShader.replace('#include <emissivemap_fragment>',`#include <emissivemap_fragment>
     vec3 room=floor(sfWorldPosition*vec3(400.0,285.714,400.0));
     float occupied=step(.975,sfTowerHash(room));
     totalEmissiveRadiance+=vec3(1.0,.60,.28)*occupied*sfNight*.44;`);
   });
  }else if(m.name==='WEB | Hero | Glazing graphite'){
   program(m,'sf-crown-light-v4',shader=>{
    addWorldPosition(shader);shader.uniforms.sfNight=uniforms.night;
    shader.fragmentShader='uniform float sfNight;\n'+shader.fragmentShader;
    shader.fragmentShader=shader.fragmentShader.replace('#include <emissivemap_fragment>',`#include <emissivemap_fragment>
     float crown=(1.0-step(.052,distance(sfWorldPosition.xz,vec2(.78849,.171532))))*step(.275,sfWorldPosition.y);
     totalEmissiveRadiance+=vec3(.68,.79,1.0)*crown*sfNight*.30;`);
   });
  }
  if(/Warm occupied office|Clock enamel|Bridge \/ lamp lens/.test(m.name)){
   m.emissive=new THREE.Color('#ffd59c');luminous.push(m);
  }
 }
 return luminous;
}

// A low coastal field rides the existing surface shading. It adds no fog
// planes or draw calls, and follows the active animation clock so pause and
// reduced-motion keep the exact current bank instead of making it disappear.
function setupCoastalFog(model,uniforms){
 const materials=new Set();model.traverse(o=>{if(o.isMesh)for(const m of Array.isArray(o.material)?o.material:[o.material])if(m?.isMeshStandardMaterial)materials.add(m)});
 for(const material of materials){
  const previousKey=material.customProgramCacheKey();
  program(material,previousKey+'|sf-coastal-haze-v1',shader=>{
   addWorldPosition(shader);shader.uniforms.sfTime=uniforms.time;shader.uniforms.sfCoastalFogColor=uniforms.fogColor;
   if(!shader.fragmentShader.includes('uniform float sfTime;'))shader.fragmentShader='uniform float sfTime;\n'+shader.fragmentShader;
   shader.fragmentShader=`uniform vec3 sfCoastalFogColor;
    float sfFogHash(vec2 p){return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5453);}
    float sfFogNoise(vec2 p){vec2 i=floor(p),f=fract(p);f=f*f*(3.0-2.0*f);return mix(mix(sfFogHash(i),sfFogHash(i+vec2(1,0)),f.x),mix(sfFogHash(i+vec2(0,1)),sfFogHash(i+vec2(1,1)),f.x),f.y);}
   `+shader.fragmentShader;
   shader.fragmentShader=shader.fragmentShader.replace('#include <opaque_fragment>',`
    vec2 sfStrait=(sfWorldPosition.xz-vec2(-6.3,-3.2))/vec2(2.1,.82);
    vec2 sfNorthBay=(sfWorldPosition.xz-vec2(-3.4,-5.1))/vec2(2.0,1.25);
    float sfCoastalRegion=exp(-dot(sfStrait,sfStrait)*1.6)+exp(-dot(sfNorthBay,sfNorthBay)*1.7)*.58;
    if(sfCoastalRegion>.003&&sfWorldPosition.y<.35){
     vec2 sfFogUV=sfWorldPosition.xz*3.1+vec2(sfTime*.006,-sfTime*.0019);
     float sfWisps=sfFogNoise(sfFogUV)*.68+sfFogNoise(sfFogUV*2.13+8.7)*.32;
     sfWisps=smoothstep(.23,.76,sfWisps);
     float sfHeight=exp(-pow(max(sfWorldPosition.y-.012,0.0)/.085,2.0));
     float sfDepth=1.0-exp(-distance(cameraPosition,sfWorldPosition)*.35);
     float sfVeil=clamp(sfCoastalRegion*sfWisps*sfHeight*sfDepth*.20,0.0,.20);
     outgoingLight=mix(outgoingLight,sfCoastalFogColor,sfVeil);
    }
    #include <opaque_fragment>`);
  });
 }
}

const FERRY_MATERIAL=/WEB \| Hero \| (Marine white|Marine navy|Light aluminum|Reflective glass 01|Deck safety red)$/;
function lonLatToWorld(lon,lat){return new THREE.Vector3(((lon+122.44)*87900-3000)/1000,0,-((lat-37.76)*111320-3500)/1000)}

// The GLB batches by material. Lift the two existing vessels out of those
// batches, rather than placing copies over the original static ferries.
function extractFerry(model,scene,lon,lat,name){
 model.updateWorldMatrix(true,true);
 const center=lonLatToWorld(lon,lat),group=new THREE.Group();group.name=name;group.position.copy(center);
 const sources=[];model.traverse(o=>{if(o.isMesh&&!Array.isArray(o.material)&&FERRY_MATERIAL.test(o.material.name))sources.push(o)});
 let triangles=0;const pending=[];
 for(const mesh of sources){
  const geometry=mesh.geometry,index=geometry.index,position=geometry.attributes.position;
  if(!index||!position)continue;
  const localCenter=mesh.worldToLocal(center.clone()),scale=new THREE.Vector3();mesh.getWorldScale(scale);
  const radius=.032/Math.max(Math.abs(scale.x),1e-9),yLow=localCenter.y-.001/Math.abs(scale.y),yHigh=localCenter.y+.017/Math.abs(scale.y);
  const selected=[],remaining=new Uint32Array(index.count);let retained=0;
  for(let i=0;i<index.count;i+=3){
   const a=index.getX(i),b=index.getX(i+1),c=index.getX(i+2);
   const x=(position.getX(a)+position.getX(b)+position.getX(c))/3-localCenter.x;
   const z=(position.getZ(a)+position.getZ(b)+position.getZ(c))/3-localCenter.z;
   const y=(position.getY(a)+position.getY(b)+position.getY(c))/3;
   if(x*x+z*z<radius*radius&&y>yLow&&y<yHigh)selected.push(a,b,c);
   else{remaining[retained++]=a;remaining[retained++]=b;remaining[retained++]=c}
  }
  if(!selected.length)continue;
  const remap=new Map(),vertices=[],normals=[],uvs=[],indices=[],v=new THREE.Vector3(),normal=new THREE.Vector3();
  const normalMatrix=new THREE.Matrix3().getNormalMatrix(mesh.matrixWorld),sourceNormal=geometry.attributes.normal,sourceUV=geometry.attributes.uv;
  for(const old of selected){
   let next=remap.get(old);
   if(next===undefined){
    next=remap.size;remap.set(old,next);v.fromBufferAttribute(position,old).applyMatrix4(mesh.matrixWorld).sub(center);vertices.push(v.x,v.y,v.z);
    if(sourceNormal){normal.fromBufferAttribute(sourceNormal,old).applyMatrix3(normalMatrix).normalize();normals.push(normal.x,normal.y,normal.z)}
    if(sourceUV)uvs.push(sourceUV.getX(old),sourceUV.getY(old));
   }
   indices.push(next);
  }
  const part=new THREE.BufferGeometry();part.setAttribute('position',new THREE.Float32BufferAttribute(vertices,3));part.setIndex(indices);
  if(normals.length)part.setAttribute('normal',new THREE.Float32BufferAttribute(normals,3));else part.computeVertexNormals();
  if(uvs.length)part.setAttribute('uv',new THREE.Float32BufferAttribute(uvs,2));
  part.computeBoundingSphere();group.add(new THREE.Mesh(part,mesh.material));
  pending.push({geometry,indices:remaining.slice(0,retained),retained});triangles+=selected.length/3;
 }
 if(triangles<20){for(const child of group.children)child.geometry.dispose();return null}
 for(const item of pending){item.geometry.setIndex(new THREE.BufferAttribute(item.indices,1));item.geometry.setDrawRange(0,item.retained)}
 scene.add(group);group.userData.source='Animated existing ferry geometry';group.userData.extractedTriangles=triangles;
 return {group,center};
}

function makeWake(scene,uniforms){
 const material=new THREE.ShaderMaterial({transparent:true,depthWrite:false,side:THREE.DoubleSide,
  uniforms:{sfTime:uniforms.time,sfNight:uniforms.night},
  vertexShader:`varying vec2 sfUV;\n#include <common>\n#include <logdepthbuf_pars_vertex>\nvoid main(){sfUV=uv;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.0);\n#include <logdepthbuf_vertex>\n}`,
  fragmentShader:`uniform float sfTime,sfNight;varying vec2 sfUV;\n#include <common>\n#include <logdepthbuf_pars_fragment>\nvoid main(){\n#include <logdepthbuf_fragment>
   float t=sfUV.y,x=abs(sfUV.x-.5)*2.0;
   float edge=.06+t*.85;
   float arms=exp(-pow((x-edge)*34.0,2.0));
   float center=exp(-x*x/(.004+t*.03))*.3;
   float ripple=.75+.25*sin(t*100.0-sfTime*4.0+x*8.0);
   float alpha=(arms*.38+center)*pow(1.0-t,1.35)*smoothstep(0.0,.055,t)*ripple;
   vec3 color=mix(vec3(.64,.79,.81),vec3(.10,.22,.30),sfNight);
   gl_FragColor=vec4(color,alpha*.5);
   #include <tonemapping_fragment>
   #include <colorspace_fragment>
  }`});
 const mesh=new THREE.Mesh(new THREE.PlaneGeometry(.115,.28),material);mesh.rotation.x=-Math.PI/2;mesh.position.set(0,.00168,-.155);
 const root=new THREE.Group();root.name='Ferry wake';root.add(mesh);scene.add(root);return root;
}
function setupFerries(model,scene,uniforms){
 const specs=[
  {lon:-122.3923,lat:37.7952,angle:1.93,duration:560,route:[[1.55,-.53],[2.35,-.85],[3.25,-1.45],[3.75,-1.9],[3.2,-2.05],[2.2,-1.35],[1.6,-.78]]},
  {lon:-122.3900,lat:37.7970,angle:1.1,duration:430,route:[[1.85,-.93],[2.45,-1.55],[2.95,-2.25],[2.62,-2.48],[2.0,-1.72],[1.62,-1.02]]}
 ];
 return specs.map((spec,i)=>{
  const boat=extractFerry(model,scene,spec.lon,spec.lat,`Bay passenger ferry ${i+2} · underway`);if(!boat)return null;
  const points=[boat.center.clone(),...spec.route.map(([x,z])=>new THREE.Vector3(x,0,z))];
  return {...boat,curve:new THREE.CatmullRomCurve3(points,true,'centripetal'),duration:spec.duration,nativeHeading:Math.atan2(-Math.sin(spec.angle),-Math.cos(spec.angle)),wake:makeWake(scene,uniforms),phase:i*1.7};
 }).filter(Boolean);
}

export function createCityEnvironment({scene,renderer,model,hemi,sun,initialHour=17.5}){
 const uniforms={time:{value:0},night:{value:0},fogColor:{value:new THREE.Color()}};
 const skyMaterial=new THREE.ShaderMaterial({side:THREE.BackSide,depthWrite:false,depthTest:false,
  uniforms:{sfTop:{value:new THREE.Color()},sfHorizon:{value:new THREE.Color()},sfSunColor:{value:new THREE.Color()},sfSunDirection:{value:new THREE.Vector3()},sfNight:uniforms.night,sfSunVisibility:{value:1},sfTime:uniforms.time},vertexShader:SKY_VERTEX,fragmentShader:SKY_FRAGMENT});
 const sky=new THREE.Mesh(new THREE.SphereGeometry(90,32,16),skyMaterial);sky.name='Living San Francisco sky';sky.renderOrder=-1000;sky.frustumCulled=false;scene.add(sky);
 const luminous=setupCityMaterials(model,uniforms),ferries=setupFerries(model,scene,uniforms);
 setupCoastalFog(model,uniforms);
 let hour=17.5,elapsed=0,animationEnabled=true;
 const sunDirection=new THREE.Vector3(),tangent=new THREE.Vector3(),position=new THREE.Vector3();
 function setTimeOfDay(value){
  if(!Number.isFinite(Number(value)))return hour;
  hour=Number(value)===24?24:((Number(value)%24)+24)%24;
  let left=DAY_PALETTE[0],right=DAY_PALETTE[1];
  for(let i=1;i<DAY_PALETTE.length;i++)if(hour<=DAY_PALETTE[i].hour){left=DAY_PALETTE[i-1];right=DAY_PALETTE[i];break}
  const raw=(hour-left.hour)/(right.hour-left.hour),blend=raw*raw*(3-2*raw);
  const top=skyMaterial.uniforms.sfTop.value.copy(left.top).lerp(right.top,blend);
  const horizon=skyMaterial.uniforms.sfHorizon.value.copy(left.horizon).lerp(right.horizon,blend);
  const solarAngle=(hour-6)/12*Math.PI,altitude=Math.sin(solarAngle)*.85;
  const day=smooth(-.15,.24,altitude),night=1-smooth(-.10,.17,altitude);
  uniforms.night.value=night;
  // Sun travels east to west across the bay, dipping below the horizon at night.
  sunDirection.set(Math.cos(solarAngle)*.82,altitude,.32).normalize();
  sun.position.copy(sunDirection).multiplyScalar(25);
  sun.color.set('#ffe8ca').lerp(new THREE.Color('#ffb875'),1-smooth(.02,.45,altitude));
  sun.intensity=Math.sqrt(Math.max(0,Math.sin(solarAngle)))*2.25*smooth(-.04,.08,altitude);
  hemi.color.copy(top).lerp(new THREE.Color('#cbe1ef'),day*.42);hemi.groundColor.set('#56605a').lerp(new THREE.Color('#182633'),night);
  hemi.intensity=THREE.MathUtils.lerp(.22,1.32,day);
  scene.environmentIntensity=THREE.MathUtils.lerp(.065,.36,day);
  uniforms.fogColor.value.copy(horizon).lerp(top,.18);
  scene.background=horizon.clone();scene.fog.color.copy(horizon);scene.fog.density=THREE.MathUtils.lerp(.019,.014,night);
  renderer.toneMappingExposure=THREE.MathUtils.lerp(.95,1.12,night);
  skyMaterial.uniforms.sfSunDirection.value.copy(sunDirection);skyMaterial.uniforms.sfSunColor.value.copy(sun.color);
  skyMaterial.uniforms.sfSunVisibility.value=smooth(-.04,.015,altitude);
  for(const m of luminous)m.emissiveIntensity=.01+night*.65;
  return hour;
 }
 function update(delta,camera){
  if(animationEnabled)elapsed+=Math.max(0,Math.min(delta,.1));
  uniforms.time.value=elapsed;sky.position.copy(camera.position);
  for(const ferry of ferries){
   const progress=(elapsed/ferry.duration)%1;
   ferry.curve.getPointAt(progress,position);ferry.curve.getTangentAt(progress,tangent);
   const heading=Math.atan2(tangent.x,tangent.z);
   ferry.group.position.copy(position);ferry.group.position.y=Math.sin(elapsed*.8+ferry.phase)*.00008;
   ferry.group.rotation.y=heading-ferry.nativeHeading;
   ferry.wake.position.copy(position);ferry.wake.rotation.y=heading;ferry.wake.visible=animationEnabled;
  }
 }
 setTimeOfDay(initialHour);
 return {setTimeOfDay,getTimeOfDay:()=>hour,update,setAnimationEnabled:value=>{animationEnabled=Boolean(value)},getAnimationEnabled:()=>animationEnabled,ferries,sky};
}

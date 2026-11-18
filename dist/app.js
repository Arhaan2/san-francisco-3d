'use strict';
const views=[
 {file:'skyline',title:'Telegraph Hill, looking downtown',alt:'Transamerica Pyramid, Salesforce Tower and the dense streets of downtown San Francisco'},
 {file:'waterfront',title:'The Embarcadero in daylight',alt:'The Ferry Building and San Francisco skyline reflected in the bay'},
 {file:'golden-gate',title:'The Golden Gate, from Marin',alt:'The Golden Gate Bridge spanning the strait between San Francisco and Marin'},
 {file:'ferry',title:'The Ferry Building',alt:'The Ferry Building clock tower, passenger ferries and detailed downtown architecture'},
 {file:'blue-hour',title:'Blue hour on the waterfront',alt:'Illuminated windows across the waterfront under a blue evening sky'},
 {file:'aerial',title:'The whole peninsula',alt:'An aerial view of the full city, its hills and parks, the Golden Gate and the bay'},
 {file:'sunset',title:'Sunset over the bay',alt:'The San Francisco skyline and bay in warm sunset light'}
];
const $=s=>document.querySelector(s);
let toastTimer;
function notify(message){const t=$('#toast'),host=document.fullscreenElement||document.body;if(t.parentNode!==host)host.appendChild(t);clearTimeout(toastTimer);t.textContent=message;t.hidden=false;toastTimer=setTimeout(()=>t.hidden=true,4500)}
document.addEventListener('fullscreenchange',()=>{const t=$('#toast'),host=document.fullscreenElement||document.body;if(t.parentNode!==host)host.appendChild(t)});
$('#share').addEventListener('click',async()=>{try{await navigator.clipboard.writeText(location.href.split('#')[0]);notify('Link copied. Send San Francisco to someone.')}catch{notify('Copy the page address from your browser to share this city.')}});
const dialog=$('#lightbox');let currentView=0,lastFocus;
function showView(index){currentView=(index+views.length)%views.length;const v=views[currentView];$('#lightbox-image').src=`assets/${v.file}.jpg`;$('#lightbox-image').alt=v.alt;$('#lightbox-title').textContent=v.title;$('#full-image').href=`assets/${v.file}.jpg`;}
document.querySelectorAll('[data-view]').forEach(a=>a.addEventListener('click',e=>{if(typeof dialog.showModal!=='function')return;e.preventDefault();lastFocus=a;showView(Number(a.dataset.view));dialog.showModal();document.body.style.overflow='hidden';$('#close-lightbox').focus()}));
function closeGallery(){dialog.close()}
$('#close-lightbox').addEventListener('click',closeGallery);dialog.addEventListener('close',()=>{document.body.style.overflow='';lastFocus?.focus({preventScroll:true})});$('#previous-view').addEventListener('click',()=>showView(currentView-1));$('#next-view').addEventListener('click',()=>showView(currentView+1));dialog.addEventListener('keydown',e=>{if(e.key==='ArrowLeft'){e.preventDefault();showView(currentView-1)}if(e.key==='ArrowRight'){e.preventDefault();showView(currentView+1)}});
const reduced=matchMedia('(prefers-reduced-motion: reduce)');
if(!reduced.matches&&'IntersectionObserver'in window){document.documentElement.classList.add('js-motion');const observer=new IntersectionObserver(entries=>entries.forEach(e=>{if(e.isIntersecting){e.target.classList.remove('waiting');observer.unobserve(e.target)}}),{threshold:.08});document.querySelectorAll('[data-reveal]').forEach((el,i)=>{el.style.transitionDelay=`${i%2*80}ms`;el.classList.add('waiting');observer.observe(el)})}

let heroRequest=0,heroAnimation;
const heroCaptions={6:'Sunset over the bay',1:'Daylight on the Embarcadero',4:'Blue hour on the waterfront'};
document.querySelectorAll('[data-light]').forEach(button=>button.addEventListener('click',async()=>{
 const index=Number(button.dataset.light),view=views[index],request=++heroRequest;if(button.getAttribute('aria-pressed')==='true')return;
 const picture=new Image();picture.src=`assets/${view.file}${innerWidth>1200?'':'-medium'}.webp`;
 try{await picture.decode();if(request!==heroRequest)return;const source=$('#hero-source'),img=$('#hero-render');source.srcset=`assets/${view.file}-medium.webp 1200w, assets/${view.file}.webp 2400w`;img.src=`assets/${view.file}.jpg`;img.alt=view.alt;$('#hero-link').href=img.src;$('#hero-link').dataset.view=index;$('#hero-link').setAttribute('aria-label',`Open ${view.title.toLowerCase()} full screen`);$('#hero-full-view').href=img.src;$('#hero-full-view').dataset.view=index;$('#hero-caption-text').textContent=heroCaptions[index];document.querySelectorAll('[data-light]').forEach(b=>b.setAttribute('aria-pressed',String(b===button)));heroAnimation?.cancel();if(!reduced.matches)heroAnimation=img.animate([{opacity:.4},{opacity:1}],{duration:650,easing:'ease-out'});
 }catch{if(request===heroRequest)notify('This view could not load. Please try again.');}
}));

let cityPromise;
function loadCity(){
 if(cityPromise)return cityPromise;
 cityPromise=(async()=>{
  const button=$('#load-model');button.disabled=true;button.textContent='Loading the city…';
  $('#model-status').textContent='Downloading the 23 MB browser model.';$('#model-progress').hidden=false;
  try{
   const [{startViewer},{setupNavigation},{setupExperience}]=await Promise.all([import('./viewer.js?v=20261118.1'),import('./city-navigation.js?v=20261118.1'),import('./city-experience.js?v=20261118.1')]);
   const api=await startViewer({onProgress:p=>{if(p!==null){const progress=$('#model-progress');progress.max=100;progress.value=p;$('#model-status').textContent=p<100?`Downloading the city: ${Math.round(p)}%`:'Preparing the 3D scene…'}},notify});
   const navigation=await setupNavigation(api,{notify});
   const experience=setupExperience(api,{notify,onRestore:()=>navigation.stopTour(),getNeighborhood:()=>navigation.getState().neighborhood,restoreNeighborhood:id=>id?navigation.selectNeighborhood(id,{fly:false,announce:false}):navigation.clearNeighborhood()});
   if(!location.hash.startsWith('#view=')){api.flyTo([2.8,.22,-2.15],[.54,.125,-.17],20,0);document.querySelectorAll('[data-camera]').forEach(b=>{const active=b.dataset.camera==='waterfront';b.classList.toggle('active',active);b.setAttribute('aria-pressed',String(active))})}
   $('#viewer-poster').hidden=true;$('#viewer-toolbar').hidden=false;$('#experience-controls').hidden=false;
   $('#time-of-day').addEventListener('input',()=>navigation.stopTour());
   document.querySelectorAll('[data-camera]').forEach(button=>button.addEventListener('click',()=>navigation.stopTour()));
   if(!location.hash.startsWith('#view='))notify('City loaded. Take the tour, choose a place, or explore freely.');
   return {api,navigation,experience};
  }catch(error){
   console.error('3D viewer:',error);$('#viewer-poster').hidden=true;$('#viewer-toolbar').hidden=true;$('#experience-controls').hidden=true;$('#viewer-failure').hidden=false;
   notify('The render gallery is available if this device cannot open the 3D city.');
   return null;
  }
 })();
 return cityPromise;
}
$('#load-model').addEventListener('click',()=>loadCity());
$('#tour-entry').addEventListener('click',async()=>{
 $('#viewer').scrollIntoView({behavior:reduced.matches?'auto':'smooth',block:'center'});
 const city=await loadCity();if(city){city.experience.cancelRestore();city.navigation.startTour();document.getElementById('pause-tour').focus({preventScroll:true})}
});
if(location.hash.startsWith('#view=')&&location.hash.length<240){
 $('#viewer').scrollIntoView({behavior:'auto',block:'center'});loadCity();
}

// Entry points share the same viewer promise and preserve the user's current view.
function showCity(){document.getElementById('viewer').scrollIntoView({behavior:reduced.matches?'auto':'smooth',block:'center'})}
document.getElementById('enter-city').addEventListener('click',async()=>{showCity();const city=await loadCity();city?.api.renderer.domElement.focus({preventScroll:true})});
document.querySelectorAll('[data-start-camera],[data-start-neighborhood]').forEach(button=>button.addEventListener('click',async()=>{
 showCity();button.disabled=true;
 try{const city=await loadCity();if(!city)return;city.experience.cancelRestore();
  if(button.dataset.startNeighborhood){await city.navigation.selectNeighborhood(button.dataset.startNeighborhood,{trigger:button});document.getElementById("place-title").focus({preventScroll:true})}
  else{document.querySelector(`[data-camera="${button.dataset.startCamera}"]`)?.click();city.api.renderer.domElement.focus({preventScroll:true})}
 }finally{button.disabled=false}
}));
// The collection is a native scroll surface: touch, keyboard, wheel and mouse drag.
const collection=document.getElementById('gallery-track'),back=document.getElementById('gallery-back'),forward=document.getElementById('gallery-forward');
function collectionState(){back.disabled=collection.scrollLeft<2;forward.disabled=collection.scrollLeft+collection.clientWidth>=collection.scrollWidth-2}
function moveCollection(direction){collection.scrollBy({left:direction*collection.clientWidth*.78,behavior:reduced.matches?'instant':'smooth'})}
back.addEventListener('click',()=>moveCollection(-1));forward.addEventListener('click',()=>moveCollection(1));
collection.addEventListener('scroll',collectionState,{passive:true});new ResizeObserver(collectionState).observe(collection);collectionState();
let drag=null,suppressClick=false;
collection.addEventListener('dragstart',event=>event.preventDefault());
collection.addEventListener('pointerdown',event=>{if(event.pointerType!=='mouse'||event.button!==0)return;suppressClick=false;drag={id:event.pointerId,x:event.clientX,left:collection.scrollLeft,moved:false}});
collection.addEventListener('pointermove',event=>{if(!drag||event.pointerId!==drag.id)return;const distance=event.clientX-drag.x;
 if(!drag.moved&&Math.abs(distance)>7){drag.moved=true;collection.setPointerCapture(event.pointerId);collection.classList.add('is-dragging')}
 if(drag.moved){collection.scrollLeft=drag.left-distance;event.preventDefault()}
});
function releaseCollection(){if(drag?.moved)suppressClick=true;drag=null;collection.classList.remove('is-dragging')}
collection.addEventListener('pointerup',releaseCollection);collection.addEventListener('pointercancel',releaseCollection);collection.addEventListener('lostpointercapture',releaseCollection);
collection.addEventListener('click',event=>{if(suppressClick){suppressClick=false;event.preventDefault();event.stopImmediatePropagation()}},{capture:true});
dialog.addEventListener('click',event=>{if(event.target!==dialog)return;const r=dialog.getBoundingClientRect();if(event.clientX<r.left||event.clientX>r.right||event.clientY<r.top||event.clientY>r.bottom)dialog.close()});
document.getElementById('retry-model')?.addEventListener('click',()=>location.reload());

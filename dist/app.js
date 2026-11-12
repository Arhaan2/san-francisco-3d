'use strict';
const views=[
 {file:'skyline',title:'Telegraph Hill, looking downtown',alt:'Transamerica Pyramid, Salesforce Tower and the dense streets of downtown San Francisco'},
 {file:'waterfront',title:'The Embarcadero in daylight',alt:'The Ferry Building and San Francisco skyline reflected in the bay'},
 {file:'golden-gate',title:'The Golden Gate, from Marin',alt:'The Golden Gate Bridge spanning the strait between San Francisco and Marin'},
 {file:'ferry',title:'The Ferry Building',alt:'The Ferry Building clock tower, passenger ferries and detailed downtown architecture'},
 {file:'blue-hour',title:'Blue hour on the waterfront',alt:'Illuminated windows across the waterfront under a blue evening sky'},
 {file:'aerial',title:'The whole peninsula',alt:'An aerial view of the full city, its hills and parks, the Golden Gate and the bay'}
];
const $=s=>document.querySelector(s);
let toastTimer;
function notify(message){const t=$('#toast');clearTimeout(toastTimer);t.textContent=message;t.hidden=false;toastTimer=setTimeout(()=>t.hidden=true,4500)}
$('#share').addEventListener('click',async()=>{try{await navigator.clipboard.writeText(location.href.split('#')[0]);notify('Link copied. Send San Francisco to someone.')}catch{notify('Copy the page address from your browser to share this city.')}});
const dialog=$('#lightbox');let currentView=0,lastFocus;
function showView(index){currentView=(index+views.length)%views.length;const v=views[currentView];$('#lightbox-image').src=`assets/${v.file}.jpg`;$('#lightbox-image').alt=v.alt;$('#lightbox-title').textContent=v.title;$('#full-image').href=`assets/${v.file}.jpg`;}
document.querySelectorAll('[data-view]').forEach(a=>a.addEventListener('click',e=>{if(typeof dialog.showModal!=='function')return;e.preventDefault();lastFocus=a;showView(Number(a.dataset.view));dialog.showModal();document.body.style.overflow='hidden';$('#close-lightbox').focus()}));
function closeGallery(){dialog.close()}
$('#close-lightbox').addEventListener('click',closeGallery);dialog.addEventListener('close',()=>{document.body.style.overflow='';lastFocus?.focus({preventScroll:true})});$('#previous-view').addEventListener('click',()=>showView(currentView-1));$('#next-view').addEventListener('click',()=>showView(currentView+1));dialog.addEventListener('keydown',e=>{if(e.key==='ArrowLeft'){e.preventDefault();showView(currentView-1)}if(e.key==='ArrowRight'){e.preventDefault();showView(currentView+1)}});
const reduced=matchMedia('(prefers-reduced-motion: reduce)');
if(!reduced.matches&&'IntersectionObserver'in window){document.documentElement.classList.add('js-motion');const observer=new IntersectionObserver(entries=>entries.forEach(e=>{if(e.isIntersecting){e.target.classList.remove('waiting');observer.unobserve(e.target)}}),{threshold:.08});document.querySelectorAll('[data-reveal]').forEach(el=>{el.classList.add('waiting');observer.observe(el)});let frame=false;addEventListener('scroll',()=>{if(frame)return;frame=true;requestAnimationFrame(()=>{const amount=Math.min(scrollY/innerHeight,1);$('#title').style.transform=`scale(${1-amount*.035})`;frame=false})},{passive:true})}
let modelLoading=false;
$('#load-model').addEventListener('click',async()=>{if(modelLoading)return;modelLoading=true;const button=$('#load-model');button.disabled=true;button.textContent='Loading the city…';$('#model-status').textContent='Downloading the 23 MB browser model.';$('#model-progress').hidden=false;try{const {startViewer}=await import('./viewer.js');await startViewer({onProgress:p=>{const progress=$('#model-progress');if(p!==null){progress.max=100;progress.value=p;$('#model-status').textContent=p<100?`Downloading the city: ${Math.round(p)}%`:'Preparing the 3D scene…'}},notify});$('#viewer-poster').hidden=true;$('#viewer-toolbar').hidden=false;notify('City loaded. Drag to orbit, or choose a camera view.')}catch(error){console.error('3D viewer:',error);$('#viewer-poster').hidden=true;$('#viewer-failure').hidden=false;notify('The render gallery is ready even when 3D is unavailable.')}});

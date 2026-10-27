const $=id=>document.getElementById(id);

let state={design:'D01',palette:'C01',border:'B01',medallion:'none',accent:'dark',place:'Centered on open floor'};
let photo=null,generated=null,ready=false,busy=false,skippedPreview=false,toastTimer,humanWidget;

const TOTAL_STEPS=8;
const STEP_LABELS={
  1:'Upload your photo',
  2:'Choose your layout',
  3:'Find your color',
  4:'Frame the design',
  5:'Add a focal point',
  6:'Review & create your preview',
  7:'Almost there!',
  8:'Your design'
};
let step=1;

function toast(t){$('toast').textContent=t;$('toast').style.display='block';clearTimeout(toastTimer);toastTimer=setTimeout(()=>$('toast').style.display='none',4200)}

/* ---------- Step navigation ---------- */
function showStep(n, scroll){
  step=n;
  document.querySelectorAll('.step-screen').forEach(el=>{
    el.hidden = Number(el.dataset.step) !== n;
  });
  $('stepperFill').style.width=(n/TOTAL_STEPS*100)+'%';
  $('stepperText').textContent='Step '+n+' of '+TOTAL_STEPS+' — '+STEP_LABELS[n];
  $('stepperPhotoWrap').hidden = !photo || n===1;

  $('backBtn').style.visibility = n===1 ? 'hidden' : 'visible';
  $('backBtn').disabled = n===TOTAL_STEPS;

  // Step 6 drives its own advance (via Generate); step 7 (the lead gate) drives its
  // own advance (via form submit); step 8 is terminal.
  $('nextBtn').hidden = (n===6 || n===7 || n===8);

  $('nextBtn').disabled = (n===1 && !photo);

  // Scroll to the top of the studio section itself, not the top of the page —
  // this is embedded mid-page, with the real site header/content above it.
  // Only do this on an actual step change (Next/Back/Generate), never on initial load.
  if(scroll){
    document.querySelector('.stepper').scrollIntoView({block:'start',behavior:'instant' in document.documentElement.style ? 'instant' : 'auto'});
  }
}

$('backBtn').onclick=()=>{ if(step>1) showStep(step-1, true) };
$('nextBtn').onclick=()=>{
  if(step===1 && !photo){ toast('Upload a photo to continue.'); return }
  if(step<6) showStep(step+1, true);
};

/* ---------- Choice grids ---------- */
function cardGrid(id,items,key,type){
  $(id).innerHTML='';
  for(const item of items){
    const b=document.createElement('button');
    b.type='button';
    b.className='card'+(state[key]===item[0]?' active':'');
    b.setAttribute('aria-pressed',state[key]===item[0]);
    if(type==='palette'){
      const sw=document.createElement('div');
      sw.className='swatches';
      item[2].forEach(c=>{const el=document.createElement('i');el.style.background=c;sw.append(el)});
      b.append(sw);
    }else{
      const im=document.createElement('img');
      im.src=assets[item[0]];im.alt='';im.className='thumb';
      b.append(im);
    }
    const text=document.createElement('span');
    text.innerHTML='<small>'+item[0]+'</small><br>'+item[1];
    b.append(text);
    b.onclick=()=>{ state[key]=item[0]; cardGrid(id,items,key,type); if(id==='palettes') updatePaletteDesc(); };
    $(id).append(b);
  }
}
function updatePaletteDesc(){
  $('paletteDesc').textContent = palettes.find(x=>x[0]===state.palette)[3];
}

medallions.forEach(m=>{const o=document.createElement('option');o.value=m[0];o.textContent=m.join(' · ');$('medallion').append(o)});
$('accent').onchange=e=>{state.accent=e.target.value};
$('medallion').onchange=e=>{
  state.medallion=e.target.value;
  $('place').disabled = state.medallion==='none';
  $('medImage').innerHTML = state.medallion==='none' ? '' : '<img class="thumb" style="height:90px;object-fit:contain" src="'+assets[state.medallion]+'" alt="Selected medallion">';
};
$('place').onchange=e=>{state.place=e.target.value};

function refreshAll(){
  cardGrid('designs',designs,'design');
  cardGrid('palettes',palettes,'palette','palette');
  cardGrid('borders',borders,'border');
  updatePaletteDesc();
  $('accent').value=state.accent;
  $('medallion').value=state.medallion;
  $('place').value=state.place;
  $('place').disabled = state.medallion==='none';
  $('summaryName').textContent = designs.find(x=>x[0]===state.design)[1]+' / '+palettes.find(x=>x[0]===state.palette)[1];
  $('summaryDetail').textContent = state.design+' · '+state.palette+' · '+borders.find(x=>x[0]===state.border)[1]+(state.medallion==='none'?'':' · '+medallions.find(x=>x[0]===state.medallion)[1]);
}

/* ---------- Upload ---------- */
function setPhoto(img){
  photo=img;
  $('uploadPreview').src=img.src;
  $('uploadPreviewWrap').hidden=false;
  $('stepperPhoto').src=img.src;
  $('reviewPhoto').src=img.src;
  $('nextBtn').disabled=false;
}
function load(src){
  const next=new Image();
  next.onload=()=>setPhoto(next);
  next.onerror=()=>toast('That image could not be opened. Try a JPG, PNG or WebP.');
  next.src=src;
}
function upload(f){
  if(!f) return;
  if(!['image/jpeg','image/png','image/webp'].includes(f.type)) return toast('Choose a JPG, PNG or WebP photo.');
  if(f.size>15*1024*1024) return toast('Choose an image smaller than 15 MB.');
  const r=new FileReader();
  r.onload=()=>{
    const im=new Image();
    im.onload=()=>{
      const c=document.createElement('canvas');
      const ratio=Math.min(1,2000/im.naturalWidth,2000/im.naturalHeight);
      c.width=Math.round(im.naturalWidth*ratio);
      c.height=Math.round(im.naturalHeight*ratio);
      c.getContext('2d').drawImage(im,0,0,c.width,c.height);
      load(c.toDataURL('image/jpeg',.92));
      toast('Photo ready.');
    };
    im.onerror=()=>toast('Unable to read photo. Try a different image.');
    im.src=r.result;
  };
  r.readAsDataURL(f);
}
$('uploadBtn').onclick=()=>$('upload').click();
$('upload').onchange=e=>{upload(e.target.files[0]);e.target.value=''};
['dragenter','dragover'].forEach(t=>$('dropzone').addEventListener(t,e=>e.preventDefault()));
$('dropzone').ondrop=e=>{e.preventDefault();upload(e.dataTransfer.files[0])};
$('useExample').onclick=()=>{load(assets.demo);toast('Example photo loaded.')};

/* ---------- Human check ---------- */
function turnstileFailed(){
  // Turnstile itself refused to load (e.g. this domain isn't on the sitekey's
  // allow-list yet) — don't leave a dead "Generate" button behind a broken
  // widget. Fall back to the same "unavailable" path as a down AI backend,
  // so people can still submit their info and get a human follow-up.
  ready=false;
  $('generate').disabled=true;
  $('human-check').hidden=true;
  $('unavailableNotice').hidden=false;
  $('aiHint').textContent='Realistic previews are not available right now.';
}
function loadHumanCheck(siteKey){
  const s=document.createElement('script');
  s.src='https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit';
  s.async=true;
  s.onload=()=>{humanWidget=turnstile.render('#human-check',{sitekey:siteKey,size:'flexible',theme:'light','error-callback':turnstileFailed})};
  s.onerror=turnstileFailed;
  document.head.append(s);
}
const humanToken=()=>humanWidget===undefined?'':(turnstile.getResponse(humanWidget)||'');
const resetHuman=()=>{if(humanWidget!==undefined)turnstile.reset(humanWidget)};

/* ---------- Generate (AI) ---------- */
$('generate').onclick=async()=>{
  if(!ready||busy||!photo) return;
  const token=humanToken();
  if(!token) return toast('Please complete the quick human check just above the button first.');
  busy=true;
  $('busy').style.display='grid';
  $('generate').disabled=true;
  document.querySelectorAll('.wizard-nav button').forEach(e=>e.disabled=true);
  try{
    const c=document.createElement('canvas');
    c.width=photo.naturalWidth;c.height=photo.naturalHeight;
    c.getContext('2d').drawImage(photo,0,0);
    const blob=await new Promise(r=>c.toBlob(r,'image/jpeg',.92));
    const f=new FormData();
    f.append('image',blob,'backyard.jpg');
    f.append('selection',JSON.stringify(state));
    f.append('turnstile',token);
    const res=await fetch('/api/generate',{method:'POST',body:f});
    const d=await res.json().catch(()=>({}));
    if(!res.ok) throw Error(d.error||'Generation failed. Please try again.');
    const b64=d.data?.[0]?.b64_json;
    if(!b64) throw Error('No image came back. Please try again.');
    const im=new Image();
    await new Promise((resolve,reject)=>{im.onload=resolve;im.onerror=reject;im.src='data:image/jpeg;base64,'+b64});
    generated=im;
    $('resultImg').src=im.src;
    $('resultPhotoWrap').hidden=false;
    $('download').hidden=false;
    $('revealSkippedNote').hidden=true;
    showStep(7, true);
    toast('Your realistic concept preview is ready.');
  }catch(e){
    toast(e.message||'Unable to generate preview. Please try again.');
  }finally{
    busy=false;
    resetHuman();
    $('busy').style.display='none';
    document.querySelectorAll('.wizard-nav button').forEach(e=>e.disabled=false);
    $('generate').disabled=!ready;
    showStep(step); // reapply nav visibility rules
  }
};

$('skipToLead').onclick=()=>{
  skippedPreview=true;
  $('resultPhotoWrap').hidden=true;
  $('download').hidden=true;
  $('revealSkippedNote').hidden=false;
  showStep(7, true);
};

/* ---------- Reveal gate (step 7) — reuses the site's own form handler for the
   actual webhook POST (see js/script.js), so this behaves identically to every
   other lead form on the site. We just watch for its success state to advance. ---------- */
function watchRevealGateForm(){
  const form=$('revealGateForm');
  const feedback=form.querySelector('.form-feedback');
  const obs=new MutationObserver(()=>{
    if(!feedback.hidden && feedback.classList.contains('form-feedback--success')){
      obs.disconnect();
      setTimeout(()=>showStep(8, true), 900);
    }
  });
  obs.observe(feedback,{attributes:true,attributeFilter:['class','hidden']});
}

/* ---------- Download ---------- */
$('download').onclick=()=>{
  if(!generated) return;
  const out=document.createElement('canvas');
  out.width=photo.naturalWidth;
  out.height=photo.naturalHeight+110;
  const x=out.getContext('2d');
  x.drawImage(generated,0,0,photo.naturalWidth,photo.naturalHeight);
  x.fillStyle='#f5f3ee';
  x.fillRect(0,photo.naturalHeight,out.width,110);
  x.fillStyle='#26342b';
  x.font='bold 22px Arial';
  x.fillText('PROCOAT / ESTATE-STONE',24,photo.naturalHeight+31);
  x.font='16px Arial';
  x.fillText($('summaryName').textContent+' · '+state.border+' · '+(state.medallion==='none'?'No medallion':state.medallion),24,photo.naturalHeight+59);
  x.font='12px Arial';
  x.fillText('AI concept — Approve physical samples and final layout with ProCoat.',24,photo.naturalHeight+85);
  out.toBlob(b=>{
    if(!b) return toast('Download failed. Try again.');
    const u=URL.createObjectURL(b),a=document.createElement('a');
    a.href=u;a.download='ProCoat-Estate-Stone-'+state.design+'-'+state.palette+'.png';a.click();
    setTimeout(()=>URL.revokeObjectURL(u),5000);
  },'image/png');
};

/* ---------- Availability check ---------- */
async function availability(){
  try{
    const r=await fetch('/api/status');
    if(!r.ok) throw Error();
    const d=await r.json();
    ready=d.ready;
    if(ready){
      loadHumanCheck(d.siteKey);
      $('aiHint').textContent='Create a realistic concept from your selected design. It usually takes about a minute.';
      $('unavailableNotice').hidden=true;
    }else{
      $('aiHint').textContent='Realistic previews are not available right now.';
      $('unavailableNotice').hidden=false;
    }
  }catch{
    $('aiHint').textContent='Realistic previews are currently unavailable.';
    $('unavailableNotice').hidden=false;
  }finally{
    $('generate').disabled=!ready;
  }
}

/* ---------- Init ---------- */
refreshAll();
showStep(1);
availability();
watchRevealGateForm();

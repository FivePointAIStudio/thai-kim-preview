'use strict';
(() => {
  const cards=[...document.querySelectorAll('.site-card')];
  const dialog=document.getElementById('snapshot-dialog');
  const image=document.getElementById('snapshot-image');
  const viewport=document.getElementById('snapshot-viewport');
  let activeCard=null,mode='desktop',lastTrigger=null,previousScroll=0;
  const available=()=>cards.filter(c=>!c.hidden&&c.querySelector('[data-preview]'));
  const source=()=>activeCard?.querySelector('[data-preview]');
  function render(){
    const button=source();if(!button)return;
    const d=button.dataset;
    document.getElementById('snapshot-title').textContent=`${activeCard.dataset.id} · ${activeCard.dataset.name}`;
    document.getElementById('snapshot-subtitle').textContent=`官网实景截图 · ${d.captured} · 1440 px 桌面视图`;
    const link=document.getElementById('snapshot-visit');link.href=activeCard.querySelector('.visit').href;
    document.getElementById('snapshot-context').textContent=mode==='page'?'页面长图：官网前约三屏，非完整页面。':'首页首屏：用于比较导航、配色与主视觉。';
    document.getElementById('snapshot-error').hidden=true;image.hidden=false;
    image.src=mode==='page'?d.page:d.desktop;
    image.alt=`${activeCard.dataset.name} 官网${mode==='page'?'页面长图':'首页首屏'}实际截图`;
    image.width=1440;image.height=mode==='page'?Number(d.pageHeight)||2800:1000;
    viewport.scrollTo(0,0);
    document.querySelectorAll('[data-snapshot-mode]').forEach(b=>{const on=b.dataset.snapshotMode===mode;b.classList.toggle('active',on);b.setAttribute('aria-pressed',String(on))});
    const list=available();const index=list.indexOf(activeCard);
    document.getElementById('snapshot-counter').textContent=`${index+1} / ${list.length}`;
    document.getElementById('snapshot-prev').disabled=index<=0;
    document.getElementById('snapshot-next').disabled=index<0||index>=list.length-1;
  }
  function open(button){
    lastTrigger=button;activeCard=button.closest('.site-card');mode='desktop';
    previousScroll=window.scrollY;viewport.classList.remove('actual-size');document.getElementById('snapshot-size').textContent='原尺寸';
    render();dialog.showModal();document.body.classList.add('snapshot-is-open');
  }
  function step(delta){const list=available();const index=list.indexOf(activeCard);const next=list[index+delta];if(next){activeCard=next;render()}}
  document.addEventListener('click',event=>{
    const button=event.target.closest('[data-preview]');if(button)open(button);
    const view=event.target.closest('[data-view]');
    if(view){const gallery=view.dataset.view==='gallery';document.body.classList.toggle('preview-gallery',gallery);document.querySelectorAll('[data-view]').forEach(b=>{const on=b===view;b.classList.toggle('active',on);b.setAttribute('aria-pressed',String(on))})}
  });
  document.querySelectorAll('[data-snapshot-mode]').forEach(b=>b.addEventListener('click',()=>{mode=b.dataset.snapshotMode;render()}));
  document.getElementById('snapshot-close').addEventListener('click',()=>dialog.close());
  document.getElementById('snapshot-prev').addEventListener('click',()=>step(-1));
  document.getElementById('snapshot-next').addEventListener('click',()=>step(1));
  function toggleSize(){const on=viewport.classList.toggle('actual-size');document.getElementById('snapshot-size').textContent=on?'适应窗口':'原尺寸';viewport.scrollTo(0,0)}
  image.addEventListener('click',toggleSize);document.getElementById('snapshot-size').addEventListener('click',toggleSize);
  image.addEventListener('error',()=>{image.hidden=true;document.getElementById('snapshot-error').hidden=false});
  document.addEventListener('keydown',event=>{if(!dialog.open)return;if(event.key==='ArrowRight'){event.preventDefault();step(1)}else if(event.key==='ArrowLeft'){event.preventDefault();step(-1)}});
  dialog.addEventListener('click',event=>{if(event.target===dialog){const r=dialog.getBoundingClientRect();if(event.clientX<r.left||event.clientX>r.right||event.clientY<r.top||event.clientY>r.bottom)dialog.close()}});
  dialog.addEventListener('close',()=>{document.body.classList.remove('snapshot-is-open');window.scrollTo({left:0,top:previousScroll,behavior:"instant"});if(lastTrigger?.isConnected)lastTrigger.focus({preventScroll:true})});
  document.body.dataset.previewsReady='true';
})();

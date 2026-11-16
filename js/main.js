(function(){
  /* ===== Inställningar =====
     WEB3FORMS_KEY: nyckeln från web3forms.com. När den är ifylld skickas
     bokningar och frågor direkt till er e-post. Tom = mejlprogrammet öppnas i stället. */
  var WEB3FORMS_KEY = '2c956179-d823-4c5a-9310-2a028e02b6e3';
  var MAIL = 'fenstrofonster@gmail.com';
  /* NTFY_TOPIC: kanalen i appen ntfy. Alla som prenumererar på den får en
     pushnotis när någon bokar eller frågar. Notisen innehåller inga personuppgifter. */
  /* CF_ANALYTICS_TOKEN: token från Cloudflare Web Analytics. Besöksstatistik utan cookies. */
  var CF_ANALYTICS_TOKEN = 'd2bf71420edd49898d72905a657209fa';
  function loadStats(){var cf=document.createElement('script');cf.defer=true;cf.src='https://static.cloudflareinsights.com/beacon.min.js';cf.setAttribute('data-cf-beacon',JSON.stringify({token:CF_ANALYTICS_TOKEN}));document.body.appendChild(cf)}
  if(CF_ANALYTICS_TOKEN)window.addEventListener('load',function(){(window.requestIdleCallback||function(f){setTimeout(f,1500)})(loadStats,{timeout:4000})});
  var NTFY_TOPIC = 'fenstro-ddd9891c7f64';

  var $ = function(id){return document.getElementById(id)};
  var kr = function(n){return Math.round(n).toLocaleString('sv-SE')};
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* Sidhuvud, meny, mobilrad */
  var top=$('top'),dock=$('dock'),hero=document.querySelector('.hero'),boka=$('boka');
  var bokaVisible=false,pastHero=false,scrolled=false;
  window.addEventListener('scroll',function(){var sc=window.scrollY>8;if(sc!==scrolled){scrolled=sc;onScroll()}},{passive:true});
  function onScroll(){
    dock.classList.toggle('is-on',pastHero&&!bokaVisible);
    top.classList.toggle('is-scrolled',scrolled);
  }
  var mb=document.querySelector('.menu-btn'),nav=$('nav');
  mb.addEventListener('click',function(){
    var open=nav.classList.toggle('is-open');
    mb.setAttribute('aria-expanded',open);mb.setAttribute('aria-label',open?'Stäng menyn':'Öppna menyn');
  });
  nav.addEventListener('click',function(e){if(e.target.closest('a')){nav.classList.remove('is-open');mb.setAttribute('aria-expanded','false')}});

  /* Markera aktuell sektion i menyn */
  var links={};
  nav.querySelectorAll('a[href^="#"]:not(.btn)').forEach(function(a){links[a.getAttribute('href').slice(1)]=a});
  if('IntersectionObserver' in window){
    var io=new IntersectionObserver(function(entries){
      entries.forEach(function(en){
        if(en.target.id==='boka'){bokaVisible=en.isIntersecting;onScroll();}
        var a=links[en.target.id];
        if(en.target.id==='boka'&&en.isIntersecting)Object.keys(links).forEach(function(k){links[k].removeAttribute('aria-current')});
        if(a&&en.isIntersecting){
          Object.keys(links).forEach(function(k){links[k].removeAttribute('aria-current')});
          a.setAttribute('aria-current','true');
        }
      });
    },{rootMargin:'-45% 0px -50% 0px'});
    ['varfor','priser','hur','om-oss','fragor','kontakt','boka'].forEach(function(id){var el=$(id);if(el)io.observe(el)});
    var io2=new IntersectionObserver(function(en){bokaVisible=en[0].isIntersecting;onScroll()},{threshold:0});
    io2.observe(boka);
    new IntersectionObserver(function(en){pastHero=!en[0].isIntersecting;onScroll()}).observe(hero);
  }
  onScroll();


  /* Flikar privat/företag */
  var tabs=[].slice.call(document.querySelectorAll('[role=tab]'));
  function selectTab(t){
    tabs.forEach(function(x){
      var on=x===t;x.setAttribute('aria-selected',on);x.tabIndex=on?0:-1;
      $(x.getAttribute('aria-controls')).hidden=!on;
    });
  }
  tabs.forEach(function(t,i){
    t.addEventListener('click',function(){selectTab(t)});
    t.addEventListener('keydown',function(e){
      if(e.key==='ArrowRight'||e.key==='ArrowLeft'){var n=tabs[(i+(e.key==='ArrowRight'?1:-1)+tabs.length)%tabs.length];selectTab(n);n.focus()}
    });
  });

  /* ===== Priser =====
     Alla belopp är före RUT. För privatpersoner halverar RUT-avdraget priset. */
  var PRIVAT={
    ut:  {namn:'Utvändigt, en gång',          bas:500, extra:18, over:100, gang:1},
    inut:{namn:'In- och utvändigt, en gång',  bas:1000,extra:30, over:200, gang:1},
    abo: {namn:'Fräscha Fönster, abonnemang', bas:400, extra:10, over:75,  gang:4}
  };
  var FORETAG={
    ut:  {namn:'Utvändigt, företag',          bas:500, over:150},
    inut:{namn:'In- och utvändigt, företag',  bas:1000,over:250}
  };
  var INGAR=20,SPROJS=10;
  /* Kampanjkoder. Bara hashade, så koderna går inte att läsa i sidans kod. */
  var PROMO={"a65cb420b3971bfed2fc90edc24cd0d684845e30852dc7f6d2e9c6bf130bf22b": 10, "471e3b22b82ac60f9ae67a328af022a0f341ffe47f634494ad6091ad45497ee5": 25, "e4729e5f17a8effb416e9b06e60513e55f408548172fcf5c17f81610ad5726fc": 50};
  var promo=null;

  var range=$('antal-range'),num=$('antal'),over=$('over'),sOn=$('sprojs-on'),sRow=$('sprojs-row'),sNum=$('sprojs');
  var bigEl=$('sum-big'),shown=250,state={};
  function clamp(v,a,b){v=parseInt(v,10);if(isNaN(v))v=a;return Math.max(a,Math.min(b,v))}
  function tween(to){
    if(reduce){bigEl.textContent=kr(to);shown=to;return}
    var from=shown,t0=performance.now(),d=380;shown=to;
    (function step(t){var p=Math.min(1,(t-t0)/d),e=1-Math.pow(1-p,3);bigEl.textContent=kr(from+(to-from)*e);if(p<1)requestAnimationFrame(step)})(t0);
  }
  function val(name){return document.querySelector('input[name='+name+']:checked').value}

  function calc(){
    var kund=val('kund'),t=val('tjanst');
    var abo=$('t-abo');
    abo.disabled=kund==='foretag';abo.nextElementSibling.style.display=kund==='foretag'?'none':'';
    $('tjanst-seg').style.gridTemplateColumns=kund==='foretag'?'repeat(2,1fr)':'';
    if(kund==='foretag'&&t==='abo'){$('t-ut').checked=true;t='ut'}

    var n=clamp(num.value,1,200),s=sOn.checked?clamp(sNum.value,0,n):0;
    if(document.activeElement!==num&&String(n)!==num.value)num.value=n;
    range.value=Math.min(n,60);
    var extraN=Math.max(0,n-INGAR),rows=[],big,sub,title;

    if(kund==='privat'){
      var p=PRIVAT[t],extra=extraN*p.extra,ov=over.checked?p.over:0,sp=s*SPROJS;
      var full=p.bas+extra+ov+sp,disc=promo?Math.round(full*promo.pct/100):0,gang=full-disc,rut=Math.floor(gang/2),efter=gang-rut;
      rows.push(['Grundpris, upp till '+INGAR+' fönster',kr(p.bas)+' kr']);
      if(extraN)rows.push([extraN+' extra fönster × '+p.extra+' kr',kr(extra)+' kr']);
      if(ov)rows.push(['Övervåning',kr(ov)+' kr']);
      if(sp)rows.push(['Spröjs, '+s+' × '+SPROJS+' kr',kr(sp)+' kr']);
      if(disc)rows.push(['Kampanjkod −'+promo.pct+' %','−'+kr(disc)+' kr','disc']);
      rows.push(['Före RUT'+(p.gang>1?', per gång':''),kr(gang)+' kr','tot']);
      rows.push(['RUT-avdrag (50 %)','−'+kr(rut)+' kr','rut']);
      if(p.gang>1)rows.push(['Per år, 4 gånger efter RUT',kr(efter*4)+' kr','tot']);
      big=efter;sub=p.gang>1?'per gång efter RUT-avdrag':'efter RUT-avdrag';title=p.namn;
      state={disc:disc,kund:'Privatperson',tjanst:p.namn,pris:kr(efter)+' kr efter RUT'+(p.gang>1?' per gång ('+kr(efter*4)+' kr/år)':''),fore:kr(gang)+' kr'};
    }else{
      var f=FORETAG[t],ovf=over.checked?f.over:0,spf=s*SPROJS,fullf=f.bas+ovf+spf,discf=promo?Math.round(fullf*promo.pct/100):0,tot=fullf-discf;
      rows.push(['Grundpris, upp till '+INGAR+' fönster',kr(f.bas)+' kr']);
      if(ovf)rows.push(['Övervåning',kr(ovf)+' kr']);
      if(spf)rows.push(['Spröjs, '+s+' × '+SPROJS+' kr',kr(spf)+' kr']);
      if(discf)rows.push(['Kampanjkod −'+promo.pct+' %','−'+kr(discf)+' kr','disc']);
      rows.push(['Totalt, ingen moms tillkommer',kr(tot)+' kr','tot']);
      big=tot;sub=extraN?'plus extra fönster, vi bekräftar priset':'totalpris, ingen moms tillkommer';title=f.namn;
      state={disc:discf,kund:'Företag',tjanst:f.namn,pris:kr(tot)+' kr'+(extraN?' + '+extraN+' extra fönster (pris bekräftas)':''),fore:''};
    }
    $('biz-note').hidden=!(kund==='foretag'&&extraN>0);
    $('rut-note').hidden=kund!=='privat';
    var biz=kund==='foretag';
    $('b-namn-label').textContent=biz?'Kontaktperson':'Namn';
    $('biz-fields').hidden=!biz;
    $('b-adress-label').textContent=biz?'Adress till lokalen':'Gatuadress';
    document.querySelectorAll('label[data-f]').forEach(function(l){l.innerHTML=biz?l.dataset.f:l.dataset.p});

    if($('assess').checked)rows.push(['Gratis bedömning på plats','0 kr','disc']);
    $('sum-rows').innerHTML=rows.map(function(r){return '<li'+(r[2]?' class="'+r[2]+'"':'')+'><span>'+r[0]+'</span><span>'+r[1]+'</span></li>'}).join('');
    $('sum-title').textContent=title;$('sum-sub').textContent=sub;
    if(big!==shown)tween(big);

    var scale=Math.max(INGAR*1.5,n),inN=Math.min(n,INGAR);
    $('m-in').style.width=(inN/scale*100)+'%';
    $('m-ex').style.width=(extraN/scale*100)+'%';
    $('m-left').innerHTML='<b>'+inN+' av '+INGAR+'</b> ingår';
    $('m-right').innerHTML=extraN?'<b>+'+extraN+' extra</b>':'';
    state.n=n;state.over=over.checked;state.s=s;
  }
  range.addEventListener('input',function(){num.value=range.value;calc()});
  num.addEventListener('input',calc);
  num.addEventListener('blur',function(){num.value=clamp(num.value,1,200);calc()});
  sNum.addEventListener('input',calc);
  sNum.addEventListener('blur',function(){sNum.value=clamp(sNum.value,0,clamp(num.value,1,200));calc()});
  document.querySelectorAll('[data-step-n]').forEach(function(b){b.addEventListener('click',function(){num.value=clamp(+num.value+ +b.dataset.stepN,1,200);calc()})});
  document.querySelectorAll('[data-step-s]').forEach(function(b){b.addEventListener('click',function(){sNum.value=clamp(+sNum.value+ +b.dataset.stepS,0,clamp(num.value,1,200));calc()})});
  document.querySelectorAll('input[name=tjanst],input[name=kund]').forEach(function(r){r.addEventListener('change',calc)});
  /* Ruta som visas när man kryssar i övervåning. Olika text beroende på tjänst. */
  var OVER_TXT={
    ut:'Alla fönster på övervåningen går inte alltid att nå utifrån. Vi putsar med stege och bara där det är säkert, och kan be om en bild på huset innan. Når vi inte ett fönster som räknas som extra fönster tar vi bort det från fakturan.',
    inut:'Alla fönster på övervåningen går inte alltid att nå utifrån. Då putsar vi oftast utsidan inifrån, om fönstret går att öppna. Vi kan be om en bild på huset innan. Går det inte alls och fönstret räknas som extra fönster tar vi bort det från fakturan.',
    abo:'Fräscha Fönster gäller bara utsidan. Alla fönster på övervåningen går inte alltid att nå utifrån. Vi putsar med stege och bara där det är säkert, och kan be om en bild på huset innan. Når vi inte ett fönster som räknas som extra fönster tar vi bort det från fakturan.'
  };
  var overDlg=$('over-dlg'),overOk={};
  function overClose(ok){
    if(ok)overOk[val('tjanst')]=true;else over.checked=false;
    if(overDlg.open)overDlg.close();
    calc();over.focus();
  }
  function overAsk(){
    var t=val('tjanst');
    if(!over.checked||overOk[t])return;
    if(overDlg&&overDlg.showModal){$('over-dlg-p').textContent=OVER_TXT[t];overDlg.showModal();$('over-ok').focus();}
    else if(window.confirm(OVER_TXT[t]))overOk[t]=true;else over.checked=false;
  }
  over.addEventListener('change',function(){overAsk();calc()});
  document.querySelectorAll('input[name=tjanst],input[name=kund]').forEach(function(r){r.addEventListener('change',function(){setTimeout(function(){overAsk();calc()},0)})});
  if(overDlg){
    $('over-ok').addEventListener('click',function(){overClose(true)});
    $('over-no').addEventListener('click',function(){overClose(false)});
    overDlg.addEventListener('cancel',function(e){e.preventDefault();overClose(false)});
  }

  $('assess').addEventListener('change',calc);
  sOn.addEventListener('change',function(){sRow.hidden=!sOn.checked;if(sOn.checked&&+sNum.value===0)sNum.value=Math.min(clamp(num.value,1,200),INGAR);calc()});
  document.querySelectorAll('[data-pick]').forEach(function(a){a.addEventListener('click',function(){
    $('k-privat').checked=true;$('t-'+a.dataset.pick).checked=true;goStep(1);calc();
  })});
  document.querySelectorAll('[data-kund=foretag]').forEach(function(a){a.addEventListener('click',function(){$('k-foretag').checked=true;if(a.dataset.pickB)$('t-'+a.dataset.pickB).checked=true;goStep(1);calc()})});
  calc();

  /* ===== Kampanjkod ===== */
  var pOpen=$('promo-open'),pBox=$('promo-box'),pIn=$('promo-in'),pMsg=$('promo-msg'),pOn=$('promo-on');
  function sha(txt){return crypto.subtle.digest('SHA-256',new TextEncoder().encode(txt)).then(function(b){return [].map.call(new Uint8Array(b),function(x){return ('0'+x.toString(16)).slice(-2)}).join('')})}
  pOpen.addEventListener('click',function(){pBox.hidden=false;pOpen.hidden=true;pOpen.setAttribute('aria-expanded','true');pIn.focus()});
  function tryCode(){
    var code=pIn.value.trim().toUpperCase().replace(/\s+/g,'');
    if(!code){pIn.focus();return}
    if(!window.crypto||!crypto.subtle){pMsg.hidden=false;pMsg.className='promo__msg no';pMsg.textContent='Koden kan inte kontrolleras i den här webbläsaren. Skriv den i meddelandet i steg 2.';return}
    sha('fenstro:'+code).then(function(h){
      var pct=PROMO[h];pMsg.hidden=false;
      if(pct){
        promo={code:code,pct:pct};pBox.hidden=true;pOn.hidden=false;
        $('promo-label').textContent=code+'  −'+pct+' %';
        pMsg.hidden=true;calc();
      }else{pMsg.className='promo__msg no';pMsg.textContent='Koden fungerar inte. Kolla stavningen.'}
    });
  }
  $('promo-go').addEventListener('click',tryCode);
  pIn.addEventListener('keydown',function(e){if(e.key==='Enter'){e.preventDefault();tryCode()}});
  $('promo-x').addEventListener('click',function(){promo=null;pOn.hidden=true;pBox.hidden=false;pIn.value='';calc();pIn.focus()});

  /* ===== Bokning i tre steg ===== */
  var form=$('booking'),step=1,bodies=form.querySelectorAll('[data-step]'),stepsEl=$('steps').children;
  var back=$('b-back'),next=$('b-next'),err=$('b-err');
  function goStep(s,focus){
    step=s;
    bodies.forEach(function(b){var on=+b.dataset.step===s;b.hidden=!on;if(on&&!reduce){b.classList.remove('step-enter');void b.offsetWidth;b.classList.add('step-enter')}});
    [].forEach.call(stepsEl,function(li,i){li.classList.toggle('is-now',i+1===s);li.classList.toggle('is-done',i+1<s);if(i+1===s)li.setAttribute('aria-current','step');else li.removeAttribute('aria-current')});
    back.hidden=s===1;next.textContent=s===3?'Skicka bokningsförfrågan':'Fortsätt';
    err.hidden=true;
    if(focus){var first=form.querySelector('[data-step="'+s+'"] input:not([type=hidden]),[data-step="'+s+'"] select');if(first)first.focus({preventScroll:true})}
  }
  function invalid(el,msg){el.setAttribute('aria-invalid','true');el.focus();err.textContent=msg;err.hidden=false;return false}
  function check(s){
    form.querySelectorAll('[aria-invalid]').forEach(function(e){e.removeAttribute('aria-invalid')});
    if(s===2){var a=$('b-adress');if(!a.value.trim())return invalid(a,'Fyll i adressen där vi ska putsa.')}
    if(s===3){
      var nm=$('b-namn'),tel=$('b-tel'),ml=$('b-mail');
      if(val('kund')==='foretag'){
        var ftg=$('b-ftg'),org=$('b-orgnr');
        if(!ftg.value.trim())return invalid(ftg,'Fyll i företagets namn.');
        if(org.value.replace(/\D/g,'').length!==10)return invalid(org,'Fyll i org.nr med 10 siffror, t.ex. 556677-8899.');
      }
      if(!nm.value.trim())return invalid(nm,val('kund')==='foretag'?'Fyll i namn på kontaktperson.':'Fyll i ditt namn.');
      if(tel.value.replace(/\D/g,'').length<7)return invalid(tel,'Fyll i ett telefonnummer så vi kan ringa och boka.');
      if(!/^\S+@\S+\.\S+$/.test(ml.value.trim()))return invalid(ml,'Fyll i en e-postadress som fungerar.');
      if(!$('b-ok').checked){err.textContent='Kryssa i att vi får kontakta dig, annars kan vi inte boka en tid.';err.hidden=false;$('b-ok').focus();return false}
    }
    return true;
  }
  next.addEventListener('click',function(){
    if(!check(step))return;
    if(step<3){goStep(step+1,true);scrollIntoViewIfNeeded()}else{sendBooking()}
  });
  back.addEventListener('click',function(){goStep(step-1,true)});
  function scrollIntoViewIfNeeded(){var r=form.getBoundingClientRect();if(r.top<70)window.scrollTo({top:window.scrollY+r.top-110,behavior:reduce?'auto':'smooth'})}

  function bookingData(){
    var d=$('b-datum').value,tid=val('tid');
    if(val('kund')==='foretag')tid={'Helg':'Före öppning','Vardag efter kl. 16':'Efter stängning'}[tid]||tid;
    var biz=val('kund')==='foretag',extra={};
    if(biz){
      extra={'Företag':$('b-ftg').value.trim(),'Org.nr':$('b-orgnr').value.trim(),
        'Referens':$('b-ref').value.trim()||'–','Faktura till':$('b-fmail').value.trim()||$('b-mail').value.trim()};
    }
    var base={
      'Kund':state.kund,'Tjänst':state.tjanst,'Antal fönster':String(state.n),
      'Övervåning':state.over?'Ja (har godkänt att bild kan behövas)':'Nej','Spröjs':state.s?state.s+' fönster':'Nej',
      'Gratis bedömning (udda fönster/mellanglas/svårt att nå)':$('assess').checked?'JA, åk ut och titta först':'Nej',
      'Pris':state.pris,'Före RUT':state.fore||'–',
      'Kampanjkod':promo?promo.code+' (−'+promo.pct+' %, −'+kr(state.disc)+' kr)':'–',
      'Adress':$('b-adress').value.trim()+', '+$('b-ort').value,
      'Önskad tid':tid+(d?', helst '+d:''),
      'Meddelande':$('b-msg').value.trim()||'–',
      'Namn':$('b-namn').value.trim(),'Telefon':$('b-tel').value.trim(),'E-post':$('b-mail').value.trim(),
      'Erbjudanden via mejl och sms':$('b-utskick').checked?'Ja':'NEJ, kunden har tackat nej'
    };
    if(biz){delete base['Före RUT'];base['Namn']=$('b-namn').value.trim()+' (kontaktperson)';Object.keys(extra).forEach(function(k){base[k]=extra[k]})}
    return base;
  }
  function send(subject,data,replyTo,bot){
    if(bot)return Promise.resolve(true);
    if(!WEB3FORMS_KEY){
      var body=Object.keys(data).map(function(k){return k+': '+data[k]}).join('\n');
      window.location.href='mailto:'+MAIL+'?subject='+encodeURIComponent(subject)+'&body='+encodeURIComponent(body);
      return Promise.resolve('mailto');
    }
    var payload={access_key:WEB3FORMS_KEY,subject:subject,from_name:'Fenstro hemsida'};
    if(replyTo)payload.replyto=replyTo;
    Object.keys(data).forEach(function(k){payload[k]=data[k]});
    return fetch('https://api.web3forms.com/submit',{method:'POST',headers:{'Content-Type':'application/json','Accept':'application/json'},body:JSON.stringify(payload)})
      .then(function(r){return r.json()}).then(function(j){if(!j.success)throw new Error(j.message||'fel');return true});
  }
  function notify(title,msg){
    if(!NTFY_TOPIC)return;
    try{fetch('https://ntfy.sh/'+NTFY_TOPIC,{method:'POST',body:msg,headers:{'Title':title,'Tags':'window','Priority':'high'}}).catch(function(){})}catch(e){}
  }
  function sendBooking(){
    var data=bookingData();
    next.disabled=true;next.textContent='Skickar…';
    send('Bokning: '+(data['Företag']?data['Företag']+', ':'')+data['Tjänst']+' i '+$('b-ort').value,data,data['E-post'],form.botcheck.checked)
      .then(function(how){
        if(how===true)notify('Ny bokning',data['Tjänst']+', '+$('b-ort').value+', '+state.n+' fönster. Pris: '+data['Pris']+'. Se mejlen.');
        bodies.forEach(function(b){b.hidden=true});
        $('panel-nav').hidden=true;err.hidden=true;
        $('b-done-text').textContent=how==='mailto'
          ?'Ditt mejlprogram öppnas med bokningen ifylld. Tryck på skicka där. Öppnades inget? Mejla oss på '+MAIL+'.'
          :'Tack '+data['Namn'].split(' ')[0]+'! Vi ringer eller skickar sms till '+data['Telefon']+' för att bekräfta en tid.';
        if(how==='mailto')$('b-done').querySelector('h3').textContent='Nästan klart';
        $('b-done').hidden=false;$('b-done').focus({preventScroll:true});
        [].forEach.call(stepsEl,function(li){li.classList.add('is-done');li.classList.remove('is-now')});
      })
      .catch(function(){
        err.textContent='Det gick inte att skicka just nu. Försök igen, eller mejla oss på '+MAIL+'.';err.hidden=false;
      })
      .then(function(){next.disabled=false;next.textContent='Skicka bokningsförfrågan'});
  }
  $('b-again').addEventListener('click',function(){
    form.reset();$('b-done').hidden=true;$('panel-nav').hidden=false;$('b-done').querySelector('h3').textContent='Förfrågan skickad';
    sRow.hidden=true;goStep(1,true);calc();
  });

  /* ===== Fråga ===== */
  var ask=$('ask');
  ask.addEventListener('submit',function(e){
    e.preventDefault();
    var n=$('a-namn'),k=$('a-kontakt'),m=$('a-msg'),ae=$('a-err');
    ae.hidden=true;
    if(!n.value.trim()){ae.textContent='Fyll i ditt namn.';ae.hidden=false;n.focus();return}
    if(!k.value.trim()){ae.textContent='Fyll i telefon eller e-post så vi kan svara.';ae.hidden=false;k.focus();return}
    if(!m.value.trim()){ae.textContent='Skriv din fråga.';ae.hidden=false;m.focus();return}
    var btn=$('a-send');btn.disabled=true;btn.textContent='Skickar…';
    var kv=k.value.trim();
    send('Fråga från '+n.value.trim(),{'Namn':n.value.trim(),'Kontakt':kv,'Fråga':m.value.trim()},/@/.test(kv)?kv:'',ask.botcheck.checked)
      .then(function(how){
        if(how===true)notify('Ny fråga','Någon har ställt en fråga via hemsidan. Se mejlen.');
        $('a-done').textContent=how==='mailto'?'Ditt mejlprogram öppnas med frågan ifylld. Tryck på skicka där.':'Tack, vi har fått din fråga och hör av oss.';
        $('a-done').hidden=false;if(how!=='mailto')ask.reset();
      })
      .catch(function(){ae.textContent='Det gick inte att skicka just nu. Mejla oss på '+MAIL+'.';ae.hidden=false})
      .then(function(){btn.disabled=false;btn.textContent='Skicka frågan'});
  });

  $('year').textContent=new Date().getFullYear();
})();

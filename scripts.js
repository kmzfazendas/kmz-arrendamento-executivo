(function(){
  'use strict';
  const C=window.KmzCalc;
  const byId=id=>document.getElementById(id);
  const fields=['totalArea','priceAlq','leasedArea','yield','atr','atrPrice'];
  const state={result:null,logo:null};
  const fmt=(k,n)=>k==='money'?C.money(n):k==='pct'?C.percent(n):C.number(n);
  const set=(id,value)=>{byId(id).textContent=value;};
  const safe = s=>String(s==null?'':s);

  function ring(pct){
    const p=Math.max(0,Math.min(100,pct));
    return '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 120" role="img" aria-label="'+p.toFixed(2)+' por cento de área arrendada">'+
      '<circle cx="60" cy="60" r="48" fill="none" stroke="#e3ece3" stroke-width="13"/>'+
      '<circle cx="60" cy="60" r="48" fill="none" stroke="#2e8550" stroke-width="13" stroke-dasharray="'+(p/100*301.592895)+' '+((100-p)/100*301.592895)+'" transform="rotate(-90 60 60)"/>'+
      '<text x="60" y="58" text-anchor="middle" class="donut-percent" font-size="24" font-weight="bold" fill="#175635">'+C.number(p)+'%</text>'+
      '<text x="60" y="72" text-anchor="middle" class="donut-unit" font-size="6" fill="#758976">ÁREA ARRENDADA</text></svg>';
  }

  function barNodes(r, forPdf){
    const wrap=document.createElement('div');
    const max=Math.max(r.cumulative,0);
    r.progression.forEach(item=>{
      const row=document.createElement('div'); row.className=forPdf?'pdf-bar-row':'bar-row';
      const name=document.createElement('span');name.textContent='Ano '+item.year; if(!forPdf)name.className='bar-label';
      const track=document.createElement('div');track.className=forPdf?'pdf-bar-track':'bar-track';
      const fill=document.createElement('div');fill.className=forPdf?'pdf-bar-fill':'bar-fill';
      fill.style.width=(max>0?(item.cumulative/max)*100:0)+'%';track.appendChild(fill);
      const amount=document.createElement('strong');amount.textContent=C.money(item.cumulative);if(!forPdf)amount.className='bar-amount';
      row.append(name,track,amount);wrap.appendChild(row);
    });
    return wrap;
  }

  function showInvalid(errors){
    fields.forEach(key=>{
      const node=byId(key), parent=node.closest('.field');
      const error=safe(errors[key]||'');
      parent.classList.toggle('invalid',!!error);node.setAttribute('aria-invalid',error?'true':'false');
      byId(key+'Error').textContent=error;
    });
    const panel=byId('global-error'); panel.hidden=!errors.global;
    panel.textContent=errors.global||'';
  }

  function render(){
    const raw={};fields.forEach(key=>raw[key]=byId(key).value);
    const r=C.compute(raw,byId('years').value);
    state.result=r.ok?r:null;
    showInvalid(r.errors||{});
    const btn=byId('generate-pdf');btn.disabled=!r.ok||!state.logo;
    if(!r.ok){
      ['hectares','remaining','leasedPatrimony','priceHa','areaLeased','areaLeasedHa','areaRemaining','areaRemainingHa','revenueTon','revenueAlq','tonsYear','atrYear','patrimony','annual','monthly','roi','cumulative','cumulativePct','cumulativeTons'].forEach(id=>set(id,'—'));
      set('payback','Payback bruto simples: —');set('daily','Receita diária equivalente: —');
      byId('yearChart').replaceChildren();byId('scenarios').replaceChildren();byId('donut').innerHTML='';return;
    }
    set('hectares',fmt('num',r.hectares)+' ha');set('remaining',C.number(r.remainingAlq)+' alq · '+C.number(r.remainingHa)+' ha');
    set('leasedPatrimony',C.money(r.leasedPatrimony));set('priceHa',C.money(r.priceHa)+'/ha');
    set('areaLeased',C.number(r.values.leasedArea)+' alq');set('areaLeasedHa',C.number(r.leasedHa)+' ha');
    set('areaRemaining',C.number(r.remainingAlq)+' alq');set('areaRemainingHa',C.number(r.remainingHa)+' ha');
    set('revenueTon',C.money(r.revenueTon));set('revenueAlq',C.money(r.revenueAlq));
    set('tonsYear',C.number(r.tonsYear)+' t');set('atrYear',C.number(r.atrYear)+' kg');
    set('patrimony',C.money(r.patrimony));set('annual',C.money(r.annual));set('monthly',C.money(r.monthly));
    set('roi',C.percent(r.roi)+' a.a.');set('daily','Receita diária equivalente: '+C.money(r.daily));
    set('payback','Payback bruto simples: '+(r.payback==null?'não disponível':C.number(r.payback)+' anos'));
    set('cumulative',C.money(r.cumulative));set('cumulativePct',C.percent(r.cumulativePct));set('cumulativeTons',C.number(r.cumulativeTons)+' t');
    byId('donut').innerHTML=ring(r.occupancy);
    byId('yearChart').replaceChildren(...Array.from(barNodes(r,false).children));
    byId('scenarios').replaceChildren(...r.scenarios.map(s=>{
      const el=document.createElement('div');el.className='scenario'+(s.multiplier===1?' base':'');
      const left=document.createElement('div');const title=document.createElement('div');title.className='scenario-label';title.textContent=s.label;
      const note=document.createElement('div');note.className='scenario-note';note.textContent=C.atrPrice(s.atrPrice)+' / kg';left.append(title,note);
      const right=document.createElement('div');right.className='scenario-result';const money=document.createElement('strong');money.textContent=C.money(s.annual);
      const roi=document.createElement('span');roi.textContent='ROI '+C.percent(s.roi)+' a.a.';right.append(money,roi);el.append(left,right);return el;
    }));
  }

  function printReport(){
    const r=state.result;if(!r||!state.logo){alert('Preencha os campos válidos e aguarde o carregamento da logomarca.');return;}
    // Abrir durante o clique, antes de qualquer operação assíncrona, evita bloqueio de pop-ups.
    const win=window.open('about:blank','_blank');
    if(!win){alert('O navegador bloqueou a janela do relatório. Permita pop-ups para este site e tente novamente.');return;}
    const wrapper=document.createElement('div');wrapper.append(byId('pdf-template').content.cloneNode(true));
    const property=byId('property').value.trim()||'Propriedade rural — não identificada';
    const data={property,date:new Intl.DateTimeFormat('pt-BR',{dateStyle:'short'}).format(new Date()),
      totalArea:C.number(r.values.totalArea)+' alq · '+C.number(r.hectares)+' ha',priceAlq:C.money(r.values.priceAlq),
      leasedArea:C.number(r.values.leasedArea)+' alq',hectares:C.number(r.hectares)+' ha',leasedPatrimony:C.money(r.leasedPatrimony),
      areaLeased:C.number(r.values.leasedArea)+' alq',areaRemaining:C.number(r.remainingAlq)+' alq',remainingHa:C.number(r.remainingHa)+' ha',
      yield:C.number(r.values.yield)+' t/alq/ano',atr:C.number(r.values.atr)+' kg/t',atrPrice:C.atrPrice(r.values.atrPrice)+'/kg',
      revenueTon:C.money(r.revenueTon),revenueAlq:C.money(r.revenueAlq),tonsYear:C.number(r.tonsYear)+' t',atrYear:C.number(r.atrYear)+' kg',
      patrimony:C.money(r.patrimony),annual:C.money(r.annual),monthly:C.money(r.monthly),daily:'Equivalente diário: '+C.money(r.daily),
      roi:C.percent(r.roi)+' a.a.',payback:'Payback simples: '+(r.payback==null?'indisponível':C.number(r.payback)+' anos'),
      years:r.years+' anos',cumulative:C.money(r.cumulative),cumulativePct:C.percent(r.cumulativePct),cumulativeTons:C.number(r.cumulativeTons)+' t'};
    Object.entries(data).forEach(([key,value])=>{wrapper.querySelectorAll('[data-k="'+key+'"]').forEach(node=>node.textContent=value);});
    wrapper.querySelectorAll('[data-logo]').forEach(img=>img.src=state.logo);
    // Ajusta somente a tipografia de números muito longos, nunca altera o valor.
    wrapper.querySelectorAll('.pdf-result strong, .pdf-scenario .scenario-revenue').forEach(node=>{
      if(node.textContent.length>20)node.classList.add('number-extra-long');
      else if(node.textContent.length>16)node.classList.add('number-long');
    });
    wrapper.querySelector('[data-k="donut"]').innerHTML=ring(r.occupancy);
    const pdfChart=wrapper.querySelector('[data-k="yearChart"]');pdfChart.replaceChildren(...Array.from(barNodes(r,true).children));
    const scenarios=wrapper.querySelector('[data-k="scenarios"]');
    r.scenarios.forEach(s=>{
      const el=document.createElement('div');el.className='pdf-scenario'+(s.multiplier===1?' base':'');
      const l=document.createElement('div'),title=document.createElement('div'),price=document.createElement('div');
      title.className='scenario-title';title.textContent=s.label.toUpperCase()+(s.multiplier===0.9?' (-10%)':s.multiplier===1.1?' (+10%)':'');
      price.className='scenario-price';price.textContent=C.atrPrice(s.atrPrice)+'/kg';l.append(title,price);
      const right=document.createElement('div'),money=document.createElement('div'),roi=document.createElement('div');
      money.className='scenario-revenue';money.textContent=C.money(s.annual);roi.className='scenario-roi';roi.textContent='ROI '+C.percent(s.roi)+' a.a.';
      right.append(money,roi);el.append(l,right);scenarios.append(el);
    });
    const css=byId('print-css').textContent;
    const name='KMZ Fazendas | Relatório de Arrendamento';
    // É um documento separado e vetorial; NÃO é uma captura de tela.
    win.document.open();win.document.write('<!doctype html><html lang="pt-BR"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>'+name+'</title><style>'+css+'</style><style>@media screen{.print-toolbar{position:fixed;top:12px;right:12px;z-index:999;display:flex;gap:9px;align-items:center;background:#fff;padding:10px;border:1px solid #b6cfbf;border-radius:8px;box-shadow:0 5px 25px #152b2255;font:12px Arial,sans-serif}.print-toolbar button{background:#155d3c;color:#fff;font:700 12px Arial,sans-serif;border:0;border-radius:5px;padding:11px 13px;cursor:pointer}}@media print{.print-toolbar{display:none!important}}</style></head><body><div class="print-toolbar"><span>Relatório pronto para salvar em PDF</span><button type="button" onclick="window.print()">IMPRIMIR / SALVAR PDF</button></div>'+wrapper.innerHTML+'</body></html>');win.document.close();
    const openPrint=()=>{
      if(win.closed)return;
      const imgs=Array.from(win.document.images).map(img=>img.decode?img.decode().catch(()=>{}):Promise.resolve());
      Promise.all([...(imgs),win.document.fonts?win.document.fonts.ready:Promise.resolve()]).then(()=>{
        const sheet=win.document.querySelector('.pdf-sheet');
        // Se o conteúdo ultrapassar o A4, permite extensão em vez de cortá-lo.
        if(sheet && sheet.scrollHeight>sheet.clientHeight+4)sheet.classList.add('pdf-overflow');
        win.__reportReady=true;
        win.focus();setTimeout(()=>{if(!win.closed)win.print();},300);
      });
    };
    if(win.document.readyState==='complete')openPrint();else win.addEventListener('load',openPrint,{once:true});
  }

  function logoReady(src){
    if(!src||typeof src!=='string')return logoError();
    const img=new Image();img.onload=function(){state.logo=src;byId('brand-logo').src=src;byId('logo-status').textContent='Relatório A4 pronto. No iPhone, use a opção Imprimir / Salvar PDF na nova aba.';render();};
    img.onerror=logoError;img.src=src;
  }
  function logoError(err){
    const detail=err&&err.message?(' Detalhe: '+String(err.message).slice(0,140)):'';
    byId('logo-status').textContent='Falha ao carregar a logomarca. Confira o arquivo LogoData.html.'+detail;
  }
  fields.forEach(key=>byId(key).addEventListener('input',render));
  byId('years').addEventListener('change',render);
  byId('generate-pdf').addEventListener('click',printReport);
  // Carrega o PNG original publicado com o site, sem autenticação ou servidor.
  const logoUrl = new URL('./logo-kmz.png', window.location.href).href;
  logoReady(logoUrl);
  render();
})();

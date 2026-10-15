/** Motor financeiro puro: sem DOM, sem servidor e sem arredondamento intermediário. */
(function (root) {
  'use strict';
  const UNIT_OPTIONS = Object.freeze({
    paulista: Object.freeze({label:'Alqueire paulista', adjective:'alqueires paulistas', hectares:2.42}),
    mineiro: Object.freeze({label:'Alqueire mineiro', adjective:'alqueires mineiros', hectares:4.84})
  });
  const PERIODS = [6, 10, 12];
  const brMoney = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL', minimumFractionDigits: 2, maximumFractionDigits: 2 });
  const brNum = new Intl.NumberFormat('pt-BR', { minimumFractionDigits: 0, maximumFractionDigits: 2 });
  const brPercent = new Intl.NumberFormat('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  const brPrice = new Intl.NumberFormat('pt-BR', { minimumFractionDigits: 4, maximumFractionDigits: 4 });

  function parseNumber(input) {
    if (typeof input === 'number') return Number.isFinite(input) ? input : NaN;
    let raw = String(input == null ? '' : input).replace(/[\s\u00a0R$]/g, '').trim();
    if (!raw || !/^[+\-]?\d[\d.,]*$/.test(raw)) return NaN;
    const comma = raw.lastIndexOf(','), dot = raw.lastIndexOf('.');
    if (comma >= 0) { raw = raw.replace(/\./g, '').replace(',', '.'); }
    else if ((raw.match(/\./g) || []).length > 1) { raw = raw.replace(/\./g, ''); }
    else if (dot >= 0 && /^\d{1,3}\.\d{3}$/.test(raw)) { raw = raw.replace('.', ''); }
    const value = Number(raw);
    return Number.isFinite(value) ? value : NaN;
  }

  function compute(raw, years, unit='paulista') {
    const selectedUnit = UNIT_OPTIONS[unit];
    if (!selectedUnit) return {ok:false,errors:{global:'Selecione um padrão de medida válido.'}};
    const HECTARES_PER_ALQUEIRE = selectedUnit.hectares;
    const y = Number(years);
    const errors = {};
    const fields = {totalArea:'Área total', priceAlq:'Valor por alqueire', leasedArea:'Área arrendada', yield:'Produtividade', atr:'Índice ATR', atrPrice:'Preço do ATR'};
    const v = {};
    for (const key of Object.keys(fields)) {
      v[key] = parseNumber(raw[key]);
      if (!Number.isFinite(v[key])) errors[key] = 'Informe um número válido.';
      else if (v[key] < 0) errors[key] = 'Não são permitidos valores negativos.';
      else if (v[key] > 1e12) errors[key] = 'Valor acima do limite de segurança numérica.';
    }
    if (Number.isFinite(v.totalArea) && v.totalArea <= 0) errors.totalArea = 'A área total deve ser maior que zero.';
    if (Number.isFinite(v.priceAlq) && v.priceAlq <= 0) errors.priceAlq = 'O valor de mercado deve ser maior que zero.';
    if (Number.isFinite(v.leasedArea) && Number.isFinite(v.totalArea) && v.leasedArea > v.totalArea) errors.leasedArea = 'A área arrendada supera a área total.';
    if (!PERIODS.includes(y)) errors.years = 'Selecione 6, 10 ou 12 anos.';
    if (Object.keys(errors).length) return {ok: false, errors: errors};

    const patrimony = v.totalArea * v.priceAlq;
    const occupancy = v.leasedArea / v.totalArea * 100;
    const remainingAlq = v.totalArea - v.leasedArea;
    const revenueTon = v.atr * v.atrPrice;
    const revenueAlq = v.yield * revenueTon;
    const tonsYear = v.leasedArea * v.yield;
    const atrYear = tonsYear * v.atr;
    const annual = tonsYear * revenueTon;
    const monthly = annual / 12;
    const daily = annual / 365;
    const roi = annual / patrimony * 100;
    const cumulative = annual * y;
    const cumulativePct = cumulative / patrimony * 100;
    const scenarios = [
      {label:'Conservador', multiplier:0.9},
      {label:'Base', multiplier:1},
      {label:'Otimista', multiplier:1.1}
    ].map(s => ({...s, atrPrice: v.atrPrice*s.multiplier, annual: annual*s.multiplier, roi: roi*s.multiplier}));
    const result = {ok:true, years:y, unitKey:unit, unitLabel:selectedUnit.label, hectaresPerAlqueire:HECTARES_PER_ALQUEIRE, values:v, hectares:v.totalArea*HECTARES_PER_ALQUEIRE, priceHa:v.priceAlq/HECTARES_PER_ALQUEIRE,
      patrimony, occupancy, remainingAlq, remainingHa:remainingAlq*HECTARES_PER_ALQUEIRE,
      leasedHa:v.leasedArea*HECTARES_PER_ALQUEIRE, leasedPatrimony:v.leasedArea*v.priceAlq,
      revenueTon, revenueAlq, tonsYear, atrYear, annual, monthly, daily, roi,
      payback:annual > 0 ? patrimony/annual : null,
      cumulative, cumulativePct, cumulativeTons:tonsYear*y,
      progression:Array.from({length:y},(_,i)=>({year:i+1, cumulative: annual*(i+1)})), scenarios};
    if (Object.entries(result).some(([k,n]) => typeof n === 'number' && !Number.isFinite(n)) || !Number.isFinite(atrYear)) return {ok:false, errors:{global:'Os valores são grandes demais para um cálculo confiável.'}};
    return result;
  }

  root.KmzCalc = {compute, parseNumber, money:n=>brMoney.format(n), number:n=>brNum.format(n), percent:n=>brPercent.format(n)+'%', atrPrice:n=>'R$ '+brPrice.format(n), UNIT_OPTIONS};
})(typeof window !== 'undefined' ? window : globalThis);

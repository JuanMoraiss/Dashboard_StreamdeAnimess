// Usa o JSON real se existir; senão cai no de exemplo
const DADOS_URLS = ['data/catalogo.json', 'data/catalogo_exemplo.json'];
const MIN_AVALIADOS = 10; 

const $ = id => document.getElementById(id);
const esc = t => String(t ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

let linhasGenero = [];
let linhasTotal = [];
let anoMin = 0;
let anoMax = 0;

async function carregarDados() {
  for (const url of DADOS_URLS) {
    try {
      const resp = await fetch(url);
      if (resp.ok) return { dados: await resp.json(), exemplo: url.includes('exemplo') };
    } catch (erro) {
      console.error(url, erro);
    }
  }
  return null;
}

async function iniciar() {
  const carregado = await carregarDados();
  if (!carregado) {
    $('aviso').innerHTML =
      '<div class="alert alert-danger">Não foi possível carregar os dados. ' +
      'Abra o site por um servidor local (como a extensão Live Server) ou pelo GitHub Pages.</div>';
    return;
  }

  linhasGenero = carregado.dados.filter(l => l.genero !== 'Todos');
  linhasTotal = carregado.dados.filter(l => l.genero === 'Todos');
  if (!linhasTotal.length) linhasTotal = linhasGenero; 
  $('selo-exemplo').hidden = !carregado.exemplo;

  preencherFiltros();
  criarGraficos();

  ['f-genero', 'f-tipo', 'f-de', 'f-ate', 'f-metrica'].forEach(id =>
    $(id).addEventListener('input', atualizar)
  );
  $('f-limpar').addEventListener('click', () => limparFiltros(true));

  atualizar();
  if (typeof desenharMeus === 'function') desenharMeus();
}

function valoresUnicos(chave) {
  return [...new Set(linhasGenero.map(l => l[chave]))]
    .sort((a, b) => String(a).localeCompare(String(b), 'pt-BR'));
}

function preencherFiltros() {
  valoresUnicos('genero').forEach(g => $('f-genero').add(new Option(g, g)));
  valoresUnicos('tipo').forEach(t => $('f-tipo').add(new Option(t, t)));

  const anos = linhasTotal.map(l => l.ano);
  anoMin = Math.min(...anos);
  anoMax = Math.max(...anos);
  ['f-de', 'f-ate'].forEach(id => {
    $(id).min = anoMin;
    $(id).max = anoMax;
  });
  limparFiltros(false);
}

function limparFiltros(redesenhar) {
  $('f-genero').value = '';
  $('f-tipo').value = '';
  $('f-de').value = anoMin;
  $('f-ate').value = anoMax;
  $('f-metrica').value = 'quantidade';
  if (redesenhar) atualizar();
}

function filtrar() {
  const genero = $('f-genero').value;
  const tipo = $('f-tipo').value;
  const de = Number($('f-de').value) || anoMin;
  const ate = Number($('f-ate').value) || anoMax;
  const noRecorte = l => (!tipo || l.tipo === tipo) && l.ano >= de && l.ano <= ate;

  const base = genero
    ? linhasGenero.filter(l => l.genero === genero && noRecorte(l))
    : linhasTotal.filter(noRecorte);
  const generos = linhasGenero.filter(noRecorte);
  return { base, generos };
}

function agrupar(linhas, chave) {
  const peso = l => l.avaliados ?? l.titulos;
  const mapa = new Map();
  for (const l of linhas) {
    const g = mapa.get(l[chave]) || { rotulo: l[chave], titulos: 0, avaliados: 0, soma: 0 };
    g.titulos += l.titulos;
    g.avaliados += peso(l);
    g.soma += l.nota * peso(l);
    mapa.set(l[chave], g);
  }
  return [...mapa.values()].map(g => ({
    rotulo: g.rotulo,
    titulos: g.titulos,
    avaliados: g.avaliados,
    nota: g.avaliados ? Number((g.soma / g.avaliados).toFixed(2)) : 0
  }));
}

function atualizar() {
  const metrica = $('f-metrica').value;
  const { base, generos } = filtrar();

  const porAno = agrupar(base, 'ano').sort((a, b) => a.rotulo - b.rotulo);
  const porTipo = agrupar(base, 'tipo').sort((a, b) => b.titulos - a.titulos);
  const porGenero = agrupar(generos, 'genero')
    .filter(g => metrica !== 'nota' || g.avaliados >= MIN_AVALIADOS)
    .sort((a, b) => (metrica === 'nota' ? b.nota - a.nota : b.titulos - a.titulos))
    .slice(0, 10);

  atualizarGraficos({ porAno, porTipo, porGenero }, metrica);
  atualizarResumo(base, porAno);
}

function atualizarResumo(linhas, porAno) {
  const peso = l => l.avaliados ?? l.titulos;
  const total = linhas.reduce((s, l) => s + l.titulos, 0);
  const avaliados = linhas.reduce((s, l) => s + peso(l), 0);
  const soma = linhas.reduce((s, l) => s + l.nota * peso(l), 0);
  const pico = porAno.reduce((m, d) => (!m || d.titulos > m.titulos ? d : m), null);

  $('kpi-total').textContent = total ? total.toLocaleString('pt-BR') : '—';
  $('kpi-nota').textContent = avaliados
    ? (soma / avaliados).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
    : '—';
  $('kpi-pico').textContent = pico ? pico.rotulo : '—';
}

iniciar();

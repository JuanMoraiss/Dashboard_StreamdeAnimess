const STATUS_CONCLUIDO = 'Concluído';
let minhaLista = [];
let rascunho = { malId: null, imagem: '', generos: [] };
let editandoId = null;
let resultadosBusca = [];
const modalItem = new bootstrap.Modal($('modal-item'));

function avisoLista(texto) {
  $('aviso-lista').innerHTML = texto ? `<div class="alert alert-warning">${esc(texto)}</div>` : '';
}

async function carregarLista() {
  if (B4A.appId.startsWith('COLE')) {
    avisoLista('Falta configurar as chaves do Back4App em js/api-back4app.js.');
    return renderLista();
  }
  try {
    minhaLista = await listarItens();
    avisoLista('');
  } catch (erro) {
    console.error(erro);
    avisoLista('Não foi possível carregar a lista. Confira as chaves e as permissões da classe no Back4App.');
  }
  renderLista();
}

function renderLista() {
  $('lista-corpo').innerHTML = minhaLista.length
    ? minhaLista.map(i => `
      <tr>
        <td>${esc(i.titulo)}</td>
        <td>${esc(i.status)}</td>
        <td>${i.nota ?? '—'}</td>
        <td>${i.episodio ?? 0}</td>
        <td class="text-end text-nowrap">
          <button type="button" class="btn btn-sm btn-outline-secondary" data-editar="${esc(i.objectId)}">Editar</button>
          <button type="button" class="btn btn-sm btn-outline-danger" data-excluir="${esc(i.objectId)}">Excluir</button>
        </td>
      </tr>`).join('')
    : '<tr><td colspan="5" class="text-center text-secondary py-4">Sua lista está vazia. Adicione o primeiro anime.</td></tr>';
  renderMeta();
  desenharMeus();
}

function lerMeta() {
  try { return Number(localStorage.getItem('meta-concluidos')) || 0; } catch { return 0; }
}
function salvarMeta(n) {
  try { localStorage.setItem('meta-concluidos', String(n)); } catch { /* sem armazenamento */ }
}

function renderMeta() {
  const meta = lerMeta();
  const feitos = minhaLista.filter(i => i.status === STATUS_CONCLUIDO).length;
  const pct = meta ? Math.min(100, Math.round(100 * feitos / meta)) : 0;
  $('meta-barra').style.width = pct + '%';
  $('meta-texto').textContent = meta
    ? `${feitos} de ${meta} concluídos (${pct}%)`
    : `${feitos} concluídos. Defina uma meta acima.`;
}

function desenharMeus() {
  if (!charts.meus || !linhasGenero.length) return;
  const totalCatalogo = linhasTotal.reduce((s, l) => s + l.titulos, 0);
  const generos = agrupar(linhasGenero, 'genero').sort((a, b) => b.titulos - a.titulos).slice(0, 8);
  const comGenero = minhaLista.filter(i => (i.generos || []).length);
  charts.meus.data.labels = generos.map(g => g.rotulo);
  charts.meus.data.datasets[0].data = generos.map(g => Number((100 * g.titulos / totalCatalogo).toFixed(1)));
  charts.meus.data.datasets[1].data = generos.map(g => comGenero.length
    ? Number((100 * comGenero.filter(i => i.generos.includes(g.rotulo)).length / comGenero.length).toFixed(1))
    : 0);
  charts.meus.update();
}

function abrirModal(item = {}) {
  editandoId = item.objectId || null;
  rascunho = { malId: item.malId ?? null, imagem: item.imagem || '', generos: item.generos || [] };
  $('modal-titulo').textContent = editandoId ? 'Editar anime' : 'Adicionar à lista';
  $('m-busca').value = '';
  $('m-resultados').innerHTML = '';
  $('m-erro').textContent = '';
  $('m-titulo').value = item.titulo || '';
  $('m-status').value = item.status || 'Quero ver';
  $('m-nota').value = item.nota ?? '';
  $('m-episodio').value = item.episodio ?? 0;
  modalItem.show();
}

async function salvarItem() {
  const dados = {
    titulo: $('m-titulo').value.trim(),
    status: $('m-status').value,
    nota: $('m-nota').value === '' ? null : Number($('m-nota').value),
    episodio: Number($('m-episodio').value) || 0,
    generos: rascunho.generos,
    imagem: rascunho.imagem,
    malId: rascunho.malId
  };
  if (!dados.titulo) { $('m-erro').textContent = 'Informe o título.'; return; }
  if (dados.nota !== null && (dados.nota < 0 || dados.nota > 10)) {
    $('m-erro').textContent = 'A nota deve ficar entre 0 e 10.';
    return;
  }
  const botao = $('m-salvar');
  botao.disabled = true;
  try {
    if (editandoId) await editarItem(editandoId, dados);
    else await criarItem(dados);
    modalItem.hide();
    await carregarLista();
  } catch (erro) {
    $('m-erro').textContent = 'Não foi possível salvar. ' + erro.message;
  } finally {
    botao.disabled = false;
  }
}

async function buscarNoModal() {
  const termo = $('m-busca').value.trim();
  if (!termo) return;
  const botao = $('m-buscar');
  botao.disabled = true;
  $('m-erro').textContent = '';
  try {
    resultadosBusca = await buscarAnimes(termo);
    $('m-resultados').innerHTML = resultadosBusca.length
      ? resultadosBusca.map((a, i) => `
        <button type="button" class="list-group-item list-group-item-action d-flex gap-2 align-items-center" data-res="${i}">
          <img src="${esc(a.imagem)}" alt="" width="36" height="52" class="rounded object-fit-cover">
          <span>${esc(a.titulo)}</span>
        </button>`).join('')
      : '<div class="list-group-item text-secondary">Nenhum resultado.</div>';
  } catch (erro) {
    $('m-erro').textContent = erro.message;
  } finally {
    botao.disabled = false;
  }
}

$('btn-novo').addEventListener('click', () => abrirModal());
$('m-salvar').addEventListener('click', salvarItem);
$('m-buscar').addEventListener('click', buscarNoModal);
$('m-busca').addEventListener('keydown', e => { if (e.key === 'Enter') buscarNoModal(); });

$('m-resultados').addEventListener('click', e => {
  const botao = e.target.closest('[data-res]');
  if (!botao) return;
  const a = resultadosBusca[Number(botao.dataset.res)];
  rascunho = { malId: a.malId, imagem: a.imagem, generos: a.generos };
  $('m-titulo').value = a.titulo;
  $('m-resultados').innerHTML = '';
});

$('lista-corpo').addEventListener('click', async e => {
  const editar = e.target.closest('[data-editar]');
  const excluir = e.target.closest('[data-excluir]');
  if (editar) abrirModal(minhaLista.find(i => i.objectId === editar.dataset.editar));
  if (excluir && confirm('Excluir este anime da lista?')) {
    try {
      await excluirItem(excluir.dataset.excluir);
      await carregarLista();
    } catch (erro) {
      avisoLista('Não foi possível excluir. ' + erro.message);
    }
  }
});

$('alta-container').addEventListener('click', e => {
  const botao = e.target.closest('[data-add]');
  if (!botao) return;
  const a = emAlta[Number(botao.dataset.add)];
  abrirModal({ titulo: a.titulo, imagem: a.imagem, generos: a.generos, malId: a.malId });
});

$('meta-valor').value = lerMeta() || '';
$('meta-valor').addEventListener('input', () => {
  salvarMeta(Number($('meta-valor').value) || 0);
  renderMeta();
});

carregarLista();
mostrarEmAlta();

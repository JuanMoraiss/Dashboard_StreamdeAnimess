const JIKAN = 'https://api.jikan.moe/v4';

const GENEROS_PT = {
  'Action': 'Ação', 'Adventure': 'Aventura', 'Comedy': 'Comédia', 'Drama': 'Drama',
  'Fantasy': 'Fantasia', 'Sci-Fi': 'Ficção científica', 'Romance': 'Romance',
  'Slice of Life': 'Slice of Life', 'Mystery': 'Mistério', 'Supernatural': 'Sobrenatural',
  'Horror': 'Terror', 'Sports': 'Esportes', 'Suspense': 'Suspense',
  'Award Winning': 'Premiado', 'Ecchi': 'Ecchi', 'Gourmet': 'Gastronomia',
  'Avant Garde': 'Vanguarda', 'Boys Love': 'Boys Love', 'Girls Love': 'Girls Love'
};

let emAlta = [];

async function jikan(caminho) {
  const resp = await fetch(JIKAN + caminho);
  if (resp.status === 429) throw new Error('Muitas consultas seguidas. Espere alguns segundos.');
  if (!resp.ok) throw new Error('A Jikan respondeu ' + resp.status);
  return (await resp.json()).data;
}

function normalizar(a) {
  return {
    malId: a.mal_id,
    titulo: a.title_english || a.title,
    imagem: a.images?.jpg?.image_url || '',
    nota: a.score,
    generos: (a.genres || []).map(g => GENEROS_PT[g.name] || g.name)
  };
}

async function buscarAnimes(termo) {
  const dados = await jikan('/anime?q=' + encodeURIComponent(termo) + '&limit=5&sfw=true');
  return dados.map(normalizar);
}

async function mostrarEmAlta() {
  const caixa = document.getElementById('alta-container');
  try {
    emAlta = (await jikan('/top/anime?filter=airing&limit=8&sfw=true')).map(normalizar);
    caixa.innerHTML = emAlta.map((a, i) => `
      <div class="col">
        <div class="card h-100">
          <img src="${esc(a.imagem)}" class="card-img-top poster" alt="Pôster de ${esc(a.titulo)}" loading="lazy">
          <div class="card-body p-2">
            <div class="small fw-semibold">${esc(a.titulo)}</div>
            <div class="small text-secondary">Nota ${a.nota ?? '—'}</div>
          </div>
          <div class="card-footer p-2">
            <button type="button" class="btn btn-sm btn-outline-primary w-100" data-add="${i}">Adicionar à lista</button>
          </div>
        </div>
      </div>`).join('');
  } catch (erro) {
    console.error(erro);
    caixa.innerHTML = '<div class="col-12 text-secondary">Não foi possível carregar agora. Tente de novo em instantes.</div>';
  }
}

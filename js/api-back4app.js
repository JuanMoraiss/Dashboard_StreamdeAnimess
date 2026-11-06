const B4A = {
  appId: 'zwemxR0SrgK2RpQBeEAY1zfRzbdgWGlvw3A97bb5',
  restKey: '33leU4Ttm2ICr8S1KhkVQIsBCv3mnKzPRqfjSTaH',
  url: 'https://parseapi.back4app.com/classes/ItemLista'
};

async function b4a(caminho = '', opcoes = {}) {
  const resp = await fetch(B4A.url + caminho, {
    ...opcoes,
    headers: {
      'X-Parse-Application-Id': B4A.appId,
      'X-Parse-REST-API-Key': B4A.restKey,
      'Content-Type': 'application/json'
    }
  });
  if (!resp.ok) throw new Error('Back4App respondeu ' + resp.status);
  return resp.json();
}

// Read
const listarItens = async () => (await b4a('?order=-createdAt&limit=200')).results;
// Create
const criarItem = dados => b4a('', { method: 'POST', body: JSON.stringify(dados) });
// Update
const editarItem = (id, dados) => b4a('/' + id, { method: 'PUT', body: JSON.stringify(dados) });
// Delete
const excluirItem = id => b4a('/' + id, { method: 'DELETE' });

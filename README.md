# AniStream · Painel do catálogo de animes

Dashboard com dados reais de animes, CRUD de uma lista pessoal e API pública, feito como projeto da disciplina.

**Site publicado:** (colar aqui o link do GitHub Pages)

**Equipe:** (nomes dos integrantes)

## O que o site tem
- **Dashboard (Chart.js):** lançamentos por ano (linha), títulos por formato (rosca), ranking de gêneros (barras) e "Meus gêneros × catálogo" (barras agrupadas), todos com título, eixos e unidades.
- **Interatividade:** filtros por gênero, formato e período, e ordenação do ranking por quantidade ou nota média.
- **CRUD (Back4App):** "Minha lista" com criar, listar, editar e excluir, mais uma meta de animes concluídos ligada ao painel.
- **API pública (Jikan):** busca de animes no cadastro e seção "Em alta agora".
- **Layout:** Bootstrap 5, responsivo para celular e desktop.

## Fontes
- Dados do catálogo: *Anime Dataset 2023* (MyAnimeList), no Kaggle, agregado por `scripts/agregar_dados.py`.
- API pública: [Jikan](https://jikan.moe) (MyAnimeList não oficial).
- Back-end: [Back4App](https://www.back4app.com) (Parse REST API).

## Como rodar
1. Abra a pasta por um servidor local (extensão Live Server, ou `python3 -m http.server 8000`). Abrir o `index.html` com duplo clique não funciona.
2. **Dados:** o site usa `data/catalogo.json` se existir; senão cai em `data/catalogo_exemplo.json` (números de exemplo). Para gerar o real:
   ```bash
   pip install pandas
   # coloque anime-dataset-2023.csv em dados_brutos/
   python scripts/agregar_dados.py
   ```
3. **Back4App:** crie um app novo e a classe `ItemLista` com as colunas `titulo` (String), `status` (String), `nota` (Number), `episodio` (Number), `generos` (Array), `imagem` (String) e `malId` (Number). Cole o Application ID e a REST API Key em `js/api-back4app.js` e ajuste as permissões da classe (CLP).

## Estrutura
```
index.html · css/style.css
js/ charts.js · main.js · lista.js · api-back4app.js · api-jikan.js
data/ catalogo.json (gerado) · catalogo_exemplo.json
scripts/agregar_dados.py
```

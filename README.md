# Anime Stream · Painel do catálogo de animes

Dashboard com dados reais de animes, CRUD de uma lista pessoal e API pública, feito como projeto da disciplina.

**Site publicado:** https://juanmoraiss.github.io/Dashboard_StreamdeAnimess/

**Equipe:** Emerson Heytor Trajano de Souza, Gabriel Caetano Araújo de Melo e Juan Augusto de Morais Araújo

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

## Estrutura
```
index.html · css/style.css
js/ charts.js · main.js · lista.js · api-back4app.js · api-jikan.js
data/ catalogo.json (gerado) · catalogo_exemplo.json
scripts/agregar_dados.py
```

import json
import sys
from pathlib import Path

import pandas as pd

RAIZ = Path(__file__).resolve().parent.parent
CSV = Path(sys.argv[1]) if len(sys.argv) > 1 else RAIZ / "dados_brutos" / "anime-dataset-2023.csv"
SAIDA = Path(sys.argv[2]) if len(sys.argv) > 2 else RAIZ / "data" / "catalogo.json"

ANO_MIN, ANO_MAX = 1980, 2023  

TIPOS = {"TV": "TV", "Movie": "Filme", "OVA": "OVA", "ONA": "ONA",
         "Special": "Especial", "TV Special": "Especial"} 

ADULTO = {"Hentai", "Erotica"}

GENEROS = {
    "Action": "Ação", "Adventure": "Aventura", "Comedy": "Comédia", "Drama": "Drama",
    "Fantasy": "Fantasia", "Sci-Fi": "Ficção científica", "Romance": "Romance",
    "Slice of Life": "Slice of Life", "Mystery": "Mistério", "Supernatural": "Sobrenatural",
    "Horror": "Terror", "Sports": "Esportes", "Suspense": "Suspense",
    "Award Winning": "Premiado", "Ecchi": "Ecchi", "Gourmet": "Gastronomia",
    "Avant Garde": "Vanguarda", "Boys Love": "Boys Love", "Girls Love": "Girls Love",
}


def carregar(caminho):
    if not caminho.exists():
        sys.exit(f"Arquivo não encontrado: {caminho}\n"
                 "Baixe o CSV no Kaggle e coloque-o em dados_brutos/ (ou passe o caminho como argumento).")
    df = pd.read_csv(caminho)
    df.columns = [c.strip().lower().replace(" ", "_") for c in df.columns]
    faltando = {"anime_id", "score", "genres", "type", "aired"} - set(df.columns)
    if faltando:
        sys.exit(f"Colunas ausentes no CSV: {sorted(faltando)}\nColunas encontradas: {list(df.columns)}")
    return df


def preparar(df):
    df = df.drop_duplicates("anime_id").copy()
    df["ano"] = pd.to_numeric(df["aired"].astype(str).str.extract(r"(\d{4})")[0], errors="coerce")
    df = df[df["ano"].between(ANO_MIN, ANO_MAX)].copy()
    df["ano"] = df["ano"].astype(int)
    df["nota"] = pd.to_numeric(df["score"], errors="coerce")
    df["tipo"] = df["type"].map(TIPOS).fillna("Outros")
    df["lista_generos"] = df["genres"].fillna("").astype(str).str.split(",")
    adulto = df["lista_generos"].apply(lambda gs: bool(ADULTO & {g.strip() for g in gs}))
    print(f"Títulos fora do recorte adulto: {int(adulto.sum())} excluídos")
    return df[~adulto]


def agregar(d, chaves):
    r = d.groupby(chaves).agg(
        titulos=("anime_id", "nunique"),
        avaliados=("nota", "count"),
        nota=("nota", "mean"),
    ).reset_index()
    r["nota"] = r["nota"].fillna(0).round(2)
    return r


def nativo(v):
    return v.item() if hasattr(v, "item") else v


def main():
    df = preparar(carregar(CSV))

    total = agregar(df, ["ano", "tipo"])
    total["genero"] = "Todos"

    ex = df.explode("lista_generos")
    ex["genero"] = ex["lista_generos"].str.strip().map(lambda g: GENEROS.get(g, g))
    ex = ex[~ex["genero"].str.upper().isin(["", "UNKNOWN"])]
    por_genero = agregar(ex, ["ano", "tipo", "genero"])

    colunas = ["ano", "tipo", "genero", "titulos", "avaliados", "nota"]
    final = pd.concat([total, por_genero], ignore_index=True)[colunas]
    final = final.sort_values(["genero", "ano", "tipo"])

    linhas = [json.dumps({k: nativo(v) for k, v in r.items()}, ensure_ascii=False, separators=(",", ":"))
              for r in final.to_dict("records")]
    SAIDA.parent.mkdir(parents=True, exist_ok=True)
    SAIDA.write_text("[\n" + ",\n".join(linhas) + "\n]\n", encoding="utf-8")

    print(f"{len(df)} títulos usados ({ANO_MIN}-{ANO_MAX}) · {len(final)} linhas · "
          f"{SAIDA.stat().st_size / 1024:.0f} KB -> {SAIDA}")


if __name__ == "__main__":
    main()

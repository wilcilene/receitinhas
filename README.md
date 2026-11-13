# Receitinhas da Wilcilene

Comida de casa, no seu tempo e do seu jeito.

Site estático (HTML, CSS e JavaScript puros), publicado no GitHub Pages:
https://wilcilene.github.io/receitinhas/

## Estrutura

```
index.html        página inicial, com filtros e cartões
receita.html      modelo único de página de receita (receita.html?id=...)
estilo.css        estilos compartilhados
js/comum.js       rótulos e funções compartilhadas
js/inicio.js      carrega as receitas e aplica os filtros
js/receita.js     monta a página de uma receita
receitas/index.json                  lista dos ids das receitas publicadas
receitas/<id>.json                   um arquivo por receita
```

## Como adicionar uma receita

1. Copie `receitas/medalhao-molho-madeira.json` com um novo nome, por exemplo
   `receitas/mousse-de-limao.json`. Use só letras minúsculas sem acento,
   números e hífens.
2. Edite o conteúdo. O campo `id` deve ser igual ao nome do arquivo (sem `.json`).
3. Acrescente o id em `receitas/index.json`:

   ```json
   [
     "medalhao-molho-madeira",
     "mousse-de-limao"
   ]
   ```

## Valores aceitos nos filtros

| Campo           | Valores                                                              |
|-----------------|----------------------------------------------------------------------|
| `refeicoes`     | `cafe-da-manha`, `almoco`, `jantar`, `lanche-da-tarde`, `sobremesa`  |
| `ocasioes`      | `dia-a-dia`, `especial`, `visitas`                                   |
| `energia`       | `preguica-total`, `dia-normal`, `inspirada`                          |
| `tempoTotalMin` | número de minutos (o filtro de tempo é calculado a partir dele)      |

`refeicoes` e `ocasioes` são listas: uma receita com `["almoco", "jantar"]`
aparece nos dois filtros.

## Campos opcionais

- `descricao`, `maoNaMassaMin`, `notaPassos`, `dicas` e `acompanhar` podem ser omitidos.
- Em `acompanhar.sobremesas`, inclua `"id"` para criar o link para a receita da
  sobremesa: `{ "titulo": "Mousse de limão", "id": "mousse-de-limao" }`.
  Sem `id`, o nome aparece como texto simples.

## Testar no computador

Os arquivos de receita são carregados por `fetch`, que não funciona abrindo o
`index.html` direto do disco. Rode um servidor local na pasta do projeto:

```
python -m http.server 8000
```

e abra http://localhost:8000

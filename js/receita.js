// Página da receita: lê o id da URL, carrega o arquivo da receita e monta a página.

import { rotulo, formatarTempo, el, carregarJson, linkReceita } from './comum.js';

const artigo = document.querySelector('#receita');

function secao(idTitulo, titulo, classeExtra) {
  const no = el('section', classeExtra ? `secao ${classeExtra}` : 'secao');
  no.setAttribute('aria-labelledby', idTitulo);
  const h2 = el('h2', 'titulo-secao', titulo);
  h2.id = idTitulo;
  return { no, h2 };
}

function montarApresentacao(receita) {
  const cabecalho = el('header', 'apresentacao');
  const linha = [
    ...receita.refeicoes.map((r) => rotulo('refeicao', r)),
    ...receita.ocasioes.map((o) => rotulo('ocasiao', o)),
  ].join(' · ');
  cabecalho.append(el('p', 'rotulo', linha), el('h1', '', receita.titulo));
  if (receita.descricao) {
    cabecalho.append(el('p', 'apresentacao__descricao', receita.descricao));
  }

  const indicadores = el('dl', 'indicadores');
  const dados = [['Tempo total', formatarTempo(receita.tempoTotalMin)]];
  if (receita.maoNaMassaMin) dados.push(['Mão na massa', formatarTempo(receita.maoNaMassaMin)]);
  dados.push(['Rendimento', receita.rendimento]);
  for (const [nome, valor] of dados) {
    const bloco = el('div', 'indicador');
    bloco.append(el('dt', '', nome), el('dd', '', valor));
    indicadores.append(bloco);
  }

  const etiquetas = el('div', 'etiquetas');
  etiquetas.append(
    el('span', 'etiqueta etiqueta--apoio', `Energia: ${rotulo('energia', receita.energia).toLowerCase()}`),
  );
  cabecalho.append(indicadores, etiquetas);
  return cabecalho;
}

// Um ingrediente pode apontar para outra receita do site com a marcação
// [texto do link](id-da-receita), por exemplo:
// "1 pacote de [biscoito champanhe](biscoito-champagne) (150 g)"
const LINK_RECEITA = /\[([^\]]+)\]\(([a-z0-9-]+)\)/g;

function montarItemIngrediente(texto) {
  const item = el('li');
  let inicio = 0;
  for (const encontrado of texto.matchAll(LINK_RECEITA)) {
    const [marcacao, rotuloLink, id] = encontrado;
    item.append(texto.slice(inicio, encontrado.index));
    const link = el('a', '', rotuloLink);
    link.href = linkReceita(id);
    item.append(link);
    inicio = encontrado.index + marcacao.length;
  }
  item.append(texto.slice(inicio));
  return item;
}

function montarIngredientes(receita) {
  const { no, h2 } = secao('titulo-ingredientes', 'Ingredientes');
  const topo = el('div', 'secao__topo');
  topo.append(h2, el('span', 'secao__nota', `Para ${receita.rendimento}`));

  const lista = el('div', 'ingredientes');
  for (const grupo of receita.ingredientes) {
    const bloco = el('div', 'grupo-ingredientes');
    if (grupo.grupo) bloco.append(el('h3', '', grupo.grupo));
    const itens = el('ul');
    itens.append(...grupo.itens.map(montarItemIngrediente));
    bloco.append(itens);
    lista.append(bloco);
  }
  no.append(topo, lista);
  return no;
}

function montarAcompanhar(acompanhar) {
  const sobremesas = acompanhar?.sobremesas ?? [];
  const bebidas = acompanhar?.bebidas;
  if (sobremesas.length === 0 && !bebidas) return null;

  const { no, h2 } = secao('titulo-acompanhar', 'Para acompanhar', 'para-acompanhar');
  const grupos = el('div', 'para-acompanhar__grupos');

  if (sobremesas.length > 0) {
    const bloco = el('div');
    const itens = el('ul');
    for (const sobremesa of sobremesas) {
      const item = el('li');
      if (sobremesa.id) {
        const link = el('a', '', `${sobremesa.titulo} `);
        link.href = linkReceita(sobremesa.id);
        const seta = el('span', '', '→');
        seta.setAttribute('aria-hidden', 'true');
        link.append(seta);
        item.append(link);
      } else {
        item.append(el('span', 'sem-link', sobremesa.titulo));
      }
      itens.append(item);
    }
    bloco.append(el('h3', '', 'De sobremesa'), itens);
    grupos.append(bloco);
  }

  if (bebidas) {
    const bloco = el('div');
    bloco.append(el('h3', '', 'Para beber'), el('p', '', bebidas));
    grupos.append(bloco);
  }

  no.append(h2, grupos);
  return no;
}

function montarPassos(receita) {
  const { no, h2 } = secao('titulo-passos', 'Passo a passo');
  const topo = el('div', 'secao__topo');
  topo.append(h2);
  no.append(topo);
  if (receita.notaPassos) no.append(el('p', 'passos__nota', receita.notaPassos));

  const lista = el('ol', 'passos');
  receita.passos.forEach((passo, indice) => {
    const item = el('li', 'passo');
    const numero = el('span', 'passo__numero', String(indice + 1));
    numero.setAttribute('aria-hidden', 'true');
    const corpo = el('div');
    corpo.append(el('h3', 'passo__titulo', passo.titulo));
    if (passo.tempo) corpo.append(el('p', 'passo__tempo', passo.tempo));
    corpo.append(el('p', 'passo__texto', passo.texto));
    item.append(numero, corpo);
    lista.append(item);
  });
  no.append(lista);
  return no;
}

function montarDicas(dicas) {
  if (!dicas || dicas.length === 0) return null;
  const { no, h2 } = secao('titulo-dicas', 'Dicas e erros a evitar', 'dicas');
  const lista = el('ul');
  for (const dica of dicas) {
    const item = el('li', 'dica');
    if (dica.titulo) item.append(el('strong', '', `${dica.titulo} `));
    item.append(dica.texto);
    lista.append(item);
  }
  no.append(h2, lista);
  return no;
}

function mostrarErro(mensagem) {
  const bloco = el('div', 'estado-vazio');
  bloco.append(el('p', 'estado-vazio__titulo', mensagem), el('p', '', 'Volte para a lista e escolha outra receita.'));
  artigo.replaceChildren(bloco);
}

async function iniciar() {
  const id = new URLSearchParams(location.search).get('id') ?? '';
  if (!/^[a-z0-9-]+$/.test(id)) {
    mostrarErro('Receita não encontrada.');
    return;
  }
  try {
    const receita = await carregarJson(`./receitas/${id}.json`);
    document.title = `${receita.titulo} · Receitinhas da Wilcilene`;
    const partes = [
      montarApresentacao(receita),
      montarIngredientes(receita),
      montarAcompanhar(receita.acompanhar),
      montarPassos(receita),
      montarDicas(receita.dicas),
    ].filter(Boolean);
    artigo.replaceChildren(...partes);
  } catch (erro) {
    console.error(erro);
    mostrarErro('Receita não encontrada.');
  }
}

iniciar();

// Página inicial: carrega as receitas, monta os cartões e aplica os filtros.

import { rotulo, formatarTempo, el, carregarJson, linkReceita } from './comum.js';

const GRUPOS = ['refeicao', 'tempo', 'energia', 'ocasiao'];

const grade = document.querySelector('#grade');
const contagem = document.querySelector('#contagem');
const estadoVazio = document.querySelector('.estado-vazio');
const aviso = document.querySelector('#aviso');

let receitas = [];
const filtros = lerFiltrosDaUrl();

function lerFiltrosDaUrl() {
  const parametros = new URLSearchParams(location.search);
  const estado = {};
  for (const grupo of GRUPOS) estado[grupo] = parametros.get(grupo) ?? '';
  return estado;
}

function gravarFiltrosNaUrl() {
  const parametros = new URLSearchParams();
  for (const grupo of GRUPOS) {
    if (filtros[grupo]) parametros.set(grupo, filtros[grupo]);
  }
  const consulta = parametros.toString();
  history.replaceState(null, '', consulta ? `?${consulta}` : location.pathname);
}

function combina(receita) {
  if (filtros.refeicao && !receita.refeicoes.includes(filtros.refeicao)) return false;
  if (filtros.energia && receita.energia !== filtros.energia) return false;
  if (filtros.ocasiao && !receita.ocasioes.includes(filtros.ocasiao)) return false;
  if (filtros.tempo) {
    const tempo = receita.tempoTotalMin;
    if (filtros.tempo === 'mais' ? tempo <= 60 : tempo > Number(filtros.tempo)) return false;
  }
  return true;
}

function criarCartao(receita) {
  const item = el('li');
  const link = el('a', 'cartao-receita');
  link.href = linkReceita(receita.id);

  const topo = el('div', 'cartao-receita__topo');
  topo.append(
    el('span', 'rotulo', receita.refeicoes.map((r) => rotulo('refeicao', r)).join(' · ')),
    el('span', 'cartao-receita__tempo', formatarTempo(receita.tempoTotalMin)),
  );
  link.append(topo, el('h3', 'cartao-receita__titulo', receita.titulo));

  if (receita.descricao) {
    link.append(el('p', 'cartao-receita__descricao', receita.descricao));
  }

  const etiquetas = el('div', 'etiquetas');
  etiquetas.append(
    el('span', 'etiqueta', receita.rendimento),
    el('span', 'etiqueta etiqueta--apoio', rotulo('energia', receita.energia)),
    ...receita.ocasioes.map((o) => el('span', 'etiqueta', rotulo('ocasiao', o))),
  );
  link.append(etiquetas, el('span', 'cartao-receita__ver', 'Ver receita →'));

  item.append(link);
  return item;
}

function atualizarControles() {
  document.querySelectorAll('.filtro-botao').forEach((botao) => {
    const ativo = filtros[botao.dataset.grupo] === botao.dataset.valor;
    botao.classList.toggle('ativo', ativo);
    botao.setAttribute('aria-pressed', String(ativo));
  });
  document.querySelectorAll('.filtro-select select').forEach((seletor) => {
    seletor.value = filtros[seletor.name];
    seletor.classList.toggle('ativo', Boolean(seletor.value));
  });
}

function atualizarLista() {
  const visiveis = receitas.filter(combina);
  grade.replaceChildren(...visiveis.map(criarCartao));
  contagem.textContent = visiveis.length === 1 ? '1 receita' : `${visiveis.length} receitas`;
  estadoVazio.hidden = visiveis.length > 0 || receitas.length === 0;
}

function atualizarTudo() {
  atualizarControles();
  atualizarLista();
  gravarFiltrosNaUrl();
}

function ligarControles() {
  document.querySelectorAll('.filtro-botao').forEach((botao) => {
    botao.addEventListener('click', () => {
      const { grupo, valor } = botao.dataset;
      filtros[grupo] = filtros[grupo] === valor ? '' : valor;
      atualizarTudo();
    });
  });
  document.querySelectorAll('.filtro-select select').forEach((seletor) => {
    seletor.addEventListener('change', () => {
      filtros[seletor.name] = seletor.value;
      atualizarTudo();
    });
  });
  document.querySelector('#limpar-filtros').addEventListener('click', () => {
    for (const grupo of GRUPOS) filtros[grupo] = '';
    atualizarTudo();
  });
}

async function iniciar() {
  ligarControles();
  atualizarControles();
  try {
    const ids = await carregarJson('./receitas/index.json');
    const resultados = await Promise.allSettled(
      ids.map((id) => carregarJson(`./receitas/${id}.json`)),
    );
    receitas = resultados
      .filter((r) => r.status === 'fulfilled')
      .map((r) => r.value);
    resultados
      .filter((r) => r.status === 'rejected')
      .forEach((r) => console.warn(r.reason));
    aviso.hidden = true;
    atualizarLista();
  } catch (erro) {
    console.error(erro);
    aviso.textContent = 'Não foi possível carregar as receitas. Tente recarregar a página.';
  }
}

iniciar();

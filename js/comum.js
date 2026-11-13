// Funções e rótulos compartilhados entre a página inicial e a página da receita.

export const ROTULOS = {
  refeicao: {
    'cafe-da-manha': 'Café da manhã',
    'almoco': 'Almoço',
    'jantar': 'Jantar',
    'lanche-da-tarde': 'Lanche da tarde',
    'sobremesa': 'Sobremesa',
  },
  energia: {
    'preguica-total': 'Preguiça total',
    'dia-normal': 'Dia normal',
    'inspirada': 'Inspirada',
  },
  ocasiao: {
    'dia-a-dia': 'Dia a dia',
    'especial': 'Especial ou romântico',
    'visitas': 'Visitas',
  },
};

export function rotulo(grupo, valor) {
  return ROTULOS[grupo]?.[valor] ?? valor;
}

// 40 -> "40 min", 80 -> "1 h e 20 min", 120 -> "2 h"
export function formatarTempo(minutos) {
  const h = Math.floor(minutos / 60);
  const m = minutos % 60;
  if (h === 0) return `${m} min`;
  if (m === 0) return `${h} h`;
  return `${h} h e ${m} min`;
}

// Cria um elemento com classe e texto opcionais.
export function el(tag, classe, texto) {
  const no = document.createElement(tag);
  if (classe) no.className = classe;
  if (texto !== undefined) no.textContent = texto;
  return no;
}

export async function carregarJson(caminho) {
  const resposta = await fetch(caminho);
  if (!resposta.ok) throw new Error(`Falha ao carregar ${caminho} (${resposta.status})`);
  return resposta.json();
}

export function linkReceita(id) {
  return `./receita.html?id=${encodeURIComponent(id)}`;
}

import { CurvatureType } from '../types';

export interface CurvatureInfo {
  code: CurvatureType;
  label: string;
  category: 'Lisos' | 'Ondulados' | 'Cacheados' | 'Crespos';
  description: string;
  tendency: string;
  curlIcon: string;
}

export const CURVATURE_CATALOG: CurvatureInfo[] = [
  {
    code: '1A',
    label: '1A - Liso Fino / Escorrido',
    category: 'Lisos',
    description: 'Fio totalmente reto, sem nenhuma ondulação, fino e sedoso.',
    tendency: 'Oleosidade escorre facilmente da raiz às pontas; pouco volume.',
    curlIcon: '—',
  },
  {
    code: '1B',
    label: '1B - Liso Médio / Encorpado',
    category: 'Lisos',
    description: 'Fio reto com espessura média e leve peso estrutural.',
    tendency: 'Fácil modelagem com escova, textura equilibrada.',
    curlIcon: '—',
  },
  {
    code: '1C',
    label: '1C - Liso Grosso / Resistente',
    category: 'Lisos',
    description: 'Fio reto, denso, pesado e de cutícula bem compacta.',
    tendency: 'Dificuldade de fixação de cachos artificiais e alta resistência mecânica.',
    curlIcon: '—',
  },
  {
    code: '2A',
    label: '2A - Ondulado Leve',
    category: 'Ondulados',
    description: 'Formato em "S" sutil a partir do meio do comprimento.',
    tendency: 'Raiz lisa com leve movimento nas pontas; fácil de alisar.',
    curlIcon: '〰',
  },
  {
    code: '2B',
    label: '2B - Ondulado Definido',
    category: 'Ondulados',
    description: 'Ondas em "S" mais evidentes e tendência a frizz superficial.',
    tendency: 'Necessita de leave-ins fluidos e texturização moderada.',
    curlIcon: '〰',
  },
  {
    code: '2C',
    label: '2C - Ondulado Intenso / Quase Cacheado',
    category: 'Ondulados',
    description: 'Ondas fechadas e volumosas com padrão bem marcado.',
    tendency: 'Pontas mais secas e necessidade de nutrição regular.',
    curlIcon: '〰',
  },
  {
    code: '3A',
    label: '3A - Cacho Largo / Espiral Aberta',
    category: 'Cacheados',
    description: 'Cachos soltos, em espirais grandes e bem delineadas.',
    tendency: 'Fio brilhante porém sensível ao vento e umidade climática.',
    curlIcon: '➰',
  },
  {
    code: '3B',
    label: '3B - Cacho Médio / Mola Definida',
    category: 'Cacheados',
    description: 'Cachos apertados no formato de mola elástica.',
    tendency: 'Ressecamento natural devido ao trajeto sinuoso do sebo capilar.',
    curlIcon: '➰',
  },
  {
    code: '3C',
    label: '3C - Cacho Fechado / Fio Denso',
    category: 'Cacheados',
    description: 'Cachos muito fechados e estreitos, com densidade alta.',
    tendency: 'Fator encolhimento acentuado e necessidade de umectação.',
    curlIcon: '➰',
  },
  {
    code: '4A',
    label: '4A - Crespo Macio em "S"',
    category: 'Crespos',
    description: 'Cachos minúsculos e muito unidos, visíveis ao esticar o fio.',
    tendency: 'Retenção hídrica reduzida e alta afinidade com manteigas vegetais.',
    curlIcon: '➿',
  },
  {
    code: '4B',
    label: '4B - Crespo Angular em "Z"',
    category: 'Crespos',
    description: 'Padrão em zigue-zague com ângulos agudos em vez de círculos.',
    tendency: 'Fio delicado nos pontos de torção; requer manuseio suave.',
    curlIcon: '➿',
  },
  {
    code: '4C',
    label: '4C - Crespo Muito Fechado',
    category: 'Crespos',
    description: 'Padrão em zigue-zague ultra compacto com encolhimento até 75%.',
    tendency: 'Maior necessidade de reposição lipídica e nutrição contínua.',
    curlIcon: '➿',
  },
];

export const CHEMICAL_OPTIONS = [
  { id: 'Coloração', label: 'Coloração Permanente / Tonalizante', desc: 'Abertura de cutículas e oxidação de pigmentos' },
  { id: 'Descoloração/Mechas', label: 'Descoloração / Luzes / Balayage', desc: 'Perda proteica e oxidação severa de melanina' },
  { id: 'Progressiva/Formol/Ácido', label: 'Progressiva / Botox / Ácidos', desc: 'Alinhamento térmico e alteração de pontes estruturais' },
  { id: 'Relaxamento/Guanidina', label: 'Relaxamento (Tioglicolato / Guanidina)', desc: 'Quebra permanente de pontes de cistina' },
  { id: 'Nenhuma', label: 'Cabelo Natural (Sem químicas de transformação)', desc: 'Estrutura virgem' },
];

export const PERCEIVED_DAMAGES_OPTIONS = [
  { id: 'Frizz excessivo', label: 'Frizz desalinhado / Eletrostática' },
  { id: 'Quebra mecânica', label: 'Fios quebrando no meio / Cabelo caindo quebrado' },
  { id: 'Pontas ralas/bifurcadas', label: 'Pontas duplas, triplas ou ralas' },
  { id: 'Falta de brilho/Opacidade', label: 'Opacidade / Fio fosco sem reflexo de luz' },
  { id: 'Aspereza ao toque', label: 'Sensação de palha / Aspereza ao deslizar dedos' },
  { id: 'Emborrachamento', label: 'Fio que estica e não volta (perda elástica)' },
  { id: 'Desbotamento precoce', label: 'Cor perde vivacidade rapidamente' },
];

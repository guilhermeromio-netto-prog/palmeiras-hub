/**
 * Quiz factual sobre o Palmeiras — só conhecimento comum verificado.
 * Se houver dúvida sobre um fato, a pergunta não entra.
 */

export const QUIZ_QUESTIONS = [
  {
    id: 'cores',
    q: 'Quais são as cores tradicionais do Palmeiras?',
    options: [
      'Verde e branco',
      'Azul e branco',
      'Vermelho e preto',
      'Amarelo e preto',
    ],
    correct: 0,
  },
  {
    id: 'apelido',
    q: 'Qual é o apelido mais famoso do clube?',
    options: ['Verdão', 'Mengão', 'Peixe', 'Galo'],
    correct: 0,
  },
  {
    id: 'estadio',
    q: 'Como é conhecido o estádio atual do Palmeiras (Allianz Parque)?',
    options: [
      'Nubank Arena / Allianz Parque',
      'Maracanã',
      'Morumbi',
      'Neo Química Arena',
    ],
    correct: 0,
  },
  {
    id: 'abel',
    q: 'Quem é o técnico português que conquistou vários títulos pelo Verdão na década de 2020?',
    options: [
      'Abel Ferreira',
      'José Mourinho',
      'Jorge Jesus',
      'Carlos Carvalhal',
    ],
    correct: 0,
  },
  {
    id: 'maior',
    q: 'O slogan do hub e um lema popular da torcida: o Palmeiras é…',
    options: [
      'O Maior Campeão',
      'O único hexa',
      'O time do povo carioca',
      'O clube do Morumbi',
    ],
    correct: 0,
  },
]

export const QUIZ_TOTAL = QUIZ_QUESTIONS.length

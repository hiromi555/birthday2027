// 中のページの設定
// color: 背景色 / dot: 背景のドットの色 / accent: エフェクトの色
// effect: エフェクトの名前 / textFx: 文字の動きの名前（src/textfx.js）
// textColor: 文字の色（省略すると白）
export const pages = [
  { text: 'Happy Birthday',     color: '#F7C21B', dot: '#E9A800', effect: 'confetti', textFx: 'pop' },
  { text: 'お誕生日',           color: '#2CA5D9', dot: '#1F8FC0', effect: 'shootingStars', textFx: 'drop' },
  { text: 'おめでとう',         color: '#E63B2E', dot: '#C42E22', effect: 'bang',     textFx: 'bang' },
  { text: '新しい１年も',       color: '#1B2A5C', dot: '#26397A', effect: 'spaceAge', textFx: 'zoom' },
  { text: '笑顔いっぱいで',     color: '#F4EBD9', dot: '#F0C9B8', effect: 'smileys',  textFx: 'hop', textColor: '#E63B2E' },
  { text: 'Have a great year!', color: '#1B2A5C', dot: '#26397A', effect: 'popFireworks', textFx: 'stamp' },
]

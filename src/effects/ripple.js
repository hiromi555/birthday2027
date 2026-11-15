import { gsap } from 'gsap'

const NS = 'http://www.w3.org/2000/svg'
const r = gsap.utils.random
const INK = '#111111'

// ハートの形（真ん中が 0,0 で、幅40くらい）
const HEART =
  'M0,16 C-6,10 -20,0 -20,-8 C-20,-16 -12,-20 -6,-18 C-3,-17 -1,-15 0,-12 ' +
  'C1,-15 3,-17 6,-18 C12,-20 20,-16 20,-8 C20,0 6,10 0,16Z'

// SVGの部品を1つ作る
function make(parent, tag, attrs) {
  const el = document.createElementNS(NS, tag)
  for (const [key, value] of Object.entries(attrs)) el.setAttribute(key, value)
  parent.appendChild(el)
  return el
}

// ハートの波紋＋ぽこぽこ水玉（ポップアート版）
export function ripple(svg) {
  const { width, height } = svg.getBoundingClientRect()
  const cx = width / 2
  const cy = height / 2
  const maxScale = (Math.max(width, height) * 0.6) / 20  // 画面の外まで広がる

  // ① まわりで、小さな輪っかがその場でふわっと広がって消える（ハートの余韻）
  const place = (g) => {
    g.setAttribute('transform', `translate(${r(width * 0.06, width * 0.94)}, ${r(height * 0.08, height * 0.92)})`)
  }
  for (let i = 0; i < 18; i++) {
    const g = make(svg, 'g', {})
    place(g)
    // 下に黒い線、上に色の線を重ねて「フチ取りの輪」にする
    const outline = make(g, 'circle', { r: 0, fill: 'none', stroke: INK, 'stroke-width': 6 })
    const ring = make(g, 'circle', {
      r: 0, fill: 'none', stroke: r(['#ffffff', '#ffffff', '#E63B2E', '#F7C21B']), 'stroke-width': 3,
    })
    const size = r(18, 45)
    gsap.timeline({
      repeat: -1,
      repeatDelay: r(0.5, 2),
      delay: r(1.5, 4),           // ハートが広がっている間は少し控えめに
      onRepeat: () => place(g),   // 毎回ちがう場所に出てくる
    }).fromTo([outline, ring],
      { attr: { r: 0 }, opacity: 1 },
      { attr: { r: size }, opacity: 0, duration: 1.6, ease: 'power2.out' }
    )
  }

  // ② 真ん中から、黒フチのハートの輪が3重に1回だけ広がる（白と赤を交互に）
  for (let i = 0; i < 3; i++) {
    const g = make(svg, 'g', { transform: `translate(${cx}, ${cy})` })
    const color = i % 2 === 0 ? '#ffffff' : '#E63B2E'
    // 下に太い黒線、上に色の線を重ねて「フチ取りの線」にする
    const outline = make(g, 'path', {
      d: HEART, fill: 'none', stroke: INK, 'stroke-width': 14,
      'vector-effect': 'non-scaling-stroke',  // 大きくなっても線の太さはそのまま
    })
    const line = make(g, 'path', {
      d: HEART, fill: 'none', stroke: color, 'stroke-width': 7,
      'vector-effect': 'non-scaling-stroke',
    })
    gsap.fromTo([outline, line],
      { scale: 1, svgOrigin: '0 0', opacity: 1 },
      {
        scale: maxScale,
        duration: 3,
        ease: 'power3.in',   // 最初ゆっくり→だんだん速く
        delay: 0.3 + i * 0.6,   // 少しずつずらして3重に
        onComplete: () => g.remove(),  // 広がりきったら片付ける
      }
    )
  }
}

import { gsap } from 'gsap'

const NS = 'http://www.w3.org/2000/svg'
const r = gsap.utils.random
const INK = '#111111'
const IMPACT = 0.4   // 「バーン！」の瞬間（文字の動きと合わせる）

// SVGの部品を1つ作る
function make(parent, tag, attrs) {
  const el = document.createElementNS(NS, tag)
  for (const [key, value] of Object.entries(attrs)) el.setAttribute(key, value)
  parent.appendChild(el)
  return el
}

// ギザギザの爆発の形（トゲの長さを少しずつバラバラに）
function burstPath(R, spikes = 16) {
  let d = ''
  for (let i = 0; i < spikes * 2; i++) {
    const rad = i % 2 === 0 ? R * r(0.9, 1.15) : R * r(0.62, 0.7)
    const a = (Math.PI / spikes) * i - Math.PI / 2
    d += `${i === 0 ? 'M' : 'L'}${(Math.cos(a) * rad).toFixed(1)},${(Math.sin(a) * rad).toFixed(1)} `
  }
  return d + 'Z'
}

// 漫画の「バーン！」：集中線＋爆発フキダシ＋画面の揺れ
export function bang(svg) {
  const { width, height } = svg.getBoundingClientRect()
  const cx = width / 2
  const cy = height / 2
  const R = Math.min(width * 0.46, height * 0.3)   // 爆発の大きさ
  const far = Math.hypot(width, height)            // 画面の外まで

  // ① 集中線：画面のふちから真ん中に向かう、黒い細いトゲ
  const lines = make(svg, 'g', { transform: `translate(${cx}, ${cy})` })
  for (let i = 0; i < 110; i++) {
    const a = r(0, Math.PI * 2)
    const w = r(0.004, 0.018)                     // トゲの太さ（角度）
    // 真ん中は空けておく（横長の画面では横に広く空ける）
    const inner = R * r(1.25, 1.7)
    const ix = Math.cos(a) * inner * Math.max(1, width / height)
    const iy = Math.sin(a) * inner
    make(lines, 'path', {
      d: `M${ix.toFixed(1)},${iy.toFixed(1)} ` +
         `L${(Math.cos(a - w) * far).toFixed(1)},${(Math.sin(a - w) * far).toFixed(1)} ` +
         `L${(Math.cos(a + w) * far).toFixed(1)},${(Math.sin(a + w) * far).toFixed(1)} Z`,
      fill: INK,
    })
  }
  gsap.fromTo(lines,
    { scale: 1.6, opacity: 0, svgOrigin: `${cx} ${cy}` },
    { scale: 1, opacity: 1, duration: 0.25, ease: 'power4.out', delay: IMPACT }
  )

  // ② 爆発フキダシ：黒い影＋黄色の本体（黒フチ）
  const burst = make(svg, 'g', { transform: `translate(${cx}, ${cy})` })
  const shape = burstPath(R)
  make(burst, 'path', { d: shape, fill: INK, transform: 'translate(8, 8)' })
  make(burst, 'path', {
    d: shape, fill: '#F7C21B', stroke: INK, 'stroke-width': 5, 'stroke-linejoin': 'round',
  })
  gsap.fromTo(burst,
    { scale: 0, rotation: -25, svgOrigin: `${cx} ${cy}` },
    { scale: 1, rotation: 0, duration: 0.7, ease: 'elastic.out(1, 0.45)', delay: IMPACT - 0.05 }
  )

  // ③ 画面がガタガタッと揺れる
  gsap.to(svg, {
    keyframes: [
      { x: -12, y: 7 }, { x: 10, y: -6 }, { x: -7, y: 4 }, { x: 4, y: -2 }, { x: 0, y: 0 },
    ],
    duration: 0.35,
    ease: 'none',
    delay: IMPACT,
    clearProps: 'transform',
  })
}

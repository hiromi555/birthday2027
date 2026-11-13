import { gsap } from 'gsap'

const NS = 'http://www.w3.org/2000/svg'
const r = gsap.utils.random
const DARK = '#333333'

// SVGの部品を1つ作る
function make(parent, tag, attrs) {
  const el = document.createElementNS(NS, tag)
  for (const [key, value] of Object.entries(attrs)) el.setAttribute(key, value)
  parent.appendChild(el)
  return el
}

// 星の形（stars.js と同じ作り方）
function starPath(points, outer, inner) {
  let d = ''
  for (let i = 0; i < points * 2; i++) {
    const rad = i % 2 === 0 ? outer : inner
    const a = (Math.PI / points) * i - Math.PI / 2
    d += `${i === 0 ? 'M' : 'L'}${(Math.cos(a) * rad).toFixed(2)},${(Math.sin(a) * rad).toFixed(2)} `
  }
  return d + 'Z'
}
const STAR = starPath(5, 8, 3.4)
const HEART =
  'M0,16 C-6,10 -20,0 -20,-8 C-20,-16 -12,-20 -6,-18 C-3,-17 -1,-15 0,-12 ' +
  'C1,-15 3,-17 6,-18 C12,-20 20,-16 20,-8 C20,0 6,10 0,16Z'

// これまでのページのモチーフ
const TYPES = ['circle', 'rect', 'heart', 'star', 'tri', 'smile', 'asterisk']

// モチーフを1つ作る
function motif(parent, type, color) {
  const g = make(parent, 'g', {})
  if (type === 'circle') make(g, 'circle', { r: 5, fill: color })
  if (type === 'rect') make(g, 'rect', { x: -5, y: -5, width: 10, height: 10, fill: color })
  if (type === 'heart') make(g, 'path', { d: HEART, fill: color, transform: 'scale(0.4)' })
  if (type === 'star') make(g, 'path', { d: STAR, fill: color })
  if (type === 'tri') {
    make(g, 'path', {
      d: 'M0,-8 L7,5 L-7,5Z', fill: 'none',
      stroke: color, 'stroke-width': 2, 'stroke-linejoin': 'round',
    })
  }
  if (type === 'smile') {
    make(g, 'circle', { r: 9, fill: color })
    make(g, 'circle', { cx: -3, cy: -2.5, r: 1.3, fill: DARK })
    make(g, 'circle', { cx: 3, cy: -2.5, r: 1.3, fill: DARK })
    make(g, 'path', {
      d: 'M-4.5,1.5 Q0,6.5 4.5,1.5',
      fill: 'none', stroke: DARK, 'stroke-width': 1.5, 'stroke-linecap': 'round',
    })
  }
  if (type === 'asterisk') {
    make(g, 'path', {
      d: 'M-7,0 L7,0 M-3.5,-6 L3.5,6 M-3.5,6 L3.5,-6',
      stroke: color, 'stroke-width': 3, 'stroke-linecap': 'round', fill: 'none',
    })
  }
  return g
}

// フィナーレ：モチーフの花火＋下からあふれる
export function finale(svg, accent = '#ff7a59') {
  const { width, height } = svg.getBoundingClientRect()
  const colors = [accent, '#e06c8c', '#f2a900', '#3fa58a', '#4f7fd6', '#8a63c4', '#ff2d4f']
  const maxDist = Math.min(width, height) * 0.3

  // 花火を1発あげる（x, y の場所ではじける）
  function burst(x, y) {
    // はじける瞬間の輪
    const ring = make(svg, 'circle', {
      cx: x, cy: y, r: 0, fill: 'none', stroke: r(colors), 'stroke-width': 3,
    })
    gsap.to(ring, {
      attr: { r: maxDist * 0.6, 'stroke-width': 0.5 },
      opacity: 0, duration: 0.8, ease: 'power2.out',
      onComplete: () => ring.remove(),
    })

    // 中からモチーフが飛び出す
    for (let i = 0; i < 24; i++) {
      const el = motif(svg, r(TYPES), r(colors))
      const angle = r(0, Math.PI * 2)
      const dist = r(maxDist * 0.3, maxDist)
      gsap.set(el, { x, y, scale: 0, transformOrigin: '50% 50%' })
      gsap.timeline({ onComplete: () => el.remove() })
        // パッと飛び散る
        .to(el, {
          x: x + Math.cos(angle) * dist,
          y: y + Math.sin(angle) * dist,
          scale: r(0.8, 1.6),
          rotation: r(-200, 200),
          duration: r(0.6, 0.9),
          ease: 'power3.out',
        })
        // ひらひら落ちて消える
        .to(el, {
          y: `+=${r(80, 160)}`,
          rotation: `+=${r(-90, 90)}`,
          opacity: 0,
          duration: r(1, 1.5),
          ease: 'power1.in',
        })
    }
  }

  // ① 最初の1発は文字の真ん中で、そのあとは連続で
  gsap.delayedCall(0.3, () => burst(width / 2, height / 2))
  gsap.timeline({ repeat: -1, delay: 1.2 })
    .call(() => burst(r(width * 0.2, width * 0.8), r(height * 0.15, height * 0.45)))
    .to({}, { duration: 1.4 })  // 次の花火までの間

  // ② 画面の下から、モチーフがあふれるように湧き上がる
  for (let i = 0; i < 16; i++) {
    const el = motif(svg, r(TYPES), r(colors))
    gsap.set(el, { opacity: 0, transformOrigin: '50% 50%' })

    gsap.timeline({ repeat: -1, repeatRefresh: true, delay: r(0, 4) })
      .fromTo(el,
        { x: () => r(0, width), y: height + 20, scale: () => r(0.8, 1.6), rotation: 0 },
        {
          y: () => r(height * 0.45, height * 0.75),
          rotation: () => r(-120, 120),
          duration: () => r(3, 5),
          ease: 'power1.out',
        }
      )
      .fromTo(el, { opacity: 0 }, { opacity: 1, duration: 0.6 }, 0)  // ふわっと現れて
      .to(el, { opacity: 0, duration: 1 }, '-=1')                     // ふわっと消える
  }
}

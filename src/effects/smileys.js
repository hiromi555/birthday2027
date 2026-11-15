import { gsap } from 'gsap'

const NS = 'http://www.w3.org/2000/svg'
const r = gsap.utils.random
const INK = '#111111'

// SVGの部品を1つ作る
function make(parent, tag, attrs) {
  const el = document.createElementNS(NS, tag)
  for (const [key, value] of Object.entries(attrs)) el.setAttribute(key, value)
  parent.appendChild(el)
  return el
}

// スマイルマークを1つ描く（真ん中が 0,0、半径30）
function smiley(parent, color) {
  const g = make(parent, 'g', {})
  make(g, 'circle', { r: 30, fill: color, stroke: INK, 'stroke-width': 4 })
  make(g, 'ellipse', { cx: -10, cy: -8, rx: 3.5, ry: 7, fill: INK })
  make(g, 'ellipse', { cx: 10, cy: -8, rx: 3.5, ry: 7, fill: INK })
  make(g, 'path', {
    d: 'M-17,6 Q0,26 17,6', fill: 'none', stroke: INK, 'stroke-width': 4, 'stroke-linecap': 'round',
  })
  return g
}

// 笑顔いっぱい：スマイルマークが次々にポンポン出てきて、画面をうめつくす
export function smileys(svg) {
  const { width, height } = svg.getBoundingClientRect()
  const cx = width / 2
  const cy = height / 2
  const count = Math.round(gsap.utils.clamp(14, 30, (width * height) / 22000))

  // 置く場所を決める（真ん中の文字のところと、スマイル同士の重なりはさける）
  const spots = []
  for (let tries = 0; spots.length < count && tries < 800; tries++) {
    const s = r(0.7, 1.6) * Math.max(0.8, Math.min(width, height) / 600)
    const x = r(width * 0.04, width * 0.96)
    const y = r(height * 0.04, height * 0.86)
    const onText = Math.abs(y - cy) < height * 0.12 && Math.abs(x - cx) < width * 0.45
    const tooClose = spots.some((p) => Math.hypot(p.x - x, p.y - y) < (p.s + s) * 30 * 0.95)
    if (!onText && !tooClose) spots.push({ x, y, s })
  }

  spots.forEach((p, i) => {
    const pos = make(svg, 'g', { transform: `translate(${p.x.toFixed(1)}, ${p.y.toFixed(1)})` })
    const face = smiley(pos, r(['#F7C21B', '#F7C21B', '#F7C21B', '#E63B2E', '#ffffff']))
    const tilt = r(-20, 20)

    // ポンッと出てくる（だんだん速く、次々に）
    gsap.fromTo(face,
      { scale: 0, rotation: tilt - 40, svgOrigin: '0 0' },
      {
        scale: p.s, rotation: tilt,
        duration: 0.45, ease: 'back.out(3)',
        delay: 0.3 + Math.pow(i, 0.8) * 0.12,
      })
    // そのあとは、ゆらゆら首をかしげる
    gsap.to(face, {
      rotation: tilt + r(-14, 14),
      duration: r(0.6, 1.1), ease: 'sine.inOut',
      repeat: -1, yoyo: true,
      delay: 2.5 + r(0, 1),
    })
  })
}

import { gsap } from 'gsap'
import { DrawSVGPlugin } from 'gsap/DrawSVGPlugin'

gsap.registerPlugin(DrawSVGPlugin)

const NS = 'http://www.w3.org/2000/svg'
const r = gsap.utils.random

// SVGの部品を1つ作る
function make(parent, tag, attrs) {
  const el = document.createElementNS(NS, tag)
  for (const [key, value] of Object.entries(attrs)) el.setAttribute(key, value)
  parent.appendChild(el)
  return el
}

// 正三角形の形（真ん中が 0,0、size＝真ん中から角までの距離）
function triPath(size) {
  const pts = [0, 1, 2].map((i) => {
    const a = -Math.PI / 2 + i * ((Math.PI * 2) / 3)
    return `${(Math.cos(a) * size).toFixed(1)},${(Math.sin(a) * size).toFixed(1)}`
  })
  return `M${pts[0]} L${pts[1]} L${pts[2]} Z`
}

// 近未来：ネオンの三角形＋浮かぶ三角形＋スキャンライン（軽量版）
export function future(svg, accent = '#4ff0ff') {
  const { width, height } = svg.getBoundingClientRect()
  const cx = width / 2
  const cy = height / 2
  const base = Math.min(width, height)

  // ① 大きな三角形が3重に描かれて、ゆっくり回りながら明滅する
  const sizes = [base * 0.55, base * 0.45, base * 0.36]
  sizes.forEach((size, i) => {
    const pos = make(svg, 'g', { transform: `translate(${cx}, ${cy})` })
    const spin = make(pos, 'g', {})  // 回すのはこのグループごと

    const d = triPath(size)
    const lineW = i === 0 ? 2 : 1.2
    // 後ろの「光のにじみ」：太くて薄い線
    const glow = make(spin, 'path', {
      d, fill: 'none', stroke: accent,
      'stroke-width': lineW * 5, 'stroke-linejoin': 'round', opacity: 0.18,
    })
    // 手前の「芯」：細くてはっきりした線
    const core = make(spin, 'path', {
      d, fill: 'none', stroke: accent,
      'stroke-width': lineW, 'stroke-linejoin': 'round',
    })

    // 線で描かれる（にじみと芯を一緒に）
    gsap.fromTo([glow, core],
      { drawSVG: '0% 0%' },
      { drawSVG: '0% 100%', duration: 1.2, delay: 0.3 + i * 0.25, ease: 'power2.inOut' }
    )
    // ゆっくり回る（1つおきに逆回り）
    gsap.to(spin, {
      rotation: i % 2 === 0 ? 360 : -360,
      svgOrigin: '0 0',
      duration: 30 - i * 6,
      repeat: -1,
      ease: 'none',
    })
    // ふわっと明滅
    gsap.to(spin, {
      opacity: 0.3,
      duration: r(1.2, 2),
      repeat: -1,
      yoyo: true,
      ease: 'sine.inOut',
      delay: 1.5,
    })
  })

  // ③ スキャンライン：光る横線が2本、上から下へ時間差で通過する
  for (let i = 0; i < 6; i++) {
    const scan = make(svg, 'g', { opacity: 0 })
    make(scan, 'line', { x1: 0, y1: 0, x2: width, y2: 0, stroke: accent, 'stroke-width': 8, opacity: 0.15 })  // にじみ
    make(scan, 'line', { x1: 0, y1: 0, x2: width, y2: 0, stroke: accent, 'stroke-width': 1.5 })              // 芯

    gsap.timeline({ repeat: -1, repeatDelay: 2.5, delay: 1 + i * 0.8 })  // 2本目は少し遅れて
   .fromTo(scan, { y: height + 10 }, { y: -10, duration: 2.2, ease: 'power1.inOut' })  // 下 → 上
      .to(scan, { opacity: 0.8, duration: 0.3 }, 0)
      .to(scan, { opacity: 0, duration: 0.4 }, '-=0.4')
  }
}

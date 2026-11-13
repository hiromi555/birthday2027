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

// 花火を1つ作る（外側の長い線＋内側の短い線の二重）
function makeFirework(parent, x, y, radius, color, innerColor) {
  const pos = make(parent, 'g', { transform: `translate(${x}, ${y})` })
  const pop = make(pos, 'g', {})  // ポンッと広げる用
  const spokes = []

  // 外側の線
  const n = 32
  for (let i = 0; i < n; i++) {
    const a = ((Math.PI * 2) / n) * i
    const inner = radius * 0.3
    const outer = radius * r(0.85, 1)
    spokes.push(make(pop, 'line', {
      x1: Math.cos(a) * inner, y1: Math.sin(a) * inner,
      x2: Math.cos(a) * outer, y2: Math.sin(a) * outer,
      stroke: color, 'stroke-width': 2, 'stroke-linecap': 'round', opacity: 0,
    }))
  }
  // 内側の短い線
  const m = 16
  for (let i = 0; i < m; i++) {
    const a = ((Math.PI * 2) / m) * i + Math.PI / m
    spokes.push(make(pop, 'line', {
      x1: Math.cos(a) * radius * 0.12, y1: Math.sin(a) * radius * 0.12,
      x2: Math.cos(a) * radius * 0.5, y2: Math.sin(a) * radius * 0.5,
      stroke: innerColor, 'stroke-width': 1.5, 'stroke-linecap': 'round', opacity: 0,
    }))
  }
  return { pop, spokes }
}

// フィナーレ：打ち上げ花火
export function fireworks(svg) {
  const { width, height } = svg.getBoundingClientRect()
  const cx = width / 2
  const cy = height / 2
  const base = Math.min(width, height)
  const colors = ['#e8f53a', '#2ef28a', '#ff2fd0', '#2fb8ff', '#ffffff', '#3ef0c8']

  // ① 花火の場所：文字の上にアーチ状に並べる＋下に小さいのを2つ
  const count = width < 600 ? 5 : 7  // スマホは5つ、PCは7つ
  const spots = []
  for (let i = 0; i < count; i++) {
    const deg = 205 + (130 / (count - 1)) * i
    const a = (deg * Math.PI) / 180
    spots.push({
      x: cx + Math.cos(a) * width * 0.36,
      y: cy - height * 0.05 + Math.sin(a) * height * 0.3,
      radius: r(base * 0.12, base * 0.17),
    })
  }
  spots.push({ x: width * 0.22, y: height * 0.8, radius: base * 0.1 })
  spots.push({ x: width * 0.78, y: height * 0.82, radius: base * 0.1 })

  // ② キラキラの点と小さな星（夜空のにぎやかし）
  for (let i = 0; i < 50; i++) {
    const dot = make(svg, 'circle', {
      cx: r(0, width), cy: r(0, height),
      r: r(1, 2.5), fill: r(colors), opacity: 0,
    })
    gsap.to(dot, {
      opacity: r(0.4, 1), duration: r(0.6, 1.4),
      repeat: -1, yoyo: true, ease: 'sine.inOut', delay: r(0, 2),
    })
  }

  // ③ 打ち上げ → パーッと開く → 散って消える、を順番にくり返す
  const show = gsap.timeline({ repeat: -1, repeatDelay: 0.8, delay: 0.3 })

  gsap.utils.shuffle(spots).forEach((s, i) => {
    const color = r(colors)
    const innerColor = r(colors)
    const { pop, spokes } = makeFirework(svg, s.x, s.y, s.radius, color, innerColor)

    // 打ち上げの軌跡（画面の下から、花火の場所まで）
    const sx = cx + (s.x - cx) * 0.3
    const trail = make(svg, 'path', {
      d: `M${sx},${height + 10} L${s.x},${s.y}`,
      stroke: color, 'stroke-width': 2, 'stroke-linecap': 'round', fill: 'none', opacity: 0,
    })

    const one = gsap.timeline()
      // シュッと打ち上がる（短い光の筋が上へ昇る）
      .set(trail, { opacity: 1, drawSVG: '0% 0%' })
      .to(trail, { drawSVG: '85% 100%', duration: 0.6, ease: 'power2.out' })
      .set(trail, { opacity: 0 })
      // パーッと開く
      .set(spokes, { opacity: 1, drawSVG: '0% 0%' })
      .to(spokes, { drawSVG: '0% 100%', duration: 0.5, ease: 'expo.out' })
      .fromTo(pop,
        { scale: 0.6, svgOrigin: '0 0' },
        { scale: 1, duration: 0.6, ease: 'expo.out' },
        '<'
      )
      // 外へ散るように消える
      .to(spokes, {
        drawSVG: '100% 100%',
        opacity: 0,
        duration: 0.9,
        ease: 'power1.in',
      }, '+=0.4')

    show.add(one, i * 0.35)  // 0.35秒ずつずらして、次々と打ち上げる
  })
}

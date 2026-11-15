import { gsap } from 'gsap'

const NS = 'http://www.w3.org/2000/svg'
const r = gsap.utils.random
const INK = '#111111'
const RED = '#E63B2E'
const YELLOW = '#F7C21B'
const BLUE = '#2CA5D9'

// SVGの部品を1つ作る
function make(parent, tag, attrs) {
  const el = document.createElementNS(NS, tag)
  for (const [key, value] of Object.entries(attrs)) el.setAttribute(key, value)
  parent.appendChild(el)
  return el
}

// キラキラ星（4つのトゲ）
const SPARKLE = 'M0,-14 Q2,-2 14,0 Q2,2 0,14 Q-2,2 -14,0 Q-2,-2 0,-14Z'

// 1950年代の人が夢見た「未来」：レトロなロケット＋輪っかの惑星＋キラキラ星
export function spaceAge(svg) {
  const { width, height } = svg.getBoundingClientRect()
  const base = Math.min(width, height)

  // ① キラキラ星：あちこちでまたたく
  for (let i = 0; i < 16; i++) {
    const g = make(svg, 'g', {
      transform: `translate(${r(width * 0.04, width * 0.96)}, ${r(height * 0.04, height * 0.9)})`,
    })
    const s = make(g, 'path', {
      d: SPARKLE,
      fill: r([YELLOW, YELLOW, '#ffffff']),
      stroke: INK, 'stroke-width': 2.5, 'stroke-linejoin': 'round',
    })
    gsap.fromTo(s,
      { scale: 0, svgOrigin: '0 0' },
      { scale: r(0.7, 1.3), duration: 0.5, ease: 'back.out(3)', delay: r(0.2, 1.5) })
    gsap.to(s, {
      scale: '*=0.5', rotation: 45, svgOrigin: '0 0',
      duration: r(0.6, 1.2), ease: 'sine.inOut',
      repeat: -1, yoyo: true, delay: r(1.6, 3),
    })
  }

  // ② 輪っかのある惑星：左下でふわふわ
  const pr = base * 0.11
  const planet = make(svg, 'g', { transform: `translate(${width * 0.16}, ${height * 0.74})` })
  const body = make(planet, 'g', {})
  make(body, 'circle', { r: pr, fill: RED, stroke: INK, 'stroke-width': 4 })
  make(body, 'path', {   // 影の三日月（右下）
    d: `M${pr * 0.2},${-pr * 0.95} A${pr},${pr} 0 0 1 ${pr * 0.2},${pr * 0.95} A${pr * 0.9},${pr} 0 0 0 ${pr * 0.2},${-pr * 0.95}Z`,
    fill: '#B8281E',
  })
  const ring = { rx: pr * 1.75, ry: pr * 0.45 }
  make(body, 'ellipse', { ...ring, fill: 'none', stroke: INK, 'stroke-width': 10, transform: 'rotate(-18)' })
  make(body, 'ellipse', { ...ring, fill: 'none', stroke: YELLOW, 'stroke-width': 5, transform: 'rotate(-18)' })
  gsap.fromTo(body, { scale: 0, svgOrigin: '0 0' }, { scale: 1, duration: 0.7, ease: 'back.out(2)', delay: 0.3 })
  gsap.to(body, { y: -8, duration: 1.8, ease: 'sine.inOut', repeat: -1, yoyo: true, delay: 1 })

  // ③ ロケット：左下から右上へ、モクモク煙を出して飛ぶ
  const rocket = make(svg, 'g', {})
  const ship = make(rocket, 'g', {})   // 上向きに描いて、あとで傾ける
  const flame = make(ship, 'g', {})
  make(flame, 'path', { d: 'M-8,26 Q0,54 8,26Z', fill: YELLOW, stroke: INK, 'stroke-width': 2.5, 'stroke-linejoin': 'round' })
  make(flame, 'path', { d: 'M-4,27 Q0,42 4,27Z', fill: RED })
  make(ship, 'path', { d: 'M-14,4 L-28,30 L-12,24Z', fill: RED, stroke: INK, 'stroke-width': 3, 'stroke-linejoin': 'round' })
  make(ship, 'path', { d: 'M14,4 L28,30 L12,24Z', fill: RED, stroke: INK, 'stroke-width': 3, 'stroke-linejoin': 'round' })
  make(ship, 'rect', { x: -9, y: 20, width: 18, height: 7, rx: 2, fill: INK })
  make(ship, 'path', { d: 'M0,-46 C15,-30 17,-5 14,22 L-14,22 C-17,-5 -15,-30 0,-46Z', fill: '#ffffff', stroke: INK, 'stroke-width': 3.5, 'stroke-linejoin': 'round' })
  make(ship, 'path', { d: 'M0,-46 C8,-38 11,-31 12.5,-25 L-12.5,-25 C-11,-31 -8,-38 0,-46Z', fill: RED, stroke: INK, 'stroke-width': 3, 'stroke-linejoin': 'round' })
  make(ship, 'circle', { cy: -6, r: 7, fill: BLUE, stroke: INK, 'stroke-width': 3 })

  // 炎がチラチラ
  gsap.to(flame, { scaleY: 0.7, svgOrigin: '0 26', duration: 0.08, repeat: -1, yoyo: true, ease: 'none' })

  // 飛ぶ道すじ（画面の外から外へ）
  const from = { x: -width * 0.15, y: height * 1.05 }
  const to = { x: width * 1.15, y: -height * 0.1 }
  const dx = to.x - from.x
  const dy = to.y - from.y
  const len = Math.hypot(dx, dy)
  const tilt = (Math.atan2(dy, dx) * 180) / Math.PI + 90   // 進む向きに傾ける
  const size = Math.max(0.9, base / 420)
  gsap.set(ship, { rotation: tilt, scale: size, svgOrigin: '0 0' })
  gsap.set(rocket, { x: from.x, y: from.y })

  // 煙をひとつ出す（ロケットのおしりから）
  let lastPuff = 0
  const puff = () => {
    const now = performance.now()
    if (now - lastPuff < 70) return
    lastPuff = now
    const px = gsap.getProperty(rocket, 'x') - (dx / len) * 40 * size
    const py = gsap.getProperty(rocket, 'y') - (dy / len) * 40 * size
    const c = make(svg, 'circle', {
      cx: px + r(-6, 6), cy: py + r(-6, 6), r: 6,
      fill: '#ffffff', stroke: INK, 'stroke-width': 3,
    })
    svg.insertBefore(c, rocket)   // 煙はロケットのうしろに
    gsap.to(c, {
      attr: { r: r(12, 22) }, opacity: 0,
      duration: 1.4, ease: 'power1.out',
      onComplete: () => c.remove(),
    })
  }

  gsap.timeline({ repeat: -1, repeatDelay: 2.5, delay: 0.6 })
    .fromTo(rocket,
      { x: from.x, y: from.y },
      { x: to.x, y: to.y, duration: 3.2, ease: 'sine.inOut', onUpdate: puff })
}

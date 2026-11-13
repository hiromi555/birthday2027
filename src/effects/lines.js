import { gsap } from 'gsap'
import { DrawSVGPlugin } from 'gsap/DrawSVGPlugin'

gsap.registerPlugin(DrawSVGPlugin)  // 線を描くプラグインを使えるようにする

const NS = 'http://www.w3.org/2000/svg'
const r = gsap.utils.random

// SVGの部品を1つ作る
function make(parent, tag, attrs) {
  const el = document.createElementNS(NS, tag)
  for (const [key, value] of Object.entries(attrs)) el.setAttribute(key, value)
  parent.appendChild(el)
  return el
}

// 波打つ線の形を作る（y0＝高さ、amp＝波の大きさ、wl＝波の長さ）
function wavePath(width, y0, amp, wl) {
  let d = `M-20,${y0}`
  let up = true
  for (let x = -20; x < width + 20; x += wl / 2) {
    d += ` Q${x + wl / 4},${y0 + (up ? -amp : amp)} ${x + wl / 2},${y0}`
    up = !up
  }
  return d
}

// 朝日のような光の筋＋波打つリボン
export function lines(svg, accent = '#fff') {
  const { width, height } = svg.getBoundingClientRect()
  const cx = width / 2
  const cy = height / 2

  // ① 文字のまわりから、光の筋がシュッと伸びる
  const ix = Math.min(width * 0.4, 220)  // 文字をよける横の広さ
  const iy = 70                          // 文字をよける縦の広さ
  const count = 24

  for (let i = 0; i < count; i++) {
    const a = ((Math.PI * 2) / count) * i
    const sx = cx + Math.cos(a) * ix
    const sy = cy + Math.sin(a) * iy
    const len = r(50, 90)

    const ray = make(svg, 'line', {
      x1: sx, y1: sy,
      x2: sx + Math.cos(a) * len, y2: sy + Math.sin(a) * len,
      stroke: accent,
      'stroke-width': i % 2 === 0 ? 4 : 2,  // 太い線と細い線を交互に
      'stroke-linecap': 'round',
    })

    gsap.timeline({ repeat: -1, repeatDelay: 1, delay: 0.3 + i * 0.05 })
      // 内側から外へ、線が伸びる
      .fromTo(ray,
        { drawSVG: '0% 0%' },
        { drawSVG: '0% 100%', duration: 0.6, ease: 'power2.out' }
      )
      // 外へ抜けるように消える
      .to(ray, { drawSVG: '100% 100%', duration: 0.6, ease: 'power2.in' })
  }

  // ② 画面の上と下で、波打つリボンが描かれては消える
  const ys = [
    r(height * 0.1, height * 0.2),
    r(height * 0.22, height * 0.3),
    r(height * 0.7, height * 0.78),
    r(height * 0.8, height * 0.9),
  ]

  ys.forEach((y0) => {
    const ribbon = make(svg, 'path', {
      d: wavePath(width, y0, r(10, 22), r(90, 160)),
      fill: 'none',
      stroke: accent,
      'stroke-width': 3,
      'stroke-linecap': 'round',
      opacity: 0.5,
    })

    gsap.timeline({ repeat: -1, repeatDelay: r(0.5, 1.5), delay: r(0.2, 1.5) })
      // 左から右へ、スーッと描かれる
      .fromTo(ribbon,
        { drawSVG: '0% 0%' },
        { drawSVG: '0% 100%', duration: 2, ease: 'sine.inOut' }
      )
      // 左から順に消えていく
      .to(ribbon, { drawSVG: '100% 100%', duration: 2, ease: 'sine.inOut' })
  })
}

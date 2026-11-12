import { gsap } from 'gsap'

const NS = 'http://www.w3.org/2000/svg'
const r = gsap.utils.random

// ハートの形（真ん中が 0,0 で、幅40くらい）
const HEART =
  'M0,16 C-6,10 -20,0 -20,-8 C-20,-16 -12,-20 -6,-18 C-3,-17 -1,-15 0,-12 ' +
  'C1,-15 3,-17 6,-18 C12,-20 20,-16 20,-8 C20,0 6,10 0,16Z'

// SVGの部品を1つ作る
function make(svg, tag, attrs) {
  const el = document.createElementNS(NS, tag)
  for (const [key, value] of Object.entries(attrs)) el.setAttribute(key, value)
  svg.appendChild(el)
  return el
}

// ハートの波紋＋ぽこぽこ輪っか
export function ripple(svg, accent = '#fff') {
  const { width, height } = svg.getBoundingClientRect()
  const cx = width / 2
  const cy = height / 2
  const maxScale = (Math.min(width, height) * 0.45) / 20  // 画面に合わせた広がり

  // ① 真ん中から、ハートの輪がじわ〜っと3重に広がる
  for (let i = 0; i < 3; i++) {
    const g = make(svg, 'g', { transform: `translate(${cx}, ${cy})` })
    const heart = make(g, 'path', {
      d: HEART,
      fill: 'none',
      stroke: accent,
      'stroke-width': 3,
      'vector-effect': 'non-scaling-stroke',  // 大きくなっても線が太らない
      opacity: 0,
    })
    gsap.fromTo(heart,
      { scale: 1, svgOrigin: '0 0', opacity: 0.9, attr: { 'stroke-width': 3 } },
      {
        scale: maxScale,
        opacity: 0,
        attr: { 'stroke-width': 0.5 },
        duration: 3.6,
        ease: 'sine.out',
        repeat: -1,
        delay: 0.3 + i * 1.2,  // 少しずつずらして3重に
      }
    )
  }

  // ② まわりで、小さな輪っかがぽこぽこ現れては消える
  const place = (ring) => {
    ring.setAttribute('cx', r(width * 0.08, width * 0.92))
    ring.setAttribute('cy', r(height * 0.12, height * 0.88))
  }

  for (let i = 0; i < 32; i++) {
    const size = r(50, 140)
    const ring = make(svg, 'circle', {
      r: 0, fill: 'none', stroke: accent, 'stroke-width': 2, opacity: 0,
    })
    place(ring)

    gsap.timeline({
      repeat: -1,
      repeatDelay: r(0.2, 1.2),
      delay: r(0.3, 2),
      onRepeat: () => place(ring),  // 毎回ちがう場所に出てくる
    }).fromTo(ring,
      { attr: { r: 0, 'stroke-width': 2.5 }, opacity: 0.9 },
      { attr: { r: size, 'stroke-width': 0.3 }, opacity: 0, duration: r(1.7, 2.1), ease: 'power2.out' }
    )
  }
}

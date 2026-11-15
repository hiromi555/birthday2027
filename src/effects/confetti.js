import { gsap } from 'gsap'

const NS = 'http://www.w3.org/2000/svg'
// ポップアートの色（黄色の背景で見えるように、黄色は入れない）
const COLORS = ['#E63B2E', '#E63B2E', '#2CA5D9', '#2CA5D9', '#ffffff', '#111111']

// 紙吹雪：真ん中からポンッと弾けて、ひらひら落ちる
// 1つずつ黒い線でフチ取りして、コミックっぽく
export function confetti(svg) {
  const { width, height } = svg.getBoundingClientRect()
  const cx = width / 2
  const cy = height / 2
  const r = gsap.utils.random

  for (let i = 0; i < 70; i++) {
    // 丸・四角・三角・星のどれかを作る
    const type = r(['circle', 'rect', 'polygon', 'star'])
    const el = document.createElementNS(NS, type === 'star' ? 'polygon' : type)
    if (type === 'circle') el.setAttribute('r', r(5, 9))
    if (type === 'rect') {
      el.setAttribute('width', r(8, 14))
      el.setAttribute('height', r(8, 14))
    }
    if (type === 'polygon') el.setAttribute('points', '0,-9 8,7 -8,7')
    if (type === 'star') el.setAttribute('points', '0,-11 3,-3 11,-3 5,2 7,10 0,5 -7,10 -5,2 -11,-3 -3,-3')

    const fill = r(COLORS)
    el.setAttribute('fill', fill)
    el.setAttribute('stroke', fill === '#111111' ? '#ffffff' : '#111111') // 黒い紙だけ白フチ
    el.setAttribute('stroke-width', 2.5)
    el.setAttribute('stroke-linejoin', 'round')
    svg.appendChild(el)

    // 飛んでいく方向と距離
    const angle = r(0, Math.PI * 2)
    const dist = r(80, Math.min(width, height) * 0.75)

    gsap.set(el, { x: cx, y: cy, scale: 0, transformOrigin: 'center' })
    gsap.timeline({ delay: 0.3, onComplete: () => el.remove() })
      // ポンッと弾ける
      .to(el, {
        x: cx + Math.cos(angle) * dist,
        y: cy + Math.sin(angle) * dist,
        scale: r(1, 1.8),
        rotation: r(-360, 360),
        duration: r(0.6, 1),
        ease: 'power3.out',
      })
      // ひらひら落ちて消える
      .to(el, {
        y: `+=${r(60, 140)}`,
        rotation: `+=${r(-180, 180)}`,
        opacity: 0,
        duration: r(1, 1.6),
        ease: 'power1.in',
      })
  }
}

import { gsap } from 'gsap'

const NS = 'http://www.w3.org/2000/svg'
const COLORS = ['#ffffff', '#ffd36e', '#e06c8c', '#9ad0c2', '#a8c5f0']

// 紙吹雪：真ん中からポンッと弾けて、ひらひら落ちる
export function confetti(svg, accent = '#fff') {
  const { width, height } = svg.getBoundingClientRect()
  const cx = width / 2
  const cy = height / 2
  const r = gsap.utils.random

  for (let i = 0; i < 80; i++) {
    // 丸・四角・三角のどれかを作る
    const type = r(['circle', 'rect', 'polygon'])
    const el = document.createElementNS(NS, type)
    if (type === 'circle') el.setAttribute('r', r(4, 8))
    if (type === 'rect') {
      el.setAttribute('width', r(6, 12))
      el.setAttribute('height', r(6, 12))
    }
    if (type === 'polygon') el.setAttribute('points', '0,-8 7,6 -7,6')
    el.setAttribute('fill', r([accent, accent, ...COLORS]))
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
        scale: r(1, 2),
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

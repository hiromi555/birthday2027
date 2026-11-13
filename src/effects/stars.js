import { gsap } from 'gsap'

const NS = 'http://www.w3.org/2000/svg'
const r = gsap.utils.random

// 星の形を作る（points＝とがりの数、outer＝外側の大きさ、inner＝くびれ）
function starPath(points, outer, inner) {
  let d = ''
  for (let i = 0; i < points * 2; i++) {
    const rad = i % 2 === 0 ? outer : inner
    const a = (Math.PI / points) * i - Math.PI / 2
    d += `${i === 0 ? 'M' : 'L'}${(Math.cos(a) * rad).toFixed(2)},${(Math.sin(a) * rad).toFixed(2)} `
  }
  return d + 'Z'
}
const STAR = starPath(5, 10, 4.2)     // ふつうの星 ☆
const SPARKLE = starPath(4, 10, 2.5)  // きらめき ✦

// SVGの部品を1つ作る
function make(parent, tag, attrs) {
  const el = document.createElementNS(NS, tag)
  for (const [key, value] of Object.entries(attrs)) el.setAttribute(key, value)
  parent.appendChild(el)
  return el
}

// キラキラ瞬く星＋ときどき流れ星
export function stars(svg, accent = '#fff') {
  const { width, height } = svg.getBoundingClientRect()

  // ① あちこちで星がキラッと瞬く
  for (let i = 0; i < 50; i++) {
    const g = make(svg, 'g', {})
    const star = make(g, 'path', {
      d: r([STAR, SPARKLE, SPARKLE]),
      fill: r(['#f1ead8', accent, '#ffd36e']),  // ときどき金色の星
    })

    // 毎回ちがう場所に出てくる
    const place = () => {
      g.setAttribute('transform',
        `translate(${r(width * 0.06, width * 0.94)}, ${r(height * 0.1, height * 0.9)})`)
    }
    place()
    const size = r(0.3, 0.8)

    gsap.timeline({ repeat: -1, repeatDelay: r(0.3, 1.5), delay: r(0, 2), onRepeat: place })
      // くるっと回りながら現れる
      .fromTo(star,
        { scale: 0, rotation: -90, svgOrigin: '0 0' },
        { scale: size, rotation: 0, duration: 0.5, ease: 'back.out(3)' }
      )
      // 少し光ってから、くるっと消える
      .to(star,
        { scale: 0, rotation: 90, duration: 0.6, ease: 'power2.in' },
        `+=${r(0.2, 0.8)}`
      )
  }

  // ② ときどき流れ星
  const shoot = make(svg, 'g', { opacity: 0 })
  make(shoot, 'line', {
    x1: 0, y1: 0, x2: 70, y2: -35,  // しっぽ（進む方向と逆向き）
    stroke: accent, 'stroke-width': 2, 'stroke-linecap': 'round', opacity: 0.6,
  })
  make(shoot, 'path', { d: STAR, fill: accent, transform: 'scale(0.9)' })

  gsap.timeline({ repeat: -1, repeatDelay: 2.5, delay: 1.5, repeatRefresh: true })
    .fromTo(shoot,
      {
        x: () => r(width * 0.6, width * 0.95),   // 右上のどこかから
        y: () => r(height * 0.05, height * 0.25),
        opacity: 0,
      },
      {
        x: `-=${width * 0.6}`,                   // 左下へ流れる
        y: `+=${width * 0.3}`,
        duration: 1.2,
        ease: 'power1.in',
      }
    )
    .to(shoot, { opacity: 1, duration: 0.2 }, 0)    // スッと現れて
    .to(shoot, { opacity: 0, duration: 0.3 }, 0.9)  // スッと消える
}

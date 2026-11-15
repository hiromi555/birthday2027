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

// 流れ星（ポップアート版）
export function shootingStars(svg) {
  const { width, height } = svg.getBoundingClientRect()

  // 黄色い星（黒フチ）に白い尾をつけて、右上から左下へ流れる
  const angle = 150                                  // 流れる向き（左下へ）
  const rad = (angle * Math.PI) / 180
  const dist = Math.max(width, height) * 1.1         // 流れる距離（画面の端近くまで）
  const STAR5 = 'M0,-12 L3.5,-4 L12,-3.5 L5.5,2.5 L7.5,11 L0,6.5 L-7.5,11 L-5.5,2.5 L-12,-3.5 L-3.5,-4Z'

  for (let i = 0; i < 4; i++) {
    const size = r(1.35, 1.8)          // 星の大きさ
    const g = make(svg, 'g', {})
    // 尾は星のうしろ（流れる向きと反対）にのびる
    const tail = make(g, 'g', { transform: `rotate(${angle + 180})` })
    const len = r(130, 210)
    make(tail, 'path', {
      d: `M0,-9 L${len},0 L0,9 Z`,
      fill: '#ffffff', stroke: INK, 'stroke-width': 3.5, 'stroke-linejoin': 'round',
    })
    const starG = make(g, 'g', { transform: `scale(${size})` })
    make(starG, 'path', {
      d: STAR5, fill: '#F7C21B', stroke: INK, 'stroke-width': 1.8, 'stroke-linejoin': 'round',
    })

    // 出てくる場所：画面の上のほう〜右のほう（毎回ちがう場所）
    let sx = 0, sy = 0
    const pick = () => {
      sx = r(width * 0.3, width * 1.1)
      sy = r(-height * 0.05, height * 0.45)
    }
    pick()
    gsap.set(g, { opacity: 0 })

    const time = r(1.4, 1.8)
    const tl = gsap.timeline({
      repeat: -1,
      repeatDelay: r(1, 3),
      delay: 0.4 + i * 0.8,              // 最初はすぐ1つ、あとは1つずつ
      onRepeat: () => { pick(); tl.invalidate() },  // 次は別の場所から
    })
    tl.fromTo(g,
        { x: () => sx, y: () => sy, opacity: 1 },
        {
          x: () => sx + Math.cos(rad) * dist,
          y: () => sy + Math.sin(rad) * dist,
          duration: time,
          ease: 'power1.in',
          immediateRender: false,   // 出番が来るまでは見せない
        })
      .fromTo(tail, { scaleX: 0, svgOrigin: '0 0' }, { scaleX: 1, duration: 0.3, ease: 'power2.out' }, 0)  // 尾がシュッとのびる
      .to(g, { opacity: 0, duration: 0.2 }, time - 0.2)  // 最後の最後にスッと消える
  }
}

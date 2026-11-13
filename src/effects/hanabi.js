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

// 星の形
function starPath(points, outer, inner) {
  let d = ''
  for (let i = 0; i < points * 2; i++) {
    const rad = i % 2 === 0 ? outer : inner
    const a = (Math.PI / points) * i - Math.PI / 2
    d += `${i === 0 ? 'M' : 'L'}${(Math.cos(a) * rad).toFixed(2)},${(Math.sin(a) * rad).toFixed(2)} `
  }
  return d + 'Z'
}
const STAR = starPath(5, 10, 4.2)

// カラフルな線の花火＋黒い星
export function hanabi(svg) {
  const { width, height } = svg.getBoundingClientRect()
  const cx = width / 2
  const cy = height / 2
  const colors = ['#ffc61a', '#2fa8e0', '#e8423f', '#ff8a1e', '#1549c2']

    // ① 文字のまわりから、クラッカーみたいにパンッと線が飛び出す
  const ix = Math.min(width * 0.38, 200)  // 文字をよける横の広さ
  const iy = 60                           // 文字をよける縦の広さ
  const count = 34
  const base = Math.min(width, height)

  const burstG = make(svg, 'g', {})  // 線をまとめるグループ（弾ませる用）
  const rays = []
  for (let i = 0; i < count; i++) {
    const a = ((Math.PI * 2) / count) * i + r(-0.06, 0.06)
    const sx = cx + Math.cos(a) * (ix + r(0, 20))
    const sy = cy + Math.sin(a) * (iy + r(0, 20))
    const len = r(base * 0.25, base * 0.6)  // 長めの線
    const ex = sx + Math.cos(a) * len
    const ey = sy + Math.sin(a) * len

    rays.push(make(burstG, 'path', {
      d: `M${sx},${sy} L${ex},${ey}`,  // まっすぐな線
      fill: 'none',
      stroke: r(colors),
      'stroke-width': r(4, 7),
      'stroke-linecap': 'round',
    }))
  }

    gsap.set(rays, { drawSVG: '0% 0%', opacity: 0 })  // 最初は隠しておく
  gsap.timeline({ repeat: -1, repeatDelay: 0.8, delay: 0.3 })
    // パンッ！の瞬間に見せる
    .set(rays, { opacity: 1 })
    // 一瞬で全部の線が飛び出す
    .to(rays, { drawSVG: '0% 100%', duration: 0.35, ease: 'expo.out' })
    // 同時に、全体がポンッと弾む
    .fromTo(burstG,
      { scale: 0.8, svgOrigin: `${cx} ${cy}` },
      { scale: 1, duration: 0.5, ease: 'back.out(4)' },
      0
    )
    // 少し止まってから、外へ抜けるように消える
    .to(rays, {
      drawSVG: '100% 100%',
      duration: 0.5,
      ease: 'power2.in',
      stagger: { each: 0.005, from: 'random' },
    }, '+=2')
    // 消え終わったら、残った点も隠す
    .set(rays, { opacity: 0 })

   // ② 流星群：黒い星にカラフルなしっぽの流れ星が、右上から左下へ次々と流れる
  const angle = (150 * Math.PI) / 180          // 流れる向き（150°＝右上から左下）
  const dir = { x: Math.cos(angle), y: Math.sin(angle) }
  const tailLen = 90                           // しっぽの長さ
  const travel = Math.max(width, height) * 1.1 // 流れる距離

  // しっぽの色ごとに「だんだん薄くなる」グラデーションを用意
  const defs = make(svg, 'defs', {})
  colors.forEach((c, i) => {
    const grad = make(defs, 'linearGradient', {
      id: `meteor-tail-${i}`,
      gradientUnits: 'userSpaceOnUse',
      x1: 0, y1: 0,
      x2: -dir.x * tailLen, y2: -dir.y * tailLen,
    })
    make(grad, 'stop', { offset: '0%', 'stop-color': c, 'stop-opacity': 1 })
    make(grad, 'stop', { offset: '100%', 'stop-color': c, 'stop-opacity': 0 })
  })

  for (let i = 0; i < 8; i++) {
    const meteor = make(svg, 'g', { opacity: 0 })
     // しっぽ（星の少し後ろから、進む向きと逆に伸びる）
     const gap = 7  // 星としっぽのすき間
    make(meteor, 'line', {
      x1: -dir.x * gap, y1: -dir.y * gap,
      x2: -dir.x * tailLen, y2: -dir.y * tailLen,
      stroke: `url(#meteor-tail-${i % colors.length})`,
      'stroke-width': 4,
      'stroke-linecap': 'round',
    })
    // 頭の黒い星
    const head = make(meteor, 'path', { d: STAR, fill: '#222222' })
    gsap.set(head, { scale: r(0.8, 1.5), svgOrigin: '0 0' })

    gsap.timeline({ repeat: -1, repeatRefresh: true, repeatDelay: r(0.3, 1.5), delay: r(0, 3) })
      // 右上のどこかから、左下へ流れる
      .fromTo(meteor,
        { x: () => r(width * 0.3, width * 1.1), y: () => r(-height * 0.3, height * 0.4) },
        {
          x: `+=${dir.x * travel}`,
          y: `+=${dir.y * travel}`,
          duration: () => r(2, 4),
          ease: 'power1.in',
        }
      )
      .fromTo(meteor, { opacity: 0 }, { opacity: 1, duration: 0.15 }, 0)  // スッと現れて
      .to(meteor, { opacity: 0, duration: 0.3 }, '-=0.3')                 // スッと消える
  }
}

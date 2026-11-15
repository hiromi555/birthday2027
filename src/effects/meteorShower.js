import { gsap } from 'gsap'

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

// 漫画の集中線でパンッ！→ すぐに流星群
export function meteorShower(svg) {
  const { width, height } = svg.getBoundingClientRect()
  const cx = width / 2
  const cy = height / 2
  const colors = ['#f4e9e8', '#3D83F6','#F2AEEF']

  // ① 漫画の集中線：まわりから文字に向かって、尖った線が集まる
  const LINE_COLOR = '#F2AEEF'  // 集中線の色
  const ix = Math.min(width * 0.38, 200)  // 文字をよける横の広さ
  const iy = 60                           // 文字をよける縦の広さ
  const far = Math.hypot(width, height)   // 画面の外まで届く長さ
  const count = 100                        // 集中線の本数

  const focusG = make(svg, 'g', { opacity: 0 })
  for (let i = 0; i < count; i++) {
    const a = r(0, Math.PI * 2)      // 角度はバラバラに（漫画っぽく）
    const spread = r(0.006, 0.020)   // 線の太さ（外側の幅）
    const reach = r(0, 70)           // 尖った先がどこまで文字に近づくか（バラバラに）

    // 尖った先（文字のまわり）
    const tx = cx + Math.cos(a) * (ix + reach)
    const ty = cy + Math.sin(a) * (iy + reach)
    // 外側の太い根元（画面の外）
    const x1 = cx + Math.cos(a - spread) * far
    const y1 = cy + Math.sin(a - spread) * far
    const x2 = cx + Math.cos(a + spread) * far
    const y2 = cy + Math.sin(a + spread) * far

    make(focusG, 'polygon', {
      points: `${tx},${ty} ${x1},${y1} ${x2},${y2}`,
      fill: LINE_COLOR,
    })
  }

  const BURST_END = 1.0  // 集中線が消え終わる時間（この直後から流れ星）
  gsap.timeline({ delay: 0.3 })
    // パンッ！と一瞬で現れて、少し寄るように締まる
    .set(focusG, { opacity: 1 })
    .fromTo(focusG,
      { scale: 1.15, svgOrigin: `${cx} ${cy}` },
      { scale: 1, duration: 0.25, ease: 'expo.out' }
    )
    // ちょっとだけ止まって、スッと消える
    .to(focusG, { opacity: 0, duration: 0.25, ease: 'power2.in' }, '+=0.9')

  // ② 流星群：集中線が消えたらすぐ、流れ星がたくさん流れてくる
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

  for (let i = 0; i < 14; i++) {
    const meteor = make(svg, 'g', { opacity: 0 })
    // しっぽ（星の少し後ろから、進む向きと逆に伸びる）
    const gap = 12
    make(meteor, 'line', {
      x1: -dir.x * gap, y1: -dir.y * gap,
      x2: -dir.x * tailLen, y2: -dir.y * tailLen,
      stroke: `url(#meteor-tail-${i % colors.length})`,
      'stroke-width': 3,
      'stroke-linecap': 'round',
    })
    // 頭の星
    const head = make(meteor, 'path', { d: STAR, fill: '#FDF851' })
    gsap.set(head, { scale: r(0.8, 1.6), svgOrigin: '0 0' })

    gsap.timeline({
      repeat: -1,
      repeatRefresh: true,
      repeatDelay: r(0.3, 1.5),
      delay: 0.3 + BURST_END + r(0, 1),  // 集中線が消えたら、すぐに次々と
    })
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

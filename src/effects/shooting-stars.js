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

// プレゼント箱を1つ描く（下のまん中が 0,0、幅 w）
// ふたは別のグループにして、跳ねたときに少し浮くように
function present(parent, w, box, ribbon) {
  const h = w * 0.72
  const g = make(parent, 'g', {})
  const line = { stroke: INK, 'stroke-width': 4, 'stroke-linejoin': 'round' }
  // 箱
  make(g, 'rect', { x: -w / 2, y: -h, width: w, height: h, fill: box, ...line })
  make(g, 'rect', { x: w * 0.22, y: -h + 2, width: w * 0.26, height: h - 4, fill: 'url(#giftDots)' })  // 右側の影（ドット）
  make(g, 'rect', { x: -w * 0.09, y: -h, width: w * 0.18, height: h, fill: ribbon, ...line, 'stroke-width': 3 })
  // ふた＋リボン結び
  const lid = make(g, 'g', {})
  const lh = w * 0.2
  make(lid, 'rect', { x: -w / 2 - w * 0.07, y: -h - lh, width: w * 1.14, height: lh, fill: box, ...line })
  make(lid, 'rect', { x: -w * 0.09, y: -h - lh, width: w * 0.18, height: lh, fill: ribbon, ...line, 'stroke-width': 3 })
  const top = -h - lh
  const b = w * 0.32
  make(lid, 'path', { d: `M0,${top} C${-b * 0.6},${top - b} ${-b * 1.3},${top - b * 0.3} 0,${top}Z`, fill: ribbon, ...line, 'stroke-width': 3 })
  make(lid, 'path', { d: `M0,${top} C${b * 0.6},${top - b} ${b * 1.3},${top - b * 0.3} 0,${top}Z`, fill: ribbon, ...line, 'stroke-width': 3 })
  make(lid, 'circle', { cy: top, r: w * 0.06, fill: ribbon, ...line, 'stroke-width': 3 })
  return { g, lid }
}

// 流れ星（ポップアート版）＋下にプレゼント
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
      .fromTo(tail, { scaleX: 0, transformOrigin: '0px 50%' }, { scaleX: 1, duration: 0.3, ease: 'power2.out' }, 0)  // 尾がシュッとのびる
      .to(g, { opacity: 0, duration: 0.2 }, time - 0.2)  // 最後の最後にスッと消える
  }

  // 画面の下に、プレゼントが3つ（流れ星より手前に置く）
  const defs = make(svg, 'defs', {})
  const pat = make(defs, 'pattern', { id: 'giftDots', width: 6, height: 6, patternUnits: 'userSpaceOnUse' })
  make(pat, 'circle', { cx: 3, cy: 3, r: 1.5, fill: INK, opacity: 0.3 })

  const base = Math.min(width, height, 560)       // 大きい画面でも大きくなりすぎないように
  const bottom = height - 110                     // ボタンの少し上
  const gifts = [
    { dx: -1.15, w: 0.17, box: '#E63B2E', ribbon: '#F7C21B' },
    { dx: 0,     w: 0.22, box: '#F7C21B', ribbon: '#E63B2E' },
    { dx: 1.1,   w: 0.15, box: '#ffffff', ribbon: '#2CA5D9' },
  ]
  gifts.forEach((p, i) => {
    const w = base * p.w
    const pos = make(svg, 'g', {
      transform: `translate(${(width / 2 + p.dx * base * 0.22).toFixed(1)}, ${bottom.toFixed(1)})`,
    })
    const { g, lid } = present(pos, w, p.box, p.ribbon)

    // 下からポンッと順番に出てくる
    gsap.from(g, { y: 220, duration: 0.6, ease: 'back.out(1.6)', delay: 0.3 + i * 0.15 })

    // ときどきピョコッと跳ねる（ふたは少し遅れて、少し高く）
    gsap.timeline({ repeat: -1, repeatDelay: r(2.5, 4.5), delay: 2 + i * 1.3 })
      .to(g, { scaleY: 0.88, scaleX: 1.06, transformOrigin: '50% 100%', duration: 0.12, ease: 'power1.out' })
      .to(g, { y: -w * 0.18, scaleY: 1.06, scaleX: 0.96, duration: 0.18, ease: 'power2.out' })
      .to(lid, { y: -w * 0.12, duration: 0.18, ease: 'power2.out' }, '<0.04')
      .to(g, { y: 0, scaleY: 1, scaleX: 1, duration: 0.22, ease: 'bounce.out' })
      .to(lid, { y: 0, duration: 0.25, ease: 'bounce.out' }, '<0.04')
  })
}

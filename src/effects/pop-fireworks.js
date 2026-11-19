import { gsap } from 'gsap'

const NS = 'http://www.w3.org/2000/svg'
const r = gsap.utils.random
const INK = '#111111'
const COLORS = ['#E63B2E', '#F7C21B', '#ffffff', '#2CA5D9']

// SVGの部品を1つ作る
function make(parent, tag, attrs) {
  const el = document.createElementNS(NS, tag)
  for (const [key, value] of Object.entries(attrs)) el.setAttribute(key, value)
  parent.appendChild(el)
  return el
}

// 線をフチ取りで描く（下に太い黒、上に色）
function inkLine(parent, x1, y1, x2, y2, color, w) {
  const common = { x1, y1, x2, y2, 'stroke-linecap': 'round', 'vector-effect': 'non-scaling-stroke' }
  make(parent, 'line', { ...common, stroke: INK, 'stroke-width': w + 5 })
  make(parent, 'line', { ...common, stroke: color, 'stroke-width': w })
}

// 漫画の打ち上げ花火：白い玉がヒューッと上がって、黒フチの光の線がパーン！
export function popFireworks(svg) {
  const { width, height } = svg.getBoundingClientRect()
  const cx = width / 2
  const cy = height / 2
  const base = Math.min(width, height)

  // 花火の場所：文字の上にアーチ状に並べる＋下に小さいのを2つ（book-version と同じ並べ方）
  // s は場所ごとの大きさの倍率
  const arch = width < 600 ? 5 : 7   // スマホは5つ、PCは7つ
  const spots = []
  for (let k = 0; k < arch; k++) {
    const a = ((205 + (130 / (arch - 1)) * k) * Math.PI) / 180
    spots.push({
      x: cx + Math.cos(a) * width * 0.36,
      y: cy - height * 0.05 + Math.sin(a) * height * 0.3,
      s: k % 2 === 0 ? 1.1 : 0.9,
    })
  }
  spots.push({ x: width * 0.22, y: height * 0.8, s: 0.7 })
  spots.push({ x: width * 0.78, y: height * 0.82, s: 0.7 })

  // 使っていない場所から、ランダムに1つ選ぶ（同じ場所で2つ同時に上がらないように）
  const busySpots = new Set()
  const take = (prev) => {
    if (prev) busySpots.delete(prev)
    const next = r(spots.filter((p) => !busySpots.has(p) && p !== prev))
    busySpots.add(next)
    return next
  }

  for (let i = 0; i < 5; i++) {
    const size = base * 0.15                     // 花火の大きさ（場所ごとに s 倍）
    const color = COLORS[i % COLORS.length]
    const color2 = r(COLORS.filter((c) => c !== color))

    // 打ち上げの玉
    const ball = make(svg, 'circle', { r: 6, fill: '#ffffff', stroke: INK, 'stroke-width': 3 })

    // 花火の本体（光の線が放射状に）
    const fw = make(svg, 'g', {})
    const rays = make(fw, 'g', {})
    const n = 14
    for (let k = 0; k < n; k++) {
      const a = (Math.PI * 2 * k) / n
      const c = k % 2 === 0 ? color : color2
      inkLine(rays, Math.cos(a) * size * 0.3, Math.sin(a) * size * 0.3,
        Math.cos(a) * size, Math.sin(a) * size, c, 5)
      // 線の先の丸い粒
      make(rays, 'circle', {
        cx: Math.cos(a) * size * 1.18, cy: Math.sin(a) * size * 1.18, r: 5,
        fill: c, stroke: INK, 'stroke-width': 3,
      })
    }
    const core = make(fw, 'circle', { r: size * 0.16, fill: color2, stroke: INK, 'stroke-width': 4 })

    // 上がる場所（毎回、空いている場所からランダムに）
    let spot = null, x = 0, y = 0, sc = 1
    const pick = () => {
      spot = take(spot)
      x = spot.x
      y = spot.y
      sc = spot.s
    }
    pick()
    gsap.set([ball, fw], { opacity: 0 })

    const tl = gsap.timeline({
      repeat: -1,
      repeatDelay: r(0.4, 1.4),
      delay: 0.5 + i * 0.55,
      onRepeat: () => { pick(); tl.invalidate() },  // 次は別の場所で
    })
    tl
      // ① 玉がヒューッと上がる
      .fromTo(ball,
        { attr: { cx: () => x, cy: () => height + 20 }, opacity: 1 },
        { attr: { cy: () => y }, duration: 0.7, ease: 'power2.out', immediateRender: false })
      .set(ball, { opacity: 0 })
      // ② パーン！と広がる
      .set(fw, { x: () => x, y: () => y, scale: () => sc, opacity: 1 })
      // （中心を基準に広げる。svgOrigin だとくり返すたびに位置がずれるので transformOrigin）
      .fromTo(rays, { scale: 0.1, rotation: 0, transformOrigin: '50% 50%' },
        { scale: 1, rotation: 12, duration: 0.6, ease: 'power3.out', immediateRender: false })
      .fromTo(core, { scale: 0, transformOrigin: '50% 50%' },
        { scale: 1, duration: 0.3, ease: 'back.out(3)', immediateRender: false }, '<')
      // ③ 中心がしぼんで、全体がスッと消える
      .to(core, { scale: 0, duration: 0.3, ease: 'power2.in' }, '+=0.15')
      .to(fw, { opacity: 0, duration: 0.4 }, '<')
  }
}

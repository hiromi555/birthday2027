import { gsap } from 'gsap'

const NS = 'http://www.w3.org/2000/svg'
const r = gsap.utils.random
const DARK = '#111111'  // 塗りつぶしの顔の、目と口の色

// SVGの部品を1つ作る
function make(parent, tag, attrs) {
  const el = document.createElementNS(NS, tag)
  for (const [key, value] of Object.entries(attrs)) el.setAttribute(key, value)
  parent.appendChild(el)
  return el
}

// ニコちゃんの顔を描く（描くたびに中身を作り直す）
// type：'smile'（にっこり）/ 'wink'（ウインク）/ 'laugh'（わはは）
function drawSmiley(face, color, filled, type) {
  face.innerHTML = ''
  const ink = filled ? DARK : color

  // 顔の丸
  make(face, 'circle', {
    cx: 0, cy: 0, r: 20,
    fill: filled ? color : 'none',
    stroke: color, 'stroke-width': 3,
  })

  // 目
  const openEye = (x) => make(face, 'ellipse', { cx: x, cy: -5, rx: 2.2, ry: 4, fill: ink })
  const closedEye = (x) => make(face, 'path', {
    d: `M${x - 3.5},-4 Q${x},-9 ${x + 3.5},-4`,  // 「＾」の形
    fill: 'none', stroke: ink, 'stroke-width': 2.5, 'stroke-linecap': 'round',
  })

  if (type === 'smile') { openEye(-7); openEye(7) }
  if (type === 'wink') { openEye(-7); closedEye(7) }
  if (type === 'laugh') { closedEye(-7); closedEye(7) }

  // 口
  if (type === 'laugh') {
    // 大きく開けた口
    make(face, 'path', {
      d: 'M-11,3 Q0,18 11,3 Z',
      fill: ink, stroke: ink, 'stroke-width': 2, 'stroke-linejoin': 'round',
    })
  } else {
    make(face, 'path', {
      d: 'M-11,3 Q0,16 11,3',
      fill: 'none', stroke: ink, 'stroke-width': 3, 'stroke-linecap': 'round',
    })
  }
}

// ✱ のお花（6本の線）
function asterisk(parent, color) {
  return make(parent, 'path', {
    d: 'M-9,0 L9,0 M-4.5,-7.8 L4.5,7.8 M-4.5,7.8 L4.5,-7.8',
    stroke: color, 'stroke-width': 4.5, 'stroke-linecap': 'round', fill: 'none',
  })
}

// 文字をよけて、画面の上か下のどこかに置く
function placeAround(el, width, height) {
  const y = Math.random() < 0.5
    ? r(height * 0.08, height * 0.36)
    : r(height * 0.64, height * 0.92)
  el.setAttribute('transform', `translate(${r(width * 0.1, width * 0.9)}, ${y})`)
}

// ポップなニコちゃん＋✱のお花＋Smile の文字
export function smile(svg, accent = '#c8f03c') {
  const { width, height } = svg.getBoundingClientRect()
  const colors = [accent, '#ff2d4f', '#ffffff', '#ffd400']
  const types = ['smile', 'wink', 'laugh']

  // ニコちゃんの「席」：文字をよけて、上と下に並べる（スマホは2列、PCは3列）
  const cols = width < 600 ? [0.27, 0.73] : [0.2, 0.5, 0.8]
  const rows = [0.2, 0.8]
  const seats = []
  rows.forEach((ry) => cols.forEach((cxr) => seats.push({ x: width * cxr, y: height * ry })))

  const taken = new Set()  // 今だれかが座っている席
  // 空いている席から1つ選ぶ（さっきと同じ席は避ける）
  function takeSeat(prev) {
    if (prev !== null) taken.delete(prev)
    let free = seats.map((_, i) => i).filter((i) => !taken.has(i) && i !== prev)
    if (free.length === 0) free = [prev]
    const seat = r(free)
    taken.add(seat)
    return seat
  }

  // ① ニコちゃんが、空いている席にポンッと現れて、首をかしげて、消える
  for (let i = 0; i < 3; i++) {
    const pos = make(svg, 'g', {})
    const face = make(pos, 'g', {})
    let seat = null

    // 新しい席と、新しい顔に入れかえる
    const refresh = () => {
      seat = takeSeat(seat)
      const s = seats[seat]
      const jx = r(-width * 0.04, width * 0.04)  // 席の中で少しだけずらす
      const jy = r(-height * 0.04, height * 0.04)
      pos.setAttribute('transform', `translate(${s.x + jx}, ${s.y + jy})`)
      drawSmiley(face, r(colors), Math.random() < 0.5, r(types))
    }
    refresh()

    const size = r(2, 3)
    const tilt = r(-5, 5)

    gsap.timeline({ repeat: -1, repeatDelay: r(0.2, 1), delay: r(0, 2.5), onRepeat: refresh })
      // くるっと回りながら、ポンッと現れる
      .fromTo(face,
        { scale: 0, rotation: tilt - 180, svgOrigin: '0 0' },
        { scale: size, rotation: tilt, duration: 0.6, ease: 'back.out(2.5)' }
      )
      // 首をかしげるように揺れる
      .to(face, { rotation: tilt + 10, duration: 0.35, ease: 'sine.inOut', repeat: 3, yoyo: true })
      // ポンッと消える
      .to(face, { scale: 0, duration: 0.35, ease: 'back.in(2.5)' })
  }

  // ② ✱ のお花が、くるくる回りながら瞬く
  for (let i = 0; i < 10; i++) {
    const pos = make(svg, 'g', {})
    const star = asterisk(pos, r(colors))
    const place = () => placeAround(pos, width, height)
    place()

    gsap.timeline({ repeat: -1, repeatDelay: r(0.2, 1.2), delay: r(0, 3), onRepeat: place })
      .fromTo(star,
        { scale: 0, rotation: 0, svgOrigin: '0 0' },
        { scale: r(0.8, 1.5), rotation: 180, duration: 0.5, ease: 'back.out(3)' }
      )
      .to(star, { rotation: 360, duration: 1, ease: 'none' })
      .to(star, { scale: 0, rotation: 450, duration: 0.4, ease: 'power2.in' })
  }

  // ③ ときどき「Smile」の文字がポンッと出てくる
  for (let i = 0; i < 3; i++) {
    const pos = make(svg, 'g', {})
    const word = make(pos, 'text', {
      x: 0, y: 0,
      'text-anchor': 'middle',
      'dominant-baseline': 'middle',
      'font-family': 'Georgia, serif',
      'font-weight': 'bold',
      'font-size': 30,
      fill: colors[i % colors.length],
    })
    word.textContent = 'Smile'
    const place = () => placeAround(pos, width, height)
    place()
    const tilt = r(-40, 40)

    gsap.timeline({ repeat: -1, repeatDelay: r(1, 2.5), delay: 1 + i * 1.5, onRepeat: place })
      .fromTo(word,
        { scale: 0, rotation: tilt, svgOrigin: '0 0' },
        { scale: 1, duration: 0.5, ease: 'back.out(3)' }
      )
      .to(word, { scale: 0, duration: 0.3, ease: 'back.in(2)' }, '+=1.5')
  }
}

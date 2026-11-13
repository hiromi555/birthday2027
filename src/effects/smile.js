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

// ニコちゃんを1つ作る（filled＝塗りつぶし、false なら線だけ）
function smiley(parent, color, filled) {
  const face = make(parent, 'g', {})
  const ink = filled ? DARK : color
  make(face, 'circle', {
    cx: 0, cy: 0, r: 20,
    fill: filled ? color : 'none',
    stroke: color, 'stroke-width': 3,
  })
  make(face, 'ellipse', { cx: -7, cy: -5, rx: 2.2, ry: 4, fill: ink })  // 目
  make(face, 'ellipse', { cx: 7, cy: -5, rx: 2.2, ry: 4, fill: ink })   // 目
  make(face, 'path', {                                                  // 口
    d: 'M-11,3 Q0,16 11,3',
    fill: 'none', stroke: ink, 'stroke-width': 3, 'stroke-linecap': 'round',
  })
  return face
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

  // ① ニコちゃんが、あちこちでポンッと現れて、首をかしげて、消える
  for (let i = 0; i < 5; i++) {
    const pos = make(svg, 'g', {})
    const face = smiley(pos, r(colors), Math.random() < 0.5)
    const place = () => placeAround(pos, width, height)
    place()
    const size = r(1.5, 3.5)
    const tilt = r(-35, 35)  // ちょっと傾けて、ポップな感じに

    gsap.timeline({ repeat: -1, repeatDelay: r(0.2, 1), delay: r(0, 2.5), onRepeat: place })
      // くるっと回りながら、ポンッと現れる
      .fromTo(face,
        { scale: 0, rotation: tilt - 180, svgOrigin: '0 0' },
        { scale: size, rotation: tilt, duration: 0.6, ease: 'back.out(2.5)' }
      )
      // 首をかしげるように揺れる
      .to(face, { rotation: tilt + 15, duration: 0.35, ease: 'sine.inOut', repeat: 3, yoyo: true })
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
      'font-size': 26,
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

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

// 花びら1枚の形（真ん中が 0,0）
const PETAL = 'M0,-7 C5,-7 6,2 0,8 C-6,2 -5,-7 0,-7Z'

// 笑顔の花を1つ作る
function smileFlower(parent, petalColor) {
  const flower = make(parent, 'g', {})
  // 花びら5枚
  for (let i = 0; i < 5; i++) {
    make(flower, 'ellipse', {
      cx: 0, cy: -14, rx: 7, ry: 11,
      fill: petalColor,
      transform: `rotate(${i * 72})`,
    })
  }
  // まんなかの顔
  make(flower, 'circle', { cx: 0, cy: 0, r: 10, fill: '#fff3b0' })
  make(flower, 'circle', { cx: -3.5, cy: -2, r: 1.4, fill: '#5a4a3a' })  // 目
  make(flower, 'circle', { cx: 3.5, cy: -2, r: 1.4, fill: '#5a4a3a' })   // 目
  make(flower, 'path', {                                                  // にっこり口
    d: 'M-4.5,2 Q0,7 4.5,2',
    fill: 'none', stroke: '#5a4a3a', 'stroke-width': 1.5, 'stroke-linecap': 'round',
  })
  make(flower, 'circle', { cx: -6.5, cy: 2.5, r: 1.8, fill: '#f4a6c1', opacity: 0.7 })  // ほっぺ
  make(flower, 'circle', { cx: 6.5, cy: 2.5, r: 1.8, fill: '#f4a6c1', opacity: 0.7 })   // ほっぺ
  return flower
}

// 笑顔の花が咲く＋花びらが舞う
export function petals(svg, accent = '#8a63c4') {
  const { width, height } = svg.getBoundingClientRect()
  const colors = [accent, '#f4a6c1', '#ffd36e', '#9ad0c2']

  // ① 笑顔の花が、あちこちでポンッと咲いては、しぼむ
  for (let i = 0; i < 8; i++) {
    const pos = make(svg, 'g', {})
    const flower = smileFlower(pos, r(colors))

    // 文字をよけて、画面の上か下のどこかに置く
    const place = () => {
      const y = Math.random() < 0.5
        ? r(height * 0.1, height * 0.36)
        : r(height * 0.64, height * 0.9)
      pos.setAttribute('transform', `translate(${r(width * 0.1, width * 0.9)}, ${y})`)
    }
    place()
    const size = r(0.8, 1.6)

    gsap.timeline({ repeat: -1, repeatDelay: r(0.3, 1.2), delay: r(0, 3), onRepeat: place })
      // くるっと回りながら、ポンッと咲く
      .fromTo(flower,
        { scale: 0, rotation: -120, svgOrigin: '0 0' },
        { scale: size, rotation: 0, duration: 0.7, ease: 'back.out(2)' }
      )
      // ゆらゆら揺れる
      .to(flower, { rotation: 10, duration: 0.5, ease: 'sine.inOut', repeat: 3, yoyo: true })
      // しぼんで消える
      .to(flower, { scale: 0, rotation: 60, duration: 0.5, ease: 'back.in(2)' })
  }

  // ② 花びらが、上からひらひら舞い落ちる
  for (let i = 0; i < 14; i++) {
    const fall = make(svg, 'g', {})   // 落ちる係
    const sway = make(fall, 'g', {})  // 左右にゆれる係
    const petal = make(sway, 'path', { d: PETAL, fill: r(colors), opacity: 0.85 })
    gsap.set(petal, { scale: r(0.8, 1.5), svgOrigin: '0 0' })

    // 上から下へ落ちる（毎回ちがう場所から）
    gsap.timeline({ repeat: -1, repeatRefresh: true, delay: r(0, 5) })
      .fromTo(fall,
        { x: () => r(0, width), y: -20 },
        { x: () => `+=${r(-60, 60)}`, y: height + 20, duration: () => r(5, 8), ease: 'none' }
      )
    // 左右にゆれる
    gsap.to(sway, { x: 25, duration: r(1, 1.6), repeat: -1, yoyo: true, ease: 'sine.inOut' })
    // くるくる回る
    gsap.to(petal, { rotation: 360, svgOrigin: '0 0', duration: r(3, 6), repeat: -1, ease: 'none' })
  }
}

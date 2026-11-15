import { gsap } from 'gsap'
import { SplitText } from 'gsap/SplitText'

gsap.registerPlugin(SplitText)

// ページごとの「文字の動き」
// pages.js の textFx に名前を書くと、そのページで使われる
export const textFx = {
  // 1文字ずつポンポン飛び出して、そろったら止まる
  pop(el) {
    const { chars } = SplitText.create(el, { type: 'chars', charsClass: 'char' })
    gsap.from(chars, {
      scale: 0,
      y: -40,
      rotation: () => gsap.utils.random(-50, 50),
      duration: 0.5,
      ease: 'back.out(3)',
      stagger: 0.07,
      delay: 0.15,
    })
  },

  // 1文字ずつ上から落ちてきて、ボヨンボヨンと弾んで止まる
  drop(el) {
    const { chars } = SplitText.create(el, { type: 'chars', charsClass: 'char' })
    gsap.from(chars, {
      y: () => -innerHeight * 0.6,
      opacity: 0,
      duration: 1,
      ease: 'bounce.out',
      stagger: 0.15,
      delay: 0.15,
    })
  },

  // 「バーン！」：0からはじけるように出て、ガタガタッと揺れて、少し傾いて止まる
  // （エフェクトの bang と同じタイミング）
  bang(el) {
    gsap.timeline({ delay: 0.35 })
      .fromTo(el,
        { scale: 0, rotation: -20 },
        { scale: 1, rotation: -4, duration: 0.9, ease: 'elastic.out(1, 0.4)' })
      .to(el, {
        keyframes: [{ x: -10, y: 6 }, { x: 8, y: -5 }, { x: -5, y: 3 }, { x: 0, y: 0 }],
        duration: 0.3, ease: 'none',
      }, 0.05)
  },
}

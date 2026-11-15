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
}

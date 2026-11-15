// ページで使うエフェクトの一覧（pages.js の effect にこの名前を書く）
import { confetti } from './confetti.js'          // Happy Birthday：紙吹雪
import { shootingStars } from './shooting-stars.js' // お誕生日：流れ星＋プレゼント
import { bang } from './bang.js'                  // おめでとう：漫画のバーン！
import { spaceAge } from './space-age.js'         // 新しい１年も：レトロな宇宙
import { smileys } from './smileys.js'            // 笑顔いっぱいで：スマイルマーク
import { popFireworks } from './pop-fireworks.js' // Have a great year!：漫画の花火

export const effects = {
  confetti,
  shootingStars,
  bang,
  spaceAge,
  smileys,
  popFireworks,
}

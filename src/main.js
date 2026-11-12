import './style.css'
import { gsap } from 'gsap'
import { pages } from './pages.js'
import { effects } from './effects/index.js'

const $ = (id) => document.getElementById(id)
const pageEl = $('page'), counterEl = $('counter'), controls = $('controls')
const prevBtn = $('prev'), nextBtn = $('next')
const bookWrap = $('bookWrap'), book = $('book')
const leftEl = $('left'), rightEl = $('right')
const sheet = $('sheet'), frontEl = $('front'), backEl = $('back')
const rightText = $('rightText'), frontText = $('frontText')
const fxEl = $('fx')

const COVER = '#e06c8c'     // 表紙の色
const START_BG = '#f6f1e7'  // 本が見えているときの背景色

// 本の置き方（カメラの代わり）
const TILT = 50
const REST   = `translate(-50%, -50%) rotateX(${TILT}deg) scale(1)`  // 開いた本
const CLOSED = `translate(-75%, -50%) rotateX(${TILT}deg) scale(1)`  // 閉じた本

// 真上から見た大きな表紙（画面の大きさに合わせて計算）
function coverView() {
  const coverW = book.offsetWidth / 2
  const coverH = book.offsetHeight
  const s = Math.min((innerWidth * 0.9) / coverW, (innerHeight * 0.85) / coverH)
  const shift = ((s - 1) * coverW) / 2  // 表紙の真ん中を画面の真ん中に
  return `translate(calc(-75% - ${shift}px), -50%) rotateX(0deg) scale(${s})`
}

// 右のページの真ん中にズームアップ
function zoomView() {
  const s = 2.5  // どれだけ寄るか
  const shift = (s * book.offsetWidth) / 4
  return `translate(calc(-50% - ${shift}px), -50%) rotateX(0deg) scale(${s})`
}

const light = (c) => `color-mix(in srgb, ${c} 65%, white)`
const sleep = (ms) => new Promise((r) => setTimeout(r, ms))
const last = pages.length - 1

let current = 0
let busy = false
let state = 'closed'  // closed（閉じてる） / open（開いてる）

// ろうそくの炎をゆらゆら
gsap.to('.flame', {
  scaleY: 0.8,
  scaleX: 1.1,
  transformOrigin: '50% 100%',
  duration: 0.2,
  repeat: -1,
  yoyo: true,
  ease: 'sine.inOut',
  stagger: { each: 0.07, from: 'random' },
})

// エフェクトを片付ける
let fxCtx = null
function clearFx() {
  if (fxCtx) fxCtx.kill()  // このページで始めた動きを全部止める
  fxCtx = null
  fxEl.innerHTML = ''
}
// 文字・背景・ボタンを表示
function render() {
  const { text, color } = pages[current]
  pageEl.innerHTML = ''
  const p = document.createElement('p')
  p.className = 'text'
  p.textContent = text
  pageEl.appendChild(p)
  pageEl.classList.remove('show')
  void pageEl.offsetWidth
  pageEl.classList.add('show')

  // 前のエフェクトを片付けて、このページのエフェクトを再生
  clearFx()
  const play = effects[pages[current].effect]
  if (play) fxCtx = gsap.context(() => play(fxEl, pages[current].accent))

  document.body.style.backgroundColor = color
  document.body.style.setProperty('--ink', pages[current].ink || '#333')
  counterEl.textContent = `${current + 1} / ${pages.length}`
  prevBtn.disabled = current === 0

  const isLast = current === last
  nextBtn.textContent = isLast ? 'とじる' : '›'
  nextBtn.setAttribute('aria-label', isLast ? '本をとじる' : '次のページ')
  nextBtn.classList.toggle('close', isLast)
}

// めくる紙を、めくり始めの位置に置いておく
function prepareSheet(forward) {
  sheet.style.transform = `translateZ(1px) rotateY(${forward ? 0 : -180}deg)`
  sheet.classList.add('flipping')
}

// 紙を1枚めくる（めくり終わったら、右のページを endText にする）
async function flipSheet(forward, duration, endColor, endText) {
  const angles = forward ? [0, -180] : [-180, 0]
  const anim = sheet.animate(
    angles.map((a) => ({ transform: `translateZ(1px) rotateY(${a}deg)` })),
    { duration, easing: 'ease-in-out', fill: 'forwards' }
  )
  await anim.finished
  leftEl.style.background = light(endColor)
  rightEl.style.background = light(endColor)
  leftEl.style.visibility = 'visible'
  rightText.textContent = endText
  sheet.classList.remove('flipping')
  anim.cancel()
}

// 本を動かす（終わったらその位置で止める）
async function moveBook(from, to, duration) {
  const anim = book.animate(
    [{ transform: from }, { transform: to }],
    { duration, easing: 'ease-in-out', fill: 'forwards' }
  )
  await anim.finished
  book.style.transform = to
  anim.cancel()
}

// ズームアップしながら本を消して、文字を出す
async function zoomAndShow() {
  const zoom = book.animate(
    [{ transform: zoomView() }],
    { duration: 900, easing: 'ease-in', fill: 'forwards' }
  )
  await sleep(350)
  bookWrap.classList.remove('visible')
  render()
  await zoom.finished
}

// ズームアウト（ページの中から本へ引いていく）
async function zoomOut() {
  const from = zoomView()
  book.style.transform = from
  bookWrap.classList.add('visible')
  const out = book.animate(
    [{ transform: from }, { transform: REST }],
    { duration: 900, easing: 'ease-out', fill: 'forwards' }
  )
  await out.finished
  book.style.transform = REST
  out.cancel()
}

// 本を元の置き方に戻す（見えていない間に）
function resetBook() {
  book.getAnimations().forEach((a) => a.cancel())
  book.style.transform = REST
}

// 最初の画面：真上から見た大きな表紙
function showCover() {
  document.body.style.backgroundColor = START_BG
  leftEl.style.visibility = 'hidden'
  frontEl.style.background = COVER
  sheet.classList.add('is-cover')
  prepareSheet(true)
  book.style.transform = coverView()
  bookWrap.classList.add('visible', 'closed')
}

// タップで本を開く
async function openBook() {
  if (busy || state !== 'closed') return
  busy = true
  bookWrap.classList.remove('closed')
  current = 0
  const first = pages[0].color
  rightEl.style.background = light(first)
  backEl.style.background = light(first)
  rightText.textContent = pages[0].text

  // ① 表紙から引いて、斜めから見た閉じた本に
  await moveBook(coverView(), CLOSED, 900)

  // ② 表紙を開きながら、本を見開きの位置へ
  book.animate(
    [{ transform: CLOSED }, { transform: REST }],
    { duration: 1200, easing: 'ease-in-out', fill: 'forwards' }
  )
  const flip = flipSheet(true, 1200, first, pages[0].text)

  // ③ 開き終わる少し前からズームアップ
  await sleep(800)
  await zoomAndShow()
  controls.classList.add('visible')
  await flip
  resetBook()
  state = 'open'
  busy = false
}

// 最後のページで本を閉じる
async function closeBook() {
  if (busy || state !== 'open') return
  busy = true
  const color = pages[current].color

  controls.classList.remove('visible')
  document.body.style.backgroundColor = START_BG
  pageEl.classList.remove('show')
  clearFx()
  leftEl.style.background = light(color)
  rightEl.style.background = light(color)
  leftEl.style.visibility = 'visible'
  rightText.textContent = pages[current].text

  // ① ページの中から引いて本に
  await zoomOut()

  // ② 表紙を閉じながら、本を表紙の位置へ
  frontEl.style.background = COVER
  backEl.style.background = light(color)
  sheet.classList.add('is-cover')
  prepareSheet(false)
  leftEl.style.visibility = 'hidden'

  const move = moveBook(REST, CLOSED, 1200)
  const flip = sheet.animate(
    [
      { transform: 'translateZ(1px) rotateY(-180deg)' },
      { transform: 'translateZ(1px) rotateY(0deg)' },
    ],
    { duration: 1200, easing: 'ease-in-out', fill: 'forwards' }
  )
  await flip.finished
  sheet.style.transform = 'translateZ(1px) rotateY(0deg)'
  flip.cancel()
  await move

  // ③ 表紙に寄っていって、最初の画面に戻る
  await moveBook(CLOSED, coverView(), 900)
  book.getAnimations().forEach((a) => a.cancel())  // ← 追加：名残りを全部片付ける
  book.style.transform = coverView()                // ← 追加：表紙の位置に確実に置く
  bookWrap.classList.add('closed')
  current = 0
  state = 'closed'
  busy = false
}

// ボタン：引いて、めくって、ズームして消す
async function go(to) {
  if (busy || state !== 'open' || to < 0 || to > last) return
  busy = true
  const from = pages[current].color
  const next = pages[to].color
  const forward = to > current

  if (forward) {
    leftEl.style.background = light(from)
    rightEl.style.background = light(next)
    frontEl.style.background = light(from)
    backEl.style.background = light(next)
    frontText.textContent = pages[current].text  // めくる紙＝今のページ
    rightText.textContent = pages[to].text       // 下から出てくる紙＝次のページ
  } else {
    leftEl.style.background = light(next)
    rightEl.style.background = light(from)
    frontEl.style.background = light(next)
    backEl.style.background = light(from)
    frontText.textContent = pages[to].text       // 戻ってくる紙＝前のページ
    rightText.textContent = pages[current].text  // 今のページ
  }

  pageEl.classList.remove('show')
  clearFx()
  document.body.style.backgroundColor = START_BG
  sheet.classList.remove('is-cover')
  prepareSheet(forward)
  await zoomOut()

  const flip = flipSheet(forward, 800, next, pages[to].text)
  await sleep(500)
  current = to
  await zoomAndShow()
  await flip
  resetBook()
  busy = false
}

// 次へ（最後のページなら閉じる）
function goNext() {
  if (current === last) closeBook()
  else go(current + 1)
}

bookWrap.addEventListener('click', openBook)
prevBtn.addEventListener('click', () => go(current - 1))
nextBtn.addEventListener('click', goNext)

let startX = 0
$('stage').addEventListener('touchstart', (e) => {
  startX = e.touches[0].clientX
})
$('stage').addEventListener('touchend', (e) => {
  const diff = e.changedTouches[0].clientX - startX
  if (diff < -50) goNext()
  if (diff > 50) go(current - 1)
})

// 画面の大きさが変わったら、表紙の大きさも合わせる
addEventListener('resize', () => {
  if (state === 'closed' && !busy) book.style.transform = coverView()
})

showCover()

// modules/willemLoader.js
// Loader actforsport, inspiré du "Willem Loading Animation" d'Osmo. Option B :
// 1. Les lettres "act" et "forsport" montent.
// 2. La box s'ouvre entre les deux mots et les images défilent dedans.
// 3. L'image passe en plein écran.
// 4. Elle se rétracte dans le losange du hero (.hero_image-wrap).
// 5. Le loader est retiré et le contenu du hero apparaît.
//
// Le loader ne joue qu'au PREMIER chargement du site.
// Sur une navigation Barba, l'appel retire simplement le .willem-header du container.
//
// Utilisation (voir la note d'intégration envoyée avec ce fichier) :
//   import { initWillemLoader } from './modules/willemLoader.js'
//   await initWillemLoader(container)   // renvoie une Promise résolue à la fin

let hasRun = false

const KEYWORDS = { left: '0%', top: '0%', center: '50%', right: '100%', bottom: '100%' }
const toPercentPos = (str) =>
  (str || '0% 50%').split(',')[0].trim().split(/\s+/).map((v) => KEYWORDS[v] || v).join(' ')

// Convertit une expression CSS (ex: "max(60vw, 80svh)") en pixels.
function resolveLength(expr) {
  const probe = document.createElement('div')
  probe.style.cssText = `position:absolute;visibility:hidden;pointer-events:none;width:${expr}`
  document.body.appendChild(probe)
  const w = probe.getBoundingClientRect().width
  probe.remove()
  return w
}

// Lit le masque losange appliqué sur .hero_image-wrap pour reproduire exactement l'état final.
function readHeroMask(el) {
  const cs = getComputedStyle(el)
  const image = cs.maskImage || cs.webkitMaskImage
  if (!image || image === 'none') return null
  const rawSize = (cs.maskSize || cs.webkitMaskSize || '').split(',')[0].trim()
  const firstToken = rawSize.replace(/\s+auto$/, '')
  return {
    image,
    size: `${resolveLength(firstToken)}px auto`,
    position: toPercentPos(cs.maskPosition || cs.webkitMaskPosition),
  }
}

function setMask(el, props) {
  const out = {}
  if (props.image) { out.maskImage = props.image; out.webkitMaskImage = props.image }
  if (props.size) { out.maskSize = props.size; out.webkitMaskSize = props.size }
  if (props.position) { out.maskPosition = props.position; out.webkitMaskPosition = props.position }
  if (props.image) { out.maskRepeat = 'no-repeat'; out.webkitMaskRepeat = 'no-repeat' }
  return out
}

function lockScroll(lock) {
  document.documentElement.classList.toggle('is-loader-active', lock)
  const lenis = window.lenis
  if (lenis) lock ? lenis.stop?.() : lenis.start?.()
}

export function initWillemLoader(scope = document) {
  const header = scope.querySelector('.willem-header')
  const firstCall = !hasRun
  hasRun = true

  // Navigation Barba (ou page sans loader) : on retire le loader, rien d'autre.
  if (!header) return Promise.resolve()
  if (!firstCall || window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    header.remove()
    return Promise.resolve()
  }

  const gsap = window.gsap
  const letters = header.querySelectorAll('.willem__letter')
  const box = header.querySelector('.willem-loader__box')
  const growing = header.querySelector('.willem__growing-image')
  const start = header.querySelector('.willem__h1-start')
  const end = header.querySelector('.willem__h1-end')
  const extras = header.querySelectorAll('.willem__cover-image-extra')

  const hero = scope.querySelector('.section-hero')
  const heroWrap = hero?.querySelector('.hero_image-wrap')
  const heroContent = hero
    ? hero.querySelectorAll('.hero_content-left > *, .hero_deco-diamond')
    : []

  window.scrollTo(0, 0)
  lockScroll(true)

  // État initial du hero (caché sous le loader)
  if (heroWrap) gsap.set(heroWrap, { autoAlpha: 0 })
  if (heroContent.length) gsap.set(heroContent, { autoAlpha: 0, y: 40 })

  let target = null // rect + masque finaux, mesurés au moment du morph

  return new Promise((resolve) => {
    const finish = () => {
      header.remove()
      lockScroll(false)
      window.__loaderComplete = true
      document.dispatchEvent(new CustomEvent('loader:complete'))
      resolve()
    }

    const tl = gsap.timeline({
      defaults: { ease: 'expo.inOut' },
      onStart: () => header.classList.remove('is--hidden'),
    })

    // 1. Lettres
    tl.from(letters, { yPercent: 110, stagger: 0.025, duration: 1.25 })

    // 2. Ouverture de la box entre "act" et "forsport" + défilement des images
    tl.fromTo(box, { width: '0em' }, { width: '1.3em', duration: 1.25 }, '< 1.1')
      .fromTo(growing, { width: '0%' }, { width: '100%', duration: 1.25 }, '<')
      .fromTo(start, { x: '0em' }, { x: '-0.05em', duration: 1.25 }, '<')
      .fromTo(end, { x: '0em' }, { x: '0.05em', duration: 1.25 }, '<')
      .fromTo(extras, { opacity: 1 }, { opacity: 0, duration: 0.05, ease: 'none', stagger: 0.5 }, '-=0.05')

    // 3. Plein écran
    tl.to(growing, { width: '100vw', height: '100dvh', duration: 2 }, '< 1.25')
      .to(box, { width: '110vw', duration: 2 }, '<')

    // 4. Passage en position fixe + mesure de la cible, puis rétractation dans le losange
    tl.add(() => {
      const r = growing.getBoundingClientRect()
      gsap.set([start, end], { autoAlpha: 0 })
      gsap.set(growing, {
        position: 'fixed', left: r.left, top: r.top, width: r.width, height: r.height,
        margin: 0, x: 0, y: 0, zIndex: 2,
      })

      const rect = heroWrap?.getBoundingClientRect()
      if (!rect || rect.width < 2 || rect.height < 2) return // pas de cible : simple fondu
      const mask = readHeroMask(heroWrap)
      target = { rect, mask }

      if (mask) {
        // Losange géant centré : couvre tout l'écran au départ, aucun saut visible
        const big = 2 * (window.innerWidth + window.innerHeight)
        gsap.set(growing, setMask(growing, { image: mask.image, size: `${big}px auto`, position: '50% 50%' }))
      }
    }, '+=0.15')

    tl.to(growing, {
      left: () => (target ? target.rect.left : 0),
      top: () => (target ? target.rect.top : 0),
      width: () => (target ? target.rect.width : window.innerWidth),
      height: () => (target ? target.rect.height : window.innerHeight),
      maskSize: () => target?.mask?.size ?? 'auto',
      webkitMaskSize: () => target?.mask?.size ?? 'auto',
      maskPosition: () => target?.mask?.position ?? '50% 50%',
      webkitMaskPosition: () => target?.mask?.position ?? '50% 50%',
      autoAlpha: () => (target ? 1 : 0),
      duration: 1.6,
      ease: 'expo.inOut',
    })

    // 5. Relais vers le vrai hero, retrait du loader, apparition du contenu
    tl.add(() => {
      if (heroWrap) gsap.set(heroWrap, { autoAlpha: 1 })
      finish()
    })
    if (heroContent.length) {
      tl.to(heroContent, { autoAlpha: 1, y: 0, duration: 1.1, ease: 'expo.out', stagger: 0.08 }, '<')
    }
  })
}

// modules/willemLoader.js
// Loader actforsport, inspiré du "Willem Loading Animation" d'Osmo.
// 1. Les lettres "act" et "forsport" montent.
// 2. La box s'ouvre entre les deux mots.
// 3. Les images défilent dans la box.
// 4. Sortie identique au changement de page : le logo s'efface, le fond
//    remonte et la page remonte de 15vh en même temps (effet d'inertie).
//
// Le loader ne joue qu'au PREMIER chargement du site.
// Sur une navigation Barba, l'appel retire simplement le .willem-header du container.
//
// Le loader est affiché par le CSS dès le premier paint via html.is-loading
// (voir le script du Head) : le JS n'a plus qu'à l'animer puis le retirer.
//
// gsap + CustomEase chargés via CDN Webflow (globaux)
//
// Utilisation :
//   import { initWillemLoader } from './modules/willemLoader.js'
//   await initWillemLoader(container)   // renvoie une Promise résolue à la fin

let hasRun = false

const root = document.documentElement
const endLoading = () => root.classList.remove('is-loading')

// Bloque le scroll pendant le loader (Lenis est déjà actif au premier chargement).
const blockScroll = (e) => { e.preventDefault(); e.stopImmediatePropagation() }
const blockKeys = (e) => {
  if ([' ', 'PageDown', 'PageUp', 'ArrowDown', 'ArrowUp', 'Home', 'End'].includes(e.key)) blockScroll(e)
}

function lockScroll() {
  window.scrollTo(0, 0)
  window.addEventListener('wheel', blockScroll, { capture: true, passive: false })
  window.addEventListener('touchmove', blockScroll, { capture: true, passive: false })
  window.addEventListener('keydown', blockKeys, { capture: true })
}

function unlockScroll() {
  window.removeEventListener('wheel', blockScroll, { capture: true })
  window.removeEventListener('touchmove', blockScroll, { capture: true })
  window.removeEventListener('keydown', blockKeys, { capture: true })
}

export function initWillemLoader(scope = document) {
  const container = scope.querySelector('.willem-header')
  const firstCall = !hasRun
  hasRun = true

  // Navigation Barba (ou page sans loader) : on retire le loader, rien d'autre.
  if (!container) {
    endLoading()
    return Promise.resolve()
  }
  if (
    !firstCall ||
    typeof gsap === 'undefined' ||
    window.matchMedia('(prefers-reduced-motion: reduce)').matches
  ) {
    container.remove()
    endLoading()
    return Promise.resolve()
  }

  // Mêmes courbes que les transitions de page ; repli sur les eases natifs sans CustomEase.
  let easeLoader = 'power3.inOut'
  let easeOsmo = 'expo.inOut'
  if (typeof CustomEase !== 'undefined') {
    gsap.registerPlugin(CustomEase)
    CustomEase.create('loader', '0.65, 0.01, 0.05, 0.99')
    CustomEase.create('osmo', '0.625, 0.05, 0, 1')
    easeLoader = 'loader'
    easeOsmo = 'osmo'
  }

  const loader = container.querySelector('.willem-loader')
  const loadingLetter = container.querySelectorAll('.willem__letter')
  const box = container.querySelectorAll('.willem-loader__box')
  const growingImage = container.querySelectorAll('.willem__growing-image')
  const headingStart = container.querySelectorAll('.willem__h1-start')
  const headingEnd = container.querySelectorAll('.willem__h1-end')
  const coverImageExtra = container.querySelectorAll('.willem__cover-image-extra')

  // Contenu de la page sous le loader (pour l'effet d'inertie).
  // On anime les sections et pas le container Barba : un transform sur le
  // container déplacerait aussi le loader, qui est en position fixe dedans.
  // La barre de scroll (data-scroll-header) est exclue : elle gère son propre
  // transform et ne doit jamais bouger avec cet effet d'inertie.
  const pageContent = Array.from(container.parentElement.children)
    .filter((el) => (
      el !== container &&
      !el.matches('[data-scroll-header]') &&
      !el.querySelector('[data-scroll-header]')
    ))

  lockScroll()

  return new Promise((resolve) => {
    // Le loader est déjà visible grâce à html.is-loading ; on retire is--hidden
    // par sécurité si la classe traîne encore dans le markup.
    container.classList.remove('is--hidden')

    const tl = gsap.timeline({ defaults: { ease: 'expo.inOut' } })

    // 1. Lettres "act" / "forsport"
    if (loadingLetter.length) {
      tl.from(loadingLetter, { yPercent: 100, stagger: 0.025, duration: 1.25 })
    }

    // 2. Ouverture de la box entre les deux mots
    if (box.length) {
      tl.fromTo(box, { width: '0em' }, { width: '1em', duration: 1.25 }, '< 1.25')
    }
    if (growingImage.length) {
      tl.fromTo(growingImage, { width: '0%' }, { width: '100%', duration: 1.25 }, '<')
    }
    if (headingStart.length) {
      tl.fromTo(headingStart, { x: '0em' }, { x: '-0.05em', duration: 1.25 }, '<')
    }
    if (headingEnd.length) {
      tl.fromTo(headingEnd, { x: '0em' }, { x: '0.05em', duration: 1.25 }, '<')
    }

    // 3. Défilement des images dans la box
    if (coverImageExtra.length) {
      tl.fromTo(coverImageExtra, { opacity: 1 }, { opacity: 0, duration: 0.05, ease: 'none', stagger: 0.5 }, '-=0.05')
    }

    // 4. Sortie : même transition que le changement de page
    if (loader) {
      tl.to(loader, { autoAlpha: 0, duration: 0.5, ease: easeLoader }, '+=0.6') // petite pause sur la dernière image
    }
    tl.add('hideContent', loader ? '<' : '+=0.6')
      .to(container, { yPercent: -101, duration: 1, ease: easeOsmo }, 'hideContent')

    if (pageContent.length) {
      tl.fromTo(pageContent, { y: '15vh' }, {
        y: 0,
        duration: 1,
        ease: easeOsmo,
        // Décalage appliqué seulement au début de la sortie (le loader couvre
        // encore l'écran) : ScrollTrigger mesure la page à sa vraie place.
        immediateRender: false,
        clearProps: 'transform',
      }, 'hideContent')
    }

    tl.set(container, { display: 'none' })

    // Fin : on rend le scroll et on recalcule les positions ScrollTrigger
    tl.call(() => {
      endLoading()
      unlockScroll()
      if (typeof ScrollTrigger !== 'undefined') ScrollTrigger.refresh()
      window.__loaderComplete = true
      document.dispatchEvent(new CustomEvent('loader:complete'))
      resolve()
    })
  })
}
// main.js
import Lenis from 'https://cdn.jsdelivr.net/npm/lenis@1.3.17/dist/lenis.mjs'

import { init as initFaqAccordion } from './modules/faqAccordion.js'
import { init as initMarquee } from './modules/marquee.js'
import { init as initSplitText } from './modules/splitText.js'
import { init as initCardsStack } from './modules/cardsStack.js'
import { init as initScrollHeader } from './modules/scrollHeader.js'
import { init as initSlider } from './modules/slider.js'
import { init as initFooterParallax } from './modules/footerParallax.js'
import { init as initHighlightText } from './modules/highlightText.js'
import { init as initFlipOnScroll } from './modules/flipOnScroll.js'
import { init as initTestimonials } from './modules/testimonials.js'
import { init as initDepthTiles } from './modules/depthTiles.js'
import { init as initImageTrail } from './modules/imageTrail.js'
import { init as initSplitImageReveal } from './modules/splitImageReveal.js'
import { init as initPathsHover } from './modules/pathsHover.js'
import { init as initSwiperSlider } from './modules/swiperSlider.js'
import { init as initHeaderTheme } from './modules/headerTheme.js'
import { init as initHamburgerNav } from './modules/hamburgerNav.js'
// import { init as initScalingNav } from './modules/scalingNav.js' // désactivé temporairement
import { init as initPageTransitions } from './modules/pageTransitions.js'
import { initWillemLoader } from './modules/willemLoader.js'

const moduleDetectors = {
  faqAccordion: { selector: '.faq_accordion', initFn: initFaqAccordion },
  marquee: { selector: '.marquee_wrapper', initFn: initMarquee },
  splitText: { selector: '[animate]', initFn: initSplitText },
  cardsStack: { selector: '.feature-item', initFn: initCardsStack },
  scrollHeader: { selector: '[data-scroll-header]', initFn: initScrollHeader },
  slider: { selector: '#slider', initFn: initSlider },
  footerParallax: { selector: '[data-footer-parallax]', initFn: initFooterParallax },
  highlightText: { selector: '[data-highlight-text]', initFn: initHighlightText },
  flipOnScroll: { selector: "[data-flip-element='wrapper']", initFn: initFlipOnScroll },
  testimonials: { selector: '#testimonials-slider', initFn: initTestimonials },
  depthTiles: { selector: '[data-depth-tiles-init]', initFn: initDepthTiles },
  imageTrail: { selector: '[data-trail="wrapper"]', initFn: initImageTrail },
  splitImageReveal: { selector: '.split_component', initFn: initSplitImageReveal },
  pathsHover: { selector: '[data-paths-hover]', initFn: initPathsHover },
  swiperSlider: { selector: '[data-swiper-group]', initFn: initSwiperSlider },
  // Détecté sur le logo (pas sur les sections) : init() remet aussi le header à zéro
  // sur les pages sans section blanche.
  headerTheme: { selector: '[data-logo="main"]', initFn: initHeaderTheme },
  hamburgerNav: { selector: '[data-navigation-status]', initFn: initHamburgerNav },
  // scalingNav: { selector: '[data-navigation-status]', initFn: initScalingNav }, // désactivé temporairement
}

const hasBarba =
  !!document.querySelector('[data-barba="wrapper"]') && typeof barba !== 'undefined'

// -----------------------------------------
// LENIS (créé une seule fois, importé en module ES pour être isolé
// des variables globales que d'autres scripts, comme multi-step.js, écrasent)
// -----------------------------------------
let lenis = null
try {
  lenis = new Lenis({ autoRaf: false })

  if (typeof ScrollTrigger !== 'undefined' && typeof gsap !== 'undefined') {
    lenis.on('scroll', ScrollTrigger.update)
    gsap.ticker.add((time) => lenis.raf(time * 1000))
    gsap.ticker.lagSmoothing(0)
  }
} catch (e) {
  console.error('[lenis]', e)
}

// Remesure Lenis (limite de scroll) PUIS ScrollTrigger. Rafraîchir seulement
// ScrollTrigger ne suffit pas : Lenis continuerait de bloquer le scroll à
// l'ancienne hauteur de page.
function refreshScroll() {
  lenis?.resize()
  if (typeof ScrollTrigger !== 'undefined') ScrollTrigger.refresh()
}

let lastPageHeight = 0
let heightRefreshTimeout = null
const contentObserver =
  typeof ResizeObserver !== 'undefined'
    ? new ResizeObserver(() => {
        const h = document.documentElement.scrollHeight
        if (h === lastPageHeight) return
        lastPageHeight = h
        clearTimeout(heightRefreshTimeout)
        heightRefreshTimeout = setTimeout(refreshScroll, 150)
      })
    : null

function observeContent(container) {
  if (!contentObserver) return
  contentObserver.disconnect()
  const root = container || document
  root
    .querySelectorAll('.main-wrapper > *, .page-wrapper > *, [data-footer-parallax]')
    .forEach((el) => contentObserver.observe(el))
}

function initModules(container) {
  // Joue le loader au premier chargement ; sur une navigation Barba, retire
  // simplement le .willem-header de la nouvelle page.
  try {
    initWillemLoader(container || document)
  } catch (e) {
    console.error('[willemLoader]', e)
  }

  // Évite les doublons de triggers si les modules sont relancés
  if (typeof ScrollTrigger !== 'undefined') {
    ScrollTrigger.getAll().forEach((t) => t.kill(true))
  }

  // (Re)branche l'observation de hauteur sur le contenu de la page courante
  observeContent(document)

  Object.entries(moduleDetectors).forEach(([name, { selector, initFn }]) => {
    if (!document.querySelector(selector)) return
    try {
      // Modules that don't care about Lenis just ignore the extra argument.
      initFn({ lenis })
    } catch (e) {
      console.error(`[${name}]`, e)
    }
  })
}

// Avec Barba, c'est le hook afterEnter (via onEnter) qui initialise les
// modules, y compris au premier chargement. Sans Barba, on le fait ici.
if (!hasBarba) {
  initModules()
}

// element widths that depend on images, so refresh once everything is loaded.
window.addEventListener('load', refreshScroll)

// Les images en loading="lazy" ne sont récupérées que près du viewport : elles
// finissent souvent de charger bien après 'load', et changent la hauteur de la
// page une fois affichées. Ça rend obsolètes des positions déjà mesurées par
// ScrollTrigger (ex. la fin du parallax du footer, qui ne remonte alors plus
// tout à fait en haut). 'load' sur une <img> ne bubble pas : on écoute en
// phase de capture sur document pour l'attraper quelle que soit l'image.
let imageRefreshTimeout = null
document.addEventListener('load', (e) => {
  if (e.target.tagName !== 'IMG' || typeof ScrollTrigger === 'undefined') return
  clearTimeout(imageRefreshTimeout)
  imageRefreshTimeout = setTimeout(refreshScroll, 100)
}, true)

// Filet de sécurité général : dès que la hauteur de la page change, quelle
// qu'en soit la cause (polices qui arrivent après coup sur une première visite,
// Weglot, Finsweet List, iframes, accordéons...), on remesure Lenis et
// ScrollTrigger. Si la page RACCOURCIT après la mesure, la fin du parallax du
// footer ('clamp(top top)') reste calée sur l'ancienne hauteur : on n'atteint
// jamais la fin du scroll et le footer ne remonte pas jusqu'en haut.
//
// ATTENTION : html, body, .page-wrapper et .main-wrapper sont à height: 100%
// (= hauteur du viewport). Leur boîte ne change JAMAIS de taille, donc observer
// document.body ne déclenche rien, et l'autoResize interne de Lenis non plus :
// Lenis garde son ancienne limite de scroll et bloque avant la vraie fin de
// page (ex. logo du footer en lazy qui ajoute ~190px). On observe donc les
// enfants directs du contenu, qui eux grandissent réellement.


// Première visite (lien partagé = cache vide) : les polices arrivent tard et
// changent la hauteur des gros titres.
document.fonts?.ready.then(refreshScroll)

// Un formulaire Webflow (.w-form) cache le <form> et affiche le message de
// succès/erreur en changeant leur style inline : la page change de hauteur,
// ce qui rend obsolètes les positions déjà mesurées par ScrollTrigger pour
// tout ce qui suit (ex. le parallax du footer). On les remesure à chaque fois.
new MutationObserver((mutations) => {
  const touchedForm = mutations.some((m) => m.target.closest?.('.w-form'))
  if (touchedForm) requestAnimationFrame(refreshScroll)
}).observe(document.body, {
  attributes: true,
  attributeFilter: ['style'],
  subtree: true
})

// Barba swaps the page content without reloading main.js, so every other
// module has to be re-run manually once a new page has entered.
if (hasBarba) {
  try {
    initPageTransitions({ onEnter: initModules, lenis })
  } catch (e) {
    console.error('[pageTransitions]', e)
  }
}
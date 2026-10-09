// main.js
import Lenis from 'https://cdn.jsdelivr.net/npm/lenis@1.3.17/dist/lenis.mjs'

import { init as initFaqAccordion } from './modules/faqAccordion.js'
import { init as initShowcaseHorizontal } from './modules/showcaseHorizontal.js'
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
// import { init as initScalingNav } from './modules/scalingNav.js' // désactivé temporairement
import { init as initPageTransitions } from './modules/pageTransitions.js'

const moduleDetectors = {
  faqAccordion: { selector: '.faq_accordion', initFn: initFaqAccordion },
  showcaseHorizontal: { selector: '.showcase_horizontal-wrapper', initFn: initShowcaseHorizontal },
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

function initModules() {
  // Évite les doublons de triggers si les modules sont relancés
  if (typeof ScrollTrigger !== 'undefined') {
    ScrollTrigger.getAll().forEach((t) => t.kill(true))
  }

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

// Some triggers (e.g. showcaseHorizontal's pin distance) are measured from
// element widths that depend on images, so refresh once everything is loaded.
window.addEventListener('load', () => {
  if (typeof ScrollTrigger !== 'undefined') ScrollTrigger.refresh()
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
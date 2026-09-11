// main.js
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
}

Object.entries(moduleDetectors).forEach(([name, { selector, initFn }]) => {
  if (!document.querySelector(selector)) return
  try {
    initFn()
  } catch (e) {
    console.error(`[${name}]`, e)
  }
})

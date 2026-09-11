// footerParallax.js
// gsap + ScrollTrigger chargés via CDN Webflow (globaux)

export function init() {
  if (typeof gsap === 'undefined' || typeof ScrollTrigger === 'undefined') return
  gsap.registerPlugin(ScrollTrigger)

  document.querySelectorAll('[data-footer-parallax]').forEach((el) => {
    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: el,
        start: 'clamp(top bottom)',
        end: 'clamp(top top)',
        scrub: true
      }
    })

    const inner = el.querySelector('[data-footer-parallax-inner]')
    const dark = el.querySelector('[data-footer-parallax-dark]')

    if (inner) {
      tl.from(inner, {
        yPercent: -80,
        ease: 'linear'
      })
    }

    if (dark) {
      tl.from(dark, {
        opacity: 0.5,
        ease: 'linear'
      }, '<')
    }
  })
}

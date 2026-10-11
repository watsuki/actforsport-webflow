// footerParallax.js
// gsap + ScrollTrigger chargés via CDN Webflow (globaux)
//
// Desktop (≥ 992px) : parallax du footer au scroll.
// Tablette / mobile : désactivé, le footer s'affiche normalement.
// Sur mobile, le scroll tactile est géré par le navigateur (Lenis ne le lisse pas) :
// l'élément décalé en JS a toujours un temps de retard sur le doigt, d'où les à-coups.

let mm = null

export function init() {
  if (typeof gsap === 'undefined' || typeof ScrollTrigger === 'undefined') return
  gsap.registerPlugin(ScrollTrigger)

  // Barba relance init() à chaque page : on nettoie l'instance précédente
  if (mm) mm.revert()
  mm = gsap.matchMedia()

  mm.add('(min-width: 992px)', () => {
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
  })
}
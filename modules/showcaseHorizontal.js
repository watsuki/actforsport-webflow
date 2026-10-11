// showcaseHorizontal.js
// gsap + ScrollTrigger chargés via CDN Webflow (globaux)
//
// Desktop (≥ 992px) : section épinglée, les cartes défilent à l'horizontale au scroll.
// Tablette / mobile : pas d'épinglage. Les cartes se font défiler au doigt
// (scroll horizontal natif + aimantation), réglé en CSS dans style-main.
// Sur mobile, le scroll tactile est géré par le navigateur (Lenis ne le lisse pas) :
// un pin repositionné en JS a toujours un temps de retard, d'où les petites secousses.

let mm = null

export function init() {
  if (typeof gsap === 'undefined' || typeof ScrollTrigger === 'undefined') return
  gsap.registerPlugin(ScrollTrigger)

  // Barba relance init() à chaque page : on nettoie l'instance précédente
  if (mm) mm.revert()
  mm = gsap.matchMedia()

  mm.add('(min-width: 992px)', () => {
    document.querySelectorAll('.showcase_horizontal-wrapper').forEach((wrapper) => {
      const sticky = wrapper.querySelector('.showcase_sticky')
      const track = wrapper.querySelector('.showcase_track')
      if (!sticky || !track) return

      const getScrollDistance = () => Math.max(0, track.scrollWidth - sticky.clientWidth)

      const tween = gsap.to(track, {
        x: () => -getScrollDistance(),
        ease: 'none'
      })

      ScrollTrigger.create({
        trigger: wrapper,
        start: 'top top',
        end: () => '+=' + getScrollDistance(),
        pin: sticky,
        pinType: 'transform', // réglage d'origine, fluide sur desktop avec Lenis
        animation: tween,
        scrub: 1,
        invalidateOnRefresh: true
      })
    })
  })
}
// showcaseHorizontal.js
// gsap + ScrollTrigger chargés via CDN Webflow (globaux)

export function init() {
  if (typeof gsap === 'undefined' || typeof ScrollTrigger === 'undefined') return
  gsap.registerPlugin(ScrollTrigger)

  // Mobile : la barre d'adresse qui apparaît/disparaît redimensionne la fenêtre ;
  // sans ça, chaque redimensionnement relance un refresh et fait sauter le pin.
  ScrollTrigger.config({ ignoreMobileResize: true })

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
      // Pas de pinType 'transform' : sur mobile, le scroll tactile est natif
      // (Lenis ne le lisse pas), et un pin en transform est repositionné en JS
      // avec un temps de retard sur le scroll -> la section "saute".
      // Le pin en position fixe (par défaut) suit le scroll sans décalage.
      anticipatePin: 1,
      animation: tween,
      scrub: 1,
      invalidateOnRefresh: true
    })
  })
}
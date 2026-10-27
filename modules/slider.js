// slider.js
// Swiper chargé via CDN Webflow (global)

export function init() {
  if (typeof Swiper === 'undefined') return

  new Swiper('#slider', {
    loop: true,
    grabCursor: true,
    navigation: {
      nextEl: '#swiper-next',
      prevEl: '#swiper-prev'
    },
    // Swipe trackpad (deltaX) : fait glisser le slider, sans jamais intercepter
    // le scroll vertical normal de la page (forceToAxis limite à l'axe horizontal).
    mousewheel: { forceToAxis: true },
    // Flèches ← → : actives dès que le slider est visible, pas besoin de clic préalable.
    keyboard: {
      enabled: true,
      onlyInViewport: true
    }
  })
}

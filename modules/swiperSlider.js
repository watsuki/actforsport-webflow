// swiperSlider.js
// Swiper chargé via CDN Webflow (global)
//
// Attributs Webflow :
//   [data-swiper-group]  conteneur du slider (flèches + pagination comprises)
//   [data-swiper-wrap]   élément .swiper
//   [data-swiper-prev] / [data-swiper-next]  flèches (optionnelles)
//   .swiper-pagination   puces (optionnelles), cherchées dans le groupe
//
// La largeur des slides vient du CSS Webflow (slidesPerView: 'auto'),
// pas de Swiper : c'est la classe .swiper-slide 2 qui la pilote.

let instances = []

export function init() {
  if (typeof Swiper === 'undefined') return

  // Barba relance init() à chaque page : on détruit les sliders précédents
  instances.forEach((swiper) => swiper.destroy(true, true))
  instances = []

  document.querySelectorAll('[data-swiper-group]').forEach((swiperGroup) => {
    // Swiper attend un .swiper-wrapper en enfant DIRECT de l'élément qu'on lui passe.
    // On prend donc le parent du .swiper-wrapper, que data-swiper-wrap soit posé
    // sur le .swiper, sur le .swiper-wrapper lui-même ou sur un parent plus haut.
    const wrapAttr = swiperGroup.querySelector('[data-swiper-wrap]')
    const wrapperEl = wrapAttr?.classList.contains('swiper-wrapper')
      ? wrapAttr
      : (wrapAttr || swiperGroup).querySelector('.swiper-wrapper')
    if (!wrapperEl) {
      console.warn('[swiperSlider] aucun .swiper-wrapper dans ce groupe', swiperGroup)
      return
    }
    const swiperSliderWrap = wrapperEl.parentElement

    const prevButton = swiperGroup.querySelector('[data-swiper-prev]')
    const nextButton = swiperGroup.querySelector('[data-swiper-next]')
    // Pagination propre à chaque groupe (sinon Swiper prend la première de la page)
    const pagination = swiperGroup.querySelector('.swiper-pagination')

    const swiper = new Swiper(swiperSliderWrap, {
      slidesPerView: 'auto', // largeur pilotée par le CSS (841px max, 85vw sur petit écran)
      spaceBetween: 0,       // l'espace entre cartes vient du padding-right du slide
      speed: 600,
      mousewheel: false,
      grabCursor: true,
      navigation: {
        nextEl: nextButton,
        prevEl: prevButton
      },
      pagination: {
        el: pagination,
        type: 'bullets',
        clickable: true
      },
      keyboard: {
        enabled: true,
        onlyInViewport: false
      }
    })

    instances.push(swiper)
  })
}
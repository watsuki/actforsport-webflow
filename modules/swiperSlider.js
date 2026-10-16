// swiperSlider.js
// Swiper chargé via CDN Webflow (global)
//
// Attributs Webflow :
//   [data-swiper-group]  conteneur du slider (flèches + pagination comprises)
//   [data-swiper-wrap]   élément .swiper
//   [data-swiper-prev] / [data-swiper-next]  flèches (optionnelles)
//   .swiper-pagination   puces (optionnelles), cherchées dans le groupe

let instances = []

export function init() {
  if (typeof Swiper === 'undefined') return

  // Barba relance init() à chaque page : on détruit les sliders précédents
  instances.forEach((swiper) => swiper.destroy(true, true))
  instances = []

  document.querySelectorAll('[data-swiper-group]').forEach((swiperGroup) => {
    const swiperSliderWrap = swiperGroup.querySelector('[data-swiper-wrap]')
    if (!swiperSliderWrap) return

    const prevButton = swiperGroup.querySelector('[data-swiper-prev]')
    const nextButton = swiperGroup.querySelector('[data-swiper-next]')
    // Pagination propre à chaque groupe (sinon Swiper prend la première de la page)
    const pagination = swiperGroup.querySelector('.swiper-pagination')

    const swiper = new Swiper(swiperSliderWrap, {
      slidesPerView: 1.25,
      speed: 600,
      mousewheel: true,
      grabCursor: true,
      breakpoints: {
        // >= 480px
        480: { slidesPerView: 1.8 },
        // >= 992px
        992: { slidesPerView: 3.5 }
      },
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

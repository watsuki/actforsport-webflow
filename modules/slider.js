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
    }
  })
}

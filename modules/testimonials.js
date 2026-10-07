export function init() {
  if (typeof Swiper === 'undefined') return
  const el = document.querySelector('#testimonials-slider')
  if (!el) return

  const wrapper = el.querySelector('.swiper-wrapper')
  const originals = [...wrapper.children]
  while (wrapper.children.length < 6) {
    originals.forEach((slide) => {
      const clone = slide.cloneNode(true)
      clone.setAttribute('aria-hidden', 'true')
      wrapper.appendChild(clone)
    })
  }

  new Swiper(el, {
    loop: true,
    centeredSlides: true,
    slidesPerView: 'auto',
    spaceBetween: 48,
    grabCursor: true,
    slideToClickedSlide: true,
    speed: 600,
    autoplay: {
      delay: 5000,
      disableOnInteraction: false, // reprend l'autoplay après un clic ou un drag
      pauseOnMouseEnter: true,     // pause au survol, pratique pour lire
    },
    breakpoints: {
      0: { spaceBetween: 24 },
      768: { spaceBetween: 48 },
    },
  })
}
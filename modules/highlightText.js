// highlightText.js
// gsap + ScrollTrigger + SplitText chargés via CDN Webflow (globaux)
//
// - Titres hors slider : les lettres s'allument au scroll (scrub).
// - Texte dans un slider Swiper : l'effet se joue uniquement sur la slide active,
//   y compris sur les slides dupliquées par Swiper en mode loop.
//   Il est relancé à chaque entrée dans la section (événement 'slider:enter',
//   émis par testimonials.js).
//
// Le titre est déjà atténué en CSS avant le lancement du JS (style-main :
// [data-highlight-text] { opacity: 0.2 }), pour éviter le flash du texte plein.
// Une fois les lettres découpées et passées à 0.2, on remet le titre à 1.

export function init() {
  if (typeof gsap === 'undefined' || typeof ScrollTrigger === 'undefined' || typeof SplitText === 'undefined') return
  gsap.registerPlugin(ScrollTrigger, SplitText)

  const sliders = new Set()

  document.querySelectorAll('[data-highlight-text]').forEach((heading) => {
    // Texte dans un slider : géré à part, sur la slide active uniquement
    const swiperEl = heading.closest('.swiper')
    if (swiperEl) {
      sliders.add(swiperEl)
      return
    }

    const scrollStart = heading.getAttribute('data-highlight-scroll-start') || 'top 50%'
    const scrollEnd = heading.getAttribute('data-highlight-scroll-end') || 'center 40%'
    const fadedValue = heading.getAttribute('data-highlight-fade') || 0.2
    const staggerValue = heading.getAttribute('data-highlight-stagger') || 0.1

    new SplitText(heading, {
      type: 'words, chars',
      autoSplit: true,
      onSplit(self) {
        const ctx = gsap.context(() => {
          const tl = gsap.timeline({
            scrollTrigger: {
              scrub: true,
              trigger: heading,
              start: scrollStart,
              end: scrollEnd
            }
          })
          tl.from(self.chars, {
            autoAlpha: fadedValue,
            stagger: staggerValue,
            ease: 'linear'
          })
        })

        // Les lettres sont maintenant à fadedValue : on rend son opacité au titre
        gsap.set(heading, { opacity: 1 })

        return ctx
      }
    })
  })

  sliders.forEach(initSliderHighlight)
}

function initSliderHighlight(sliderEl) {
  const faded = 0.2

  // Slide devenue inactive : texte plein, animation arrêtée
  const reset = (slide) => {
    const h = slide.querySelector('[data-highlight-text]')
    if (!h) return
    if (h._hlTl) h._hlTl.kill()
    gsap.set(h, { opacity: 1 })
    if (h._hl) gsap.set(h._hl.chars, { autoAlpha: 1 })
  }

  // Slide devenue active : les lettres s'allument l'une après l'autre
  const play = (slide) => {
    const h = slide.querySelector('[data-highlight-text]')
    if (!h) return
    if (h._hlTl) h._hlTl.kill()

    // Un clone Swiper n'a pas d'instance SplitText : on remet le texte à plat
    // (les spans copiés par cloneNode), puis on découpe à neuf.
    if (!h._hl) {
      h.textContent = h.textContent
      h._hl = new SplitText(h, { type: 'words, chars' })
    }

    gsap.set(h, { opacity: 1 })
    gsap.set(h._hl.chars, { autoAlpha: faded })
    h._hlTl = gsap.to(h._hl.chars, {
      autoAlpha: 1,
      ease: 'none',
      duration: 0.3,
      stagger: { amount: 1.2 } // durée totale de l'allumage, en secondes
    })
  }

  const sync = (slide) => {
    const isActive = slide.classList.contains('swiper-slide-active')
    if (isActive === !!slide._hlActive) return
    slide._hlActive = isActive
    isActive ? play(slide) : reset(slide)
  }

  // Le CSS atténue les textes ([data-highlight-text] { opacity: 0.2 }) : on les remet à 1
  sliderEl.querySelectorAll('[data-highlight-text]').forEach((h) => gsap.set(h, { opacity: 1 }))

  // Un seul observateur pour tout le slider : il couvre aussi les slides
  // dupliquées par Swiper (loop), créées après l'init.
  new MutationObserver((mutations) => {
    mutations.forEach((m) => {
      const slide = m.target
      if (slide.classList && slide.classList.contains('swiper-slide')) sync(slide)
    })
  }).observe(sliderEl, { subtree: true, attributes: true, attributeFilter: ['class'] })

  // Rejoue l'effet sur la slide active quand la section est (ré)entrée
  sliderEl.addEventListener('slider:enter', () => {
    const active = sliderEl.querySelector('.swiper-slide-active')
    if (active) play(active)
  })

  sliderEl.querySelectorAll('.swiper-slide').forEach(sync)
}
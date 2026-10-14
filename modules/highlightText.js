// highlightText.js
export function init() {
  if (typeof gsap === 'undefined' || typeof ScrollTrigger === 'undefined' || typeof SplitText === 'undefined') return
  gsap.registerPlugin(ScrollTrigger, SplitText)

  document.querySelectorAll('[data-highlight-text]').forEach((heading) => {
    const fadedValue = heading.getAttribute('data-highlight-fade') || 0.2

    // Texte dans un slider : l'effet ne joue que sur la slide active
    const slide = heading.closest('.swiper-slide')
    if (slide) {
      initSlideHighlight(heading, slide, fadedValue)
      return
    }

    const scrollStart = heading.getAttribute('data-highlight-scroll-start') || 'top 50%'
    const scrollEnd = heading.getAttribute('data-highlight-scroll-end') || 'center 40%'
    const staggerValue = heading.getAttribute('data-highlight-stagger') || 0.1

    new SplitText(heading, {
      type: 'words, chars',
      autoSplit: true,
      onSplit(self) {
        const ctx = gsap.context(() => {
          const tl = gsap.timeline({
            scrollTrigger: { scrub: true, trigger: heading, start: scrollStart, end: scrollEnd }
          })
          tl.from(self.chars, { autoAlpha: fadedValue, stagger: staggerValue, ease: 'linear' })
        })
        gsap.set(heading, { opacity: 1 })
        return ctx
      }
    })
  })
}

function initSlideHighlight(heading, slide, faded) {
  const split = new SplitText(heading, { type: 'words, chars' })
  let tl = null
  let wasActive = false

  gsap.set(heading, { opacity: 1 })
  gsap.set(split.chars, { autoAlpha: 1 })

  const sync = () => {
    const isActive = slide.classList.contains('swiper-slide-active')
    if (isActive === wasActive) return
    wasActive = isActive
    if (tl) tl.kill()
    if (isActive) {
      gsap.set(split.chars, { autoAlpha: faded })
      tl = gsap.to(split.chars, {
        autoAlpha: 1,
        ease: 'none',
        duration: 0.3,
        stagger: { amount: 1.2 }
      })
    } else {
      gsap.set(split.chars, { autoAlpha: 1 })
    }
  }

  new MutationObserver(sync).observe(slide, { attributes: true, attributeFilter: ['class'] })
  sync()
}
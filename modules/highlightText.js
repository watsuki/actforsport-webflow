// highlightText.js
// gsap + ScrollTrigger + SplitText chargés via CDN Webflow (globaux)

export function init() {
  if (typeof gsap === 'undefined' || typeof ScrollTrigger === 'undefined' || typeof SplitText === 'undefined') return
  gsap.registerPlugin(ScrollTrigger, SplitText)

  document.querySelectorAll('[data-highlight-text]').forEach((heading) => {
    const scrollStart = heading.getAttribute('data-highlight-scroll-start') || 'top 60%'
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
        return ctx
      }
    })
  })
}

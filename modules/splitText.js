// splitText.js
// gsap + SplitType chargés via CDN Webflow (globaux)

export function init() {
  if (typeof gsap === 'undefined' || typeof SplitType === 'undefined') return

  document.fonts.ready.then(() => {
    new SplitType('[animate]', {
      types: 'lines, words, chars',
      tagName: 'span'
    })

    gsap.from('[animate] .word', {
      y: '100%',
      opacity: 1,
      duration: 0.6,
      ease: 'sine.out',
      stagger: 0.05
    })
  })
}

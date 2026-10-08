// cardsStack.js
// gsap + ScrollTrigger chargés via CDN Webflow (globaux)

export function init() {
  if (typeof gsap === 'undefined' || typeof ScrollTrigger === 'undefined') return
  gsap.registerPlugin(ScrollTrigger)

  const panels = gsap.utils.toArray('.feature-item')

  panels.forEach((panel, i) => {
    const isLast = i === panels.length - 1

    ScrollTrigger.create({
      trigger: panel,
      start: 'top top',
      end: '+=100%',
      pin: true,
      pinType: 'transform',
      pinSpacing: isLast,
      scrub: 1
    })
  })
}

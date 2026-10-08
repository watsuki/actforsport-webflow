// showcaseHorizontal.js
// gsap + ScrollTrigger chargés via CDN Webflow (globaux)

export function init() {
  if (typeof gsap === 'undefined' || typeof ScrollTrigger === 'undefined') return
  gsap.registerPlugin(ScrollTrigger)

  document.querySelectorAll('.showcase_horizontal-wrapper').forEach((wrapper) => {
    const sticky = wrapper.querySelector('.showcase_sticky')
    const track = wrapper.querySelector('.showcase_track')
    if (!sticky || !track) return

    const getScrollDistance = () => Math.max(0, track.scrollWidth - sticky.clientWidth)

    const tween = gsap.to(track, {
      x: () => -getScrollDistance(),
      ease: 'none'
    })

    ScrollTrigger.create({
      trigger: wrapper,
      start: 'top top',
      end: () => '+=' + getScrollDistance(),
      pin: sticky,
      pinType: 'transform',
      animation: tween,
      scrub: 1,
      invalidateOnRefresh: true
    })
  })
}

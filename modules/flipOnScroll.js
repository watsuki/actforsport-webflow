// flipOnScroll.js
// gsap + ScrollTrigger + Flip chargés via CDN Webflow (globaux)

export function init() {
  if (typeof gsap === 'undefined' || typeof ScrollTrigger === 'undefined' || typeof Flip === 'undefined') return
  gsap.registerPlugin(ScrollTrigger, Flip)

  const wrapperElements = document.querySelectorAll("[data-flip-element='wrapper']")
  const targetEl = document.querySelector("[data-flip-element='target']")
  if (!wrapperElements.length || !targetEl) return

  let tl

  const flipTimeline = () => {
    if (tl) {
      tl.kill()
      gsap.set(targetEl, { clearProps: 'all' })
    }

    tl = gsap.timeline({
      scrollTrigger: {
        trigger: wrapperElements[0],
        start: 'bottom bottom',
        endTrigger: wrapperElements[wrapperElements.length - 1],
        end: 'bottom bottom',
        scrub: 0.25
      }
    })

    gsap.set(targetEl, { opacity: 0.5 })

    wrapperElements.forEach((element, index) => {
      const nextIndex = index + 1
      if (nextIndex < wrapperElements.length) {
        const nextWrapperEl = wrapperElements[nextIndex]
        const nextRect = nextWrapperEl.getBoundingClientRect()
        const thisRect = element.getBoundingClientRect()
        const nextDistance = nextRect.top + window.pageYOffset + nextWrapperEl.offsetHeight / 2
        const thisDistance = thisRect.top + window.pageYOffset + element.offsetHeight / 2
        const offset = nextDistance - thisDistance

        tl.add(
          Flip.fit(targetEl, nextWrapperEl, {
            duration: offset,
            ease: 'none'
          })
        )
      }
    })

    tl.fromTo(targetEl, { opacity: 0.5 }, { opacity: 1, ease: 'none', duration: tl.duration() }, 0)
  }

  flipTimeline()

  let resizeTimer
  window.addEventListener('resize', () => {
    clearTimeout(resizeTimer)
    resizeTimer = setTimeout(() => {
      flipTimeline()
    }, 100)
  })
}

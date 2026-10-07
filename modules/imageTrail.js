// imageTrail.js
// gsap + ScrollTrigger chargés via CDN Webflow (globaux)

function initImageTrail(config = {}) {
  const options = {
    minWidth: config.minWidth ?? 992,
    moveDistance: config.moveDistance ?? 15,
    stopDuration: config.stopDuration ?? 300,
    trailLength: config.trailLength ?? 5
  }

  const wrapper = document.querySelector('[data-trail="wrapper"]')

  if (!wrapper || window.innerWidth < options.minWidth) {
    return
  }

  const state = {
    trailInterval: null,
    globalIndex: 0,
    last: { x: 0, y: 0 },
    trailImageTimestamps: new Map(),
    trailImages: Array.from(document.querySelectorAll('[data-trail="item"]')),
    isActive: false
  }

  const MathUtils = {
    lerp: (a, b, n) => (1 - n) * a + n * b,
    distance: (x1, y1, x2, y2) => Math.hypot(x2 - x1, y2 - y1)
  }

  function getRelativeCoordinates(e, rect) {
    return {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top
    }
  }

  /* ---------------------------------------------------------------
     Losange qui suit le curseur (uniquement dans cette section)
  --------------------------------------------------------------- */
  const cursor = wrapper.querySelector('[data-trail="cursor"]')
  let cursorCleanup = () => {}

  if (cursor) {
    gsap.set(cursor, { xPercent: -50, yPercent: -50, autoAlpha: 0, scale: 0.6 })

    const xTo = gsap.quickTo(cursor, 'x', { duration: 0.45, ease: 'power3' })
    const yTo = gsap.quickTo(cursor, 'y', { duration: 0.45, ease: 'power3' })

    const onCursorMove = (e) => {
      const r = wrapper.getBoundingClientRect()
      xTo(e.clientX - r.left)
      yTo(e.clientY - r.top)
    }

    const onCursorEnter = (e) => {
      const r = wrapper.getBoundingClientRect()
      gsap.set(cursor, { x: e.clientX - r.left, y: e.clientY - r.top })
      gsap.to(cursor, {
        autoAlpha: 1,
        scale: 1,
        duration: 0.3,
        ease: 'back.out(1.7)',
        overwrite: 'auto'
      })
    }

    const onCursorLeave = () => {
      gsap.to(cursor, {
        autoAlpha: 0,
        scale: 0.6,
        duration: 0.25,
        overwrite: 'auto'
      })
    }

    wrapper.addEventListener('mousemove', onCursorMove)
    wrapper.addEventListener('mouseenter', onCursorEnter)
    wrapper.addEventListener('mouseleave', onCursorLeave)

    cursorCleanup = () => {
      wrapper.removeEventListener('mousemove', onCursorMove)
      wrapper.removeEventListener('mouseenter', onCursorEnter)
      wrapper.removeEventListener('mouseleave', onCursorLeave)
      gsap.set(cursor, { autoAlpha: 0 })
    }
  }

  /* ---------------------------------------------------------------
     Image trail
  --------------------------------------------------------------- */
  function activate(trailImage, x, y) {
    if (!trailImage) return

    const rect = trailImage.getBoundingClientRect()
    const styles = {
      left: `${x - rect.width / 2}px`,
      top: `${y - rect.height / 2}px`,
      zIndex: state.globalIndex,
      display: 'block'
    }

    Object.assign(trailImage.style, styles)
    state.trailImageTimestamps.set(trailImage, Date.now())

    gsap.fromTo(
      trailImage,
      { autoAlpha: 0, scale: 0.8 },
      {
        scale: 1,
        autoAlpha: 1,
        duration: 0.2,
        overwrite: true
      }
    )

    state.last = { x, y }
  }

  function fadeOutTrailImage(trailImage) {
    if (!trailImage) return

    gsap.to(trailImage, {
      opacity: 0,
      scale: 0.2,
      duration: 0.8,
      ease: 'expo.out',
      onComplete: () => {
        gsap.set(trailImage, { autoAlpha: 0 })
      }
    })
  }

  function handleOnMove(e) {
    if (!state.isActive) return

    const rectWrapper = wrapper.getBoundingClientRect()
    const { x: relativeX, y: relativeY } = getRelativeCoordinates(e, rectWrapper)

    const distanceFromLast = MathUtils.distance(
      relativeX,
      relativeY,
      state.last.x,
      state.last.y
    )

    if (distanceFromLast > window.innerWidth / options.moveDistance) {
      const lead = state.trailImages[state.globalIndex % state.trailImages.length]
      const tail = state.trailImages[(state.globalIndex - options.trailLength) % state.trailImages.length]

      activate(lead, relativeX, relativeY)
      fadeOutTrailImage(tail)
      state.globalIndex++
    }
  }

  function cleanupTrailImages() {
    const currentTime = Date.now()
    for (const [trailImage, timestamp] of state.trailImageTimestamps.entries()) {
      if (currentTime - timestamp > options.stopDuration) {
        fadeOutTrailImage(trailImage)
        state.trailImageTimestamps.delete(trailImage)
      }
    }
  }

  function startTrail() {
    if (state.isActive) return

    state.isActive = true
    wrapper.addEventListener('mousemove', handleOnMove)
    state.trailInterval = setInterval(cleanupTrailImages, 100)
  }

  function stopTrail() {
    if (!state.isActive) return

    state.isActive = false
    wrapper.removeEventListener('mousemove', handleOnMove)
    clearInterval(state.trailInterval)
    state.trailInterval = null

    state.trailImages.forEach(fadeOutTrailImage)
    state.trailImageTimestamps.clear()
  }

  ScrollTrigger.create({
    trigger: wrapper,
    start: 'top bottom',
    end: 'bottom top',
    onEnter: startTrail,
    onEnterBack: startTrail,
    onLeave: stopTrail,
    onLeaveBack: stopTrail
  })

  const handleResize = () => {
    if (window.innerWidth < options.minWidth && state.isActive) {
      stopTrail()
    } else if (window.innerWidth >= options.minWidth && !state.isActive) {
      startTrail()
    }
  }

  window.addEventListener('resize', handleResize)

  return () => {
    stopTrail()
    cursorCleanup()
    window.removeEventListener('resize', handleResize)
  }
}

export function init() {
  if (typeof gsap === 'undefined' || typeof ScrollTrigger === 'undefined') return
  gsap.registerPlugin(ScrollTrigger)

  initImageTrail({
    minWidth: 992,
    moveDistance: 15,
    stopDuration: 350,
    trailLength: 8
  })
}
// depthTiles.js
// gsap + ScrollTrigger + CustomEase chargés via CDN Webflow (globaux)

export function init() {
  if (typeof gsap === 'undefined' || typeof ScrollTrigger === 'undefined' || typeof CustomEase === 'undefined') return
  gsap.registerPlugin(CustomEase, ScrollTrigger)
  CustomEase.create('depth', 'M0,0 C0.6,0 0,1 1,1')

  document.querySelectorAll('[data-depth-tiles-init]').forEach((container) => {
    const list = container.querySelector('[data-depth-tiles-list]')
    const tiles = container.querySelectorAll('[data-depth-tiles-item]')
    const tileCount = tiles.length
    if (tileCount < 2) return

    const xMultiplier = 0.65
    const backScale = 0.5
    const backOpacity = 1
    const backDarkness = 1
    const sideRotateY = 5
    const perspective = 75

    const moveDuration = 1.5
    const startDelay = 0.5
    const pauseDuration = 0.125

    const state = { progress: 0 }

    let isActive = false
    let isHovering = false
    let hasStarted = false
    let stepTimeline
    let delayedCall
    let startDelayedCall
    let activeTileIndex = -1

    gsap.set(list, { perspective: `${perspective}em` })
    gsap.set(tiles, {
      transformStyle: 'preserve-3d',
      transformPerspective: perspective * 16
    })

    function getRelativeIndex(index) {
      let relative = index - state.progress
      relative = (((relative + tileCount / 2) % tileCount + tileCount) % tileCount) - tileCount / 2
      return gsap.utils.clamp(-2, 2, relative)
    }

    function getActiveIndex() {
      return ((Math.round(state.progress) % tileCount) + tileCount) % tileCount
    }

    function updateTileStatus() {
      const currentActiveIndex = getActiveIndex()
      if (currentActiveIndex === activeTileIndex) return

      activeTileIndex = currentActiveIndex

      tiles.forEach((tile, index) => {
        tile.setAttribute('data-depth-tiles-item-status', index === activeTileIndex ? 'active' : 'not-active')
      })
    }

    function renderDepth() {
      const tileWidth = tiles[0].offsetWidth
      const radiusX = tileWidth * xMultiplier

      updateTileStatus()

      tiles.forEach((tile, index) => {
        const relative = getRelativeIndex(index)
        const angle = (relative / 2) * Math.PI

        const orbitX = Math.sin(angle) * radiusX
        const orbitDepth = (Math.cos(angle) + 1) / 2

        const x = relative <= -2 || relative >= 2 ? 0 : orbitX
        const scale = gsap.utils.interpolate(backScale, 1, orbitDepth)
        const opacity = gsap.utils.interpolate(backOpacity, 1, orbitDepth)
        const brightness = gsap.utils.interpolate(backDarkness, 1, orbitDepth)
        const rotateY = Math.sin(angle) * -sideRotateY
        const zIndex = Math.round(gsap.utils.interpolate(1, 1000, orbitDepth))

        gsap.set(tile, {
          x,
          scale,
          opacity,
          rotateY,
          filter: `brightness(${brightness})`,
          zIndex
        })
      })
    }

    function goToNextTile() {
      if (!isActive || isHovering) return

      stepTimeline = gsap.timeline({
        paused: true,
        onComplete: () => {
          if (isActive && !isHovering) {
            delayedCall = gsap.delayedCall(pauseDuration, goToNextTile)
          }
        }
      })

      stepTimeline.to(state, {
        progress: state.progress + 1,
        duration: moveDuration,
        ease: 'depth',
        onUpdate: renderDepth
      })

      stepTimeline.play()
    }

    function pauseDepth() {
      isActive = false
      if (stepTimeline) stepTimeline.pause()
      if (delayedCall) delayedCall.pause()
      if (startDelayedCall) startDelayedCall.pause()
    }

    function playDepth() {
      isActive = true
      if (isHovering) return

      if (!hasStarted) {
        hasStarted = true
        startDelayedCall = gsap.delayedCall(startDelay, goToNextTile)
        return
      }

      if (stepTimeline && stepTimeline.progress() < 1) {
        stepTimeline.play()
      } else {
        goToNextTile()
      }
    }

    function handleHoverStart() {
      isHovering = true
      if (delayedCall) delayedCall.pause()
      if (startDelayedCall) startDelayedCall.pause()
    }

    function handleHoverEnd() {
      isHovering = false
      if (!isActive) return

      if (!hasStarted) {
        playDepth()
        return
      }

      if (stepTimeline && stepTimeline.progress() < 1) {
        stepTimeline.play()
      } else {
        goToNextTile()
      }
    }

    list.addEventListener('pointerover', (event) => {
      if (!event.target.closest('[data-depth-tiles-item]')) return
      handleHoverStart()
    })

    list.addEventListener('pointerleave', () => {
      handleHoverEnd()
    })

    renderDepth()

    ScrollTrigger.create({
      trigger: container,
      start: 'top bottom',
      end: 'bottom top',
      onToggle: (self) => (self.isActive ? playDepth() : pauseDepth())
    })
  })
}

// depthTiles.js
// gsap chargé via CDN Webflow (global)
//
// Carrousel en profondeur piloté au drag (souris ou doigt), sans défilement automatique.
// Au relâchement, la carte la plus proche se cale au centre ; un geste rapide
// (« flick ») passe à la carte suivante même si le drag est court.

export function init() {
  if (typeof gsap === 'undefined') return

  document.querySelectorAll('[data-depth-tiles-init]').forEach((container) => {
    const list = container.querySelector('[data-depth-tiles-list]')
    const tiles = container.querySelectorAll('[data-depth-tiles-item]')
    const tileCount = tiles.length
    if (!list || tileCount < 2) return

    const xMultiplier = 0.65
    const backScale = 0.5
    const backOpacity = 1
    const backDarkness = 1
    const sideRotateY = 5
    const perspective = 75

    const dragThreshold = 6     // px avant de considérer qu'on drague (sinon c'est un clic)
    const flickProjection = 200 // ms : élan projeté au relâchement
    const snapDuration = 0.8
    const snapEase = 'power3.out'

    const state = { progress: 0 }

    let activeTileIndex = -1
    let snapTween = null
    let pointerId = null
    let dragging = false
    let justDragged = false
    let startX = 0
    let startProgress = 0
    let lastX = 0
    let lastT = 0
    let velocity = 0 // px / ms

    gsap.set(list, {
      perspective: `${perspective}em`,
      cursor: 'grab',
      touchAction: 'pan-y', // le scroll vertical reste natif sur mobile
      userSelect: 'none'
    })
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

    // Distance de drag (px) pour avancer d'une carte : celle qui amène une carte
    // latérale au centre.
    function getStepDistance() {
      return Math.max(1, tiles[0].offsetWidth * xMultiplier)
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
      const radiusX = getStepDistance()

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

    // Cale la carte la plus proche au centre, en tenant compte de l'élan du geste
    function snap() {
      const nearest = Math.round(state.progress)
      const projected = state.progress - (velocity * flickProjection) / getStepDistance()
      const target = gsap.utils.clamp(nearest - 1, nearest + 1, Math.round(projected))

      snapTween = gsap.to(state, {
        progress: target,
        duration: snapDuration,
        ease: snapEase,
        onUpdate: renderDepth
      })
    }

    list.addEventListener('pointerdown', (e) => {
      if (e.pointerType === 'mouse' && e.button !== 0) return
      pointerId = e.pointerId
      dragging = false
      velocity = 0
      startX = lastX = e.clientX
      lastT = e.timeStamp
      // Attrape les cartes en plein mouvement
      if (snapTween) snapTween.kill()
    })

    list.addEventListener('pointermove', (e) => {
      if (e.pointerId !== pointerId) return

      if (!dragging) {
        if (Math.abs(e.clientX - startX) < dragThreshold) return
        dragging = true
        startX = e.clientX
        startProgress = state.progress
        list.setPointerCapture(pointerId)
        list.style.cursor = 'grabbing'
      }

      const dt = e.timeStamp - lastT
      if (dt > 0) velocity = (e.clientX - lastX) / dt
      lastX = e.clientX
      lastT = e.timeStamp

      // Glisser vers la gauche fait venir la carte de droite
      state.progress = startProgress - (e.clientX - startX) / getStepDistance()
      renderDepth()
    })

    const endDrag = (e) => {
      if (e.pointerId !== pointerId) return
      pointerId = null

      if (dragging) {
        dragging = false
        list.style.cursor = 'grab'
        if (list.hasPointerCapture(e.pointerId)) list.releasePointerCapture(e.pointerId)
        // Un geste arrêté avant de relâcher n'a plus d'élan
        if (e.timeStamp - lastT > 100) velocity = 0
        // Bloque le clic qui suit le relâchement (liens dans les cartes)
        justDragged = true
        setTimeout(() => { justDragged = false }, 0)
      }

      snap()
    }

    list.addEventListener('pointerup', endDrag)
    list.addEventListener('pointercancel', endDrag)

    list.addEventListener('click', (e) => {
      if (!justDragged) return
      e.preventDefault()
      e.stopPropagation()
    }, true)

    // Empêche le glisser natif des images / liens du navigateur
    list.addEventListener('dragstart', (e) => e.preventDefault())

    // La largeur des cartes change avec la fenêtre : on recalcule les positions
    new ResizeObserver(renderDepth).observe(tiles[0])

    renderDepth()
  })
}

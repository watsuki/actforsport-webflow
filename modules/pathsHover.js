// pathsHover.js : au survol, la carte s'élargit, l'autre se réduit, le losange grossit
// gsap chargé via CDN Webflow (global)
//
// Desktop avec souris uniquement (≥ 992px et hover) : sur tactile, pas de survol.

const GROW = 1.2          // flex-grow de la carte survolée
const SHRINK = 0.9        // flex-grow de l'autre carte
const DECO_REST = { opacity: 1, scale: 1 }        // 0 pour un losange visible seulement au survol
const DECO_HOVER = { opacity: 1, scale: 1.15 }
const DURATION = 0.7
const EASE = 'power2.out'

let mm = null

export function init() {
  if (typeof gsap === 'undefined') return

  // Barba relance init() à chaque page : on nettoie l'instance précédente
  if (mm) mm.revert()
  mm = gsap.matchMedia()

  mm.add('(min-width: 992px) and (hover: hover)', () => {
    const cleanups = []

    document.querySelectorAll('[data-paths-hover]').forEach((grid) => {
      const cards = [...grid.querySelectorAll('.card-path')]
      if (cards.length < 2) return

      gsap.set(cards, { flexGrow: 1, flexShrink: 1, flexBasis: 0, minWidth: 0 })
      cards.forEach((card) => {
        const deco = card.querySelector('.card-path_deco')
        if (deco) gsap.set(deco, { ...DECO_REST, transformOrigin: 'left bottom' })
      })

      const setState = (active) => {
        cards.forEach((card) => {
          const isActive = card === active
          gsap.to(card, {
            flexGrow: !active ? 1 : isActive ? GROW : SHRINK,
            duration: DURATION,
            ease: EASE,
            overwrite: 'auto'
          })
          const deco = card.querySelector('.card-path_deco')
          if (deco) {
            gsap.to(deco, {
              ...(isActive ? DECO_HOVER : DECO_REST),
              duration: DURATION,
              ease: EASE,
              overwrite: 'auto'
            })
          }
        })
      }

      const handlers = cards.map((card) => {
        const enter = () => setState(card)
        const leave = () => setState(null)
        card.addEventListener('mouseenter', enter)
        card.addEventListener('mouseleave', leave)
        return { card, enter, leave }
      })

      cleanups.push(() => {
        handlers.forEach(({ card, enter, leave }) => {
          card.removeEventListener('mouseenter', enter)
          card.removeEventListener('mouseleave', leave)
        })
        gsap.set(cards, { clearProps: 'flexGrow,flexShrink,flexBasis,minWidth' })
        cards.forEach((card) => {
          const deco = card.querySelector('.card-path_deco')
          if (deco) gsap.set(deco, { clearProps: 'opacity,scale,transform' })
        })
      })
    })

    // Nettoyage (changement de breakpoint ou nouvelle page Barba)
    return () => cleanups.forEach((fn) => fn())
  })
}

// hamburgerNav.js
// Menu hamburger (Osmo Scaling Hamburger Navigation) compatible Barba.
// Listeners délégués sur document : ils survivent au remplacement du conteneur Barba,
// donc on ne les enregistre qu'une fois même si init() est rappelé à chaque page.

const SEL_NAV = '[data-navigation-status]'

let initialized = false

function setStatus(status) {
  const nav = document.querySelector(SEL_NAV)
  if (nav) nav.setAttribute('data-navigation-status', status)
}

export function init() {
  if (initialized) return
  initialized = true

  document.addEventListener('click', (e) => {
    const trigger = e.target.closest('[data-navigation-toggle]')
    if (trigger) {
      const nav = document.querySelector(SEL_NAV)
      if (!nav) return
      const type = trigger.getAttribute('data-navigation-toggle')
      if (type === 'toggle') {
        const open = nav.getAttribute('data-navigation-status') === 'active'
        nav.setAttribute('data-navigation-status', open ? 'not-active' : 'active')
      } else if (type === 'close') {
        nav.setAttribute('data-navigation-status', 'not-active')
      }
      return
    }
    // Clic sur un lien du menu : on referme avant la transition
    if (e.target.closest('.hamburger-nav__a')) setStatus('not-active')
  })

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') setStatus('not-active')
  })
}

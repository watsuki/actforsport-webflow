// scalingNav.js
// Boilerplate Osmo : menu "scaling hamburger navigation"
// La nav est persistante entre les pages (hors du container barba), donc ce
// module ne doit s'initialiser qu'une fois même si init() est rappelé après
// chaque transition — sinon les listeners s'empilent.

let initialized = false

export function init() {
  if (initialized) return
  if (!document.querySelector('[data-navigation-status]')) return

  initialized = true

  // Toggle Navigation
  document.querySelectorAll('[data-navigation-toggle="toggle"]').forEach(toggleBtn => {
    toggleBtn.addEventListener('click', () => {
      const navStatusEl = document.querySelector('[data-navigation-status]')
      if (!navStatusEl) return
      if (navStatusEl.getAttribute('data-navigation-status') === 'not-active') {
        navStatusEl.setAttribute('data-navigation-status', 'active')
        // If you use Lenis you can 'stop' Lenis here: Example Lenis.stop();
      } else {
        navStatusEl.setAttribute('data-navigation-status', 'not-active')
        // If you use Lenis you can 'start' Lenis here: Example Lenis.start();
      }
    })
  })

  // Close Navigation
  document.querySelectorAll('[data-navigation-toggle="close"]').forEach(closeBtn => {
    closeBtn.addEventListener('click', () => {
      const navStatusEl = document.querySelector('[data-navigation-status]')
      if (!navStatusEl) return
      navStatusEl.setAttribute('data-navigation-status', 'not-active')
      // If you use Lenis you can 'start' Lenis here: Example Lenis.start();
    })
  })

  // Key ESC - Close Navigation
  document.addEventListener('keydown', e => {
    if (e.keyCode === 27) {
      const navStatusEl = document.querySelector('[data-navigation-status]')
      if (!navStatusEl) return
      if (navStatusEl.getAttribute('data-navigation-status') === 'active') {
        navStatusEl.setAttribute('data-navigation-status', 'not-active')
        // If you use Lenis you can 'start' Lenis here: Example Lenis.start();
      }
    }
  })
}

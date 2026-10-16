// headerTheme.js
// Le header passe en orange quand il survole une section blanche
// ([data-logo-trigger="white"]). Compatible Barba : init() est relancé à chaque
// page et re-sélectionne le header et les sections de la nouvelle page.

const isTabletMobile = window.matchMedia('(max-width: 991px)')

let observer = null
let logo = null
let navButtons = []
let navBar = null
let isOverWhite = false

const apply = () => {
  logo?.classList.toggle('is-orange', isOverWhite)
  navButtons.forEach((btn) => btn.classList.toggle('is-orange', isOverWhite))

  // Style appliqué uniquement en tablette / mobile
  navBar?.classList.toggle('is-orange-mobile', isOverWhite && isTabletMobile.matches)
}

// Enregistré une seule fois (module-level), pas à chaque init()
isTabletMobile.addEventListener('change', apply)

export function init() {
  // Nettoie l'observer de la page précédente
  observer?.disconnect()
  observer = null
  isOverWhite = false

  // Toujours re-sélectionner : le header est recréé par Barba à chaque page
  logo = document.querySelector('[data-logo="main"]')
  navButtons = Array.from(document.querySelectorAll('[data-nav-btn="main"]'))
  navBar = document.querySelector('[data-nav="main"]')

  const sections = document.querySelectorAll('[data-logo-trigger="white"]')
  apply() // remet le header à son état par défaut
  if (!logo || !sections.length) return

  // On mémorise les sections qui touchent la zone d'observation :
  // le header reste orange tant qu'au moins une est dedans.
  const intersecting = new Set()

  observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) intersecting.add(entry.target)
      else intersecting.delete(entry.target)
    })
    isOverWhite = intersecting.size > 0
    apply()
  }, {
    threshold: 0,
    rootMargin: '0px 0px -90% 0px'
  })

  sections.forEach((section) => observer.observe(section))
}

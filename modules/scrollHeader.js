// scrollHeader.js

export function init() {
  const header = document.querySelector('[data-scroll-header]')
  if (!header) return

  const threshold = parseInt(header.getAttribute('data-scroll-threshold')) || 50
  const stopDelay = parseInt(header.getAttribute('data-scroll-stop-delay')) || 600
  const transitionDuration = parseFloat(header.getAttribute('data-scroll-duration')) || 0.5
  let lastScroll = 0
  let scrollTimeout

  header.style.transition = `transform ${transitionDuration}s ease`

  const showHeader = () => {
    header.style.transform = 'translateY(0)'
  }

  const hideHeader = () => {
    header.style.transform = 'translateY(-100%)'
  }

  window.addEventListener('scroll', () => {
    // ScrollTrigger.refresh() (ex. à la fin du loader) scrolle temporairement
    // la page pour remesurer les triggers épinglés : ces faux événements de
    // scroll ne doivent pas faire bouger la barre.
    if (typeof ScrollTrigger !== 'undefined' && ScrollTrigger.isRefreshing) return

    const currentScroll = window.pageYOffset

    clearTimeout(scrollTimeout)

    if (currentScroll <= threshold) {
      showHeader()
      lastScroll = currentScroll
      return
    }

    if (currentScroll > lastScroll) {
      hideHeader()
    } else {
      showHeader()
    }

    lastScroll = currentScroll

    scrollTimeout = setTimeout(() => {
      showHeader()
    }, stopDelay)
  })
}

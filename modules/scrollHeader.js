// scrollHeader.js

export function init() {
  const header = document.querySelector('[data-scroll-header]')
  if (!header) return

  const threshold = parseInt(header.getAttribute('data-scroll-threshold')) || 50
  const stopDelay = parseInt(header.getAttribute('data-scroll-stop-delay')) || 600
  let lastScroll = 0
  let scrollTimeout

  const showHeader = () => {
    header.style.transform = 'translateY(0)'
  }

  const hideHeader = () => {
    header.style.transform = 'translateY(-100%)'
  }

  window.addEventListener('scroll', () => {
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

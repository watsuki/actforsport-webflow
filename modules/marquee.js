// marquee.js
export function init() {
  document.querySelectorAll('.marquee_wrapper').forEach((wrapper) => {
    const track = wrapper.querySelector('.marquee_track')
    if (!track || track.dataset.marqueeReady) return
    track.dataset.marqueeReady = 'true'

    // Remplit la piste : on clone le jeu de logos jusqu'à dépasser la largeur
    // du wrapper, puis on double le tout pour que la boucle reste continue.
    const base = Array.from(track.children)
    const fill = () => {
      let guard = 0
      while (track.scrollWidth < wrapper.offsetWidth && guard++ < 20) {
        base.forEach((el) => track.appendChild(el.cloneNode(true)))
      }
      const set = Array.from(track.children)
      set.forEach((el) => {
        const c = el.cloneNode(true)
        c.setAttribute('aria-hidden', 'true')
        track.appendChild(c)
      })
    }
    // Les images doivent avoir une largeur avant de mesurer
    const imgs = Array.from(track.querySelectorAll('img'))
    Promise.all(
      imgs.map((i) => (i.complete ? Promise.resolve() : new Promise((r) => { i.onload = i.onerror = r })))
    ).then(fill)

    const duration = wrapper.getAttribute('data-duration') || '80'
    track.style.animationDuration = duration + 's'

    const direction = wrapper.getAttribute('data-direction') || 'left'
    if (direction === 'right') track.classList.add('is-right')

    const pause = wrapper.getAttribute('data-pause') || 'true'
    if (pause === 'true') {
      wrapper.addEventListener('mouseenter', () => { track.style.animationPlayState = 'paused' })
      wrapper.addEventListener('mouseleave', () => { track.style.animationPlayState = 'running' })
    }
  })
}
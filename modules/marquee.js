// marquee.js

export function init() {
  document.querySelectorAll('.marquee_wrapper').forEach((wrapper) => {
    const track = wrapper.querySelector('.marquee_track')
    if (!track) return

    const duration = wrapper.getAttribute('data-duration') || '80'
    track.style.animationDuration = duration + 's'

    const direction = wrapper.getAttribute('data-direction') || 'left'
    if (direction === 'right') {
      track.classList.add('is-right')
    }

    const pause = wrapper.getAttribute('data-pause') || 'true'
    if (pause === 'true') {
      wrapper.addEventListener('mouseenter', () => {
        track.style.animationPlayState = 'paused'
      })
      wrapper.addEventListener('mouseleave', () => {
        track.style.animationPlayState = 'running'
      })
    }
  })
}

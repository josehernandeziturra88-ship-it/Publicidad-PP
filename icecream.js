const brandsWindow = document.querySelector('.brands-window');
const pauseBrands = document.querySelector('.brands-pause');
if (brandsWindow && pauseBrands) {
  pauseBrands.addEventListener('click', () => {
    const paused = pauseBrands.getAttribute('aria-pressed') !== 'true';
    pauseBrands.setAttribute('aria-pressed', String(paused));
    pauseBrands.textContent = paused ? 'Reanudar movimiento' : 'Pausar movimiento';
    brandsWindow.classList.toggle('is-paused', paused);
  });
}

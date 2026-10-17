const flavorsDialog = document.querySelector('#flavors-dialog');
const flavorsTrigger = document.querySelector('.flavors-trigger');
if (flavorsDialog && flavorsTrigger && typeof flavorsDialog.showModal === 'function') {
  flavorsTrigger.addEventListener('click', (event) => {
    event.preventDefault();
    flavorsDialog.showModal();
  });
  flavorsDialog.querySelector('.flavors-close').addEventListener('click', () => flavorsDialog.close());
  flavorsDialog.addEventListener('click', (event) => {
    const rect = flavorsDialog.getBoundingClientRect();
    if (event.target === flavorsDialog && (event.clientX < rect.left || event.clientX > rect.right || event.clientY < rect.top || event.clientY > rect.bottom)) {
      flavorsDialog.close();
    }
  });
  flavorsDialog.addEventListener('close', () => flavorsTrigger.focus());
}

const flavorsDialog = document.querySelector('#flavors-dialog');
let flavorsTrigger = null;
if (flavorsDialog && typeof flavorsDialog.showModal === 'function') {
  document.addEventListener('click', (event) => {
    const trigger = event.target.closest('.flavors-trigger');
    if (!trigger) return;
    event.preventDefault();
    flavorsTrigger = trigger;
    flavorsDialog.showModal();
  });
  flavorsDialog.querySelector('.flavors-close').addEventListener('click', () => flavorsDialog.close());
  flavorsDialog.addEventListener('click', (event) => {
    const rect = flavorsDialog.getBoundingClientRect();
    if (event.target === flavorsDialog && (event.clientX < rect.left || event.clientX > rect.right || event.clientY < rect.top || event.clientY > rect.bottom)) {
      flavorsDialog.close();
    }
  });
  flavorsDialog.addEventListener('close', () => { if (flavorsTrigger?.isConnected) flavorsTrigger.focus(); });
}

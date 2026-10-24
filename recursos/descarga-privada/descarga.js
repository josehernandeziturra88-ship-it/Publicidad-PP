'use strict';
(() => {
  const docs = [
    { encrypted: 'kit.enc', filename: 'Kit-web.zip', label: 'Descargar kit completo', description: 'ZIP · Todos los documentos.', type: 'application/zip' },
    { encrypted: 'guia.enc', filename: 'Guia-web.pdf', label: 'Descargar guía', description: 'PDF · 14 páginas.', type: 'application/pdf' },
    { encrypted: 'propuesta.enc', filename: 'Propuesta-web.docx', label: 'Descargar propuesta editable', description: 'Word · Plantilla comercial.', type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' },
    { encrypted: 'control.enc', filename: 'Control-web.xlsx', label: 'Descargar control de clientes', description: 'Excel · Clientes, solicitudes y costos.', type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' },
  ];
  const form = document.querySelector('#unlock');
  const password = document.querySelector('#password');
  const prepare = document.querySelector('#prepare');
  const status = document.querySelector('#status');
  const ready = document.querySelector('#ready');
  const files = document.querySelector('#files');
  const urls = [];
  const encoder = new TextEncoder();

  function clearDownloads() {
    for (const url of urls) URL.revokeObjectURL(url);
    urls.length = 0;
    files.replaceChildren();
  }

  async function decrypt(doc, secret) {
    const response = await fetch(doc.encrypted, { credentials: 'omit', redirect: 'error', cache: 'no-store' });
    if (!response.ok) throw new Error('FETCH');
    const bytes = new Uint8Array(await response.arrayBuffer());
    if (bytes.length < 49 || new TextDecoder().decode(bytes.slice(0, 5)) !== 'PWEB1') throw new Error('FORMAT');
    const material = await crypto.subtle.importKey('raw', encoder.encode(secret), 'PBKDF2', false, ['deriveKey']);
    const key = await crypto.subtle.deriveKey(
      { name: 'PBKDF2', hash: 'SHA-256', iterations: 600000, salt: bytes.slice(5, 21) },
      material, { name: 'AES-GCM', length: 256 }, false, ['decrypt']
    );
    const data = await crypto.subtle.decrypt(
      { name: 'AES-GCM', iv: bytes.slice(21, 33), additionalData: encoder.encode('playero-private-download-v1:' + doc.filename) },
      key, bytes.slice(33)
    );
    return { doc, data };
  }

  form.addEventListener('submit', async event => {
    event.preventDefault();
    const secret = password.value.trim();
    if (!secret) return;
    clearDownloads();
    ready.hidden = true;
    status.className = '';
    status.textContent = 'Preparando tus archivos…';
    prepare.disabled = true;
    password.disabled = true;
    try {
      if (!globalThis.crypto?.subtle) throw new Error('BROWSER');
      // Finish every verification before making any file available.
      const result = [];
      for (const doc of docs) result.push(await decrypt(doc, secret));
      for (const { doc, data } of result) {
        const url = URL.createObjectURL(new Blob([data], { type: doc.type }));
        urls.push(url);
        const link = document.createElement('a');
        link.href = url;
        link.download = doc.filename;
        link.className = 'file';
        link.append(document.createTextNode(doc.label));
        const description = document.createElement('span');
        description.textContent = doc.description;
        link.append(description);
        files.append(link);
      }
      password.value = '';
      form.hidden = true;
      ready.hidden = false;
      status.textContent = 'Puedes guardar los archivos en tu dispositivo.';
      files.querySelector('a').focus();
    } catch (error) {
      clearDownloads();
      status.className = 'error';
      status.textContent = error.message === 'FETCH'
        ? 'No se pudieron cargar los archivos. Revisa la conexión e inténtalo nuevamente.'
        : error.message === 'BROWSER'
          ? 'Abre esta dirección directamente en Chrome o Safari para descargar.'
          : 'No se pudieron abrir los archivos. Revisa que hayas copiado la clave completa e inténtalo nuevamente.';
    } finally {
      prepare.disabled = false;
      password.disabled = false;
    }
  });

  document.querySelector('#close').addEventListener('click', () => {
    clearDownloads();
    ready.hidden = true;
    form.hidden = false;
    password.value = '';
    status.textContent = 'Descarga cerrada.';
    password.focus();
  });
  addEventListener('pagehide', clearDownloads);
})();

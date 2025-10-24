// Navegação botão estilizado (funciona mesmo localmente sem servidor)
document.addEventListener('DOMContentLoaded', () => {
  const gotoAES = document.getElementById('goto-aes');
  const gotoIndex = document.getElementById('goto-index');

  if (gotoAES) gotoAES.addEventListener('click', () => {
    window.location.href = 'aes.html';
  });
  if (gotoIndex) gotoIndex.addEventListener('click', () => {
    window.location.href = 'index.html';
  });

  // copy buttons (delegation)
  document.body.addEventListener('click', (e) => {
    if (e.target.matches('.copy-btn')) {
      const targetId = e.target.getAttribute('data-copy-target');
      if (!targetId) return;
      const el = document.getElementById(targetId);
      if (!el) return;
      // copy the text content (works for pre, textarea)
      const text = el.tagName === 'TEXTAREA' || el.tagName === 'INPUT' ? el.value : el.textContent;
      navigator.clipboard.writeText(text).then(() => {
        e.target.textContent = 'Copiado!';
        setTimeout(()=> e.target.textContent = 'Copiar', 1200);
      }).catch(() => {
        // fallback
        const ta = document.createElement('textarea');
        ta.value = text;
        document.body.appendChild(ta);
        ta.select();
        document.execCommand('copy');
        document.body.removeChild(ta);
        e.target.textContent = 'Copiado!';
        setTimeout(()=> e.target.textContent = 'Copiar', 1200);
      });
    }
  });
});

document.getElementById('caesar-enc').addEventListener('click', () => {
  const text = document.getElementById('caesar-input').value;
  const shift = parseInt(document.getElementById('caesar-shift').value, 10);
  const out = document.getElementById('caesar-output');
  if (isNaN(shift)) return out.textContent = 'Deslocamento inválido.';
  let res = '';
  for (let c of text) {
    if (/[a-zA-Z]/.test(c)) {
      const base = c === c.toUpperCase() ? 65 : 97;
      res += String.fromCharCode((c.charCodeAt(0)-base + shift + 26) % 26 + base);
    } else res += c;
  }
  out.textContent = 'Criptografado: ' + res;
});

document.getElementById('caesar-dec').addEventListener('click', () => {
  const text = document.getElementById('caesar-input').value;
  const shift = parseInt(document.getElementById('caesar-shift').value, 10);
  const out = document.getElementById('caesar-output');
  if (isNaN(shift)) return out.textContent = 'Deslocamento inválido.';
  let res = '';
  for (let c of text) {
    if (/[a-zA-Z]/.test(c)) {
      const base = c === c.toUpperCase() ? 65 : 97;
      res += String.fromCharCode((c.charCodeAt(0)-base - shift + 26*10) % 26 + base);
    } else res += c;
  }
  out.textContent = 'Decriptografado: ' + res;
});

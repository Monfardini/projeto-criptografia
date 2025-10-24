function cleanKeyLetters(k) { return k.replace(/[^a-zA-Z]/g,''); }

document.getElementById('vigenere-enc').addEventListener('click', () => {
  const text = document.getElementById('vigenere-input').value;
  const key = cleanKeyLetters(document.getElementById('vigenere-key').value);
  const out = document.getElementById('vigenere-output');
  if (!key) return out.textContent = 'Chave inválida (use letras).';
  let res = '';
  let j=0;
  for (let i=0;i<text.length;i++){
    const c = text[i];
    if (/[a-zA-Z]/.test(c)) {
      const isUpper = c === c.toUpperCase();
      const base = isUpper ? 65 : 97;
      const shift = key[j % key.length].toLowerCase().charCodeAt(0) - 97;
      res += String.fromCharCode((c.charCodeAt(0)-base + shift) % 26 + base);
      j++;
    } else res += c;
  }
  out.textContent = 'Criptografado: ' + res;
});

document.getElementById('vigenere-dec').addEventListener('click', () => {
  const text = document.getElementById('vigenere-input').value;
  const key = cleanKeyLetters(document.getElementById('vigenere-key').value);
  const out = document.getElementById('vigenere-output');
  if (!key) return out.textContent = 'Chave inválida (use letras).';
  let res = '';
  let j=0;
  for (let i=0;i<text.length;i++){
    const c = text[i];
    if (/[a-zA-Z]/.test(c)) {
      const isUpper = c === c.toUpperCase();
      const base = isUpper ? 65 : 97;
      const shift = key[j % key.length].toLowerCase().charCodeAt(0) - 97;
      res += String.fromCharCode((c.charCodeAt(0)-base - shift + 26) % 26 + base);
      j++;
    } else res += c;
  }
  out.textContent = 'Decriptografado: ' + res;
});

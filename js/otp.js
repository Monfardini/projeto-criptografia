function toBase64FromBinary(str) {
  // str is raw binary string
  return btoa(str);
}
function fromBase64ToBinary(b64) {
  try { return atob(b64); } catch(e) { return null; }
}

document.getElementById('otp-enc').addEventListener('click', () => {
  const msg = document.getElementById('otp-input').value;
  const key = document.getElementById('otp-key').value;
  const out = document.getElementById('otp-output');

  if (!msg) return out.textContent = 'Insira mensagem.';
  if (!key) return out.textContent = 'Insira chave.';
  if (key.length !== msg.length) return out.textContent = 'Erro: chave deve ter o mesmo tamanho da mensagem.';

  let resBin = '';
  for (let i=0;i<msg.length;i++) resBin += String.fromCharCode(msg.charCodeAt(i) ^ key.charCodeAt(i));
  out.textContent = 'Criptografado (Base64): ' + toBase64FromBinary(resBin);
});

document.getElementById('otp-dec').addEventListener('click', () => {
  const b64 = document.getElementById('otp-input').value;
  const key = document.getElementById('otp-key').value;
  const out = document.getElementById('otp-output');

  if (!b64) return out.textContent = 'Insira Base64 cifrado para decodificar.';
  if (!key) return out.textContent = 'Insira chave.';
  const bin = fromBase64ToBinary(b64);
  if (bin === null) return out.textContent = 'Base64 inválido.';
  if (bin.length !== key.length) return out.textContent = 'Erro: chave deve ter o mesmo tamanho dos bytes cifrados.';

  let res = '';
  for (let i=0;i<bin.length;i++) res += String.fromCharCode(bin.charCodeAt(i) ^ key.charCodeAt(i));
  out.textContent = 'Decriptografado: ' + res;
});

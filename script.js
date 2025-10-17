/* script.js
   Implementações das cifras: César, Vigenère, Hill (2x2), OTP, AES-128 (ECB PKCS#7).
   Validação visual e botão copiar.
*/

// ----------------- Helpers e UI -----------------
function mod(n, m) { return ((n % m) + m) % m; }

const algoritmoSelect = document.getElementById('algoritmo');
const mensagemInput = document.getElementById('mensagem');
const chaveInput = document.getElementById('chave');
const resultadoArea = document.getElementById('resultado');
const criptBtn = document.getElementById('criptografar');
const decriptBtn = document.getElementById('decriptografar');
const copiarBtn = document.getElementById('copiar');
const hintDiv = document.getElementById('hint');
const mensagemVisual = document.getElementById('mensagem-visual');

function showMessage(text, type='success') {
  mensagemVisual.textContent = text;
  mensagemVisual.className = 'message ' + (type === 'error' ? 'error' : 'success');
}
function clearMessage(){ mensagemVisual.textContent=''; mensagemVisual.className='message'; }

function setHint(text){ hintDiv.innerHTML = text || ''; }

// Atualiza dica conforme algoritmo
function atualizarHint(){
  const a = algoritmoSelect.value;
  if(a === 'cesar') setHint('Chave: número inteiro (ex: 3). Mantém símbolos e espaços.');
  else if(a === 'vigenere') setHint('Chave: palavra (apenas letras).');
  else if(a === 'hill') setHint("Chave: quatro números separados por espaço (ex: '3 3 2 5'). O texto será filterado para letras minúsculas e terá padding 'x' se necessário.");
  else if(a === 'otp') setHint('Chave: deve ter o mesmo tamanho da mensagem (cada caractere será XORado).');
  else if(a === 'aes') setHint('AES-128: chave ideal = 16 caracteres (será pad/recortada se necessário). Saída codificada em Base64. Modo ECB + PKCS#7 (apenas para demos).');
}
algoritmoSelect.addEventListener('change', atualizarHint);
atualizarHint();

// ----------------- Cifra de César -----------------
function cifraCesar(texto, chave, modo) {
  let desloc = parseInt(chave);
  if (isNaN(desloc)) desloc = 3;
  let res = '';
  for (let c of texto) {
    if (/[a-z]/.test(c)) {
      let base = 97;
      res += String.fromCharCode(base + mod(c.charCodeAt(0) - base + (modo === 'cripto' ? desloc : -desloc), 26));
    } else if (/[A-Z]/.test(c)) {
      let base = 65;
      res += String.fromCharCode(base + mod(c.charCodeAt(0) - base + (modo === 'cripto' ? desloc : -desloc), 26));
    } else res += c;
  }
  return res;
}

// ----------------- Cifra de Vigenère -----------------
function cifraVigenere(texto, chave, modo) {
  if (!chave || !/[a-zA-Z]/.test(chave)) return { error: 'Chave inválida para Vigenère (somente letras).' };
  let res = '';
  chave = chave.toLowerCase().replace(/[^a-z]/g, '');
  let j = 0;
  for (let c of texto) {
    if (/[a-z]/.test(c)) {
      let base = 97;
      let desloc = chave.charCodeAt(j % chave.length) - base;
      if (modo === 'decripto') desloc = -desloc;
      res += String.fromCharCode(base + mod(c.charCodeAt(0) - base + desloc, 26));
      j++;
    } else if (/[A-Z]/.test(c)) {
      let base = 65;
      let desloc = chave.charCodeAt(j % chave.length) - 97;
      if (modo === 'decripto') desloc = -desloc;
      res += String.fromCharCode(base + mod(c.charCodeAt(0) - base + desloc, 26));
      j++;
    } else res += c;
  }
  return res;
}

// ----------------- OTP (XOR por caractere) -----------------
function otp(texto, chave) {
  if (!chave) return { error: 'Chave necessária para OTP.' };
  if (chave.length !== texto.length) return { error: 'Chave deve ter o mesmo comprimento da mensagem.' };
  let out = '';
  for (let i=0;i<texto.length;i++){
    out += String.fromCharCode(texto.charCodeAt(i) ^ chave.charCodeAt(i));
  }
  return out;
}

// Para exibir bytes "não imprimíveis" quando necessário, para OTP use Base64 de/para
function toBase64(str) {
  // browser btoa works on binary strings -> ensure binary via Uint8Array -> binary string
  try {
    let bytes = new TextEncoder().encode(str);
    let bin = '';
    for (let b of bytes) bin += String.fromCharCode(b);
    return btoa(bin);
  } catch (e) { return null; }
}
function fromBase64(b64) {
  try {
    let bin = atob(b64);
    let bytes = new Uint8Array(bin.length);
    for (let i=0;i<bin.length;i++) bytes[i] = bin.charCodeAt(i);
    return new TextDecoder().decode(bytes);
  } catch (e) { return null; }
}

// ----------------- Cifra de Hill (2x2) -----------------
function multiplicarMatriz(vetor, matriz) {
  // vetor [v0,v1]; matriz [[a,b],[c,d]]; retorna [r0,r1]
  return [
    vetor[0] * matriz[0][0] + vetor[1] * matriz[1][0],
    vetor[0] * matriz[0][1] + vetor[1] * matriz[1][1]
  ];
}

function invMod(a, m) {
  a = mod(a, m);
  for (let x = 1; x < m; x++) if ((a * x) % m === 1) return x;
  return null;
}

function inversaMatriz2x2(matriz) {
  let det = matriz[0][0]*matriz[1][1] - matriz[0][1]*matriz[1][0];
  let invDet = invMod(det, 26);
  if (invDet === null) return null;
  return [
    [mod(matriz[1][1]*invDet,26), mod(-matriz[0][1]*invDet,26)],
    [mod(-matriz[1][0]*invDet,26), mod(matriz[0][0]*invDet,26)]
  ];
}

function cifraHill(texto, chave, modo) {
  let nums = chave.trim().split(/\s+/).map(Number);
  if (nums.length !== 4 || nums.some(isNaN)) return { error: "Chave inválida! Use formato: 'a b c d'."};
  let matriz = [[nums[0], nums[1]],[nums[2], nums[3]]];
  if (modo === 'decripto') {
    let inv = inversaMatriz2x2(matriz);
    if (!inv) return { error: 'Matriz da chave não é invertível mod 26.' };
    matriz = inv;
  }
  // limpar texto
  let plain = texto.toLowerCase().replace(/[^a-z]/g, '');
  if (plain.length % 2 !== 0) plain += 'x';
  let res = '';
  for (let i=0; i<plain.length; i+=2){
    let vetor = [plain.charCodeAt(i)-97, plain.charCodeAt(i+1)-97];
    let r = multiplicarMatriz(vetor, matriz);
    res += String.fromCharCode(mod(r[0],26)+97);
    res += String.fromCharCode(mod(r[1],26)+97);
  }
  return res;
}

// ----------------- AES-128 (ECB, PKCS#7) -----------------
/* Implementação de AES-128 em JS pura (educacional).
   NOTAS:
   - Chave é tratada como UTF-8 e padded/truncada para 16 bytes.
   - ECB usado apenas para simplicidade/demonstração.
   - Saída: Base64 do bloco cifrado (string).
*/

const AES = (function(){
  // S-box e inv S-box
  const sBox = [
    0x63,0x7c,0x77,0x7b,0xf2,0x6b,0x6f,0xc5,0x30,0x01,0x67,0x2b,0xfe,0xd7,0xab,0x76,
    0xca,0x82,0xc9,0x7d,0xfa,0x59,0x47,0xf0,0xad,0xd4,0xa2,0xaf,0x9c,0xa4,0x72,0xc0,
    0xb7,0xfd,0x93,0x26,0x36,0x3f,0xf7,0xcc,0x34,0xa5,0xe5,0xf1,0x71,0xd8,0x31,0x15,
    0x04,0xc7,0x23,0xc3,0x18,0x96,0x05,0x9a,0x07,0x12,0x80,0xe2,0xeb,0x27,0xb2,0x75,
    0x09,0x83,0x2c,0x1a,0x1b,0x6e,0x5a,0xa0,0x52,0x3b,0xd6,0xb3,0x29,0xe3,0x2f,0x84,
    0x53,0xd1,0x00,0xed,0x20,0xfc,0xb1,0x5b,0x6a,0xcb,0xbe,0x39,0x4a,0x4c,0x58,0xcf,
    0xd0,0xef,0xaa,0xfb,0x43,0x4d,0x33,0x85,0x45,0xf9,0x02,0x7f,0x50,0x3c,0x9f,0xa8,
    0x51,0xa3,0x40,0x8f,0x92,0x9d,0x38,0xf5,0xbc,0xb6,0xda,0x21,0x10,0xff,0xf3,0xd2,
    0xcd,0x0c,0x13,0xec,0x5f,0x97,0x44,0x17,0xc4,0xa7,0x7e,0x3d,0x64,0x5d,0x19,0x73,
    0x60,0x81,0x4f,0xdc,0x22,0x2a,0x90,0x88,0x46,0xee,0xb8,0x14,0xde,0x5e,0x0b,0xdb,
    0xe0,0x32,0x3a,0x0a,0x49,0x06,0x24,0x5c,0xc2,0xd3,0xac,0x62,0x91,0x95,0xe4,0x79,
    0xe7,0xc8,0x37,0x6d,0x8d,0xd5,0x4e,0xa9,0x6c,0x56,0xf4,0xea,0x65,0x7a,0xae,0x08,
    0xba,0x78,0x25,0x2e,0x1c,0xa6,0xb4,0xc6,0xe8,0xdd,0x74,0x1f,0x4b,0xbd,0x8b,0x8a,
    0x70,0x3e,0xb5,0x66,0x48,0x03,0xf6,0x0e,0x61,0x35,0x57,0xb9,0x86,0xc1,0x1d,0x9e,
    0xe1,0xf8,0x98,0x11,0x69,0xd9,0x8e,0x94,0x9b,0x1e,0x87,0xe9,0xce,0x55,0x28,0xdf,
    0x8c,0xa1,0x89,0x0d,0xbf,0xe6,0x42,0x68,0x41,0x99,0x2d,0x0f,0xb0,0x54,0xbb,0x16
  ];
  const invSBox = (function(){
    const a = new Array(256);
    for(let i=0;i<256;i++) a[sBox[i]] = i;
    return a;
  })();

  const Rcon = [0x00,0x01,0x02,0x04,0x08,0x10,0x20,0x40,0x80,0x1B,0x36];

  function subWord(w){
    return w.map(b => sBox[b]);
  }
  function rotWord(w){
    return w.slice(1).concat(w[0]);
  }

  function keyExpansion(keyBytes){
    // keyBytes: 16 bytes
    const Nk = 4, Nr = 10, Nb = 4;
    let w = new Array(Nb*(Nr+1));
    for(let i=0;i<Nk;i++){
      w[i] = [ keyBytes[4*i], keyBytes[4*i+1], keyBytes[4*i+2], keyBytes[4*i+3] ];
    }
    for(let i=Nk;i<Nb*(Nr+1);i++){
      let temp = w[i-1].slice();
      if(i % Nk === 0){
        temp = subWord(rotWord(temp));
        temp[0] ^= Rcon[i/Nk];
      }
      w[i] = [
        w[i-Nk][0] ^ temp[0],
        w[i-Nk][1] ^ temp[1],
        w[i-Nk][2] ^ temp[2],
        w[i-Nk][3] ^ temp[3]
      ];
    }
    return w; // array of 44 words (4 bytes each)
  }

  function addRoundKey(state, w, round){
    for(let c=0;c<4;c++){
      for(let r=0;r<4;r++){
        state[r][c] ^= w[round*4 + c][r];
      }
    }
  }

  function subBytes(state){
    for(let r=0;r<4;r++) for(let c=0;c<4;c++) state[r][c] = sBox[state[r][c]];
  }
  function invSubBytes(state){
    for(let r=0;r<4;r++) for(let c=0;c<4;c++) state[r][c] = invSBox[state[r][c]];
  }

  function shiftRows(state){
    // row r shifted left by r
    for(let r=1;r<4;r++){
      state[r] = state[r].slice(r).concat(state[r].slice(0,r));
    }
  }
  function invShiftRows(state){
    for(let r=1;r<4;r++){
      state[r] = state[r].slice(4-r).concat(state[r].slice(0,4-r));
    }
  }

  function xtime(a){ return ((a<<1) ^ ((a & 0x80) ? 0x1b : 0)) & 0xFF; }

  function mixColumns(state){
    for(let c=0;c<4;c++){
      let a = [], b = [];
      for(let r=0;r<4;r++) { a[r]=state[r][c]; b[r]=xtime(a[r]); }
      state[0][c] = b[0] ^ a[1] ^ b[1] ^ a[2] ^ a[3];
      state[1][c] = a[0] ^ b[1] ^ a[2] ^ b[2] ^ a[3];
      state[2][c] = a[0] ^ a[1] ^ b[2] ^ a[3] ^ b[3];
      state[3][c] = a[0] ^ b[0] ^ a[1] ^ a[2] ^ b[3];
      for(let r=0;r<4;r++) state[r][c] &= 0xFF;
    }
  }

  // multiplication helper for invMixColumns
  function mul(a,b){
    let res = 0;
    for(let i=0;i<8;i++){
      if(b & 1) res ^= a;
      let hi = a & 0x80;
      a = (a << 1) & 0xFF;
      if(hi) a ^= 0x1b;
      b >>= 1;
    }
    return res;
  }

  function invMixColumns(state){
    for(let c=0;c<4;c++){
      let a = [], res = [];
      for(let r=0;r<4;r++) a[r] = state[r][c];
      res[0] = mul(a[0],0x0e) ^ mul(a[1],0x0b) ^ mul(a[2],0x0d) ^ mul(a[3],0x09);
      res[1] = mul(a[0],0x09) ^ mul(a[1],0x0e) ^ mul(a[2],0x0b) ^ mul(a[3],0x0d);
      res[2] = mul(a[0],0x0d) ^ mul(a[1],0x09) ^ mul(a[2],0x0e) ^ mul(a[3],0x0b);
      res[3] = mul(a[0],0x0b) ^ mul(a[1],0x0d) ^ mul(a[2],0x09) ^ mul(a[3],0x0e);
      for(let r=0;r<4;r++) state[r][c] = res[r] & 0xFF;
    }
  }

  function blockToState(block){ // block: 16 bytes
    let state = [[],[],[],[]];
    // state[row][col] where block is column-major
    for(let i=0;i<16;i++){
      state[i%4][Math.floor(i/4)] = block[i];
    }
    return state;
  }
  function stateToBlock(state){
    let block = new Array(16);
    for(let c=0;c<4;c++) for(let r=0;r<4;r++) block[c*4 + r] = state[r][c];
    return block;
  }

  function cipher(input, w){
    // input: 16 bytes array
    let state = blockToState(input);
    addRoundKey(state, w, 0);
    for(let round=1; round<=9; round++){
      subBytes(state);
      shiftRows(state);
      mixColumns(state);
      addRoundKey(state, w, round);
    }
    subBytes(state);
    shiftRows(state);
    addRoundKey(state, w, 10);
    return stateToBlock(state);
  }

  function invCipher(input, w){
    let state = blockToState(input);
    addRoundKey(state, w, 10);
    invShiftRows(state);
    invSubBytes(state);
    for(let round=9; round>=1; round--){
      addRoundKey(state, w, round);
      invMixColumns(state);
      invShiftRows(state);
      invSubBytes(state);
    }
    addRoundKey(state, w, 0);
    return stateToBlock(state);
  }

  function pkcs7Pad(bytes){
    const pad = 16 - (bytes.length % 16);
    let out = new Uint8Array(bytes.length + pad);
    out.set(bytes);
    for(let i=bytes.length;i<out.length;i++) out[i] = pad;
    return out;
  }
  function pkcs7Unpad(bytes){
    if(bytes.length === 0 || bytes.length % 16 !== 0) return null;
    const pad = bytes[bytes.length - 1];
    if(pad <1 || pad >16) return null;
    for(let i=bytes.length-pad;i<bytes.length;i++) if(bytes[i] !== pad) return null;
    return bytes.slice(0, bytes.length - pad);
  }

  function aesEncryptECB(plaintextStr, keyStr){
    // keyStr -> 16 bytes (pad/truncate UTF-8)
    let encoder = new TextEncoder();
    let ptBytes = encoder.encode(plaintextStr);
    let keyBytes = encoder.encode(keyStr);
    // ensure 16 bytes key
    if (keyBytes.length < 16) {
      let tmp = new Uint8Array(16);
      tmp.set(keyBytes);
      keyBytes = tmp;
    } else if (keyBytes.length > 16) {
      keyBytes = keyBytes.slice(0,16);
    }
    // expand key
    let w = keyExpansion(Array.from(keyBytes));
    // pad plaintext
    let padded = pkcs7Pad(ptBytes);
    let out = new Uint8Array(padded.length);
    for(let i=0;i<padded.length;i+=16){
      let block = Array.from(padded.slice(i,i+16));
      let enc = cipher(block, w);
      out.set(enc, i);
    }
    // return Base64
    let binary = '';
    for(let i=0;i<out.length;i++) binary += String.fromCharCode(out[i]);
    return btoa(binary);
  }

  function aesDecryptECB(base64Str, keyStr){
    try {
      let binary = atob(base64Str);
      let bytes = new Uint8Array(binary.length);
      for(let i=0;i<binary.length;i++) bytes[i] = binary.charCodeAt(i);
      let encoder = new TextEncoder();
      let keyBytes = encoder.encode(keyStr);
      if (keyBytes.length < 16) {
        let tmp = new Uint8Array(16); tmp.set(keyBytes); keyBytes = tmp;
      } else if (keyBytes.length > 16) keyBytes = keyBytes.slice(0,16);
      let w = keyExpansion(Array.from(keyBytes));
      let out = new Uint8Array(bytes.length);
      for(let i=0;i<bytes.length;i+=16){
        let block = Array.from(bytes.slice(i,i+16));
        let dec = invCipher(block, w);
        out.set(dec, i);
      }
      let unp = pkcs7Unpad(out);
      if (!unp) return { error: 'Falha no padding ou dados inválidos.' };
      let decoder = new TextDecoder();
      return decoder.decode(unp);
    } catch(e){ return { error: 'Erro ao decodificar Base64 ou chave inválida.' }; }
  }

  return { encrypt: aesEncryptECB, decrypt: aesDecryptECB };
})();

// ----------------- UI: execução e validação -----------------
function executar(modo) {
  clearMessage();
  const alg = algoritmoSelect.value;
  const msg = mensagemInput.value;
  const chave = chaveInput.value;

  if (!msg) { showMessage('Digite uma mensagem.', 'error'); return; }

  try {
    let out;
    if (alg === 'cesar') {
      out = cifraCesar(msg, chave, modo === 'cripto' ? 'cripto' : 'decripto');
      resultadoArea.value = out;
      showMessage('Operação concluída.', 'success');
    } else if (alg === 'vigenere') {
      let r = cifraVigenere(msg, chave, modo === 'cripto' ? 'cripto' : 'decripto');
      if (r && r.error) { showMessage(r.error, 'error'); return; }
      resultadoArea.value = r;
      showMessage('Operação concluída.', 'success');
    } else if (alg === 'otp') {
      if (modo === 'cripto') {
        if (!chave) { showMessage('Chave necessária para OTP.', 'error'); return; }
        if (chave.length !== msg.length) { showMessage('Chave deve ter o mesmo comprimento da mensagem para OTP.', 'error'); return; }
        let res = otp(msg, chave);
        // saída binária -> base64 para leitura segura
        resultadoArea.value = toBase64(res);
        showMessage('Criptografado (resultado em Base64). Guarde a chave com segurança.', 'success');
      } else {
        // decriptar: espera Base64 no campo mensagem
        let decoded = fromBase64(msg);
        if (decoded === null) { showMessage('Entrada inválida Base64 para OTP decriptar.', 'error'); return; }
        if (!chave) { showMessage('Chave necessária para OTP.', 'error'); return; }
        if (chave.length !== decoded.length) { showMessage('Chave deve corresponder ao tamanho dos bytes cifrados.', 'error'); return; }
        let res = otp(decoded, chave); // otp é reversível (XOR)
        resultadoArea.value = res;
        showMessage('Decriptado com sucesso.', 'success');
      }
    } else if (alg === 'hill') {
      let r = cifraHill(msg, chave, modo === 'cripto' ? 'cripto' : 'decripto');
      if (r && r.error) { showMessage(r.error, 'error'); return; }
      resultadoArea.value = r;
      showMessage('Operação concluída.', 'success');
    } else if (alg === 'aes') {
      if (modo === 'cripto') {
        // output base64
        let key = chave || '';
        // pad key to 16 or truncate
        if (key.length < 16) {
          key = key.padEnd(16, '\0');
        } else if (key.length > 16) {
          key = key.slice(0,16);
        }
        let enc = AES.encrypt(msg, key);
        resultadoArea.value = enc;
        showMessage('AES: mensagem criptografada (Base64). Use a mesma chave para decriptar.', 'success');
      } else {
        // decriptar: expects base64 in mensagem
        let key = chave || '';
        if (key.length < 16) key = key.padEnd(16, '\0'); else if (key.length > 16) key = key.slice(0,16);
        let dec = AES.decrypt(msg, key);
        if (dec && dec.error) { showMessage(dec.error, 'error'); return; }
        resultadoArea.value = dec;
        showMessage('AES: decriptado com sucesso.', 'success');
      }
    } else {
      showMessage('Algoritmo não implementado.', 'error');
    }
  } catch (err) {
    console.error(err);
    showMessage('Erro durante a operação: ' + (err.message || err), 'error');
  }
}

criptBtn.addEventListener('click', () => executar('cripto'));
decriptBtn.addEventListener('click', () => executar('decripto'));
copiarBtn.addEventListener('click', () => {
  if (!resultadoArea.value) { showMessage('Nada para copiar.', 'error'); return; }
  resultadoArea.select();
  document.execCommand('copy');
  showMessage('Resultado copiado para a área de transferência.', 'success');
});

// Pequena melhoria: trocar placeholder e label quando muda algoritmo (feito via hint)

function mod(n, m) {
  return ((n % m) + m) % m;
}

// ---------- Cifra de César ----------
function cifraCesar(texto, chave, modo) {
  let desloc = parseInt(chave) || 3;
  let resultado = "";
  for (let c of texto) {
    if (/[a-z]/.test(c)) {
      let base = 'a'.charCodeAt(0);
      resultado += String.fromCharCode(base + mod(c.charCodeAt(0) - base + (modo === "cripto" ? desloc : -desloc), 26));
    } else if (/[A-Z]/.test(c)) {
      let base = 'A'.charCodeAt(0);
      resultado += String.fromCharCode(base + mod(c.charCodeAt(0) - base + (modo === "cripto" ? desloc : -desloc), 26));
    } else resultado += c;
  }
  return resultado;
}

// ---------- Cifra de Vigenère ----------
function cifraVigenere(texto, chave, modo) {
  if (!chave) return "Chave necessária!";
  let resultado = "";
  chave = chave.toLowerCase().replace(/[^a-z]/g, "");
  let j = 0;
  for (let c of texto) {
    if (/[a-z]/.test(c)) {
      let base = 'a'.charCodeAt(0);
      let desloc = chave.charCodeAt(j % chave.length) - base;
      if (modo === "decripto") desloc = -desloc;
      resultado += String.fromCharCode(base + mod(c.charCodeAt(0) - base + desloc, 26));
      j++;
    } else if (/[A-Z]/.test(c)) {
      let base = 'A'.charCodeAt(0);
      let desloc = chave.charCodeAt(j % chave.length) - 'a'.charCodeAt(0);
      if (modo === "decripto") desloc = -desloc;
      resultado += String.fromCharCode(base + mod(c.charCodeAt(0) - base + desloc, 26));
      j++;
    } else resultado += c;
  }
  return resultado;
}

// ---------- OTP (One-Time Pad) ----------
function otp(texto, chave, modo) {
  if (!chave) return "Chave necessária!";
  if (chave.length < texto.length) return "Chave deve ser do mesmo tamanho da mensagem!";
  let resultado = "";
  for (let i = 0; i < texto.length; i++) {
    resultado += String.fromCharCode(texto.charCodeAt(i) ^ chave.charCodeAt(i));
  }
  return resultado;
}

// ---------- Cifra de Hill ----------
function multiplicarMatriz(vetor, matriz) {
  return [
    vetor[0] * matriz[0][0] + vetor[1] * matriz[1][0],
    vetor[0] * matriz[0][1] + vetor[1] * matriz[1][1]
  ];
}

function inversaMatriz2x2(matriz) {
  let det = matriz[0][0]*matriz[1][1] - matriz[0][1]*matriz[1][0];
  let invDet = mod(det, 26);
  for (let i = 1; i < 26; i++) {
    if ((invDet * i) % 26 === 1) {
      invDet = i;
      break;
    }
  }
  return [
    [mod(matriz[1][1]*invDet,26), mod(-matriz[0][1]*invDet,26)],
    [mod(-matriz[1][0]*invDet,26), mod(matriz[0][0]*invDet,26)]
  ];
}

function cifraHill(texto, chave, modo) {
  // chave no formato "a b c d"
  let nums = chave.split(" ").map(Number);
  if (nums.length !== 4 || nums.some(isNaN)) return "Chave inválida! Use formato: 'a b c d'";
  let matriz = [[nums[0], nums[1]],[nums[2], nums[3]]];
  if (modo === "decripto") matriz = inversaMatriz2x2(matriz);

  texto = texto.toLowerCase().replace(/[^a-z]/g, "");
  if (texto.length % 2 !== 0) texto += "x";
  let resultado = "";

  for (let i = 0; i < texto.length; i += 2) {
    let vetor = [texto.charCodeAt(i) - 97, texto.charCodeAt(i+1) - 97];
    let r = multiplicarMatriz(vetor, matriz);
    resultado += String.fromCharCode(mod(r[0],26)+97);
    resultado += String.fromCharCode(mod(r[1],26)+97);
  }
  return resultado;
}

// ---------- Controle de Interface ----------
document.getElementById("criptografar").addEventListener("click", () => executar("cripto"));
document.getElementById("decriptografar").addEventListener("click", () => executar("decripto"));

function executar(modo) {
  const algoritmo = document.getElementById("algoritmo").value;
  const mensagem = document.getElementById("mensagem").value;
  const chave = document.getElementById("chave").value;
  let resultado = "";

  switch(algoritmo) {
    case "cesar": resultado = cifraCesar(mensagem, chave, modo); break;
    case "vigenere": resultado = cifraVigenere(mensagem, chave, modo); break;
    case "otp": resultado = otp(mensagem, chave, modo); break;
    case "hill": resultado = cifraHill(mensagem, chave, modo); break;
  }

  document.getElementById("resultado").value = resultado;
}

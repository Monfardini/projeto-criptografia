// AES simplificado educacional — criptografia de bloco único (16 bytes)

function strToBytes(str) {
  const encoder = new TextEncoder();
  return encoder.encode(str);
}

function bytesToStr(bytes) {
  const decoder = new TextDecoder();
  return decoder.decode(bytes);
}

// Funções para ajustar chave e texto
function padTo16(str) {
  while (str.length < 16) str += " ";
  return str.slice(0, 16);
}

function normalizeKey(key) {
  return padTo16(key);
}

// 🔐 Criptografia e Descriptografia usando Web Crypto (nativo, sem libs externas)
async function encryptAES() {
  const text = document.getElementById("aes-input").value;
  const keyText = document.getElementById("aes-key").value;
  const output = document.getElementById("aes-output");

  if (!text || !keyText) {
    output.value = "⚠️ Por favor, insira texto e chave.";
    output.style.color = "red";
    return;
  }

  try {
    const enc = new TextEncoder();
    const keyData = enc.encode(normalizeKey(keyText));

    const cryptoKey = await crypto.subtle.importKey(
      "raw",
      keyData,
      { name: "AES-CBC" },
      false,
      ["encrypt"]
    );

    // vetor de inicialização fixo (educacional, não use em produção)
    const iv = enc.encode("1234567890123456");
    const encrypted = await crypto.subtle.encrypt(
      { name: "AES-CBC", iv },
      cryptoKey,
      enc.encode(padTo16(text))
    );

    const base64 = btoa(String.fromCharCode(...new Uint8Array(encrypted)));
    output.value = base64;
    output.style.color = "green";
  } catch (e) {
    output.value = "Erro: " + e.message;
    output.style.color = "red";
  }
}

async function decryptAES() {
  const base64 = document.getElementById("aes-input").value;
  const keyText = document.getElementById("aes-key").value;
  const output = document.getElementById("aes-output");

  if (!base64 || !keyText) {
    output.value = "⚠️ Por favor, insira texto criptografado e chave.";
    output.style.color = "red";
    return;
  }

  try {
    const enc = new TextEncoder();
    const keyData = enc.encode(normalizeKey(keyText));

    const cryptoKey = await crypto.subtle.importKey(
      "raw",
      keyData,
      { name: "AES-CBC" },
      false,
      ["decrypt"]
    );

    const iv = enc.encode("1234567890123456");
    const encryptedBytes = Uint8Array.from(atob(base64), c => c.charCodeAt(0));

    const decrypted = await crypto.subtle.decrypt(
      { name: "AES-CBC", iv },
      cryptoKey,
      encryptedBytes
    );

    output.value = bytesToStr(new Uint8Array(decrypted)).trim();
    output.style.color = "green";
  } catch (e) {
    output.value = "❌ Falha na descriptografia: verifique a chave e o texto.";
    output.style.color = "red";
  }
}

function mod(a, m=26){ return ((a % m) + m) % m; }
function modInverse(a, m) {
  a = mod(a,m);
  for (let x=1;x<m;x++) if ((a*x)%m === 1) return x;
  return null;
}

document.getElementById('hill-enc').addEventListener('click', () => {
  let text = document.getElementById('hill-input').value.toUpperCase().replace(/[^A-Z]/g,'');
  const matrixStr = document.getElementById('hill-matrix').value;
  const out = document.getElementById('hill-output');

  let matrix;
  try { matrix = JSON.parse(matrixStr); } catch(e){ return out.textContent = 'Matriz inválida (JSON).'; }
  if (!Array.isArray(matrix) || matrix.length !== 2 || matrix.some(r=>!Array.isArray(r) || r.length!==2)) return out.textContent='Matriz deve ser 2x2.';

  if (text.length % 2 !== 0) text += 'X';
  let res = '';
  for (let i=0;i<text.length;i+=2) {
    const a = text.charCodeAt(i)-65, b = text.charCodeAt(i+1)-65;
    const c1 = mod(matrix[0][0]*a + matrix[0][1]*b);
    const c2 = mod(matrix[1][0]*a + matrix[1][1]*b);
    res += String.fromCharCode(c1+65) + String.fromCharCode(c2+65);
  }
  out.textContent = 'Criptografado: ' + res;
});

document.getElementById('hill-dec').addEventListener('click', () => {
  let text = document.getElementById('hill-input').value.toUpperCase().replace(/[^A-Z]/g,'');
  const matrixStr = document.getElementById('hill-matrix').value;
  const out = document.getElementById('hill-output');

  let matrix;
  try { matrix = JSON.parse(matrixStr); } catch(e){ return out.textContent = 'Matriz inválida (JSON).'; }
  if (!Array.isArray(matrix) || matrix.length !== 2 || matrix.some(r=>!Array.isArray(r) || r.length!==2)) return out.textContent='Matriz deve ser 2x2.';

  const det = mod(matrix[0][0]*matrix[1][1] - matrix[0][1]*matrix[1][0]);
  const invDet = modInverse(det,26);
  if (invDet === null) return out.textContent = 'Matriz não invertível mod 26.';
  const inv = [
    [ mod(matrix[1][1]*invDet), mod(-matrix[0][1]*invDet) ],
    [ mod(-matrix[1][0]*invDet), mod(matrix[0][0]*invDet) ]
  ];
  let res = '';
  for (let i=0;i<text.length;i+=2){
    const a = text.charCodeAt(i)-65, b = text.charCodeAt(i+1)-65;
    const p1 = mod(inv[0][0]*a + inv[0][1]*b);
    const p2 = mod(inv[1][0]*a + inv[1][1]*b);
    res += String.fromCharCode(p1+65) + String.fromCharCode(p2+65);
  }
  out.textContent = 'Decriptografado: ' + res;
});

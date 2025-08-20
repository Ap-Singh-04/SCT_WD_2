const exprEl = document.getElementById('expr');
const resEl = document.getElementById('res');
const keysEl = document.getElementById('keys');
const degBtn = document.getElementById('deg');
const radBtn = document.getElementById('rad');
const modeSwitchBtn = document.getElementById('modeSwitch');

let expr = '', mode = 'DEG', memory = 0;
let calcType = 'scientific'; // or 'standard'

// Button layouts
const simpleButtons = [
    '7','8','9','/',
    '4','5','6','*',
    '1','2','3','-',
    '0','.','=','+',
    'C','⌫','%'
];

const scientificButtons = [
  'MC','MR','M+','M-','(',')',
  'sin','cos','tan','√','^','C',
  '7','8','9','/','pi','⌫',
  '4','5','6','*','ln','log',
  '1','2','3','-','e','x!',
  '0','.','+','%','=',' '
];

// Load keypad layout
function loadKeys(layout) {
  keysEl.innerHTML = '';

  // Decide column count: 6 for scientific, 4 for simple
  const cols = (calcType === 'scientific') ? 6 : 4;
  keysEl.style.gridTemplateColumns = `repeat(${cols}, 1fr)`;

  layout.forEach(b => {
    const btn = document.createElement('button');
    btn.textContent = b;
    if (/^[a-z√^π%]+$/i.test(b)) btn.classList.add('fn');
    if (/^[/*+\-]$/.test(b)) btn.classList.add('op');
    if (b === 'C' || b === '⌫') btn.classList.add('danger');
    if (b === '=') btn.classList.add('equals');
    btn.onclick = () => handle(b);
    keysEl.appendChild(btn);
  });
}

// Handle button press
function handle(b) {
  if (b === 'C') { expr = ''; resEl.textContent = '0'; }
  else if (b === '⌫') { expr = expr.slice(0, -1); }
  else if (b === '=') { calc(); }
  else if (b === 'MC') { memory = 0; }
  else if (b === 'MR') { expr += memory; }
  else if (b === 'M+') { memory += Number(resEl.textContent) || 0; }
  else if (b === 'M-') { memory -= Number(resEl.textContent) || 0; }
  else { expr += mapSymbol(b); }
  exprEl.textContent = expr;
}

function mapSymbol(s) {
  return { pi: 'π', e: 'e', Ans: resEl.textContent }[s] || s;
}

// Calculate
function calc() {
  try {
    let val = expr
      .replace(/π/g, Math.PI)
      .replace(/√/g, 'Math.sqrt')
      .replace(/\^/g, '**')
      .replace(/ln/g, 'Math.log')
      .replace(/log/g, 'Math.log10')
      .replace(/(\d+)!/g, (_, n) => fact(parseInt(n))) 
      .replace(/(\d+(\.\d+)?)%/g, (_, num) => `(${num}/100)`)
      .replace(/sin/g, 'Math.sin')
      .replace(/cos/g, 'Math.cos')
      .replace(/tan/g, 'Math.tan');

    if (mode === 'DEG') {
      val = val.replace(/Math\.(sin|cos|tan)\((.*?)\)/g,
        (_, fn, arg) => `Math.${fn}((${arg})*Math.PI/180)`);
    }

    resEl.textContent = Function(`return ${val}`)();
  } catch {
    resEl.textContent = 'Error';
  }
}

// Factorial
function fact(n) { return n <= 1 ? 1 : n * fact(n - 1); }

// DEG/RAD toggle
degBtn.onclick = () => { mode = 'DEG'; degBtn.classList.add('active'); radBtn.classList.remove('active'); };
radBtn.onclick = () => { mode = 'RAD'; radBtn.classList.add('active'); degBtn.classList.remove('active'); };

// Mode switch
modeSwitchBtn.onclick = () => {
  calcType = calcType === 'scientific' ? 'Standard' : 'scientific';
  modeSwitchBtn.textContent = calcType === 'scientific' ? 'Scientific' : 'Standard';
  loadKeys(calcType === 'scientific' ? scientificButtons : simpleButtons);
};

// Initial load
loadKeys(scientificButtons);





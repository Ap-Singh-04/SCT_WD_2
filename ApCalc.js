const exprEl = document.getElementById('expr');
const resEl = document.getElementById('res');
const keysEl = document.getElementById('keys');
const degBtn = document.getElementById('deg');
const radBtn = document.getElementById('rad');
const modeSwitchBtn = document.getElementById('modeSwitch');

let expr = '', mode = 'DEG', memory = 0;
let calcType = 'scientific'; // or 'simple'

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
  '0','.','+','%','=','exp','mod'
];

// Load keypad layout
function loadKeys(layout) {
  keysEl.innerHTML = '';

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
    let exp = expr;

    // Replace constants
    exp = exp.replace(/π/g, Math.PI);
    exp = exp.replace(/\be\b/g, Math.E);

    // Factorial
    exp = exp.replace(/(\d+)!/g, (_, n) => fact(parseInt(n)));

    // Percent: convert "50%" → "(50/100)"
    exp = exp.replace(/(\d+(\.\d+)?)%/g, (_, num) => `(${num}/100)`);

    // Square root √(x) or √x
    exp = exp.replace(/√\((.*?)\)/g, (_, val) => `Math.sqrt(${val})`);
    exp = exp.replace(/√(\d+(\.\d+)?)/g, (_, num) => `Math.sqrt(${num})`);

    // Power ^
    exp = exp.replace(/(\d+(\.\d+)?)(\^)(\d+(\.\d+)?)/g, (_, base, __, ___, pow) => `Math.pow(${base},${pow})`);

    // Modulus: "a mod b" → "(a % b)"
    exp = exp.replace(/(\d+)\s*mod\s*(\d+)/g, (_, a, b) => `(${a} % ${b})`);

    // Exponential exp(x)
    exp = exp.replace(/\bexp\((.*?)\)/g, (_, val) => `Math.exp(${val})`);

    // Logarithms
    exp = exp.replace(/\blog\((.*?)\)/g, (_, val) => `Math.log10(${val})`);
    exp = exp.replace(/\bln\((.*?)\)/g, (_, val) => `Math.log(${val})`);

    // Trig functions
    exp = exp.replace(/\bsin\((.*?)\)/g, (_, val) => trig('sin', val));
    exp = exp.replace(/\bcos\((.*?)\)/g, (_, val) => trig('cos', val));
    exp = exp.replace(/\btan\((.*?)\)/g, (_, val) => trig('tan', val));

    // Evaluate safely
    const result = Function(`"use strict"; return (${exp})`)();
    resEl.textContent = result;
  } catch (err) {
    resEl.textContent = 'Error';
    console.error(err);
  }
}

// Factorial
function fact(n) {
  if (n < 0) return NaN;
  if (n === 0 || n === 1) return 1;
  return n * fact(n - 1);
}

// Handle trig in DEG or RAD
function trig(fn, val) {
  const num = parseFloat(val);
  if (isNaN(num)) return `Math.${fn}(0)`;
  if (mode === 'DEG') {
    return `Math.${fn}(${num} * Math.PI / 180)`;
  }
  return `Math.${fn}(${num})`;
}

// DEG/RAD toggle
degBtn.onclick = () => { mode = 'DEG'; degBtn.classList.add('active'); radBtn.classList.remove('active'); };
radBtn.onclick = () => { mode = 'RAD'; radBtn.classList.add('active'); degBtn.classList.remove('active'); };

// Mode switch
modeSwitchBtn.onclick = () => {
  calcType = calcType === 'scientific' ? 'simple' : 'scientific';
  modeSwitchBtn.textContent = calcType === 'scientific' ? 'Scientific' : 'Standard';
  loadKeys(calcType === 'scientific' ? scientificButtons : simpleButtons);
};

// Initial load
loadKeys(scientificButtons);

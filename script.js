/**
 * NeoCalc - Modern Glassmorphic Precision Calculator & Expandable Smart Converter
 * Full keyboard support, calculation history, audio synthesizer, and unit converters.
 */

// ========================================================
// CONVERSION DEFINITIONS
// ========================================================
const CONVERSION_DATA = {
    length: {
        name: "Length",
        base: "m",
        units: {
            m: { name: "Meters (m)", factor: 1 },
            km: { name: "Kilometers (km)", factor: 1000 },
            cm: { name: "Centimeters (cm)", factor: 0.01 },
            mm: { name: "Millimeters (mm)", factor: 0.001 },
            mi: { name: "Miles (mi)", factor: 1609.344 },
            yd: { name: "Yards (yd)", factor: 0.9144 },
            ft: { name: "Feet (ft)", factor: 0.3048 },
            in: { name: "Inches (in)", factor: 0.0254 }
        },
        defaultFrom: "km",
        defaultTo: "mi",
        presets: [
            { from: 1, fromU: "km", toU: "m" },
            { from: 1, fromU: "mi", toU: "km" },
            { from: 1, fromU: "m", toU: "ft" },
            { from: 1, fromU: "ft", toU: "in" }
        ]
    },
    weight: {
        name: "Mass / Weight",
        base: "kg",
        units: {
            kg: { name: "Kilograms (kg)", factor: 1 },
            g: { name: "Grams (g)", factor: 0.001 },
            mg: { name: "Milligrams (mg)", factor: 0.000001 },
            t: { name: "Metric Tons (t)", factor: 1000 },
            lb: { name: "Pounds (lbs)", factor: 0.45359237 },
            oz: { name: "Ounces (oz)", factor: 0.02834952 }
        },
        defaultFrom: "kg",
        defaultTo: "lb",
        presets: [
            { from: 1, fromU: "kg", toU: "lb" },
            { from: 1, fromU: "lb", toU: "oz" },
            { from: 1, fromU: "kg", toU: "g" },
            { from: 1, fromU: "t", toU: "kg" }
        ]
    },
    temperature: {
        name: "Temperature",
        special: true,
        units: {
            c: { name: "Celsius (°C)" },
            f: { name: "Fahrenheit (°F)" },
            k: { name: "Kelvin (K)" }
        },
        defaultFrom: "c",
        defaultTo: "f",
        presets: [
            { from: 0, fromU: "c", toU: "f" },
            { from: 100, fromU: "c", toU: "f" },
            { from: 72, fromU: "f", toU: "c" },
            { from: 273.15, fromU: "k", toU: "c" }
        ]
    },
    data: {
        name: "Digital Data",
        base: "b",
        units: {
            b: { name: "Bytes (B)", factor: 1 },
            kb: { name: "Kilobytes (KB)", factor: 1024 },
            mb: { name: "Megabytes (MB)", factor: 1024 * 1024 },
            gb: { name: "Gigabytes (GB)", factor: 1024 * 1024 * 1024 },
            tb: { name: "Terabytes (TB)", factor: 1024 * 1024 * 1024 * 1024 }
        },
        defaultFrom: "gb",
        defaultTo: "mb",
        presets: [
            { from: 1, fromU: "gb", toU: "mb" },
            { from: 1, fromU: "tb", toU: "gb" },
            { from: 1, fromU: "mb", toU: "kb" }
        ]
    },
    speed: {
        name: "Speed",
        base: "mps",
        units: {
            mps: { name: "Meters/sec (m/s)", factor: 1 },
            kmh: { name: "Kilometers/hour (km/h)", factor: 1 / 3.6 },
            mph: { name: "Miles/hour (mph)", factor: 0.44704 },
            knot: { name: "Knots (kn)", factor: 0.514444 }
        },
        defaultFrom: "kmh",
        defaultTo: "mph",
        presets: [
            { from: 100, fromU: "kmh", toU: "mph" },
            { from: 60, fromU: "mph", toU: "kmh" },
            { from: 10, fromU: "mps", toU: "kmh" }
        ]
    },
    time: {
        name: "Time",
        base: "s",
        units: {
            s: { name: "Seconds (s)", factor: 1 },
            min: { name: "Minutes (min)", factor: 60 },
            h: { name: "Hours (h)", factor: 3600 },
            d: { name: "Days (d)", factor: 86400 },
            wk: { name: "Weeks (wk)", factor: 604800 },
            yr: { name: "Years (yr)", factor: 31536000 }
        },
        defaultFrom: "h",
        defaultTo: "min",
        presets: [
            { from: 1, fromU: "h", toU: "min" },
            { from: 1, fromU: "d", toU: "h" },
            { from: 1, fromU: "yr", toU: "d" }
        ]
    }
};

// ========================================================
// SMART CONVERTER ENGINE
// ========================================================
class SmartConverter {
    constructor(calculatorInstance) {
        this.calc = calculatorInstance;
        this.currentCategory = 'length';
        this.fromUnit = CONVERSION_DATA.length.defaultFrom;
        this.toUnit = CONVERSION_DATA.length.defaultTo;

        // Elements
        this.categoryPills = document.getElementById('categoryPills');
        this.fromValueInput = document.getElementById('fromValueInput');
        this.toValueInput = document.getElementById('toValueInput');
        this.fromUnitSelect = document.getElementById('fromUnitSelect');
        this.toUnitSelect = document.getElementById('toUnitSelect');
        this.swapUnitsBtn = document.getElementById('swapUnitsBtn');
        this.insightFormula = document.getElementById('insightFormula');
        this.presetsGrid = document.getElementById('presetsGrid');
        this.sendToCalcBtn = document.getElementById('sendToCalcBtn');

        this.init();
    }

    init() {
        this.populateDropdowns();
        this.renderPresets();
        this.setupEvents();
        this.convert('from');
    }

    setupEvents() {
        // Category switching
        this.categoryPills.addEventListener('click', (e) => {
            const pill = e.target.closest('.pill');
            if (!pill) return;
            const cat = pill.dataset.category;
            if (cat && cat !== this.currentCategory) {
                this.setCategory(cat);
                this.calc.playSound(550, 'sine', 0.03);
            }
        });

        // Value inputs
        this.fromValueInput.addEventListener('input', () => this.convert('from'));
        this.toValueInput.addEventListener('input', () => this.convert('to'));

        // Unit changes
        this.fromUnitSelect.addEventListener('change', () => {
            this.fromUnit = this.fromUnitSelect.value;
            this.convert('from');
            this.calc.playSound(480, 'sine', 0.02);
        });

        this.toUnitSelect.addEventListener('change', () => {
            this.toUnit = this.toUnitSelect.value;
            this.convert('from');
            this.calc.playSound(480, 'sine', 0.02);
        });

        // Swap button
        this.swapUnitsBtn.addEventListener('click', () => {
            this.swapUnits();
            this.calc.playSound(620, 'triangle', 0.04);
        });

        // Send to Calc button
        this.sendToCalcBtn.addEventListener('click', () => {
            const val = this.toValueInput.value;
            if (val && !isNaN(val)) {
                this.calc.currentInput = val.toString();
                this.calc.shouldResetInput = true;
                this.calc.updateDisplay();
                this.calc.showToast('Imported ' + val + ' into Calculator');
                this.calc.playSound(750, 'sine', 0.06);
            }
        });
    }

    setCategory(catKey) {
        this.currentCategory = catKey;
        const catData = CONVERSION_DATA[catKey];
        this.fromUnit = catData.defaultFrom;
        this.toUnit = catData.defaultTo;

        // Update active pill
        this.categoryPills.querySelectorAll('.pill').forEach(p => {
            p.classList.toggle('active', p.dataset.category === catKey);
        });

        this.populateDropdowns();
        this.renderPresets();
        this.convert('from');
    }

    populateDropdowns() {
        const catData = CONVERSION_DATA[this.currentCategory];
        const units = catData.units;

        const optionsHtml = Object.entries(units).map(([key, u]) => 
            '<option value="' + key + '">' + u.name + '</option>'
        ).join('');

        this.fromUnitSelect.innerHTML = optionsHtml;
        this.toUnitSelect.innerHTML = optionsHtml;

        this.fromUnitSelect.value = this.fromUnit;
        this.toUnitSelect.value = this.toUnit;
    }

    renderPresets() {
        const catData = CONVERSION_DATA[this.currentCategory];
        if (!catData.presets || catData.presets.length === 0) {
            this.presetsGrid.innerHTML = '';
            return;
        }

        this.presetsGrid.innerHTML = catData.presets.map(p => {
            return '<button type="button" class="preset-chip" data-from="' + p.from + '" data-fromu="' + p.fromU + '" data-tou="' + p.toU + '">' +
                p.from + ' ' + p.fromU + ' → ' + p.toU +
            '</button>';
        }).join('');

        this.presetsGrid.querySelectorAll('.preset-chip').forEach(chip => {
            chip.addEventListener('click', () => {
                this.fromValueInput.value = chip.dataset.from;
                this.fromUnit = chip.dataset.fromu;
                this.toUnit = chip.dataset.tou;
                this.fromUnitSelect.value = this.fromUnit;
                this.toUnitSelect.value = this.toUnit;
                this.convert('from');
                this.calc.playSound(500, 'sine', 0.03);
            });
        });
    }

    swapUnits() {
        const tempUnit = this.fromUnit;
        this.fromUnit = this.toUnit;
        this.toUnit = tempUnit;

        this.fromUnitSelect.value = this.fromUnit;
        this.toUnitSelect.value = this.toUnit;

        const tempVal = this.fromValueInput.value;
        this.fromValueInput.value = this.toValueInput.value;
        this.toValueInput.value = tempVal;

        this.convert('from');
    }

    convert(direction = 'from') {
        const catData = CONVERSION_DATA[this.currentCategory];
        const fromU = this.fromUnit;
        const toU = this.toUnit;

        let inputVal = parseFloat(direction === 'from' ? this.fromValueInput.value : this.toValueInput.value);

        if (isNaN(inputVal)) {
            if (direction === 'from') this.toValueInput.value = '';
            else this.fromValueInput.value = '';
            return;
        }

        let result = 0;

        if (catData.special && this.currentCategory === 'temperature') {
            if (direction === 'from') {
                result = this.convertTemperature(inputVal, fromU, toU);
                this.toValueInput.value = this.formatNumber(result);
            } else {
                result = this.convertTemperature(inputVal, toU, fromU);
                this.fromValueInput.value = this.formatNumber(result);
            }
        } else {
            const fromFactor = catData.units[fromU].factor;
            const toFactor = catData.units[toU].factor;

            if (direction === 'from') {
                const baseVal = inputVal * fromFactor;
                result = baseVal / toFactor;
                this.toValueInput.value = this.formatNumber(result);
            } else {
                const baseVal = inputVal * toFactor;
                result = baseVal / fromFactor;
                this.fromValueInput.value = this.formatNumber(result);
            }
        }

        this.updateFormulaInsight();
    }

    convertTemperature(val, from, to) {
        if (from === to) return val;
        let c = val;
        if (from === 'f') c = (val - 32) * (5 / 9);
        else if (from === 'k') c = val - 273.15;

        if (to === 'c') return c;
        if (to === 'f') return (c * 9 / 5) + 32;
        if (to === 'k') return c + 273.15;
        return c;
    }

    formatNumber(num) {
        if (!isFinite(num)) return '0';
        return parseFloat(Number(num).toPrecision(8)).toString();
    }

    updateFormulaInsight() {
        const catData = CONVERSION_DATA[this.currentCategory];
        const fromName = catData.units[this.fromUnit].name;
        const toName = catData.units[this.toUnit].name;

        if (this.currentCategory === 'temperature') {
            if (this.fromUnit === 'c' && this.toUnit === 'f') {
                this.insightFormula.textContent = "(°C × 9/5) + 32 = °F";
            } else if (this.fromUnit === 'f' && this.toUnit === 'c') {
                this.insightFormula.textContent = "(°F − 32) × 5/9 = °C";
            } else {
                this.insightFormula.textContent = fromName + ' ⇄ ' + toName;
            }
        } else {
            const singleFromBase = catData.units[this.fromUnit].factor;
            const singleToBase = catData.units[this.toUnit].factor;
            const ratio = this.formatNumber(singleFromBase / singleToBase);
            this.insightFormula.textContent = '1 ' + this.fromUnit + ' = ' + ratio + ' ' + this.toUnit;
        }
    }
}

// ========================================================
// MAIN CALCULATOR ENGINE
// ========================================================
class NeoCalculator {
    constructor() {
        // UI Elements
        this.appContainer = document.getElementById('appContainer');
        this.currentValueEl = document.getElementById('currentValueDisplay');
        this.expressionEl = document.getElementById('expressionDisplay');
        this.operatorIndicatorEl = document.getElementById('operatorIndicator');
        this.displayArea = document.getElementById('displayArea');
        this.copyHint = document.getElementById('copyHint');
        this.themeToggleBtn = document.getElementById('themeToggleBtn');
        this.soundToggleBtn = document.getElementById('soundToggleBtn');
        this.historyToggleBtn = document.getElementById('historyToggleBtn');
        this.historyDrawer = document.getElementById('historyDrawer');
        this.closeHistoryBtn = document.getElementById('closeHistoryBtn');
        this.clearHistoryBtn = document.getElementById('clearHistoryBtn');
        this.historyList = document.getElementById('historyList');
        this.keypad = document.getElementById('keypad');
        this.toast = document.getElementById('toast');

        // Mode buttons
        this.modeCalcBtn = document.getElementById('modeCalcBtn');
        this.modeConverterBtn = document.getElementById('modeConverterBtn');
        this.modeSplitBtn = document.getElementById('modeSplitBtn');

        // State variables
        this.currentInput = '0';
        this.previousInput = '';
        this.activeOperator = null;
        this.shouldResetInput = false;
        this.openParensCount = 0;
        this.soundEnabled = true;
        this.history = [];
        this.currentMode = 'calc';

        // Audio Context
        this.audioCtx = null;

        this.init();
    }

    init() {
        this.loadSettings();
        this.setupEventListeners();
        this.setupModeSwitcher();
        this.updateDisplay();
        this.renderHistory();

        // Instantiate Smart Converter
        this.converter = new SmartConverter(this);
    }

    /* ----------------------------------------------------
       Theme & Sound Storage
    ---------------------------------------------------- */
    loadSettings() {
        const savedTheme = localStorage.getItem('neocalc_theme');
        if (savedTheme === 'light') {
            document.body.classList.add('light-theme');
            this.updateThemeIcons(true);
        }

        const savedSound = localStorage.getItem('neocalc_sound');
        if (savedSound !== null) {
            this.soundEnabled = savedSound === 'true';
            this.updateSoundIcons(this.soundEnabled);
        }

        const savedMode = localStorage.getItem('neocalc_mode');
        if (savedMode && ['calc', 'converter', 'split'].includes(savedMode)) {
            this.setMode(savedMode);
        }

        const savedHistory = localStorage.getItem('neocalc_history');
        if (savedHistory) {
            try {
                this.history = JSON.parse(savedHistory);
            } catch (e) {
                this.history = [];
            }
        }
    }

    setupModeSwitcher() {
        this.modeCalcBtn.addEventListener('click', () => this.setMode('calc'));
        this.modeConverterBtn.addEventListener('click', () => this.setMode('converter'));
        this.modeSplitBtn.addEventListener('click', () => this.setMode('split'));
    }

    setMode(mode) {
        this.currentMode = mode;
        localStorage.setItem('neocalc_mode', mode);

        this.appContainer.classList.remove('mode-calc', 'mode-converter', 'mode-split');
        this.appContainer.classList.add('mode-' + mode);

        this.modeCalcBtn.classList.toggle('active', mode === 'calc');
        this.modeConverterBtn.classList.toggle('active', mode === 'converter');
        this.modeSplitBtn.classList.toggle('active', mode === 'split');

        this.playSound(600, 'sine', 0.04);
    }

    updateThemeIcons(isLight) {
        const sun = this.themeToggleBtn.querySelector('.sun-icon');
        const moon = this.themeToggleBtn.querySelector('.moon-icon');
        if (isLight) {
            sun.classList.add('hidden');
            moon.classList.remove('hidden');
        } else {
            sun.classList.remove('hidden');
            moon.classList.add('hidden');
        }
    }

    toggleTheme() {
        const isLight = document.body.classList.toggle('light-theme');
        localStorage.setItem('neocalc_theme', isLight ? 'light' : 'dark');
        this.updateThemeIcons(isLight);
        this.playSound(600, 'sine', 0.05);
    }

    updateSoundIcons(enabled) {
        const soundOn = this.soundToggleBtn.querySelector('.sound-on-icon');
        const soundOff = this.soundToggleBtn.querySelector('.sound-off-icon');
        if (enabled) {
            soundOn.classList.remove('hidden');
            soundOff.classList.add('hidden');
        } else {
            soundOn.classList.add('hidden');
            soundOff.classList.remove('hidden');
        }
    }

    toggleSound() {
        this.soundEnabled = !this.soundEnabled;
        localStorage.setItem('neocalc_sound', this.soundEnabled);
        this.updateSoundIcons(this.soundEnabled);
        this.showToast(this.soundEnabled ? 'Audio feedback enabled' : 'Audio muted');
        if (this.soundEnabled) {
            this.playSound(700, 'sine', 0.08);
        }
    }

    /* ----------------------------------------------------
       Web Audio API Synthesizer Feedback
    ---------------------------------------------------- */
    playSound(frequency = 440, type = 'sine', duration = 0.04) {
        if (!this.soundEnabled) return;
        try {
            if (!this.audioCtx) {
                const AudioContextClass = window.AudioContext || window.webkitAudioContext;
                if (AudioContextClass) this.audioCtx = new AudioContextClass();
            }
            if (this.audioCtx && this.audioCtx.state === 'suspended') {
                this.audioCtx.resume();
            }
            if (!this.audioCtx) return;

            const osc = this.audioCtx.createOscillator();
            const gain = this.audioCtx.createGain();

            osc.type = type;
            osc.frequency.setValueAtTime(frequency, this.audioCtx.currentTime);

            gain.gain.setValueAtTime(0.08, this.audioCtx.currentTime);
            gain.gain.exponentialRampToValueAtTime(0.0001, this.audioCtx.currentTime + duration);

            osc.connect(gain);
            gain.connect(this.audioCtx.destination);

            osc.start();
            osc.stop(this.audioCtx.currentTime + duration);
        } catch (e) {
            // Audio unavailable
        }
    }

    /* ----------------------------------------------------
       Event Listeners
    ---------------------------------------------------- */
    setupEventListeners() {
        this.themeToggleBtn.addEventListener('click', () => this.toggleTheme());
        this.soundToggleBtn.addEventListener('click', () => this.toggleSound());
        this.historyToggleBtn.addEventListener('click', () => this.openHistory());
        this.closeHistoryBtn.addEventListener('click', () => this.closeHistory());
        this.clearHistoryBtn.addEventListener('click', () => this.clearHistory());
        this.displayArea.addEventListener('click', () => this.copyToClipboard());

        this.keypad.addEventListener('click', (e) => {
            const btn = e.target.closest('button');
            if (!btn) return;

            if (btn.dataset.number !== undefined) {
                this.handleNumber(btn.dataset.number);
                this.playSound(450, 'sine', 0.03);
            } else if (btn.dataset.operator !== undefined) {
                this.handleOperator(btn.dataset.operator);
                this.playSound(550, 'triangle', 0.04);
            } else if (btn.dataset.action !== undefined) {
                this.handleAction(btn.dataset.action);
            }
        });

        window.addEventListener('keydown', (e) => this.handleKeyboard(e));
    }

    handleKeyboard(e) {
        if (e.target.tagName === 'INPUT' || e.target.tagName === 'SELECT') return;
        if (e.repeat) return;

        if (/^[0-9]$/.test(e.key)) {
            this.animateButton('btn-' + e.key);
            this.handleNumber(e.key);
            this.playSound(450, 'sine', 0.03);
            return;
        }

        if (e.key === '+') {
            this.animateButton('btn-add');
            this.handleOperator('+');
            this.playSound(550, 'triangle', 0.04);
        } else if (e.key === '-') {
            this.animateButton('btn-subtract');
            this.handleOperator('-');
            this.playSound(550, 'triangle', 0.04);
        } else if (e.key === '*' || e.key === 'x' || e.key === 'X') {
            this.animateButton('btn-multiply');
            this.handleOperator('×');
            this.playSound(550, 'triangle', 0.04);
        } else if (e.key === '/') {
            e.preventDefault();
            this.animateButton('btn-divide');
            this.handleOperator('÷');
            this.playSound(550, 'triangle', 0.04);
        } else if (e.key === '%') {
            this.animateButton('btn-percent');
            this.handleAction('percent');
        } else if (e.key === '.' || e.key === ',') {
            this.animateButton('btn-decimal');
            this.handleAction('decimal');
        } else if (e.key === 'Enter' || e.key === '=') {
            e.preventDefault();
            this.animateButton('btn-equals');
            this.handleAction('equals');
        } else if (e.key === 'Backspace') {
            this.animateButton('btn-backspace');
            this.handleAction('backspace');
        } else if (e.key === 'Escape') {
            this.animateButton('btn-clear');
            this.handleAction('clear');
        } else if (e.key === '(' || e.key === ')') {
            this.animateButton('btn-parens');
            this.handleAction('parentheses');
        }
    }

    animateButton(buttonId) {
        const btn = document.getElementById(buttonId);
        if (btn) {
            btn.classList.add('active');
            btn.style.transform = 'scale(0.92)';
            setTimeout(() => {
                btn.style.transform = '';
                btn.classList.remove('active');
            }, 120);
        }
    }

    /* ----------------------------------------------------
       Calculator Core Logic
    ---------------------------------------------------- */
    handleNumber(num) {
        if (this.currentInput === '0' || this.shouldResetInput) {
            this.currentInput = num;
            this.shouldResetInput = false;
        } else {
            if (this.currentInput.length >= 15) return;
            this.currentInput += num;
        }
        this.updateDisplay();
    }

    handleOperator(op) {
        if (this.activeOperator && !this.shouldResetInput) {
            this.calculate(false);
        }

        this.previousInput = this.currentInput;
        this.activeOperator = op;
        this.shouldResetInput = true;
        this.updateDisplay();
    }

    handleAction(action) {
        switch (action) {
            case 'clear':
                this.clearAll();
                this.playSound(350, 'sawtooth', 0.05);
                break;
            case 'backspace':
                this.backspace();
                this.playSound(400, 'square', 0.03);
                break;
            case 'decimal':
                this.addDecimal();
                this.playSound(480, 'sine', 0.03);
                break;
            case 'negate':
                this.toggleSign();
                this.playSound(500, 'sine', 0.03);
                break;
            case 'percent':
                this.calculatePercent();
                this.playSound(550, 'triangle', 0.04);
                break;
            case 'sqrt':
                this.calculateSqrt();
                this.playSound(620, 'triangle', 0.05);
                break;
            case 'power':
                this.calculatePower();
                this.playSound(640, 'triangle', 0.05);
                break;
            case 'parentheses':
                this.handleParentheses();
                this.playSound(520, 'sine', 0.03);
                break;
            case 'equals':
                this.calculate(true);
                this.playSound(750, 'sine', 0.08);
                break;
        }
    }

    clearAll() {
        this.currentInput = '0';
        this.previousInput = '';
        this.activeOperator = null;
        this.shouldResetInput = false;
        this.openParensCount = 0;
        this.updateDisplay();
    }

    backspace() {
        if (this.shouldResetInput) return;
        if (this.currentInput.length === 1 || (this.currentInput.length === 2 && this.currentInput.startsWith('-'))) {
            this.currentInput = '0';
        } else {
            this.currentInput = this.currentInput.slice(0, -1);
        }
        this.updateDisplay();
    }

    addDecimal() {
        if (this.shouldResetInput) {
            this.currentInput = '0.';
            this.shouldResetInput = false;
        } else if (!this.currentInput.includes('.')) {
            this.currentInput += '.';
        }
        this.updateDisplay();
    }

    toggleSign() {
        if (this.currentInput === '0') return;
        if (this.currentInput.startsWith('-')) {
            this.currentInput = this.currentInput.slice(1);
        } else {
            this.currentInput = '-' + this.currentInput;
        }
        this.updateDisplay();
    }

    calculatePercent() {
        const val = parseFloat(this.currentInput);
        if (isNaN(val)) return;
        const res = this.formatPrecision(val / 100);
        this.currentInput = res.toString();
        this.updateDisplay();
    }

    calculateSqrt() {
        const val = parseFloat(this.currentInput);
        if (isNaN(val)) return;
        if (val < 0) {
            this.showToast('Invalid input for square root');
            return;
        }
        const expr = '√(' + this.currentInput + ')';
        const res = this.formatPrecision(Math.sqrt(val));
        this.saveHistory(expr, res);
        this.currentInput = res.toString();
        this.shouldResetInput = true;
        this.updateDisplay();
    }

    calculatePower() {
        const val = parseFloat(this.currentInput);
        if (isNaN(val)) return;
        const expr = 'sqr(' + this.currentInput + ')';
        const res = this.formatPrecision(Math.pow(val, 2));
        this.saveHistory(expr, res);
        this.currentInput = res.toString();
        this.shouldResetInput = true;
        this.updateDisplay();
    }

    handleParentheses() {
        if (this.currentInput === '0' || this.shouldResetInput) {
            this.currentInput = '(';
            this.openParensCount++;
            this.shouldResetInput = false;
        } else if (this.openParensCount > 0) {
            this.currentInput += ')';
            this.openParensCount--;
        } else {
            this.currentInput += ' × (';
            this.openParensCount++;
        }
        this.updateDisplay();
    }

    calculate(isFinal = true) {
        if (!this.activeOperator || this.previousInput === '') return;

        const prev = parseFloat(this.previousInput);
        const curr = parseFloat(this.currentInput);
        if (isNaN(prev) || isNaN(curr)) return;

        let result = 0;
        const expression = this.previousInput + ' ' + this.activeOperator + ' ' + this.currentInput;

        switch (this.activeOperator) {
            case '+':
                result = prev + curr;
                break;
            case '-':
                result = prev - curr;
                break;
            case '×':
                result = prev * curr;
                break;
            case '÷':
                if (curr === 0) {
                    this.showToast('Cannot divide by zero');
                    this.currentInput = 'Error';
                    this.activeOperator = null;
                    this.previousInput = '';
                    this.shouldResetInput = true;
                    this.updateDisplay();
                    return;
                }
                result = prev / curr;
                break;
        }

        result = this.formatPrecision(result);

        if (isFinal) {
            this.saveHistory(expression, result);
            this.previousInput = '';
            this.activeOperator = null;
        } else {
            this.previousInput = result.toString();
        }

        this.currentInput = result.toString();
        this.shouldResetInput = true;
        this.updateDisplay();
    }

    formatPrecision(num) {
        if (!isFinite(num)) return 'Error';
        return parseFloat(Number(num).toPrecision(12));
    }

    /* ----------------------------------------------------
       Display & Scaling
    ---------------------------------------------------- */
    updateDisplay() {
        this.currentValueEl.textContent = this.formatNumberDisplay(this.currentInput);

        if (this.activeOperator && this.previousInput !== '') {
            this.expressionEl.textContent = this.formatNumberDisplay(this.previousInput) + ' ' + this.activeOperator;
            this.operatorIndicatorEl.textContent = this.activeOperator;
        } else {
            this.expressionEl.textContent = '';
            this.operatorIndicatorEl.textContent = '';
        }

        const len = this.currentInput.length;
        if (len > 12) {
            this.currentValueEl.style.fontSize = '1.6rem';
        } else if (len > 8) {
            this.currentValueEl.style.fontSize = '2.1rem';
        } else {
            this.currentValueEl.style.fontSize = '2.5rem';
        }
    }

    formatNumberDisplay(str) {
        if (str === 'Error') return 'Error';
        if (str.includes('(') || str.includes(')')) return str;
        const parts = str.split('.');
        parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ',');
        return parts.join('.');
    }

    /* ----------------------------------------------------
       Clipboard & Toast
    ---------------------------------------------------- */
    copyToClipboard() {
        if (this.currentInput === 'Error') return;
        const textToCopy = this.currentInput;
        navigator.clipboard.writeText(textToCopy).then(() => {
            this.copyHint.classList.add('show');
            setTimeout(() => this.copyHint.classList.remove('show'), 1500);
            this.playSound(800, 'sine', 0.05);
        }).catch(() => {
            this.showToast('Unable to copy');
        });
    }

    showToast(message) {
        this.toast.textContent = message;
        this.toast.classList.add('show');
        setTimeout(() => {
            this.toast.classList.remove('show');
        }, 2400);
    }

    /* ----------------------------------------------------
       History Drawer
    ---------------------------------------------------- */
    openHistory() {
        this.historyDrawer.classList.add('active');
        this.historyDrawer.setAttribute('aria-hidden', 'false');
    }

    closeHistory() {
        this.historyDrawer.classList.remove('active');
        this.historyDrawer.setAttribute('aria-hidden', 'true');
    }

    saveHistory(expression, result) {
        this.history.unshift({
            id: Date.now(),
            expression: expression,
            result: result.toString(),
            time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        });

        if (this.history.length > 25) {
            this.history.pop();
        }

        localStorage.setItem('neocalc_history', JSON.stringify(this.history));
        this.renderHistory();
    }

    renderHistory() {
        if (this.history.length === 0) {
            this.historyList.innerHTML = '<div class="empty-history"><p>No calculations yet</p><small>Your past math results will appear here automatically.</small></div>';
            return;
        }

        this.historyList.innerHTML = this.history.map(item => 
            '<div class="history-item" data-res="' + item.result + '" tabindex="0" title="Click to use this result">' +
                '<span class="history-expr">' + item.expression + ' =</span>' +
                '<span class="history-res">' + this.formatNumberDisplay(item.result) + '</span>' +
            '</div>'
        ).join('');

        this.historyList.querySelectorAll('.history-item').forEach(item => {
            item.addEventListener('click', () => {
                this.currentInput = item.dataset.res;
                this.shouldResetInput = true;
                this.updateDisplay();
                this.closeHistory();
                this.playSound(600, 'sine', 0.04);
            });
        });
    }

    clearHistory() {
        this.history = [];
        localStorage.removeItem('neocalc_history');
        this.renderHistory();
        this.showToast('History cleared');
        this.playSound(350, 'sawtooth', 0.04);
    }
}

// Instantiate on DOMContentLoaded
document.addEventListener('DOMContentLoaded', () => {
    window.calcApp = new NeoCalculator();
});

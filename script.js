/**
 * NeoCalc - Modern Glassmorphic Precision Calculator
 * Full keyboard support, calculation history, audio synthesizer, and themes.
 */

class NeoCalculator {
    constructor() {
        // UI Elements
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

        // State variables
        this.currentInput = '0';
        this.previousInput = '';
        this.activeOperator = null;
        this.shouldResetInput = false;
        this.openParensCount = 0;
        this.soundEnabled = true;
        this.history = [];

        // Audio Context
        this.audioCtx = null;

        this.init();
    }

    init() {
        this.loadSettings();
        this.setupEventListeners();
        this.updateDisplay();
        this.renderHistory();
    }

    /* ----------------------------------------------------
       Theme & Sound Storage
    ---------------------------------------------------- */
    loadSettings() {
        // Theme
        const savedTheme = localStorage.getItem('neocalc_theme');
        if (savedTheme === 'light') {
            document.body.classList.add('light-theme');
            this.updateThemeIcons(true);
        }

        // Sound
        const savedSound = localStorage.getItem('neocalc_sound');
        if (savedSound !== null) {
            this.soundEnabled = savedSound === 'true';
            this.updateSoundIcons(this.soundEnabled);
        }

        // History
        const savedHistory = localStorage.getItem('neocalc_history');
        if (savedHistory) {
            try {
                this.history = JSON.parse(savedHistory);
            } catch (e) {
                this.history = [];
            }
        }
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
            // Audio not allowed or unavailable
        }
    }

    /* ----------------------------------------------------
       Event Listeners
    ---------------------------------------------------- */
    setupEventListeners() {
        // Theme toggle
        this.themeToggleBtn.addEventListener('click', () => this.toggleTheme());

        // Sound toggle
        this.soundToggleBtn.addEventListener('click', () => this.toggleSound());

        // History Drawer toggles
        this.historyToggleBtn.addEventListener('click', () => this.openHistory());
        this.closeHistoryBtn.addEventListener('click', () => this.closeHistory());
        this.clearHistoryBtn.addEventListener('click', () => this.clearHistory());

        // Copy on display click
        this.displayArea.addEventListener('click', () => this.copyToClipboard());

        // Keypad clicks
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

        // Physical Keyboard Support
        window.addEventListener('keydown', (e) => this.handleKeyboard(e));
    }

    handleKeyboard(e) {
        if (e.repeat) return;

        // Numbers 0-9
        if (/^[0-9]$/.test(e.key)) {
            this.animateButton(`btn-${e.key}`);
            this.handleNumber(e.key);
            this.playSound(450, 'sine', 0.03);
            return;
        }

        // Operators
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
        const expr = `√(${this.currentInput})`;
        const res = this.formatPrecision(Math.sqrt(val));
        this.saveHistory(expr, res);
        this.currentInput = res.toString();
        this.shouldResetInput = true;
        this.updateDisplay();
    }

    calculatePower() {
        const val = parseFloat(this.currentInput);
        if (isNaN(val)) return;
        const expr = `sqr(${this.currentInput})`;
        const res = this.formatPrecision(Math.pow(val, 2));
        this.saveHistory(expr, res);
        this.currentInput = res.toString();
        this.shouldResetInput = true;
        this.updateDisplay();
    }

    handleParentheses() {
        // Simple parenthesis behavior for expression grouping
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
        const expression = `${this.previousInput} ${this.activeOperator} ${this.currentInput}`;

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
        // Mitigate binary floating point issues (e.g., 0.1 + 0.2 = 0.30000000000000004)
        return parseFloat(Number(num).toPrecision(12));
    }

    /* ----------------------------------------------------
       Display & Scaling
    ---------------------------------------------------- */
    updateDisplay() {
        this.currentValueEl.textContent = this.formatNumberDisplay(this.currentInput);

        if (this.activeOperator && this.previousInput !== '') {
            this.expressionEl.textContent = `${this.formatNumberDisplay(this.previousInput)} ${this.activeOperator}`;
            this.operatorIndicatorEl.textContent = this.activeOperator;
        } else {
            this.expressionEl.textContent = '';
            this.operatorIndicatorEl.textContent = '';
        }

        // Adjust font size dynamically for long numbers
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
            expression,
            result: result.toString(),
            time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        });

        // Limit to 25 items
        if (this.history.length > 25) {
            this.history.pop();
        }

        localStorage.setItem('neocalc_history', JSON.stringify(this.history));
        this.renderHistory();
    }

    renderHistory() {
        if (this.history.length === 0) {
            this.historyList.innerHTML = `
                <div class="empty-history">
                    <p>No calculations yet</p>
                    <small>Your past math results will appear here automatically.</small>
                </div>
            `;
            return;
        }

        this.historyList.innerHTML = this.history.map(item => `
            <div class="history-item" data-res="${item.result}" tabindex="0" title="Click to use this result">
                <span class="history-expr">${item.expression} =</span>
                <span class="history-res">${this.formatNumberDisplay(item.result)}</span>
            </div>
        `).join('');

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

# 🧮 NeoCalc - Modern Glassmorphic Precision Calculator

A modern, high-precision web calculator designed with glassmorphism aesthetics, dynamic ambient glows, Web Audio API sound feedback, responsive layout, and interactive calculation history.

![NeoCalc](https://img.shields.io/badge/NeoCalc-v1.0-indigo?style=for-the-badge)
![HTML5](https://img.shields.io/badge/HTML5-E34F26?style=for-the-badge&logo=html5&logoColor=white)
![CSS3](https://img.shields.io/badge/CSS3-1572B6?style=for-the-badge&logo=css3&logoColor=white)
![JavaScript](https://img.shields.io/badge/JavaScript-F7DF1E?style=for-the-badge&logo=javascript&logoColor=black)

---

## ✨ Features

- 💎 **Modern Glassmorphic UI**: Backdrop blur, ambient gradient floating orbs, smooth borders, and responsive neumorphic buttons.
- 🌓 **Dark & Light Mode**: Instant toggle with persistent preferences saved to `localStorage`.
- 🔊 **Synthesizer Audio Feedback**: Real-time auditory feedback powered by the Web Audio API (can be toggled on/off).
- 📜 **Calculation History Drawer**: Keeps track of recent equations; click any previous result to restore it into the calculator.
- 📋 **Click to Copy**: Tap the screen to copy current numbers directly to the clipboard.
- ⌨️ **Full Physical Keyboard Support**:
  - Numbers `0-9`
  - Operators `+`, `-`, `*`, `/`
  - `Enter` or `=` to calculate
  - `Backspace` to delete digits
  - `Escape` for All Clear (AC)
  - `%` for percentages, `(` and `)` for grouping
- 🧮 **Advanced Precision**: Floating-point rounding protection and error protection for edge cases (e.g. division by zero).

---

## 🚀 Getting Started

Simply open `index.html` in any modern web browser or serve it via a local development server:

```bash
# Example with Python
python -m http.server 3000

# Or via XAMPP
# Access http://localhost/calculator
```

---

## 💻 Tech Stack

- **HTML5** (Semantic architecture)
- **Vanilla CSS** (Custom CSS variables, Glassmorphism, CSS Grid)
- **Vanilla JavaScript** (Object-Oriented state management, Web Audio API, LocalStorage)

---

## 📄 License

MIT License. Free to use, modify, and distribute.

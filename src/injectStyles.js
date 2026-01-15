/**
 * Injects component library styles into the document head.
 * This runs automatically when the library is imported.
 */

const styles = `
/* @argojun/react-components - Injected Styles */

/* Animation Keyframes */
@keyframes argojun-spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

@keyframes argojun-fade-in {
  from { opacity: 0; }
  to { opacity: 1; }
}

@keyframes argojun-slide-in-from-top {
  from { opacity: 0; transform: translateY(-8px); }
  to { opacity: 1; transform: translateY(0); }
}

@keyframes argojun-slide-in-from-bottom {
  from { opacity: 0; transform: translateY(8px); }
  to { opacity: 1; transform: translateY(0); }
}

@keyframes argojun-scale-in {
  from { opacity: 0; transform: scale(0.95); }
  to { opacity: 1; transform: scale(1); }
}

/* Animation Utility Classes */
.animate-spin {
  animation: argojun-spin 1s linear infinite;
}

.animate-in {
  animation-duration: 150ms;
  animation-timing-function: cubic-bezier(0.16, 1, 0.3, 1);
  animation-fill-mode: both;
}

.fade-in {
  animation-name: argojun-fade-in;
}

.slide-in-from-top-2 {
  animation-name: argojun-slide-in-from-top;
}

.slide-in-from-bottom-2 {
  animation-name: argojun-slide-in-from-bottom;
}

.scale-in {
  animation-name: argojun-scale-in;
}

.duration-150 {
  animation-duration: 150ms;
}

.duration-200 {
  animation-duration: 200ms;
}

.duration-300 {
  animation-duration: 300ms;
}

/* Custom Scrollbar */
.custom-scrollbar::-webkit-scrollbar {
  width: 6px;
}

.custom-scrollbar::-webkit-scrollbar-track {
  background: transparent;
}

.custom-scrollbar::-webkit-scrollbar-thumb {
  background-color: rgba(156, 163, 175, 0.5);
  border-radius: 3px;
}

.custom-scrollbar::-webkit-scrollbar-thumb:hover {
  background-color: rgba(156, 163, 175, 0.7);
}

/* Screen Reader Only */
.sr-only {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border-width: 0;
}

/* Base Form Element Resets */
input[type="number"]::-webkit-inner-spin-button,
input[type="number"]::-webkit-outer-spin-button {
  -webkit-appearance: none;
  margin: 0;
}

input[type="number"] {
  -moz-appearance: textfield;
}

input[type="checkbox"],
input[type="radio"] {
  -webkit-appearance: none;
  -moz-appearance: none;
  appearance: none;
}
`;

const STYLE_ID = 'argojun-react-components-styles';

function injectStyles() {
  // Only run in browser environment
  if (typeof document === 'undefined') return;
  
  // Don't inject twice
  if (document.getElementById(STYLE_ID)) return;
  
  const styleElement = document.createElement('style');
  styleElement.id = STYLE_ID;
  styleElement.textContent = styles;
  document.head.appendChild(styleElement);
}

// Auto-inject on import
injectStyles();

export default injectStyles;

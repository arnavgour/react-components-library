/**
 * Tailwind CSS Preset for @argojun/react-components
 * 
 * Usage (tailwind.config.js):
 * 
 * const { tailwindPreset } = require('@argojun/react-components/tailwind');
 * 
 * module.exports = {
 *   presets: [tailwindPreset],
 *   // ... rest of your config
 * }
 */

const path = require('path');

const tailwindPreset = {
    content: [
        // Automatically include the library's dist files
        path.join(path.dirname(require.resolve('@argojun/react-components')), '**/*.js'),
    ],
};

module.exports = { tailwindPreset };

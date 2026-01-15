# @argojun/react-components

A collection of beautifully crafted React components designed to work seamlessly with your Tailwind CSS project.

📚 **[Documentation](https://www.argojun.in/)**

## Installation

```bash
# npm
npm install @argojun/react-components

# yarn
yarn add @argojun/react-components

# pnpm
pnpm add @argojun/react-components
```

## ⚠️ Required Setup: Tailwind CSS Configuration

**This library requires Tailwind CSS in your project.** The components use Tailwind utility classes that need to be compiled by your project's Tailwind setup.

---

### 🔷 For Tailwind CSS v3 Users

#### Option A: Using the Tailwind Preset (Recommended)

The easiest way! Import our preset in your `tailwind.config.js`:

```js
const { tailwindPreset } = require('@argojun/react-components/tailwind');

/** @type {import('tailwindcss').Config} */
module.exports = {
  presets: [tailwindPreset],
  content: [
    './src/**/*.{js,jsx,ts,tsx}',
  ],
  darkMode: 'class',
  theme: {
    extend: {},
  },
  plugins: [],
};
```

#### Option B: Manual Configuration

Add the library path to your `tailwind.config.js` content array:

```js
/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/**/*.{js,jsx,ts,tsx}',
    // 👇 Add this line to include the component library
    './node_modules/@argojun/react-components/dist/**/*.js',
  ],
  darkMode: 'class',
  theme: {
    extend: {},
  },
  plugins: [],
};
```

---

### 🔶 For Tailwind CSS v4 Users

If using Tailwind v4 with CSS-based configuration, add the `@source` directive to your CSS:

```css
@import "tailwindcss";

/* Scan the component library for utility classes */
@source "./node_modules/@argojun/react-components/dist/*.js";
```

---

### Start Using Components

Base styles (animations, scroll behavior, etc.) are **automatically injected** when you import any component — no separate CSS import needed!

```jsx
import { Button, Input, Select } from '@argojun/react-components';

function App() {
  return (
    <div className="p-8">
      <Button variant="primary" color="violet">
        Click me
      </Button>
    </div>
  );
}
```

## Dark Mode Support

All components support dark mode. Add the `dark` class to your `<html>` or parent element:

```html
<html class="dark">
  <!-- Your app -->
</html>
```

Or toggle it programmatically:

```jsx
document.documentElement.classList.toggle('dark');
```

## Components

### Button

```jsx
<Button variant="primary" color="violet" size="md">
  Click me
</Button>

<Button variant="outline" startIcon="plus" isLoading={loading}>
  Add Item
</Button>
```

**Props:**
- `variant`: `'primary'` | `'secondary'` | `'outline'` | `'ghost'` | `'danger'`
- `size`: `'sm'` | `'md'` | `'lg'`
- `color`: `'violet'` | `'blue'` | `'emerald'` | `'rose'` | `'amber'` | `'black'`
- `isLoading`: boolean
- `startIcon` / `endIcon`: icon name string
- `fullWidth`: boolean

### Input

```jsx
<Input
  label="Email"
  placeholder="Enter your email"
  leftIcon="envelope"
  theme="glass"
  color="blue"
/>
```

**Props:**
- `theme`: `'default'` | `'glass'` | `'minimal'` | `'outlined'` | `'filled'` | `'gradient'`
- `size`: `'xs'` | `'sm'` | `'md'` | `'lg'` | `'xl'`
- `color`: `'violet'` | `'blue'` | `'emerald'` | `'rose'` | `'amber'` | `'black'`
- `leftIcon` / `rightIcon`: icon name string
- `floatingLabel`: boolean
- `clearable`: boolean
- `copyable`: boolean

### Select

```jsx
<Select
  label="Country"
  options={[
    { value: 'us', label: 'United States' },
    { value: 'uk', label: 'United Kingdom' },
  ]}
  searchable
  clearable
/>
```

**Props:**
- `options`: Array of `{ value, label, icon?, description? }` or strings
- `searchable`: boolean - Enable search/filter
- `clearable`: boolean - Show clear button
- `theme`: `'default'` | `'glass'` | `'minimal'` | `'outlined'` | `'filled'`
- `color`: `'violet'` | `'blue'` | `'emerald'` | `'rose'` | `'amber'` | `'black'`

### MultiSelect

```jsx
<MultiSelect
  label="Tags"
  options={tags}
  maxSelections={5}
  searchable
/>
```

**Props:**
- All Select props, plus:
- `maxSelections`: number - Limit selections
- `chipDisplay`: `'inline'` | `'count'` | `'compact'`

### Checkbox

```jsx
// Standalone
<Checkbox
  label="Accept terms"
  description="I agree to the terms and conditions"
  color="emerald"
/>

// As a group
<Checkbox.Group
  label="Select options"
  onChange={(values) => console.log(values)}
>
  <Checkbox value="opt1" label="Option 1" />
  <Checkbox value="opt2" label="Option 2" />
</Checkbox.Group>
```

### Radio

```jsx
<Radio.Group
  name="plan"
  label="Select a plan"
  onChange={(value) => console.log(value)}
>
  <Radio value="basic" label="Basic" description="$9/month" />
  <Radio value="pro" label="Pro" description="$29/month" variant="card" />
</Radio.Group>
```

### DateTimePicker

```jsx
<DateTimePicker
  type="datetime"
  label="Appointment"
  value={date}
  onChange={(newDate) => setDate(newDate)}
  minDate={new Date()}
/>
```

**Props:**
- `type`: `'date'` | `'time'` | `'datetime'`
- `value`: Date object
- `onChange`: `(date: Date) => void`
- `minDate` / `maxDate`: Date constraints

### FileUpload

```jsx
<FileUpload
  accept="image/*"
  multiple
  maxFiles={5}
  maxSize={5 * 1024 * 1024}
  onFilesChange={(files) => console.log(files)}
/>
```

**Props:**
- `variant`: `'dropzone'` | `'compact'`
- `multiple`: boolean
- `accept`: string (MIME types)
- `maxFiles`: number
- `maxSize`: number (bytes)

### Textarea

```jsx
<Textarea
  label="Description"
  placeholder="Enter description..."
  maxLength={500}
  helperText="Write a brief description"
/>
```

### Icon

Built-in icon library with 150+ icons - no external dependencies needed!

```jsx
<Icon icon="check" size="md" variant="solid" />
<Icon icon="user" size="lg" />
<Icon icon="heart" variant="outline" className="text-red-500" />
```

**Props:**
- `icon`: string - Icon name (see full list in docs)
- `size`: `'xs'` | `'sm'` | `'md'` | `'lg'` | `'xl'` | `'2xl'`
- `variant`: `'outline'` | `'solid'`

**Available Icons:**
Navigation, actions, status, forms, media, files, commerce, shapes, weather, development, social brands, and more.

## Peer Dependencies

```json
{
  "react": ">=17.0.0",
  "react-dom": ">=17.0.0",
  "tailwindcss": ">=3.0.0"
}
```

## Troubleshooting

### Styles not appearing?

1. **Check Tailwind config**: Make sure you added the library path to `content` array, or use the preset
2. **Rebuild your app**: Restart your dev server after config changes
3. **Check browser console**: Look for any JavaScript errors

### Dark mode not working?

Make sure your `tailwind.config.js` has `darkMode: 'class'` and add the `dark` class to your root element.

## License

MIT © Arnav Gour

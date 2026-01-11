# @arnavgour/react-components

A collection of beautifully crafted React components built with Tailwind CSS.

## Installation

```bash
npm install @arnavgour/react-components
```

## Usage

Import components directly from the package:

```jsx
import { Button, Input, Select, Checkbox, Radio, DateTimePicker, FileUpload, MultiSelect, Textarea, Icon } from '@arnavgour/react-components';
```

### Include Styles

Make sure to include the styles in your app:

```jsx
import '@arnavgour/react-components/styles.css';
```

Or if you're using Tailwind CSS, you can include the component paths in your `tailwind.config.js`:

```js
module.exports = {
  content: [
    // ... your paths
    './node_modules/@arnavgour/react-components/dist/**/*.js',
  ],
  // ...
};
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

### MultiSelect

```jsx
<MultiSelect
  label="Tags"
  options={tags}
  maxSelections={5}
  searchable
/>
```

### Checkbox

```jsx
<Checkbox
  label="Accept terms"
  description="I agree to the terms and conditions"
  color="emerald"
/>
```

### Radio

```jsx
<Radio
  name="plan"
  label="Pro Plan"
  description="$29/month"
  variant="card"
/>
```

### DateTimePicker

```jsx
<DateTimePicker
  mode="datetime"
  label="Appointment"
  minDate={new Date()}
/>
```

### FileUpload

```jsx
<FileUpload
  accept="image/*"
  multiple
  maxFiles={5}
  maxSize={5 * 1024 * 1024}
  showPreview
/>
```

### Textarea

```jsx
<Textarea
  label="Description"
  placeholder="Enter description..."
  autoResize
  showCharCount
  maxLength={500}
/>
```

### Icon

```jsx
<Icon icon="check" size="md" variant="solid" />
<Icon icon="user" size="lg" />
```

## Peer Dependencies

This package requires the following peer dependencies:

```json
{
  "react": ">=17.0.0",
  "react-dom": ">=17.0.0"
}
```

## Tailwind CSS

These components are built with Tailwind CSS. Make sure you have Tailwind configured in your project for the best experience.

## License

MIT

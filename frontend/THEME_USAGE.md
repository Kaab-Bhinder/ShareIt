# ShareIt Theme Token Usage Guide

## Color Tokens Available

All defined in `globals.css` with `@theme` directive.

### Primary Colors (Dark Green)
- `primary-surface` - Main dark green background
- `primary-surface-light` - Medium green
- `primary-surface-dark` - Darker green
- `primary-400` - Bright green accent
- `primary-500` - Green hover state
- `primary-700` - Dark green accent
- `primary-800` - Very dark green

### Semantic Colors
- `muted` - Light green text
- `muted-dark` - Darker muted text
- `warning` - Yellow alerts
- `error` - Red errors
- `info` - Cyan information
- `success` - Green success

## Component Classes Available

Use these pre-built components instead of writing color utilities:

### Buttons
```html
<!-- Primary button (green gradient) -->
<button class="btn-primary">Click me</button>

<!-- Large primary button -->
<button class="btn-primary-lg">Click me</button>

<!-- Secondary button (transparent dark) -->
<button class="btn-secondary">Click me</button>

<!-- Large secondary button -->
<button class="btn-secondary-lg">Click me</button>

<!-- Ghost button (no background) -->
<button class="btn-ghost">Click me</button>

<!-- Disabled button -->
<button class="btn-disabled">Disabled</button>
```

### Cards
```html
<!-- Primary card with hover effect -->
<div class="card-primary-hover">
  Content here
</div>

<!-- Secondary card -->
<div class="card-secondary">
  Content here
</div>
```

### Layout
```html
<!-- Page background wrapper -->
<div class="page-container">
  Page content
</div>

<!-- Header -->
<header class="header-base">
  Header content
</header>

<!-- Modal -->
<div class="modal-overlay">
  <div class="modal-base">
    Modal content
  </div>
</div>
```

### Badges/Status
```html
<!-- Success badge -->
<span class="badge-success">Available</span>

<!-- Warning badge -->
<span class="badge-warning">Pending</span>

<!-- Error badge -->
<span class="badge-error">Error</span>

<!-- Info badge -->
<span class="badge-info">Info</span>
```

### Forms
```html
<!-- Primary input -->
<input type="text" class="input-primary" placeholder="Enter text...">
```

### Utilities
```html
<!-- Stat boxes -->
<div class="stat-box">
  Stat content
</div>

<!-- Image container -->
<div class="img-container">
  <img src="..." alt="...">
  <div class="img-overlay"></div>
</div>

<!-- Dividers -->
<div class="divider-primary"></div>
<div class="divider-muted"></div>

<!-- Text -->
<h1 class="text-heading">Heading</h1>
<p class="text-subheading">Subheading</p>
<p class="text-muted-light">Muted text</p>
```

## Migration Checklist

When converting components:

❌ **Don't use** hex color codes
```html
<!-- Bad -->
<button style="background-color: #4ade80">Click</button>
```

✅ **Do use** component classes or color tokens
```html
<!-- Good -->
<button class="btn-primary">Click</button>

<!-- Also good with tokens -->
<div class="bg-primary-500 text-white p-4">Content</div>
```

## Customizing Colors

All colors are defined in one place: `globals.css` under `@theme`.

To change a color, edit that file only:
```css
@theme {
  --color-primary-400: #YOUR_NEW_COLOR;
}
```

All components using that token update automatically.

## Color Palette

| Token | Hex | Usage |
|-------|-----|-------|
| primary-surface | #0a3d2a | Dark backgrounds |
| primary-surface-light | #1d6b47 | Medium backgrounds |
| primary-surface-dark | #0f4d2f | Very dark backgrounds |
| primary-400 | #4ade80 | Bright green accent |
| primary-500 | #22c55e | Hover states |
| primary-700 | #15803d | Dark accents |
| primary-800 | #166534 | Very dark accents |
| muted | #a8d5ba | Light text |
| muted-dark | #7a9e82 | Darker text |
| warning | #facc15 | Yellow warnings |
| error | #ef4444 | Red errors |
| info | #38bdf8 | Cyan info |
| success | #22c55e | Green success |

---

**Remember:** No hex codes in your component files. Use theme tokens and component classes only!

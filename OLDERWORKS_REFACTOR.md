# OlderWorks Component Refactor

## Overview
Successfully refactored the `OlderWorks` component with a professional project preview modal system.

## Components Created

### 1. ProjectPreviewModal ([ProjectPreviewModal.tsx](src/components/ProjectPreviewModal.tsx))
A fully-featured modal component with:
- **Accessibility**: Full keyboard navigation, focus trap, ARIA labels
- **Animations**: Smooth fade + scale transitions using Framer Motion
- **Code Display**: Syntax highlighted code blocks with copy-to-clipboard
- **Responsive Layout**: Side-by-side on desktop, stacked on mobile
- **Portal Rendering**: Modal renders outside main DOM tree
- **Body Scroll Lock**: Prevents background scrolling when open

### 2. Refactored OlderWorks ([OlderWorks.tsx](src/components/OlderWorks.tsx))
Enhanced with:
- Rich project data including code snippets
- Hover effects with "View Details" CTA
- Click handlers to open modal
- Framer Motion scroll animations
- Gradient backgrounds for visual appeal

## Features Implemented

### Modal Functionality
✅ Click project card to open modal
✅ Close via X button, backdrop click, or Escape key
✅ Smooth open/close animations
✅ Body scroll prevention when open

### Content Display
✅ Hero image section (21:9 aspect ratio)
✅ Project metadata (tech stack, date, role)
✅ Full project description
✅ Multiple code blocks with syntax highlighting
✅ Language labels for each code snippet
✅ Copy-to-clipboard with visual feedback

### Accessibility
✅ Keyboard navigation (Tab, Shift+Tab, Escape)
✅ Focus trap within modal
✅ ARIA labels and roles
✅ Semantic HTML structure
✅ Focus management (close button auto-focus)

### Visual Design
✅ Clean, minimalist aesthetic
✅ Monospace fonts for code (VS Code Dark Plus theme)
✅ Consistent spacing and typography
✅ Subtle shadows and borders
✅ Custom scrollbar styling
✅ Responsive grid layout

### Performance
✅ Lazy loading for images
✅ Proper state management
✅ Cleanup on unmount
✅ Optimized animations

## Project Data Structure

```typescript
interface Project {
    title: string;           // Project name
    desc: string;            // Short description
    color: string;           // Card background gradient
    image?: string;          // Hero image path
    techStack: string[];     // Technologies used
    date: string;            // Project timeline
    role: string;            // Your role in project
    description: string;     // Full description
    codeBlocks: CodeBlock[]; // Code snippets
}

interface CodeBlock {
    language: string;  // Programming language
    code: string;      // Code content
    label?: string;    // Optional custom label
}
```

## Sample Projects Included

1. **Biome Terrain Engine** (2022)
   - Procedural generation with Perlin noise
   - Three.js and WebGL implementation
   - Terrain height and biome detection algorithms

2. **Hackflix** (2021)
   - UPI payment processing
   - React Native mobile app
   - Transaction handling code

3. **Bookscape** (2020)
   - E-commerce platform
   - Recommendation engine
   - Redux state management

## Customization

### Add New Projects
Edit the `projects` array in [OlderWorks.tsx](src/components/OlderWorks.tsx#L5-L198):

```typescript
{
    title: "Your Project",
    desc: "Short description",
    color: "bg-gradient-to-br from-blue-100 to-cyan-200",
    image: "/images/your-project.png",
    techStack: ["React", "TypeScript"],
    date: "2023",
    role: "Developer",
    description: "Full project description...",
    codeBlocks: [
        {
            language: "typescript",
            label: "Feature Implementation",
            code: `// Your code here...`
        }
    ]
}
```

### Customize Syntax Theme
Change the theme import in [ProjectPreviewModal.tsx](src/components/ProjectPreviewModal.tsx#L4):

```typescript
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';
// Other options: vs, dracula, tomorrow, atomDark, etc.
```

### Adjust Modal Size
Modify the modal container classes in [ProjectPreviewModal.tsx](src/components/ProjectPreviewModal.tsx#L143):

```tsx
className="relative w-full max-w-6xl max-h-[90vh] ..."
// Change max-w-6xl to max-w-4xl, max-w-5xl, max-w-7xl, etc.
```

## Dependencies Added

```json
{
    "react-syntax-highlighter": "^15.6.1",
    "@types/react-syntax-highlighter": "^15.5.13"
}
```

Existing dependencies used:
- `framer-motion` - Animations
- `lucide-react` - Icons (X, Copy, Check)
- `tailwindcss` - Styling

## Styles Added

Custom scrollbar styles in [index.css](src/index.css#L63-L87) for a polished modal experience.

## Browser Support

- Modern browsers with ES6+ support
- Webkit/Blink scrollbar customization
- Firefox scrollbar-width support
- Backdrop blur effects

## Next Steps

1. **Add Project Images**: Place actual project screenshots in `/public/images/`
2. **Replace Sample Code**: Update code blocks with real implementation snippets
3. **Customize Colors**: Adjust gradient colors to match project themes
4. **Add More Projects**: Expand the projects array as needed
5. **Optional Enhancements**:
   - Add project links/buttons
   - Include demo videos
   - Add GitHub repository links
   - Include project metrics/stats

## Notes

- Images are set to lazy load for performance
- Modal uses React Portals for proper z-index stacking
- All animations respect reduced-motion preferences (via Framer Motion)
- Code blocks use VS Code Dark Plus theme for familiarity
- Fully TypeScript typed for type safety

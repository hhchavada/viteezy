# Local Fonts Integration Guide

This project now includes two custom local font families: **Cardinal** (serif) and **Saans** (sans-serif).

## Available Fonts

### Cardinal Font Family (Serif)
- **Regular** (400) - Normal and Italic
- **Medium** (500) - Normal and Italic  
- **Semibold** (600) - Normal and Italic
- **Bold** (700) - Normal and Italic

### Saans Font Family (Sans-serif)
- **Light** (300) - Normal and Italic
- **Regular** (400) - Normal and Italic
- **Medium** (500) - Normal and Italic
- **Semibold** (600) - Normal and Italic
- **Bold** (700) - Normal and Italic
- **Heavy** (800) - Normal and Italic

## How to Use

### Method 1: Using Tailwind CSS Classes

```jsx
// Cardinal font examples
<h1 className="font-cardinal font-bold text-4xl">
  Main Heading with Cardinal Bold
</h1>

<h2 className="font-cardinal font-semibold text-2xl">
  Subheading with Cardinal Semibold
</h2>

<p className="font-cardinal font-normal italic">
  Italic text with Cardinal Regular
</p>

// Saans font examples
<p className="font-saans font-normal text-lg">
  Body text with Saans Regular
</p>

<button className="font-saans font-semibold">
  Button with Saans Semibold
</button>

<span className="font-saans font-light text-sm">
  Light text with Saans Light
</span>
```

### Method 2: Using Pre-defined Typography Classes

Import the typography utility:

```jsx
import { typography, fontClasses, usage } from '@/lib/typography';

// Using typography combinations
<h1 className={typography.heading.h1}>Hero Title</h1>
<p className={typography.body.regular}>Regular body text</p>

// Using predefined usage patterns  
<h1 className={usage.heroTitle}>Welcome to Viteezy</h1>
<button className={usage.primaryButton}>Get Started</button>

// Using font classes object
<span className={fontClasses.cardinal.semibold}>Cardinal Semibold</span>
<span className={fontClasses.saans.medium}>Saans Medium</span>
```

### Method 3: Using Custom CSS Classes

```jsx
// Quick utility classes
<h1 className="text-cardinal-heading">Heading with Cardinal</h1>
<p className="text-saans-body">Body text with Saans</p>
```

## Font Weights Reference

| Weight | CSS Value | Tailwind Class |
|--------|-----------|----------------|
| Light  | 300       | `font-light`   |
| Regular| 400       | `font-normal`  |
| Medium | 500       | `font-medium`  |
| Semibold| 600      | `font-semibold`|
| Bold   | 700       | `font-bold`    |
| Heavy  | 800       | `font-extrabold`|

## Best Practices

### When to Use Cardinal (Serif)
- Main headings and titles
- Hero sections
- Quote blocks  
- Elegant, formal content
- Brand-related text

### When to Use Saans (Sans-serif)
- Body text and paragraphs
- Navigation menus
- Buttons and UI elements
- Modern, clean interfaces
- Data and technical content

### Example Implementation

```jsx
function HomePage() {
  return (
    <div>
      {/* Hero section with Cardinal */}
      <section className="text-center py-20">
        <h1 className="font-cardinal font-bold text-5xl mb-4">
          Welcome to Viteezy
        </h1>
        <p className="font-saans font-normal text-xl max-w-2xl mx-auto">
          Personalized vitamins, especially for your intestines. 
          Join 400,000+ people who have received their recommendation.
        </p>
      </section>

      {/* Content section with mixed fonts */}
      <section className="py-16">
        <h2 className="font-cardinal font-semibold text-3xl mb-8 text-center">
          Our Mission
        </h2>
        <div className="grid md:grid-cols-2 gap-8">
          <div>
            <h3 className="font-cardinal font-medium text-xl mb-4">
              Personalized Approach
            </h3>
            <p className="font-saans font-light text-base leading-relaxed">
              We analyze your specific needs and create custom vitamin 
              formulations that work with your body's unique requirements.
            </p>
          </div>
          <div>
            <h3 className="font-cardinal font-medium text-xl mb-4">
              Scientific Backing
            </h3>
            <p className="font-saans font-light text-base leading-relaxed">
              Our recommendations are based on the latest nutritional 
              science and research in personalized medicine.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
```

## Testing the Fonts

A demo component has been created at `src/components/FontDemo.tsx` that showcases all font weights and styles. You can import and use this component to see all available options:

```jsx
import FontDemo from '@/components/FontDemo';

// Use in any page to see the font examples
<FontDemo />
```

## File Structure

```
public/fonts/
├── cardinal/
│   ├── cardinal-fruit.ttf
│   ├── cardinal-fruit-italic.ttf
│   ├── cardinal-fruit-medium.ttf
│   ├── cardinal-fruit-medium-italic.ttf
│   ├── cardinal-fruit-semibold.ttf
│   ├── cardinal-fruit-semibold-italic.ttf
│   ├── cardinal-fruit-bold.ttf
│   └── cardinal-fruit-bold-italic.ttf
└── saans/
    ├── SaansTRIAL-Light.ttf
    ├── SaansTRIAL-LightItalic.ttf
    ├── SaansTRIAL-Regular.ttf
    ├── SaansTRIAL-RegularItalic.ttf
    ├── SaansTRIAL-Medium.ttf
    ├── SaansTRIAL-MediumItalic.ttf
    ├── SaansTRIAL-SemiBold.ttf
    ├── SaansTRIAL-SemiBoldItalic.ttf
    ├── SaansTRIAL-Bold.ttf
    ├── SaansTRIAL-BoldItalic.ttf
    ├── SaansTRIAL-Heavy.ttf
    └── SaansTRIAL-HeavyItalic.ttf

src/app/fonts/
└── index.ts (font configurations)

src/lib/
└── typography.ts (utility classes and combinations)
```

The fonts are now fully configured and ready to use throughout your application!
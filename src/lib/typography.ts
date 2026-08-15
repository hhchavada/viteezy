// Font utility classes and configurations for Viteezy project

export const fontClasses = {
    // Cardinal Font Classes (Serif)
    cardinal: {
        regular: 'font-cardinal font-normal',
        medium: 'font-cardinal font-medium',
        semibold: 'font-cardinal font-semibold',
        bold: 'font-cardinal font-bold',
        italic: 'font-cardinal font-normal italic',
        mediumItalic: 'font-cardinal font-medium italic',
        semiboldItalic: 'font-cardinal font-semibold italic',
        boldItalic: 'font-cardinal font-bold italic',
    },

    // Saans Font Classes (Sans-serif)
    saans: {
        light: 'font-saans font-light',
        regular: 'font-saans font-normal',
        medium: 'font-saans font-medium',
        semibold: 'font-saans font-semibold',
        bold: 'font-saans font-bold',
        heavy: 'font-saans font-extrabold',
        lightItalic: 'font-saans font-light italic',
        regularItalic: 'font-saans font-normal italic',
        mediumItalic: 'font-saans font-medium italic',
        semiboldItalic: 'font-saans font-semibold italic',
        boldItalic: 'font-saans font-bold italic',
        heavyItalic: 'font-saans font-extrabold italic',
    }
};

// Common typography combinations
export const typography = {
    // Headings with Cardinal
    heading: {
        h1: 'font-cardinal font-bold text-4xl md:text-5xl lg:text-6xl',
        h2: 'font-cardinal font-semibold text-3xl md:text-4xl lg:text-5xl',
        h3: 'font-cardinal font-semibold text-2xl md:text-3xl lg:text-4xl',
        h4: 'font-cardinal font-medium text-xl md:text-2xl lg:text-3xl',
        h5: 'font-cardinal font-medium text-lg md:text-xl lg:text-2xl',
        h6: 'font-cardinal font-medium text-base md:text-lg lg:text-xl',
    },

    // Body text with Saans
    body: {
        large: 'font-saans font-normal text-lg md:text-xl',
        regular: 'font-saans font-normal text-base md:text-lg',
        small: 'font-saans font-normal text-sm md:text-base',
        caption: 'font-saans font-light text-xs md:text-sm',
    },

    // Special purpose
    button: 'font-saans font-semibold',
    navbar: 'font-saans font-medium',
    quote: 'font-cardinal font-normal italic',
    emphasis: 'font-saans font-medium',
};

// Usage examples for developers
export const usage = {
    // Hero section
    heroTitle: `${typography.heading.h1} text-center`,
    heroSubtitle: `${typography.body.large} text-center`,

    // Section headers
    sectionTitle: `${typography.heading.h2} mb-6`,
    sectionSubtitle: `${typography.body.regular} mb-8`,

    // Cards and components
    cardTitle: `${typography.heading.h4} mb-3`,
    cardText: `${typography.body.regular}`,

    // Navigation
    navLink: `${typography.navbar} hover:font-semibold transition-all`,

    // Buttons
    primaryButton: `${typography.button} px-6 py-3 rounded-lg`,
    secondaryButton: `${typography.button} px-4 py-2 rounded`,
};
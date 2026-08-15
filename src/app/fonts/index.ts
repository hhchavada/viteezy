import localFont from 'next/font/local'

// Cardinal Font Configuration - Using CardinalFruitWeb font files
export const cardinalFont = localFont({
    src: [
        {
            path: './cardinal/CardinalFruitWeb-Regular.name.woff2',
            weight: '400',
            style: 'normal',
        },
        {
            path: './cardinal/CardinalFruitWeb-Italic.name.woff2',
            weight: '400',
            style: 'italic',
        },
        {
            path: './cardinal/CardinalFruitWeb-SemiBold.display.woff2',
            weight: '600',
            style: 'normal',
        },
    ],
    variable: '--font-cardinal',
    display: 'swap',
})

// Saans Font Configuration
export const saansFont = localFont({
    src: [
        {
            path: './saans/SaansTRIAL-Light.ttf',
            weight: '300',
            style: 'normal',
        },
        {
            path: './saans/SaansTRIAL-LightItalic.ttf',
            weight: '300',
            style: 'italic',
        },
        {
            path: './saans/SaansTRIAL-Regular.ttf',
            weight: '400',
            style: 'normal',
        },
        {
            path: './saans/SaansTRIAL-RegularItalic.ttf',
            weight: '400',
            style: 'italic',
        },
        {
            path: './saans/SaansTRIAL-Medium.ttf',
            weight: '500',
            style: 'normal',
        },
        {
            path: './saans/SaansTRIAL-MediumItalic.ttf',
            weight: '500',
            style: 'italic',
        },
        {
            path: './saans/SaansTRIAL-SemiBold.ttf',
            weight: '600',
            style: 'normal',
        },
        {
            path: './saans/SaansTRIAL-SemiBoldItalic.ttf',
            weight: '600',
            style: 'italic',
        },
        {
            path: './saans/SaansTRIAL-Bold.ttf',
            weight: '700',
            style: 'normal',
        },
        {
            path: './saans/SaansTRIAL-BoldItalic.ttf',
            weight: '700',
            style: 'italic',
        },
        {
            path: './saans/SaansTRIAL-Heavy.ttf',
            weight: '800',
            style: 'normal',
        },
        {
            path: './saans/SaansTRIAL-HeavyItalic.ttf',
            weight: '800',
            style: 'italic',
        },
    ],
    variable: '--font-saans',
    display: 'swap',
})
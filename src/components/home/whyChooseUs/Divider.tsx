import { memo } from "react";

// Optimized divider component
const Divider = memo(({ orientation = 'horizontal', className = '' }: { orientation?: 'horizontal' | 'vertical'; className?: string }) => (
    <div
        className={`bg-gray-300 ${orientation === 'vertical'
            ? `w-px ${className}`
            : `h-px ${className}`
            }`}
        role="separator"
        aria-orientation={orientation}
    />
));

Divider.displayName = 'Divider';

export default Divider;
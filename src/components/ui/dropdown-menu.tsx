"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

interface DropdownMenuProps {
    children: React.ReactNode;
    open: boolean;
    onOpenChange: (open: boolean) => void;
    trigger: React.ReactNode;
}

const DropdownMenuContext = React.createContext<{
    open: boolean;
    onOpenChange: (open: boolean) => void;
}>({
    open: false,
    onOpenChange: () => {},
});

const DropdownMenu = React.forwardRef<
    HTMLDivElement,
    DropdownMenuProps
>(({ children, open, onOpenChange, trigger }, ref) => {
    const [position, setPosition] = React.useState({ top: 0, left: 0 });
    const triggerRef = React.useRef<HTMLDivElement>(null);

    React.useEffect(() => {
        if (open && triggerRef.current) {
            const rect = triggerRef.current.getBoundingClientRect();
            setPosition({
                top: rect.bottom + window.scrollY,
                left: rect.left + window.scrollX,
            });
        }
    }, [open]);

    React.useEffect(() => {
        const handleClick = (event: MouseEvent) => {
            if (triggerRef.current && !triggerRef.current.contains(event.target as Node)) {
                onOpenChange(false);
            }
        };

        if (open) {
            document.addEventListener('mousedown', handleClick);
        }

        return () => {
            document.removeEventListener('mousedown', handleClick);
        };
    }, [open, onOpenChange]);

    return (
        <DropdownMenuContext.Provider value={{ open, onOpenChange }}>
            <div ref={triggerRef} className="relative inline-block">
                {trigger}
                {open && (
                    <div
                        className="fixed z-50 bg-white border border-gray-200 rounded-lg shadow-lg py-1 min-w-[120px]"
                        style={{
                            position: 'fixed',
                            top: position.top,
                            left: position.left,
                        }}
                    >
                        {children}
                    </div>
                )}
            </div>
        </DropdownMenuContext.Provider>
    );
});
DropdownMenu.displayName = "DropdownMenu";

const DropdownMenuContent = React.forwardRef<
    HTMLDivElement,
    React.HTMLAttributes<HTMLDivElement>
>(({ className, children, ...props }, ref) => {
    return (
        <div
            ref={ref}
            className={cn(
                "bg-white border border-gray-200 rounded-lg shadow-lg py-1 min-w-[120px]",
                className
            )}
            {...props}
        >
            {children}
        </div>
    );
});
DropdownMenuContent.displayName = "DropdownMenuContent";

const DropdownMenuItem = React.forwardRef<
    HTMLButtonElement,
    React.ButtonHTMLAttributes<HTMLButtonElement>
>(({ className, children, ...props }, ref) => {
    const { onOpenChange } = React.useContext(DropdownMenuContext);

    const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
        if (props.onClick) {
            props.onClick(e);
        }
        onOpenChange(false);
    };

    return (
        <button
            ref={ref}
            className={cn(
                "w-full text-left px-4 py-2 text-sm hover:bg-gray-50 transition-colors focus:outline-none focus:bg-gray-50 cursor-pointer",
                className
            )}
            {...props}
            onClick={handleClick}
        >
            {children}
        </button>
    );
});
DropdownMenuItem.displayName = "DropdownMenuItem";

const DropdownMenuTrigger = React.forwardRef<
    HTMLButtonElement,
    React.ButtonHTMLAttributes<HTMLButtonElement>
>(({ className, children, ...props }, ref) => {
    const { open, onOpenChange } = React.useContext(DropdownMenuContext);

    return (
        <button
            ref={ref}
            className={cn(
                "inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none",
                className
            )}
            onClick={() => onOpenChange(!open)}
            {...props}
        >
            {children}
        </button>
    );
});
DropdownMenuTrigger.displayName = "DropdownMenuTrigger";

export {
    DropdownMenu,
    DropdownMenuTrigger,
    DropdownMenuContent,
    DropdownMenuItem,
};

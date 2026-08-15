import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "group inline-flex relative items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-all disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none shrink-0 outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive cursor-pointer overflow-hidden",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground hover:bg-primary/90",
        destructive: "bg-destructive text-white hover:bg-destructive/90",
        outline:
          "bg-background border border-gray-300 hover:bg-gray-100 text-gray-700 dark:bg-input/30 dark:border-input dark:hover:bg-input/50",
        secondary:
          "bg-secondary text-secondary-foreground hover:bg-secondary/80",
        ghost:
          "hover:bg-accent hover:text-accent-foreground dark:hover:bg-accent/50",
        link: "text-primary underline-offset-4 hover:underline",
        login:
          "bg-[#1BAF9A] text-white hover:bg-[#178F7C] w-full rounded-xl font-semibold",
        elevate:
          "bg-black text-white hover:bg-black/95 rounded-4xl hover:rounded-2xl transition-all duration-400",
        tealElevate:
          "bg-teal-500 text-white hover:bg-teal-600 rounded-4xl hover:rounded-2xl transition-all duration-400",
        outlineElevate:
          "bg-background border border-gray-300 rounded-4xl hover:rounded-2xl hover:bg-gray-100 text-gray-700 dark:bg-input/30 dark:border-input dark:hover:bg-input/50",
        slateElevate:
          "bg-slate-50-color rounded-4xl hover:rounded-2xl hover:bg-[#EFEFEF] text-gray-700 dark:bg-input/30 dark:border-input dark:hover:bg-input/50",
      },
      size: {
        default: "h-9 px-4 py-2 has-[>svg]:px-3 3xl:h-fit",
        sm: "h-8 rounded-md gap-1.5 px-3 has-[>svg]:px-2.5",
        lg: "h-10 rounded-md px-6 has-[>svg]:px-4",
        login: "py-3 text-lg w-full rounded-4xl",
        icon: "size-9",

        // Optional: dedicated size for elevate style
        elevate: "h-12 md:h-13 px-8 text-base md:text-lg font-medium",
        "elevate-md":
          "h-12 md:h-11 px-8 text-sm md:text-base font-medium hover:rounded-lg",
      },

      // Controls the text sliding animation
      animateText: {
        true: "",
        false: "",
      },
    },
    compoundVariants: [
      { animateText: true, class: "overflow-hidden" },
      // Make sure elevate always has animation when requested
      { variant: "elevate", animateText: true, class: "overflow-hidden" },
    ],
    defaultVariants: {
      variant: "default",
      size: "default",
      animateText: false,
    },
  }
);

// Wrapper that creates the duplicate text + slide effect
const textWrapperVariants = cva("block overflow-hidden", {
  variants: {
    size: {
      default: "max-h-5",
      sm: "max-h-5",
      lg: "max-h-6",
      login: "max-h-8",
      elevate: "max-h-6 md:max-h-7",
      "elevate-md": "max-h-5 md:max-h-6",
      icon: "max-h-5",
    },
  },
  defaultVariants: { size: "default" },
});

function AnimatedTextContent({
  label,
  size,
}: {
  label: React.ReactNode;
  size: VariantProps<typeof buttonVariants>["size"];
}) {
  return (
    <span className={textWrapperVariants({ size })}>
      <span className="block transition-transform duration-300 group-hover:-translate-y-1/2">
        <span className="block">{label}</span>
        <span className="block">{label}</span>
      </span>
    </span>
  );
}

interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
  animateText?: boolean;
  height?: string;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      variant,
      size,
      animateText = false,
      asChild = false,
      children,
      ...props
    },
    ref
  ) => {
    const Comp = asChild ? Slot : "button";

    const classes = cn(buttonVariants({ variant, size, animateText, className }));

    if (animateText && asChild && React.isValidElement(children)) {
      const child = children as React.ReactElement<{
        children?: React.ReactNode;
      }>;

      return (
        <Comp ref={ref} className={classes} {...props}>
          {React.cloneElement(
            child,
            undefined,
            <AnimatedTextContent label={child.props.children} size={size} />
          )}
        </Comp>
      );
    }

    const content = animateText ? (
      <AnimatedTextContent label={children} size={size} />
    ) : (
      children
    );

    return (
      <Comp ref={ref} className={classes} {...props}>
        {content}
      </Comp>
    );
  }
);

Button.displayName = "Button";

export { Button, buttonVariants };

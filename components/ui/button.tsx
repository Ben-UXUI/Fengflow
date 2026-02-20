import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center whitespace-nowrap rounded-full text-sm font-medium transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)] focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 md:rounded-full",
  {
    variants: {
      variant: {
        default: "bg-[var(--accent)] text-[var(--text-inverse)] hover:bg-[var(--accent-hover)] shadow-[2px_2px_0px_0px_var(--accent)] hover:shadow-[3px_3px_0px_0px_var(--accent)]",
        ghost: "bg-transparent text-[var(--text-primary)] border-2 border-[var(--accent)] hover:bg-[var(--accent)] hover:text-[var(--text-inverse)]",
        outline: "border border-[var(--border-dark)] bg-transparent text-[var(--text-primary)] hover:bg-[var(--accent)] hover:text-[var(--text-inverse)] hover:border-[var(--accent)]",
      },
      size: {
        default: "h-10 px-6 py-2",
        sm: "h-9 px-4 rounded-full",
        lg: "h-12 px-8 rounded-full",
        icon: "h-10 w-10 rounded-full",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, ...props }, ref) => {
    return (
      <button
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    )
  }
)
Button.displayName = "Button"

export { Button, buttonVariants }

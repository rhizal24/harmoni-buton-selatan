import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { Slot } from "radix-ui"

import { cn } from "@/lib/utils"

/* Varian mengikuti tombol halaman publik (HeroBeranda/JelajahDesa/DaftarWisata):
   tosca gelap #31577F, rounded-md 12px, lift -translate-y-0.5 + glow saat hover. */
const buttonVariants = cva(
  "inline-flex shrink-0 items-center justify-center gap-2 rounded-md font-body text-sm font-semibold whitespace-nowrap motion-safe:transition-[transform,filter,background-color,border-color] motion-safe:duration-300 motion-safe:ease-[cubic-bezier(0.22,1,0.36,1)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#31577F] disabled:pointer-events-none disabled:opacity-50 aria-invalid:border-destructive [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
  {
    variants: {
      variant: {
        default:
          "bg-[#31577F] text-white shadow-sm motion-safe:hover:-translate-y-0.5 motion-safe:active:translate-y-0 hover:[filter:drop-shadow(0_0_16px_rgba(49,87,127,0.55))_drop-shadow(0_0_44px_rgba(49,87,127,0.30))]",
        destructive:
          "bg-destructive text-white shadow-sm motion-safe:hover:-translate-y-0.5 motion-safe:active:translate-y-0 hover:bg-on-error-container focus-visible:outline-destructive",
        outline:
          "border-[1.5px] border-[#31577F] bg-transparent text-[#31577F] shadow-sm motion-safe:hover:-translate-y-0.5 motion-safe:active:translate-y-0",
        secondary:
          "bg-accent text-accent-foreground shadow-sm motion-safe:hover:-translate-y-0.5 motion-safe:active:translate-y-0",
        ghost: "hover:bg-accent hover:text-accent-foreground",
        link: "text-primary underline-offset-4 hover:underline",
      },
      size: {
        default: "h-11 px-6 has-[>svg]:px-4",
        xs: "h-6 gap-1 rounded-md px-2 text-xs has-[>svg]:px-1.5 [&_svg:not([class*='size-'])]:size-3",
        sm: "h-9 gap-1.5 rounded-md px-4 has-[>svg]:px-3",
        lg: "h-[46px] rounded-md px-8 has-[>svg]:px-6",
        icon: "size-9",
        "icon-xs": "size-6 rounded-md [&_svg:not([class*='size-'])]:size-3",
        "icon-sm": "size-8",
        "icon-lg": "size-10",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

function Button({
  className,
  variant = "default",
  size = "default",
  asChild = false,
  ...props
}: React.ComponentProps<"button"> &
  VariantProps<typeof buttonVariants> & {
    asChild?: boolean
  }) {
  const Comp = asChild ? Slot.Root : "button"

  return (
    <Comp
      data-slot="button"
      data-variant={variant}
      data-size={size}
      className={cn(buttonVariants({ variant, size, className }))}
      {...props}
    />
  )
}

export { Button, buttonVariants }

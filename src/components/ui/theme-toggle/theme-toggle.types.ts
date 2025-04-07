import { ButtonHTMLAttributes } from "react";
import { VariantProps } from "class-variance-authority";
import { themeToggleVariants } from "./theme-toggle.styles";

/**
 * Props for the ThemeToggle component
 * 
 * Extends the HTML button element props and adds custom props for the theme toggle
 */
export interface ThemeToggleProps 
  extends ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof themeToggleVariants> {
  /**
   * Additional CSS class names to apply to the theme toggle
   */
  className?: string;
}

import React, { forwardRef } from 'react'
import { motion } from 'framer-motion'
import { Loader2 } from 'lucide-react'
import { tw } from '../tokens'

// ─── Types ────────────────────────────────────────────────────────────────────
export type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'outline' | 'destructive' | 'accent'
export type ButtonSize    = 'xs' | 'sm' | 'md' | 'lg'

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?:   ButtonVariant
  size?:      ButtonSize
  loading?:   boolean
  leftIcon?:  React.ReactNode
  rightIcon?: React.ReactNode
  fullWidth?: boolean
}

// ─── Variant styles ───────────────────────────────────────────────────────────
const variantClasses: Record<ButtonVariant, string> = {
  primary:     'bg-primary text-white hover:bg-[#2563EB] shadow-[0_0_24px_rgba(59,130,246,0.2)] hover:shadow-[0_0_32px_rgba(59,130,246,0.35)]',
  secondary:   'bg-secondary text-white hover:bg-[#7C3AED] shadow-[0_0_24px_rgba(139,92,246,0.2)] hover:shadow-[0_0_32px_rgba(139,92,246,0.35)]',
  accent:      'bg-accent text-white hover:bg-[#0891B2] shadow-[0_0_24px_rgba(6,182,212,0.2)] hover:shadow-[0_0_32px_rgba(6,182,212,0.3)]',
  ghost:       'text-zinc-300 hover:text-white hover:bg-white/6',
  outline:     'border border-white/12 text-zinc-300 hover:border-white/22 hover:text-white hover:bg-white/5',
  destructive: 'bg-red-500/15 border border-red-500/25 text-red-400 hover:bg-red-500/22 hover:border-red-500/40 hover:text-red-300',
}

const sizeClasses: Record<ButtonSize, string> = {
  xs: 'h-7   px-3   text-[11px] gap-1.5 rounded-lg',
  sm: 'h-8   px-3.5 text-[13px] gap-1.5 rounded-lg',
  md: 'h-9   px-4   text-[14px] gap-2   rounded-xl',
  lg: 'h-11  px-6   text-[15px] gap-2.5 rounded-xl',
}

const iconSizeClasses: Record<ButtonSize, string> = {
  xs: 'w-3 h-3',
  sm: 'w-3.5 h-3.5',
  md: 'w-4 h-4',
  lg: 'w-4.5 h-4.5',
}

// ─── Component ────────────────────────────────────────────────────────────────
export const Button = forwardRef<HTMLButtonElement, ButtonProps>(({
  variant   = 'primary',
  size      = 'md',
  loading   = false,
  leftIcon,
  rightIcon,
  fullWidth = false,
  children,
  className = '',
  disabled,
  ...props
}, ref) => {
  const isDisabled = disabled || loading

  return (
    <motion.button
      ref={ref}
      whileHover={isDisabled ? {} : { y: -1 }}
      whileTap={isDisabled  ? {} : { scale: 0.97 }}
      transition={{ duration: 0.15 }}
      disabled={isDisabled}
      className={[
        'inline-flex items-center justify-center font-semibold',
        'transition-all duration-200 cursor-pointer select-none',
        tw.focusRing,
        variantClasses[variant],
        sizeClasses[size],
        fullWidth ? 'w-full' : '',
        isDisabled ? 'opacity-50 cursor-not-allowed pointer-events-none' : '',
        className,
      ].join(' ')}
      {...props as React.ComponentProps<typeof motion.button>}
    >
      {loading ? (
        <Loader2 className={`${iconSizeClasses[size]} animate-spin`} />
      ) : leftIcon ? (
        <span className={iconSizeClasses[size]}>{leftIcon}</span>
      ) : null}
      {children && <span>{children}</span>}
      {!loading && rightIcon && (
        <span className={iconSizeClasses[size]}>{rightIcon}</span>
      )}
    </motion.button>
  )
})

Button.displayName = 'Button'

// ─── IconButton ───────────────────────────────────────────────────────────────
export interface IconButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  icon:      React.ReactNode
  label:     string               // required for a11y
  variant?:  Exclude<ButtonVariant, never>
  size?:     ButtonSize
}

export const IconButton = forwardRef<HTMLButtonElement, IconButtonProps>(({
  icon, label, variant = 'ghost', size = 'md', className = '', disabled, ...props
}, ref) => {
  const dim: Record<ButtonSize, string> = { xs: 'w-7 h-7', sm: 'w-8 h-8', md: 'w-9 h-9', lg: 'w-10 h-10' }
  const iconDim = iconSizeClasses[size]

  return (
    <motion.button
      ref={ref}
      whileHover={disabled ? {} : { y: -1 }}
      whileTap={disabled   ? {} : { scale: 0.93 }}
      transition={{ duration: 0.12 }}
      disabled={disabled}
      aria-label={label}
      className={[
        'inline-flex items-center justify-center rounded-xl',
        'transition-all duration-200 cursor-pointer',
        tw.focusRing,
        variantClasses[variant],
        dim[size],
        disabled ? 'opacity-50 cursor-not-allowed' : '',
        className,
      ].join(' ')}
      {...props as React.ComponentProps<typeof motion.button>}
    >
      <span className={iconDim}>{icon}</span>
    </motion.button>
  )
})

IconButton.displayName = 'IconButton'

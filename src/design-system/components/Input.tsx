import React, { forwardRef, useState, useId } from 'react'
import { Eye, EyeOff, AlertCircle, CheckCircle2 } from 'lucide-react'
import { tw } from '../tokens'

// ─── Input ────────────────────────────────────────────────────────────────────
export interface InputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'size'> {
  label?:      string
  hint?:       string
  error?:      string
  success?:    string
  leftIcon?:   React.ReactNode
  rightIcon?:  React.ReactNode
  inputSize?:  'sm' | 'md' | 'lg'
  fullWidth?:  boolean
}

const inputSizeMap = {
  sm: 'h-8  text-[13px] px-3',
  md: 'h-9  text-[14px] px-3.5',
  lg: 'h-11 text-[15px] px-4',
}

export const Input = forwardRef<HTMLInputElement, InputProps>(({
  label,
  hint,
  error,
  success,
  leftIcon,
  rightIcon,
  inputSize = 'md',
  fullWidth = false,
  className = '',
  id: externalId,
  disabled,
  ...props
}, ref) => {
  const autoId  = useId()
  const id      = externalId ?? autoId
  const hintId  = `${id}-hint`
  const hasLeft  = !!leftIcon
  const hasRight = !!rightIcon || !!error || !!success

  const borderColor = error
    ? 'border-red-500/40 focus:border-red-500/70 focus:ring-red-500/25'
    : success
    ? 'border-green-500/40 focus:border-green-500/70 focus:ring-green-500/25'
    : 'border-white/8 hover:border-white/14 focus:border-primary/50 focus:ring-primary/20'

  return (
    <div className={`flex flex-col gap-1.5 ${fullWidth ? 'w-full' : ''}`}>
      {label && (
        <label
          htmlFor={id}
          className="text-[13px] font-medium text-zinc-300 select-none"
        >
          {label}
          {props.required && <span className="text-red-400 ml-1">*</span>}
        </label>
      )}

      <div className="relative flex items-center">
        {/* Left icon */}
        {hasLeft && (
          <span className="absolute left-3 text-zinc-500 pointer-events-none z-10 w-4 h-4">
            {leftIcon}
          </span>
        )}

        <input
          ref={ref}
          id={id}
          disabled={disabled}
          aria-describedby={hint || error || success ? hintId : undefined}
          aria-invalid={!!error}
          className={[
            'w-full rounded-xl bg-zinc-900/60 border text-zinc-100 placeholder:text-zinc-500',
            'transition-all duration-200 appearance-none',
            'ring-0 focus:outline-none focus:ring-2',
            'disabled:opacity-50 disabled:cursor-not-allowed',
            borderColor,
            inputSizeMap[inputSize],
            hasLeft  ? 'pl-9'  : '',
            hasRight ? 'pr-9'  : '',
            className,
          ].join(' ')}
          {...props}
        />

        {/* Right: status icon or custom */}
        {hasRight && (
          <span className="absolute right-3 pointer-events-none z-10 text-zinc-500 w-4 h-4">
            {error   ? <AlertCircle  className="w-4 h-4 text-red-400"   /> :
             success ? <CheckCircle2 className="w-4 h-4 text-green-400" /> :
             rightIcon}
          </span>
        )}
      </div>

      {/* Hint / error / success text */}
      {(hint || error || success) && (
        <p
          id={hintId}
          className={`text-[12px] leading-relaxed ${
            error   ? 'text-red-400' :
            success ? 'text-green-400' :
            'text-zinc-500'
          }`}
        >
          {error ?? success ?? hint}
        </p>
      )}
    </div>
  )
})

Input.displayName = 'Input'

// ─── PasswordInput ────────────────────────────────────────────────────────────
export const PasswordInput = forwardRef<HTMLInputElement, Omit<InputProps, 'type' | 'rightIcon'>>(
  (props, ref) => {
    const [visible, setVisible] = useState(false)
    return (
      <Input
        ref={ref}
        type={visible ? 'text' : 'password'}
        rightIcon={
          <button
            type="button"
            onClick={() => setVisible(v => !v)}
            className="pointer-events-auto text-zinc-500 hover:text-zinc-300 transition-colors"
            tabIndex={-1}
          >
            {visible
              ? <EyeOff className="w-4 h-4" />
              : <Eye    className="w-4 h-4" />
            }
          </button>
        }
        {...props}
      />
    )
  }
)

PasswordInput.displayName = 'PasswordInput'

// ─── Textarea ─────────────────────────────────────────────────────────────────
export interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?:     string
  hint?:      string
  error?:     string
  fullWidth?: boolean
}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(({
  label, hint, error, fullWidth = false, className = '', id: externalId, ...props
}, ref) => {
  const autoId = useId()
  const id     = externalId ?? autoId

  return (
    <div className={`flex flex-col gap-1.5 ${fullWidth ? 'w-full' : ''}`}>
      {label && (
        <label htmlFor={id} className="text-[13px] font-medium text-zinc-300">
          {label}
        </label>
      )}
      <textarea
        ref={ref}
        id={id}
        className={[
          'w-full rounded-xl bg-zinc-900/60 border border-white/8 text-zinc-100',
          'placeholder:text-zinc-500 px-4 py-3 text-[14px] leading-relaxed',
          'transition-all duration-200 resize-y min-h-[96px]',
          'hover:border-white/14 focus:outline-none focus:border-primary/50 focus:ring-2 focus:ring-primary/20',
          'disabled:opacity-50 disabled:cursor-not-allowed',
          error ? 'border-red-500/40 focus:border-red-500/60' : '',
          className,
        ].join(' ')}
        {...props}
      />
      {(hint || error) && (
        <p className={`text-[12px] ${error ? 'text-red-400' : 'text-zinc-500'}`}>
          {error ?? hint}
        </p>
      )}
    </div>
  )
})

Textarea.displayName = 'Textarea'

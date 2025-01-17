import { ReactNode, MouseEventHandler, forwardRef } from 'react'
import styles from './Button.module.scss'
import { Color } from '../../../types/elements'

type Props = {
  children: ReactNode
  color?: Color
  type?: 'button' | 'submit' | 'reset' | 'link' | undefined
  rounded?: boolean
  onClick?: MouseEventHandler<HTMLButtonElement>
  disabled?: boolean
  rect?: boolean
  className?: string
}

export const Button = forwardRef(
  (
    {
      children,
      color,
      type,
      rounded,
      onClick,
      className,
      rect,
      disabled
    }: Props,
    ref
  ) => {
    let tagName = 'button'
    if (type === 'link') {
      tagName = 'a'
    }

    const Component = tagName as React.ElementType

    const attributes = {
      className: `${styles.btn} ${color && styles[color]} ${
        rounded && styles.rounded
      } ${rect && styles.rect} ${className}`,
      type: type === 'link' ? undefined : type,
      disabled,
      onClick,
      ref
    }

    return <Component {...attributes}>{children}</Component>
  }
)
Button.displayName = 'Button'

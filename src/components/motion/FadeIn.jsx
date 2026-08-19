import { motion } from 'motion/react'
import { fadeUp, viewOnce } from './presets'

/**
 * Subtle fade-up on scroll. Minimal y travel, short duration.
 */
export default function FadeIn({
  children,
  className = '',
  delay = 0,
  as: Tag = motion.div,
}) {
  return (
    <Tag
      className={className}
      initial={fadeUp.initial}
      whileInView={fadeUp.animate}
      viewport={viewOnce}
      transition={{ ...fadeUp.transition, delay }}
    >
      {children}
    </Tag>
  )
}

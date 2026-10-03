// Shared "on entry" animation for motion components. Returns plain props, so server
// components can pass it to `motion/react-client` elements as well.
const easeBrand = [0.5, 0, 0.2, 1] as const; // --ease-brand

export function enter(step = 0, { y = 12, x = 0 }: { y?: number; x?: number } = {}) {
  return {
    initial: { opacity: 0, x, y },
    animate: { opacity: 1, x: 0, y: 0 },
    transition: { duration: 0.5, ease: easeBrand, delay: 0.05 + step * 0.08 },
  };
}

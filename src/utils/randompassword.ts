export function generateStrongPassword(): string {
  const upper = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ',
    lower = 'abcdefghijklmnopqrstuvwxyz',
    nums = '0123456789',
    symbols = '!@#$%^&*()_+[]{}|;:,.<>?'
  const all = upper + lower + nums + symbols
  const getRand = (s: string) => s[Math.floor(Math.random() * s.length)]
  const length = Math.floor(Math.random() * 9) + 8 // random between 8-16
  const required = [getRand(upper), getRand(lower), getRand(nums), getRand(symbols)]
  const rest = Array.from({ length: length - 4 }, () => getRand(all))
  return [...required, ...rest].sort(() => Math.random() - 0.5).join('')
}

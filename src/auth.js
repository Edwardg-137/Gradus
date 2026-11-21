import { createHash, randomBytes, scrypt, timingSafeEqual } from 'node:crypto'
import { promisify } from 'node:util'

const derive = promisify(scrypt)
const params = { N: 32768, r: 8, p: 3, maxmem: 40 * 1024 * 1024 }
const fallbackSalt = randomBytes(16).toString('hex')
const invalidHash = Buffer.alloc(64)

export const newSecret = () => randomBytes(32).toString('hex')
export const digest = value => createHash('sha256').update(value).digest('hex')

export function credentials(data) {
  const email = (data.get('email') ?? '').trim().toLowerCase()
  const password = data.get('password') ?? ''
  const length = [...password].length
  if (email.length > 254 || !/^[^\s@]+@[^\s@.]+(?:\.[^\s@.]+)+$/.test(email)) {
    return { email, error: 'Escribe un correo válido.' }
  }
  if (length < 12 || length > 128) return { email, error: 'Usa una contraseña de 12 a 128 caracteres.' }
  return { email, password }
}

export async function protectPassword(password) {
  const salt = randomBytes(16).toString('hex')
  const hash = await derive(password, salt, 64, params)
  return { salt, passwordHash: hash.toString('hex') }
}

export async function verifyPassword(password, account) {
  const supplied = await derive(password, account?.salt ?? fallbackSalt, 64, params)
  const expected = account ? Buffer.from(account.passwordHash, 'hex') : invalidHash
  return timingSafeEqual(supplied, expected) && Boolean(account)
}

export function limitAuth() {
  const addresses = new Map()
  let resetAt = 0
  let active = 0
  return async (address, action) => {
    if (Date.now() >= resetAt) {
      addresses.clear()
      resetAt = Date.now() + 10 * 60_000
    }
    const attempts = addresses.get(address) ?? 0
    if (attempts >= 30 || active >= 4) return null
    addresses.set(address, attempts + 1)
    active++
    try { return await action() } finally { active-- }
  }
}

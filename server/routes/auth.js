import { Router } from 'express'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import { getStore } from '../store/index.js'

const router = Router()

const JWT_SECRET = process.env.JWT_SECRET || 'dev_secret'

function signToken(user) {
  return jwt.sign(
    { id: user._id, email: user.email, role: user.role },
    JWT_SECRET,
    { expiresIn: '7d' }
  )
}

router.post('/register', async (req, res) => {
  try {
    const { email, password, role } = req.body || {}
    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required' })
    }

    const store = getStore()
    const existing = await store.users.findByEmail(email)
    if (existing) return res.status(409).json({ message: 'Email already registered' })

    const passwordHash = await bcrypt.hash(password, 10)
    const user = await store.users.create({ email, passwordHash, role })

    const token = signToken(user)
    res.json({ token, user: { email: user.email, role: user.role } })
  } catch (err) {
    res.status(500).json({ message: 'Registration failed', error: err.message })
  }
})

router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body || {}
    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required' })
    }

    const store = getStore()
    const user = await store.users.findByEmail(email)
    if (!user) return res.status(401).json({ message: 'Invalid credentials' })

    const valid = await bcrypt.compare(password, user.passwordHash)
    if (!valid) return res.status(401).json({ message: 'Invalid credentials' })

    const token = signToken(user)
    res.json({ token, user: { email: user.email, role: user.role } })
  } catch (err) {
    res.status(500).json({ message: 'Login failed', error: err.message })
  }
})

export default router

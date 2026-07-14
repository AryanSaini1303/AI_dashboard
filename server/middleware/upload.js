import multer from 'multer'
import path from 'path'
import fs from 'fs'

// Resolve uploads/ next to the server regardless of where the process is
// launched from, and make sure it exists so multer never fails with ENOENT.
const UPLOAD_DIR = path.resolve(process.cwd(), 'uploads')
fs.mkdirSync(UPLOAD_DIR, { recursive: true })

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, UPLOAD_DIR),
  filename: (req, file, cb) => {
    const unique = `${Date.now()}-${Math.round(Math.random() * 1e9)}`
    cb(null, `${unique}${path.extname(file.originalname)}`)
  }
})

export const upload = multer({
  storage,
  limits: { fileSize: 15 * 1024 * 1024 } // 15MB, generous for model files too
})

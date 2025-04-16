const express = require('express')
const router = express.Router()
const multer = require('multer')
const cloudinary = require('../utils/cloudinary')
const fs = require('fs')

// Configuración de multer
const storage = multer.diskStorage({
  destination: 'uploads/',
  filename: (req, file, cb) => {
    cb(null, Date.now() + '-' + file.originalname)
  }
})

const fileFilter = (req, file, cb) => {
  if (file.mimetype.startsWith('image/')) {
    cb(null, true)
  } else {
    cb(new Error('Solo se permiten imágenes'), false)
  }
}

const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 } // 5MB máximo
})

// Ruta para subir imagen
router.post('/upload', upload.single('image'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No se subió ninguna imagen' })
    }

    const result = await cloudinary.uploader.upload(req.file.path, {
      folder: 'libros'
    })

    // Borrar archivo temporal
    await fs.promises.unlink(req.file.path)

    // Enviar URL de la imagen
    res.json({ imgUrl: result.secure_url })
  } catch (error) {
    console.error(error)
    res.status(500).json({ error: 'Error al subir la imagen' })
  }
})

module.exports = router

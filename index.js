require('dotenv').config()
const express = require('express')
const jwt = require('jsonwebtoken')
const { verificarCredenciales, registrarUsuario, consultaUsuario, venderLibro, Libros, consultarLibro, consultarUsuario } = require('./consultas')
const authMiddleware = require('./middleware/authMiddleware')

const app = express();
const cors = require('cors')

app.use(express.json())
app.use(cors())

app.listen(3000, () => {
    console.log('http://localhost:3000/api/v1/books');
});


app.post('/api/v1/auth/register', async (req, res) => {
    try {
        const reguser = req.body
        await registrarUsuario(reguser)
        res.send("Usuario registrado")
    } catch (error) {
        res.status(400).json({ error: 'Error al registrar usuario' })
    }
})

app.post('/api/v1/auth/login', async (req, res) => {
    try {
        const { username, password } = req.body
        await verificarCredenciales(username, password)
        const token = jwt.sign({ username }, process.env.JWT_SECRET, { expiresIn: '1h' });
        res.json({ token, username })
    } catch (error) {
        res.status(401).json({ error: 'Credenciales inválidas' })
    }
})

app.get('/api/v1/auth/me', authMiddleware, async (req, res) => {
    try {
        const { username } = req.user
        const user = await consultaUsuario(username)
        res.json(user)
    } catch (error) {
        res.status(401).json({ error })
    }
})

app.post('/api/v1/sell_books', async (req, res) => {
    console.log("BODY RECIBIDO:", req.body)
    try {
        const book = req.body
        await venderLibro(book)
        res.status(200).json({ message: "Libro publicado correctamente" })
    } catch (error) {
        res.status(400).json({ error: error.message })
    }
})

app.get('/api/v1/books', async (req, res) => {
    try {
        book = await Libros()
        res.json(book)
    } catch (error) {
        res.status(401).json({ error })
    }
})

app.get('/api/v1/books/:id', async (req, res) => {
    try {
        const { id } = req.params
        book = await consultarLibro(id)
        res.json(book)
    } catch (error) {
        res.status(401).json({ error })
    }
})

app.get('/api/v1/users', async (req, res) => {
    try {
        user = await consultarUsuario()
        res.json(user)
    } catch (error) {
        res.status(401).json({ error })
    }
})

app.post('/api/v1/checkout', async (req, res) => {
    try {
        const { id } = req.body
        await checkout(id)
        res.status(200).json({ message: "Pago realizado correctamente" })
    } catch (error) {
        res.status(400).json({ error: error.message })
    }
})
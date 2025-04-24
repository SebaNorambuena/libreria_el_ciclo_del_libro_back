require('dotenv').config()
const { Pool } = require('pg');
const format = require('pg-format');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

const pool = new Pool({
    user: process.env.PG_USER,
    host: process.env.PG_HOST,
    database: process.env.PG_DB,
    password: process.env.PG_PASSWORD,
    allowExitOnIdle: true,
    ssl: process.env.PG_SSL === "true" && { rejectUnauthorized: process.env.PG_SSL_REJECT_UNAUTHORIZED !== "false" },
    client_encoding: 'utf8'
});


const registrarUsuario = async (user) => {
    try {
        let { username, email, password } = user
        const passwordEncriptada = bcrypt.hashSync(password, 10)
        password = passwordEncriptada
        const values = [username, email, passwordEncriptada]
        const consulta = format("INSERT INTO users (username, email, password) VALUES (%L)", values)
        await pool.query(consulta)
    } catch (error) {
        console.log(error)
        throw { code: 400, message: "Error al registrar usuario" }
    }
}

const verificarCredenciales = async (username, password) => {
    const consulta = format("SELECT * FROM users WHERE username = %L", username)
    const { rows: [user], rowCount } = await pool.query(consulta)
    
    if (!user || !rowCount) {
        throw { code: 401, message: "Credenciales incorrectas" }
    }

    const { password: encriptPassword } = user
    const correctPassword = bcrypt.compareSync(password, encriptPassword)

    if (!correctPassword) {
        throw { code: 401, message: "Credenciales incorrectas" }
    }
}

const consultaUsuario = async (username) => {
    try {
        const consulta = format("SELECT * FROM users WHERE username = %L", username)
        const { rows: user } = await pool.query(consulta)
        return user
    } catch (error) {
        console.log(error)
        throw { code: 404, message: "Usuario no encontrado" }
    }
}

const venderLibro = async (book) => {

    try {
        const { name, author, category, img, price, description, stock, vendidos } = book
        const values = [name, author, category, img, price, description, stock, vendidos]
        const consulta = format("INSERT INTO books (name, author, category, img, price, description, stock, vendidos) VALUES (%L)", values)
        await pool.query(consulta)
    } catch (error) {
        console.log(error)
        throw { code: 400, message: "Error al registrar libro" }
    }

}

const Libros = async () => {
    try {
        const consulta = format("SELECT * FROM books")
        const { rows: book } = await pool.query(consulta)
        return book
    } catch (error) {
        console.log(error)
        throw { code: 404, message: "No hay libros en la base de datos" }
    }
}

const consultarLibro = async (id) => {
    try {
        const consulta = format("SELECT * FROM books WHERE id = %L", id)
        const { rows: book } = await pool.query(consulta)
        return book
    } catch (error) {
        console.log(error)
        throw { code: 404, message: "Libro no encontrado" }
    }
}

const consultarUsuario = async () => {
    try {
        const consulta = format("SELECT * FROM users")
        const { rows: user } = await pool.query(consulta)
        return user
    } catch (error) {
        console.log(error)
        throw { code: 404, message: "No hay usuarios en la base de datos" }
    }
}

const checkout = async (book) => {
    try {
      const consulta = format(
        "INSERT INTO checkout (user_id, libro) VALUES (%L, %L)",
        book.userId,
        JSON.stringify(book.libro) // Muy importante: convertir a JSON string
      );
  
      await pool.query(consulta);
    } catch (error) {
      console.log("Error al insertar en DB:", error);
      throw { code: 400, message: "Error al realizar el pago" };
    }
  }

module.exports = { verificarCredenciales, registrarUsuario, consultaUsuario, venderLibro, Libros, consultarLibro, consultarUsuario, checkout }
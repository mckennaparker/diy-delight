import express from 'express'
import path from 'path'
import favicon from 'serve-favicon'
import 'dotenv/config'
import { pool } from './config/database.js'
import carsRouter from './routes/cars.js'

const PORT = process.env.PORT || 3001

const app = express()

app.use(express.json())

if (process.env.NODE_ENV === 'development') {
    app.use(favicon(path.resolve('../', 'client', 'public', 'lightning.png')))
}
else if (process.env.NODE_ENV === 'production') {
    app.use(favicon(path.resolve('public', 'lightning.png')))
    app.use(express.static('public'))
}

app.use('/api/cars', carsRouter)
app.use('/api', (_, res) => res.status(404).json({ error: 'API endpoint not found.' }))

if (process.env.NODE_ENV === 'production') {
    app.get('/*', (_, res) =>
        res.sendFile(path.resolve('public', 'index.html'))
    )
}

app.use((error, _, res, __) => {
    const status = error.statusCode || (error.status >= 400 && error.status < 500 ? error.status : 500)
    if (status >= 500) {
        console.error(error)
    }
    res.status(status).json({
        error: status >= 500
            ? 'Something went wrong. Please try again.'
            : error.type === 'entity.parse.failed'
                ? 'Request body must be valid JSON.'
                : error.message
    })
})

const startServer = async () => {
    await pool.query(`
        CREATE TABLE IF NOT EXISTS custom_cars (
            id SERIAL PRIMARY KEY,
            name VARCHAR(50) NOT NULL,
            model VARCHAR(40) NOT NULL,
            color VARCHAR(40) NOT NULL,
            engine VARCHAR(40) NOT NULL,
            wheels VARCHAR(40) NOT NULL,
            upgrade_name VARCHAR(40) NOT NULL,
            budget INTEGER NOT NULL CHECK (budget > 0),
            total_price INTEGER NOT NULL CHECK (total_price >= 0),
            created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
        )
    `)

    app.listen(PORT, () => {
        console.log(`server listening on http://localhost:${PORT}`)
    })
}

startServer().catch(async (error) => {
    console.error('Could not start the server:', error)
    await pool.end()
    process.exitCode = 1
})
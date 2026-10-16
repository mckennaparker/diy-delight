import { pool } from '../config/database.js'
import { carOptions } from '../config/carOptions.js'

const fail = (statusCode, message) => {
    const error = new Error(message)
    error.statusCode = statusCode
    throw error
}

const getPrice = (options, name, label) => {
    const option = options.find((item) => item.name === name)
    if (!option) {
        fail(400, `Choose a valid ${label}.`)
    }
    return option.price
}

const validateCar = (body) => {
    if (!body || typeof body !== 'object' || Array.isArray(body)) {
        fail(400, 'Request body must be a car object.')
    }

    const name = typeof body.name === 'string' ? body.name.trim() : ''
    if (name.length < 2 || name.length > 50) {
        fail(400, 'Give your car a name between 2 and 50 characters.')
    }

    const budget = Number(body.budget)
    if (!Number.isInteger(budget) || budget < 1000 || budget > 250000) {
        fail(400, 'Budget must be a whole number between $1,000 and $250,000.')
    }

    const model = carOptions.models.find((item) => item.name === body.model)
    if (!model) {
        fail(400, 'Choose a valid model.')
    }
    if (!model.engines.includes(body.engine)) {
        fail(400, `${body.engine} is not available for the ${model.name}.`)
    }

    const totalPrice =
        getPrice(carOptions.models, body.model, 'model') +
        getPrice(carOptions.colors, body.color, 'paint color') +
        getPrice(carOptions.engines, body.engine, 'engine') +
        getPrice(carOptions.wheels, body.wheels, 'wheel set') +
        getPrice(carOptions.upgrades, body.upgrade, 'upgrade')

    if (totalPrice > budget) {
        fail(400, `This build costs $${totalPrice.toLocaleString()}, which is over your budget.`)
    }

    return {
        name,
        model: model.name,
        color: body.color,
        engine: body.engine,
        wheels: body.wheels,
        upgrade: body.upgrade,
        budget,
        totalPrice
    }
}

const getId = (value) => {
    const id = Number(value)
    if (!Number.isInteger(id) || id < 1) {
        fail(400, 'Car ID must be a positive whole number.')
    }
    return id
}

export const getOptions = (_, res) => res.json(carOptions)

export const getCars = async (_, res) => {
    const { rows } = await pool.query('SELECT * FROM custom_cars ORDER BY created_at DESC, id DESC')
    res.json(rows)
}

export const getCar = async (req, res) => {
    const { rows } = await pool.query('SELECT * FROM custom_cars WHERE id = $1', [getId(req.params.id)])
    if (!rows[0]) {
        fail(404, 'That custom car could not be found.')
    }
    res.json(rows[0])
}

export const createCar = async (req, res) => {
    const car = validateCar(req.body)
    const { rows } = await pool.query(
        `INSERT INTO custom_cars (name, model, color, engine, wheels, upgrade_name, budget, total_price)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
         RETURNING *`,
        [car.name, car.model, car.color, car.engine, car.wheels, car.upgrade, car.budget, car.totalPrice]
    )
    res.status(201).json(rows[0])
}

export const updateCar = async (req, res) => {
    const id = getId(req.params.id)
    const car = validateCar(req.body)
    const { rows } = await pool.query(
        `UPDATE custom_cars
         SET name = $1, model = $2, color = $3, engine = $4, wheels = $5,
             upgrade_name = $6, budget = $7, total_price = $8
         WHERE id = $9
         RETURNING *`,
        [car.name, car.model, car.color, car.engine, car.wheels, car.upgrade, car.budget, car.totalPrice, id]
    )
    if (!rows[0]) {
        fail(404, 'That custom car could not be found.')
    }
    res.json(rows[0])
}

export const deleteCar = async (req, res) => {
    const { rowCount } = await pool.query('DELETE FROM custom_cars WHERE id = $1', [getId(req.params.id)])
    if (!rowCount) {
        fail(404, 'That custom car could not be found.')
    }
    res.status(204).end()
}

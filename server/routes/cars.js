import { Router } from 'express'
import {
    createCar,
    deleteCar,
    getCar,
    getCars,
    getOptions,
    updateCar
} from '../controllers/cars.js'

const router = Router()
const handle = (controller) => (req, res, next) =>
    Promise.resolve(controller(req, res, next)).catch(next)

router.get('/options', handle(getOptions))
router.get('/', handle(getCars))
router.get('/:id', handle(getCar))
router.post('/', handle(createCar))
router.put('/:id', handle(updateCar))
router.delete('/:id', handle(deleteCar))

export default router

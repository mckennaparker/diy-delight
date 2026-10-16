import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import CarForm from '../components/CarForm'
import { createCar } from '../services/api'

const CreateCar = ({ title }) => {
    const navigate = useNavigate()
    useEffect(() => { document.title = title }, [title])
    return (
        <CarForm
            submitLabel="Save my build"
            onSave={async (car) => {
                const savedCar = await createCar(car)
                navigate(`/customcars/${savedCar.id}`)
            }}
        />
    )
}

export default CreateCar
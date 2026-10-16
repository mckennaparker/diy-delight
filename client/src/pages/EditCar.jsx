import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import CarForm from '../components/CarForm'
import { getCar, updateCar } from '../services/api'

const EditCar = ({ title }) => {
    const { id } = useParams()
    const navigate = useNavigate()
    const [car, setCar] = useState(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState('')

    useEffect(() => {
        document.title = title
        let active = true
        getCar(id)
            .then((data) => { if (active) setCar(data) })
            .catch((requestError) => { if (active) setError(requestError.message) })
            .finally(() => { if (active) setLoading(false) })
        return () => { active = false }
    }, [id, title])

    const saveChanges = async (updatedCar) => {
        const savedCar = await updateCar(id, updatedCar)
        navigate(`/customcars/${savedCar.id}`)
    }

    return (
        <>
            {loading && <main className="page-shell"><p className="notice">Loading your build…</p></main>}
            {error && <main className="page-shell"><p className="notice error" role="alert">{error}</p></main>}
            {car && <CarForm car={car} onSave={saveChanges} submitLabel="Save changes" />}
        </>
    )
}

export default EditCar
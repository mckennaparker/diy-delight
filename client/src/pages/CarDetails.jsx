import { useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { deleteCar, formatMoney, getCar } from '../services/api'

const CarDetails = ({ title }) => {
    const { id } = useParams()
    const navigate = useNavigate()
    const [car, setCar] = useState(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState('')
    const [deleting, setDeleting] = useState(false)

    useEffect(() => {
        document.title = title
        let active = true
        getCar(id)
            .then((data) => { if (active) setCar(data) })
            .catch((requestError) => { if (active) setError(requestError.message) })
            .finally(() => { if (active) setLoading(false) })
        return () => { active = false }
    }, [id, title])

    const handleDelete = async () => {
        if (!window.confirm(`Delete "${car.name}" from the garage? This cannot be undone.`)) return
        setDeleting(true)
        setError('')
        try {
            await deleteCar(car.id)
            navigate('/customcars')
        } catch (requestError) {
            setError(requestError.message)
            setDeleting(false)
        }
    }

    return (
        <main className="page-shell">
            {loading && <p className="notice">Loading your build…</p>}
            {error && <p className="notice error" role="alert">{error}</p>}
            {!loading && !car && !error && <p className="notice">This build could not be found.</p>}
            {car && (
                <section className="details-layout">
                    <div className="panel details-art" style={{ '--paint-color': getPaintColor(car.color) }}>
                        <span className="eyebrow">BOLT BUCKET GARAGE · #{car.id}</span>
                        <span className="details-lightning" aria-hidden="true">⚡</span>
                        <div><span className="car-card-tag">{car.model}</span><h2>{car.name}</h2></div>
                    </div>
                    <article className="panel details-panel">
                        <div className="eyebrow">YOUR CUSTOM BUILD</div>
                        <h2>{car.name}</h2>
                        <p className="muted">{car.model} · Built {new Date(car.created_at).toLocaleDateString()}</p>
                        <div className="details-total">
                            <div><span>Build total</span><strong>{formatMoney(car.total_price)}</strong></div>
                            <div><span>Budget </span><strong>{formatMoney(car.budget)}</strong></div>
                            <p>{formatMoney(car.budget - car.total_price)} left in your budget</p>
                        </div>
                        <ul className="spec-list">
                            <li><span>Paint</span><strong><i className="paint-dot" style={{ backgroundColor: getPaintColor(car.color) }} />{car.color}</strong></li>
                            <li><span>Engine</span><strong>{car.engine}</strong></li>
                            <li><span>Wheels</span><strong>{car.wheels}</strong></li>
                            <li><span>Upgrade</span><strong>{car.upgrade_name}</strong></li>
                        </ul>
                        <div className="form-actions">
                            <Link className="button-primary" to={`/edit/${car.id}`}>Edit build</Link>
                            <button className="button-danger" type="button" onClick={handleDelete} disabled={deleting}>
                                {deleting ? 'Deleting…' : 'Delete'}
                            </button>
                            <Link className="button-quiet" to="/customcars">Back to garage</Link>
                        </div>
                    </article>
                </section>
            )}
        </main>
    )
}

const getPaintColor = (name) => ({
    'Midnight Black': '#17191f',
    'Volt Red': '#d43a42',
    'Electric Blue': '#3585df',
    'Solar Yellow': '#f1c644',
    'Pearl White': '#e9e8e3'
}[name] || '#aab2bf')

export default CarDetails
import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { formatMoney, getCars } from '../services/api'

const ViewCars = ({ title }) => {
    const [cars, setCars] = useState([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState('')

    useEffect(() => {
        document.title = title
        let active = true
        getCars()
            .then((data) => { if (active) setCars(data) })
            .catch((requestError) => { if (active) setError(requestError.message) })
            .finally(() => { if (active) setLoading(false) })
        return () => { active = false }
    }, [title])

    return (
        <main className="page-shell">
            <header className="page-heading">
                <div>
                    <div className="eyebrow">THE COMMUNITY GARAGE</div>
                    <h2>Custom builds</h2>
                    <p className="muted">Every ride is one of a kind. Find yours in the garage.</p>
                </div>
                <Link className="button-primary" to="/">＋ Build a car</Link>
            </header>

            {loading && <p className="notice">Loading the garage…</p>}
            {error && <p className="notice error" role="alert">{error}</p>}
            {!loading && !error && cars.length === 0 && (
                <section className="panel empty-state">
                    <span className="empty-icon" aria-hidden="true">⚡</span>
                    <h3>The garage is waiting</h3>
                    <p className="muted">You haven’t saved a custom car yet. Start with a model and make it your own.</p>
                    <Link className="button-primary" to="/">Start your first build</Link>
                </section>
            )}
            {!loading && !error && cars.length > 0 && (
                <section className="car-grid" aria-label="Saved custom cars">
                    {cars.map((car) => (
                        <article className="panel car-card" key={car.id}>
                            <div className="car-card-art" style={{ '--paint-color': getPaintColor(car.color) }}>
                                <span className="car-card-tag">{car.model}</span>
                                <span className="car-card-flash" aria-hidden="true">⚡</span>
                            </div>
                            <div className="car-card-body">
                                <div className="car-card-title">
                                    <div><h3>{car.name}</h3><p className="muted">{car.engine}</p></div>
                                    <span className="paint-dot" style={{ backgroundColor: getPaintColor(car.color) }} title={car.color} />
                                </div>
                                <div className="car-card-price"><span>Build total</span><strong>{formatMoney(car.total_price)}</strong></div>
                                <p className="muted budget-caption">of {formatMoney(car.budget)} budget</p>
                                <Link className="button-primary card-link" to={`/customcars/${car.id}`}>View build <span aria-hidden="true">→</span></Link>
                            </div>
                        </article>
                    ))}
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

export default ViewCars
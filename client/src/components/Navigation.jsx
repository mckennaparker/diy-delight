import { Link, NavLink } from 'react-router-dom'
import '../css/Navigation.css'

const Navigation = () => {
    return (
        <nav className="site-nav">
            <ul>
                <li><Link className="brand" to="/"><img src="/lightning.png" alt="" />BOLT BUCKET<span> GARAGE</span></Link></li>
            </ul>
            <ul>
                <li><NavLink to="/" end className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}>Build a Car</NavLink></li>
                <li><NavLink to="/customcars" className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}>The Garage</NavLink></li>
            </ul>
        </nav>
    )
}

export default Navigation
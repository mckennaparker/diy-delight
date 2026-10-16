import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { formatMoney, getCarOptions } from '../services/api'

const CarForm = ({ car, onSave, submitLabel }) => {
    const [options, setOptions] = useState(null)
    const [form, setForm] = useState(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState('')
    const [saving, setSaving] = useState(false)

    useEffect(() => {
        let active = true
        getCarOptions()
            .then((data) => {
                if (!active) return
                setOptions(data)
                setForm({
                    name: car?.name || '',
                    budget: String(car?.budget || 50000),
                    model: car?.model || data.models[0].name,
                    color: car?.color || data.colors[0].name,
                    engine: car?.engine || data.engines[0].name,
                    wheels: car?.wheels || data.wheels[0].name,
                    upgrade: car?.upgrade_name || data.upgrades[0].name
                })
            })
            .catch((requestError) => {
                if (active) setError(requestError.message)
            })
            .finally(() => {
                if (active) setLoading(false)
            })
        return () => { active = false }
    }, [car])

    const selectedModel = options?.models.find((item) => item.name === form?.model)
    const compatibleEngine = selectedModel?.engines.includes(form?.engine) ?? false
    const total = useMemo(() => {
        if (!options || !form) return 0
        const priceFor = (group, name) => group.find((item) => item.name === name)?.price || 0
        return priceFor(options.models, form.model) +
            priceFor(options.colors, form.color) +
            priceFor(options.engines, form.engine) +
            priceFor(options.wheels, form.wheels) +
            priceFor(options.upgrades, form.upgrade)
    }, [options, form])
    const budget = Number(form?.budget)
    const withinBudget = Number.isInteger(budget) && budget >= 1000 && total <= budget

    const setField = (field) => (event) => {
        setForm((current) => ({ ...current, [field]: event.target.value }))
        setError('')
    }

    const handleSubmit = async (event) => {
        event.preventDefault()
        setError('')
        if (!compatibleEngine) {
            setError('That engine is not available for this model. Choose a compatible engine to continue.')
            return
        }
        if (!withinBudget) {
            setError('Increase your budget or choose less expensive parts to continue.')
            return
        }

        setSaving(true)
        try {
            await onSave({ ...form, budget })
        } catch (requestError) {
            setError(requestError.message)
        } finally {
            setSaving(false)
        }
    }

    if (loading) return <main className="page-shell"><p className="notice">Loading build options…</p></main>
    if (!options || !form) return <main className="page-shell"><p className="notice error">{error || 'Build options could not be loaded.'}</p></main>

    const renderChoices = (label, field, choices) => (
        <label className="field" htmlFor={field}>
            <span>{label}</span>
            <select id={field} value={form[field]} onChange={setField(field)} required>
                {choices.map((choice) => (
                    <option
                        key={choice.name}
                        value={choice.name}
                        disabled={field === 'engine' && !selectedModel.engines.includes(choice.name)}
                    >
                        {choice.name} {choice.price ? `(+${formatMoney(choice.price)})` : '(included)'}
                    </option>
                ))}
            </select>
        </label>
    )

    return (
        <main className="page-shell builder-layout">
            <section className="panel builder-panel">
                <div className="eyebrow">YOUR GARAGE · BUILD 01</div>
                <h2>{car ? 'Refine your ride' : 'Build your dream ride'}</h2>
                <p className="muted">Pick your platform, dial in the details, and keep the build under budget.</p>
                <form onSubmit={handleSubmit}>
                    <label className="field" htmlFor="car-name">
                        <span>Give your build a name</span>
                        <input id="car-name" value={form.name} onChange={setField('name')} minLength="2" maxLength="50" placeholder="e.g. Midnight Runner" required />
                    </label>
                    <label className="field" htmlFor="budget">
                        <span>Your budget</span>
                        <div className="money-input">
                            <span aria-hidden="true">$</span>
                            <input id="budget" type="number" min="1000" max="250000" step="1000" value={form.budget} onChange={setField('budget')} required />
                        </div>
                    </label>

                    <div className="field-grid">
                        {renderChoices('Choose a model', 'model', options.models)}
                        {renderChoices('Engine', 'engine', options.engines)}
                        {renderChoices('Paint', 'color', options.colors)}
                        {renderChoices('Wheels', 'wheels', options.wheels)}
                        {renderChoices('Upgrade package', 'upgrade', options.upgrades)}
                    </div>

                    {!compatibleEngine && (
                        <p className="notice warning" role="status">
                            {form.engine} doesn’t fit the {selectedModel.name}. Choose one of the available engines before saving.
                        </p>
                    )}

                    <div className="build-total" aria-live="polite">
                        <div><span>Build total</span><strong>{formatMoney(total)}</strong></div>
                        <div><span>Budget</span><strong className={withinBudget ? 'budget-ok' : 'budget-over'}>{formatMoney(Number.isFinite(budget) ? budget : 0)}</strong></div>
                        <div className="budget-track" aria-hidden="true">
                            <span style={{ width: `${Math.min((total / Math.max(budget, 1)) * 100, 100)}%` }} />
                        </div>
                        {!withinBudget && <p className="budget-over">You’re over budget. Change your budget or parts.</p>}
                    </div>

                    {error && <p className="notice error" role="alert">{error}</p>}
                    <div className="form-actions">
                        <button className="button-primary" type="submit" disabled={saving || !withinBudget || !compatibleEngine}>
                            {saving ? 'Saving…' : submitLabel || 'Save my build'}
                        </button>
                        {car && <Link className="button-quiet" to={`/customcars/${car.id}`}>Cancel</Link>}
                        {!car && <Link className="button-quiet" to="/customcars">Browse builds</Link>}
                    </div>
                </form>
            </section>
            <aside className="panel garage-preview">
                <div className="eyebrow">LIVE BUILD</div>
                <div className="preview-car" style={{ '--paint-color': options.colors.find((item) => item.name === form.color)?.hex }}>
                    <span className="preview-light" />
                    <span className="preview-car-label">BOLT BUCKET</span>
                </div>
                <h3>{form.name || 'Your next ride'}</h3>
                <p className="muted">{form.model} <span aria-hidden="true">·</span> {form.engine}</p>
                <ul className="preview-specs">
                    <li><span>Paint</span><strong>{form.color}</strong></li>
                    <li><span>Wheels</span><strong>{form.wheels}</strong></li>
                    <li><span>Package</span><strong>{form.upgrade}</strong></li>
                </ul>
                <div className="preview-total"><span>Current estimate</span><strong>{formatMoney(total)}</strong></div>
            </aside>
        </main>
    )
}

export default CarForm

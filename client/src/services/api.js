const request = async (url, options = {}) => {
    let response
    try {
        response = await fetch(url, {
            ...options,
            headers: {
                ...(options.body ? { 'Content-Type': 'application/json' } : {}),
                ...options.headers
            }
        })
    } catch {
        throw new Error('Could not reach the API. Check that the server is running and the Vite proxy uses its port.')
    }

    if (response.status === 204) {
        return null
    }

    let body
    try {
        body = await response.json()
    } catch {
        if (!response.ok) {
            throw new Error(`The API returned an empty or non-JSON response (HTTP ${response.status}).`)
        }
        throw new Error('The API returned an invalid response.')
    }

    if (!response.ok) {
        throw new Error(body.error || 'The request could not be completed.')
    }
    return body
}

export const getCarOptions = (options) => request('/api/cars/options', options)
export const getCars = (options) => request('/api/cars', options)
export const getCar = (id, options) => request(`/api/cars/${id}`, options)
export const createCar = (car) => request('/api/cars', {
    method: 'POST',
    body: JSON.stringify(car)
})
export const updateCar = (id, car) => request(`/api/cars/${id}`, {
    method: 'PUT',
    body: JSON.stringify(car)
})
export const deleteCar = (id) => request(`/api/cars/${id}`, { method: 'DELETE' })

export const formatMoney = (amount) =>
    new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(amount)

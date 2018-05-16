import fetch from 'isomorphic-fetch'

export default function apiMiddleware (req) {
  return store => next => action => {
    const { payload, meta } = action
    if (!payload || !payload.api) return next(action)

    const { path, params, method } = payload.api
    const cookie = req && req.headers.cookie
    let promise = fetchJSON(path, params, {method, cookie})

    if (meta && meta.then) {
      promise = promise.then(meta.then)
    }

    return next({...action, payload: promise})
  }
}

export const HOST = process.env.API_HOST || (typeof window === 'undefined' ? '' : window.location.origin)

export function fetchJSON (path, params, options = {}) {
  const fetchURL = (options.host || HOST) + path
  const fetchOptions = {
    method: options.method || 'get',
    headers: {
      'Accept': 'application/json',
      'Content-Type': 'application/json',
      'Cookie': options.cookie
    },
    credentials: 'same-origin',
    body: JSON.stringify(params)
  }
  const processResults = (resp) => {
    let { status, statusText, url } = resp
    if (status === 200) return resp.json()
    return resp.text().then(body => {
      let error = new Error(body)
      error.response = {status, statusText, url, body}
      throw error
    })
  }
  return fetch(fetchURL, fetchOptions).then(processResults)
}

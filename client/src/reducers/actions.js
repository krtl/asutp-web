export const FETCHING_BEGIN = 'FETCHING_BEGIN'
export function fetchingBegin(url, method) {
  return {
    type: FETCHING_BEGIN,
    url,
    method,
  }
}

export const FETCHING_END = 'FETCHING_END'
export function fetchingEnd(data, error) {
  return {
    type: FETCHING_END,
    data,
    error,
    receivedAt: Date.now()
  }
}


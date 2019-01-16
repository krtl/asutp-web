export const LOADING_BEGIN = 'LOADING_BEGIN'
export function loadingBegin() {
  return {
    type: LOADING_BEGIN,
  }
}

export const LOADING_END = 'LOADING_END'
export function loadingEnd(error) {
  return {
    type: LOADING_END,
    error,
    receivedAt: Date.now()
  }
}
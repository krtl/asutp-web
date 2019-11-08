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

export const INC_COUNT_OF_UPDATES = 'INC_COUNT_OF_UPDATES'
export function incCountOfUpdates() {
  return {
    type: INC_COUNT_OF_UPDATES,
  }
}



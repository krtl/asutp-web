
const initialState = [
];

export default function elementList(state = initialState, action) {
  if (action.type === 'ADD_ELEMENT') {
    return [
      ...state,
      action.payload,
    ];
  } else if (action.type === 'DELETE_ELEMENT') {
    const elements = state.slice();
    const i = elements.indexOf(elements.find(element => element.id === action.payload));
    if (i > -1) {
      elements.splice(i, 1);
    }
    return elements;
  }
  return state;
}

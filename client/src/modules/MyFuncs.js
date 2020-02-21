function MakeUid(length) {
  let text = "";
  const possible =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

  for (let i = 0; i < length; i++)
    text += possible.charAt(Math.floor(Math.random() * possible.length));

  return text;
}

function RoundFloatString(value, wholeDigits) {
  if (value) {
    const str = String(value);
    if (str.length > wholeDigits) {
      const pointPos = str.indexOf(".");
      if (pointPos > -1) {
        return str.substring(0, wholeDigits);
      }
    }
  }
  return value;
}

export { MakeUid, RoundFloatString };

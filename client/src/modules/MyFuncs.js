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

function GetBorderColor(paramQD) {
  let borderColor = "grey";
  if (paramQD) {
    if (paramQD.indexOf("B") > -1) {
      borderColor = "maroon";
    } else if (paramQD.indexOf("Z") > -1) {
      borderColor = "blue";
    } else if (paramQD.indexOf("NA") > -1) {
      borderColor = "gold";
    }
  }
  return borderColor;
}

function InsertLineBreaks(text, size) {
  let words = text.split(" ");
  let chunk = "";
  let chunks = [];
  let j = 0;
  for (let i = 0; i < words.length; i++) {
    if (j > size) {
      chunks.push(chunk);
      chunk = "";
      j = 0;
    }
    if (chunk !== "") chunk += " ";
    chunk += words[i];
    j += words[i].length + 1;
  }

  if (chunk !== "") chunks.push(chunk);

  return chunks.join("\n");
}

export { MakeUid, RoundFloatString, GetBorderColor, InsertLineBreaks };

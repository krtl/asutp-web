function padLeft(int) {
  const str = int.toString();
  const pad = "00";
  return pad.substring(0, pad.length - str.length) + str;
}

export function formatTime(stringMilliseconds) {
  const d = new Date(Number(stringMilliseconds));
  return `${[
    padLeft(d.getHours()),
    padLeft(d.getMinutes()),
    padLeft(d.getSeconds())
  ].join(":")}`;
  // return `${[
  //   padLeft(d.getDate()),
  //   padLeft(d.getMonth() + 1),
  //   d.getFullYear()].join('/')} ${
  //   [padLeft(d.getHours()),
  //     padLeft(d.getMinutes()),
  //     padLeft(d.getSeconds())].join(':')}`;
}

export function formatDateTime(stringMilliseconds) {
  const d = new Date(Number(stringMilliseconds));
  return `${[
    d.getFullYear(),
    padLeft(d.getMonth() + 1),
    padLeft(d.getDate())
  ].join("-")}T${[
    padLeft(d.getHours()),
    padLeft(d.getMinutes()),
    padLeft(d.getSeconds())
  ].join(":")}`;
}

export function timeDifference(stringMilliseconds2, stringMilliseconds1) {
  let totalSec =
    Math.floor(Number(stringMilliseconds2) / 1000) -
    Math.floor(Number(stringMilliseconds1) / 1000);
  const hh = Math.floor(totalSec / 60 / 60);
  totalSec -= hh * 60 * 60;
  const mm = Math.floor(totalSec / 60);
  totalSec -= mm * 60;
  const ss = Math.floor(totalSec);

  return `${padLeft(hh)}:${padLeft(mm)}:${padLeft(ss)}`;
}

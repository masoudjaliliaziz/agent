import * as moment from "moment-jalaali";

export function convertToJalaliDateTime(sharpointDateString) {
  if (!sharpointDateString) return "";

  const m = moment(sharpointDateString);

  if (!m.isValid()) return "";

  return m.format("jYYYY/jMM/jDD HH:mm:ss");
}

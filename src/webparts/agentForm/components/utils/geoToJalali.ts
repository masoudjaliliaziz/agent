import * as moment from "moment-jalaali";

export function convertToJalaliDateTime(sharpointDateString) {
  if (!sharpointDateString) return "";

  // تبدیل رشته تاریخ به moment
  const m = moment(sharpointDateString);

  // بررسی اعتبار تاریخ
  if (!m.isValid()) return "";

  // تبدیل به فرمت شمسی با ساعت
  return m.format("jYYYY/jMM/jDD HH:mm:ss");
}

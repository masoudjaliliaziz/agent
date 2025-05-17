export function convertIsoToJalali(isoString: string): string {
  const gDate = new Date(isoString);
  const gy = gDate.getUTCFullYear();
  const gm = gDate.getUTCMonth() + 1;
  const gd = gDate.getUTCDate();
  const hours = gDate.getUTCHours();
  const minutes = gDate.getUTCMinutes();

  const jDate = toJalali(gy, gm, gd);

  return `${jDate.jy}/${jDate.jm}/${jDate.jd} - ${hours}:${minutes}`;
}

function toJalali(gy: number, gm: number, gd: number) {
  const g_d_m = [
    0,
    31,
    (gy % 4 === 0 && gy % 100 !== 0) || gy % 400 === 0 ? 29 : 28,
    31,
    30,
    31,
    30,
    31,
    31,
    30,
    31,
    30,
    31,
  ];
  let jy = gy <= 1600 ? 0 : 979;
  let gy2 = gy - (gy <= 1600 ? 621 : 1600);
  let days =
    365 * gy2 +
    Math.floor((gy2 + 3) / 4) -
    Math.floor((gy2 + 99) / 100) +
    Math.floor((gy2 + 399) / 400);
  for (let i = 0; i < gm; ++i) days += g_d_m[i];
  days += gd - 1;
  let j_day_no = days - 79;
  let j_np = Math.floor(j_day_no / 12053);
  j_day_no %= 12053;
  jy += 33 * j_np + 4 * Math.floor(j_day_no / 1461);
  j_day_no %= 1461;
  if (j_day_no >= 366) {
    jy += Math.floor((j_day_no - 1) / 365);
    j_day_no = (j_day_no - 1) % 365;
  }
  const jmList = [31, 31, 31, 31, 31, 31, 30, 30, 30, 30, 30, 29];
  let jm = 0;
  let jd = 0;
  for (let i = 0; i < 12 && j_day_no >= jmList[i]; ++i) {
    j_day_no -= jmList[i];
    jm++;
  }
  jd = j_day_no + 1;
  return { jy, jm: jm + 1, jd };
}

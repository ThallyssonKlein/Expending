export function buildMonthSlashYearDateString(pastMonth: boolean = false) {
  const date = new Date();
  if (pastMonth) {
      date.setMonth(date.getMonth() - 1);
  }
  const month = date.getMonth() + 1; // Add 1 to get month in range 1-12
  const year = date.getFullYear();
  return `${month}/${year}`;
}

export function buildDaySlashMonthDateString() {
  const hoje = new Date();
  const dia = hoje.getDate().toString().padStart(2, "0");
  const mes = (hoje.getMonth() + 1).toString().padStart(2, "0");
  return `${dia}/${mes}`;
}
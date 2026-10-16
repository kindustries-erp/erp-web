export function quarterFirstDay(q: string): string {
  if (!q || !q.includes("-Q")) return "";
  const [year, qNum] = q.split("-Q");
  const qInt = parseInt(qNum, 10);
  const startMonth = (qInt - 1) * 3 + 1;
  return `${year}-${String(startMonth).padStart(2, "0")}-01`;
}

export function quarterLastDay(q: string): string {
  if (!q || !q.includes("-Q")) return "";
  const [year, qNum] = q.split("-Q");
  const qInt = parseInt(qNum, 10);
  const endMonth = qInt * 3;
  const lastDay = new Date(Number(year), endMonth, 0).getDate();
  return `${year}-${String(endMonth).padStart(2, "0")}-${String(lastDay).padStart(2, "0")}`;
}

export function initQuarter(): string {
  const d = new Date();
  const q = Math.floor(d.getMonth() / 3) + 1;
  return `${d.getFullYear()}-Q${q}`;
}

export function generateQuarterOptions(
  yearsBack = 3,
): Array<{ value: string; label: string }> {
  const currentYear = new Date().getFullYear();
  const currentQuarter = Math.floor(new Date().getMonth() / 3) + 1;
  const options: Array<{ value: string; label: string }> = [];

  for (let y = currentYear; y >= currentYear - yearsBack; y--) {
    const maxQ = y === currentYear ? currentQuarter : 4;
    for (let q = maxQ; q >= 1; q--) {
      const val = `${y}-Q${q}`;
      const from = quarterFirstDay(val);
      const to = quarterLastDay(val);
      options.push({
        value: val,
        label: `Quý ${q}/${y} (${from.slice(8, 10)}/${from.slice(5, 7)} - ${to.slice(8, 10)}/${to.slice(5, 7)}/${y})`,
      });
    }
  }
  return options;
}

export function quarterFromExactRange(
  dateFrom?: string,
  dateTo?: string,
): string {
  if (!dateFrom || !dateTo || dateFrom.length < 10 || dateTo.length < 10)
    return "";
  const year = dateFrom.slice(0, 4);
  if (dateTo.slice(0, 4) !== year) return "";

  for (let q = 1; q <= 4; q++) {
    const qKey = `${year}-Q${q}`;
    if (dateFrom === quarterFirstDay(qKey) && dateTo === quarterLastDay(qKey)) {
      return qKey;
    }
  }
  return "";
}

import { APIData } from "src/types/index.dto";

const QTRs: number[] = [1, 2, 3, 4];
const MONTHS: number[] = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12];

export const defaultDataSet = (data: APIData[], filterValue: string) => {
  return data
    .filter((d) => d.name === filterValue)
    .map((m) => [convertStringDateToUTC(m.date), m.quantity]);
}

export const quarterWiseData = (data: APIData[], filterValue: string) => {
  const defaultData = defaultDataSet(data, filterValue);
  return QTRs.map((q) => [
    `QTR-${q}`,
    defaultData
      .map((i) => [getQuarterFromDate(i[0]).toString(), i[1]])
      .filter((i) => +i[0] === q)
      .map((j) => +j[1])
      .reduce((acc, curr) => acc + curr, 0),
  ]);
}

export const monthWiseData = (data: APIData[], filterValue: string) =>{
  const defaultData = defaultDataSet(data, filterValue);
  return MONTHS.map((q) => [
    q,
    defaultData
      .map((i) => [getMonthFromDate(i[0]), i[1]])
      .filter((i) => i[0] === q)
      .map((j) => j[1])
      .reduce((acc, curr) => acc + curr, 0),
  ]);
}


// COnverstion String date to UTC
export const convertStringDateToUTC = (date: string) => {
  const [year, month, day] = date.split('-');
  return Date.UTC(+year, +month, +day);
}


// Function to get the quarter from a given timestamp
export const getQuarterFromDate = (timestamp: number): number  => {
  const date = new Date(timestamp);
  return Math.floor(date.getUTCMonth() / 3) + 1;
}


export const getMonthFromDate = (timestamp: number): number => {
  const date = new Date(timestamp);
  return Math.floor(date.getUTCMonth()) + 1;
}


export const randomColorGenerator = () => {
  return '#' + Math.random().toString(16).substr(2, 6);
}

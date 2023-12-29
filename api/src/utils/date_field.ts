export function convertDateToYearTraceMonthTraceDayFormat(date: Date): string {
    const dia = date.getDate().toString().padStart(2, '0');
    const mes = (date.getMonth() + 1).toString().padStart(2, '0');
    const ano = (date.getFullYear()).toString().padStart(4, '0');
  
    return `${ano}-${mes}-${dia}`
}

export function buildDatePropertyData(date?: string) {
    const dateValue = {
        date: {
            start: date ? date : convertDateToYearTraceMonthTraceDayFormat(new Date()),
            end: null
        }
    }
  
    return {
      Date: dateValue
    }
  }
  
export function getDateOfTheFirstDayOfThisMonth(pastMonth: boolean = false): Date {
    const date = new Date();
    const firstDay = new Date(date.getFullYear(), pastMonth ? date.getMonth() - 1 : date.getMonth(), 1);
    return firstDay;
}
  
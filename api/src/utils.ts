function buildYearTraceMonthTraceDayTraceDateString() {
    let agr = new Date();

    // agr.setUTCHours(0, 0, 0, 0); // Zera o tempo UTC
    // return agr.toISOString()
    // return the date in the format 2023-02-23

    const dia = agr.getDate().toString().padStart(2, '0');
    const mes = (agr.getMonth() + 1).toString().padStart(2, '0');
    const ano = agr.getFullYear();
    return `${ano}-${mes}-${dia}`;
}

export function buildMonthSlashYearDateString(){
    //const hoje = new Date();
    const mes = (11).toString().padStart(2, '0');
    const ano = 2023;
    return `${mes}/${ano}`;
}

export function buildDatePropertyData(date?: string, fieldName?: string) {
    const dateValue = {
        date: {
            start: date ? date : buildYearTraceMonthTraceDayTraceDateString(),
            end: null
        }
    }

    if (fieldName) {
        return {
            [fieldName]: dateValue
        }
    } else {
        return {
            Date: dateValue
        }
    }
}
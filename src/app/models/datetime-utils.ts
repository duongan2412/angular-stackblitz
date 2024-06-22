import moment from 'moment';

export class DatetimeUtils {
    public static COMMON_DATE_FORMAT = 'YYYY-MM-DD';
    public static COMMON_DATETIME_FORMAT = 'YYYY-MM-DD HH:mm:ss';

    public static today() {
        return moment().toDate();
    }

    public static getday(day: number) {
        return moment().add(day, 'days').toDate();
    }

    public static tomorrow() {
        return moment().add(1, 'days').toDate();
    }

    public static todayStr(format?: string) {
        return moment().format(format ?? this.COMMON_DATETIME_FORMAT);
    }

    public static tomorrowStr(format?: string) {
        return moment().add(1, 'days').format(format ?? this.COMMON_DATETIME_FORMAT);
    }

    public static format(date: string | Date, format?: string) {
        return moment(date).format(format ?? this.COMMON_DATETIME_FORMAT);
    }

    public static toDate(date: string) {
        return moment(date).toDate();
    }

    public static utcToLocal(utcDate: string, format?: string) {
        const date = moment.utc(utcDate).toDate();
        return moment(date).local().format(format ?? this.COMMON_DATETIME_FORMAT);
    }

    public static localToUtc(localDate: string, format?: string) {
        return moment(localDate).utc().format(format ?? this.COMMON_DATETIME_FORMAT);
    }
}

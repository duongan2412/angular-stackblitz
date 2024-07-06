export class Helper {
    public static round2d(num: number) {
        if (num === null || num === undefined || isNaN(num)) {
            return 0;
        }
        if (this.countDecimals(num) <= 2) {
            return num;
        }
        const sign = Math.sign(num);
        const absNumber = Math.abs(num);
        const thirdDecimal = Math.floor((absNumber * 1000) % 10);
        let roundedNumber;
        if (thirdDecimal >= 5) {
            roundedNumber = Math.ceil(absNumber * 100) / 100;
        } else {
            roundedNumber = Math.floor(absNumber * 100) / 100;
        }
        return Math.round((roundedNumber * sign) * 100) / 100;
    }


    public static countDecimals(number: number) {
        if (Math.floor(number) === number) return 0;
        return number.toString().split(".")[1].length || 0;
    }
}

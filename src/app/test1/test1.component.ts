import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-test1',
  templateUrl: './test1.component.html',
  styleUrls: ['./test1.component.css'],
})
export class Test1Component implements OnInit {
  constructor() {}
  bookingDate: any;
  serviceTransaction: any;
  ngOnInit() {
    console.log(this.round(3.171, 2));
    this.bookingDate = [
      {
        confirmNumber: '23A00672',
        bookingCode: '23B00767',
        room: '104',
        guestName: 'Shiba',
        arrival: '2023-09-08 09:48:30',
        departure: '2023-10-08 11:00:00',
        company: 'Agoda 2',
        amount: 0,
        originAmount: '45.00',
        notice: '',
        cashier: null,
        paymentMethod: 'Receivables',
        customers: 'Shiba',
        hasServiceCharge: 1,
        hasAct: 1,
        createdAt: '2023-09-08',
        checkNumCode: '',
        date: '2023-09-08',
        type: 'RTT',
        refId: 1218,
        transId: 1218,
      },
      {
        confirmNumber: '23A00672',
        bookingCode: '23B00767',
        room: '104',
        guestName: 'Shiba',
        arrival: '2023-09-08 09:48:30',
        departure: '2023-10-08 11:00:00',
        company: 'Agoda 2',
        amount: 0,
        originAmount: '45.00',
        notice: '',
        cashier: null,
        paymentMethod: 'Receivables',
        customers: 'Shiba',
        hasServiceCharge: 1,
        hasAct: 1,
        createdAt: '2023-09-09',
        checkNumCode: '',
        date: '2023-09-09',
        type: 'RTT',
        refId: 1218,
        transId: 1218,
      },
    ];
    this.serviceTransaction = [
      {
        confirmNumber: '23A00672',
        bookingCode: '23B00767',
        room: '104',
        guestName: 'Shiba',
        arrival: '2023-09-08 09:48:30',
        departure: '2023-10-08 11:00:00',
        company: 'Agoda 2',
        amount: 0,
        originAmount: '230.00',
        notice: '',
        cashier: null,
        paymentMethod: 'Receivables',
        createdAt: '2023-09-08 09:57:48',
        checkNumCode: '',
        date: '2023-09-08',
        type: 'STT',
        refId: 1218,
        transId: 1218,
      },
    ];
    this.cal();
  }

  round(num: number, fixed: number) {
    fixed = fixed || 0;
    fixed = Math.pow(10, fixed);
    return Math.floor(num * fixed) / fixed;
  }

  cal() {
    const groupedResult: { [key: string]: any } = {};
    [...this.bookingDate, ...this.serviceTransaction].forEach((x: any) => {
      const { confirmNumber, date, originAmount } = x;
      const value = Number(originAmount);
      const key = `${confirmNumber}_${date}`;

      if (groupedResult.hasOwnProperty(key)) {
        groupedResult[key].originAmount += Number(value);
      } else {
        groupedResult[key] = { ...x, originAmount: value };
      }
    });
    const resultCityLedger: any[] = Object.values(groupedResult);
    console.log(resultCityLedger);
  }
}

import { Component, OnInit } from '@angular/core';
import * as moment from 'moment';

@Component({
  selector: 'app-test1',
  templateUrl: './test1.component.html',
  styleUrls: ['./test1.component.css'],
})
export class Test1Component implements OnInit {
  constructor() { }
  filter: any
  promotions: any;

  ngOnInit() {
    this.promotions = [
      {
        "id": 1,
        "code": "RP001",
        "name": "RP001",
        "hotelId": 5,
        "promotionTypeId": 1,
        "applyTimeBookingDateType": "ALWAYS",
        "bookingDateFrom": null,
        "bookingDateTo": null,
        "applyTimeStayingDateType": "PERIOD",
        "stayingDateFrom": "2024-06-17 00:00:00",
        "stayingDateTo": "2024-06-17 00:00:00",
        "canRefund": false,
        "refundDay": "1101111",
        "refundAt": "CHECKIN_DATE",
        "description": "",
        "createdAt": "2024-06-17 09:07:45",
        "updatedAt": "2024-06-19 08:42:42",
        "createdBy": 96,
        "updatedBy": 96,
        "deletedAt": null,
        "deletedBy": null,
        "status": "ACTIVE",
        "promotionConditionId": 1,
        "promotionCondition": {
          "id": 1,
          "bookingEnginePromotionTypeId": 1,
          "applyAdjustmentType": "DISCOUNT",
          "rate": 0,
          "unit": "PERCENT",
          "minQuantityApply": 1,
          "freeQuantity": 1,
          "applyFor": "NIGHTS",
          "createdAt": "2024-06-17 09:07:45",
          "updatedAt": "2024-06-19 08:42:42",
          "createdBy": 96,
          "updatedBy": 96
        },
        "blackoutDateBookedDate": [
          {
            "id": 28,
            "refId": 1,
            "blackoutDateType": "BOOKING_DATE",
            "from": "2024-06-17 00:00:00",
            "to": "2024-06-17 00:00:00"
          }
        ],
        "blackoutDateStayingDate": [
          {
            "id": 29,
            "refId": 1,
            "blackoutDateType": "STAYING_DATE",
            "from": "2024-06-17 00:00:00",
            "to": "2024-06-17 00:00:00"
          }
        ]
      }
    ]
    this.checkStaying();
  }

  checkStaying() {
    this.filter = {
      "hotelId": 5,
      "checkIn": "2024-06-20",
      "checkOut": "2024-06-21",
      "roomBooked": 1,
      "adult": 2,
      "children": 0,
      "nights": 1
    };

    const diff = moment(this.filter.checkOut).diff(moment(this.filter.checkIn), 'days');
    console.log({ diff });
    let isAllStayingDateNotApply: boolean = true;
    for (let i = 0; i < diff; i++) {
      const start = this.filter.checkIn;
      isAllStayingDateNotApply = this.isDateInRange(start,)


    }
  }

  isDateInRange(date: string, from?: string, to?: string): boolean {
    const targetDate = new Date(date);
    if (from && targetDate < new Date(from)) {
      return false;
    }
    if (to && targetDate > new Date(to)) {
      return false;
    }
    return true;
  }
}

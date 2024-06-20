import { Component, OnInit } from '@angular/core';
// import * as moment from 'moment';
import moment from 'moment';
import source from '../source/BookingEnginePromotion.json';

@Component({
  selector: 'app-test1',
  templateUrl: './test1.component.html',
  styleUrls: ['./test1.component.css'],
})
export class Test1Component implements OnInit {
  constructor(
    // private dataService: DataService
  ) { }
  data: any
  filter: any
  promotions: any;
  roomTypeData: any;
  roomTypeFilter: any;
  
  ngOnInit() {
    this.roomTypeData = source.filteredMinimumAvailabilities;
    this.roomTypeFilter = source.filter;
    this.checkStaying();
  }

  checkStaying() {
    this.roomTypeData = source.filter;
    this.roomTypeData = source.filter;

    const diff = moment(this.roomTypeFilter.checkOut).diff(moment(this.roomTypeFilter.checkIn), 'days');
    console.log({ diff });
    let isAllStayingDateNotApply: boolean = true;
    for (let i = 0; i < diff; i++) {
      const start = this.roomTypeFilter.checkIn;
      // isAllStayingDateNotApply = this.isDateInRange(start,)
    }
    console.log({roomTypeFilter: this.roomTypeFilter})
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

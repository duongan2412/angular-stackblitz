import { Component, OnInit } from '@angular/core';
// import * as moment from 'moment';
import moment from 'moment';
import source from '../source/BookingEnginePromotion.json';
import cart from '../source/BookingCart.json'
import { BlackoutDateRefType, BlackoutDateType, BookingEnginePromotionApplyTimeType, BookingEnginePromotionConditioAdjustmentType, BookingEnginePromotionConditioApplyUnitType, BookingEnginePromotionConditionApplyForType, COMMON_STATUS } from '../enum/enum';
import { DatetimeUtils } from '../models/datetime-utils';
import { Helper } from '../utils/helps';

@Component({
  selector: 'app-test1',
  templateUrl: './test1.component.html',
  styleUrls: ['./test1.component.css'],
})

export class Test1Component implements OnInit {
  constructor(
    // private dataService: DataService
  ) { }
  promotions: any;
  roomTypeData: any;
  roomTypeFilter: any;
  list = [
    { id: 1, fromValue: 0, toValue: 50, monday: 0, tuesday: 0, wednesday: 0, thursday: 0, friday: 0, saturday: 0, sunday: 0 },
    { id: 2, fromValue: 51, toValue: 55, monday: 0, tuesday: 0, wednesday: 0, thursday: 0, friday: 0, saturday: 0, sunday: 0 },
    { id: 3, fromValue: 61, toValue: 100, monday: 0, tuesday: 0, wednesday: 0, thursday: 0, friday: 0, saturday: 0, sunday: 0 }
  ]
  bookingCart: any;
  ktvTrans:any = {
    "id": 245,
    "hotelId": 3,
    "outletId": 13,
    "printNum": null,
    "checkNum": null,
    "billStatus": null,
    "open": "2024-10-15 17:50:36",
    "close": null,
    "status": 1,
    "currencyId": 4,
    "guestCnt": 1,
    "hasServiceCharge": true,
    "serviceChargeValue": "0.0000",
    "priceSum": "0.0000",
    "discountValue": "0.0000",
    "vatValue": "0.0000",
    "abtValue": "0.0000",
    "paySum": "0.0000",
    "descriptions": null,
    "tableId": 20,
    "tableName": "VIP 4",
    "slot": 4,
    "hallId": 1,
    "hallName": "KTV King 1",
    "cashier": null,
    "roomId": null,
    "customerName": null,
    "startMinutes": 10,
    "hourlyRate": 5,
    "checkinAt": "2024-10-15 13:16:58",
    "checkoutAt": "2024-10-15 13:16:59",
    "checkinBy": 304,
    "checkoutBy": null,
    "serviceCharge": 6.00,
    "vatRate": 12.00,
    "priceSumRound": null,
    "paySumRound": null
}


  ngOnInit() {
    console.log({calAmountByHours: this.calAmountByHours()})
  }

  calAmountByHours(){
    let startMinutes = this.ktvTrans.startMinutes;
    let checkinAt = this.ktvTrans.checkinAt;
    let checkoutAt = this.ktvTrans.checkoutAt;
    let price = this.ktvTrans.hourlyRate;

    startMinutes = startMinutes && startMinutes > 0 ? startMinutes : 1;
    const durationInMinutes = Math.ceil((moment(checkoutAt).diff(moment(checkinAt), "seconds") + 1) / 60);
    const chargePeriods = durationInMinutes > startMinutes ? Math.floor((durationInMinutes > 0 ? durationInMinutes : 1) / startMinutes) + 1 : Math.ceil((durationInMinutes > 0 ? durationInMinutes : 1) / startMinutes);
    const floor = Math.floor((durationInMinutes > 0 ? durationInMinutes : 1) / startMinutes) + 1;
    const ceil = Math.ceil((durationInMinutes > 0 ? durationInMinutes : 1) / startMinutes);
    const quantity = this.round2d((chargePeriods * startMinutes) / 60);
    const quantity2 = this.roundN(((chargePeriods * startMinutes) / 60), 2);
    // console.log({quantityFloor: this.round2d((floor * startMinutes) / 60)});
    // console.log({quantityCeil: this.round2d((ceil * startMinutes) / 60)});
    // console.log({quantity, total: price * quantity, totalFloor: price * floor, totalCeil: price * ceil})
    console.log({quantity, quantity2})
    return this.round2d(price * quantity);
  }

  countDecimals(number: number) {
    if (Math.floor(number) === number) return 0;
    return number.toString().split(".")[1].length || 0;
  }

  round2d(num: number) {
    if (num === null || num === undefined || isNaN(num)) {
      return 0;
    }
    if (this.countDecimals(num) <= 2) {
      return num;
    }
    const sign = Math.sign(num);
    const absNumber = Math.abs(num);
    const thirdDecimal = Math.floor((absNumber * 1000) % 10);
    console.log({thirdDecimal2d:thirdDecimal})
    let roundedNumber;
    if (thirdDecimal >= 5) {
      roundedNumber = Math.ceil(absNumber * 100) / 100;
    } else {
      roundedNumber = Math.floor(absNumber * 100) / 100;
    }
    return Math.round((roundedNumber * sign) * 100) / 100;
  }

  roundN(num: number, decimals: number) {
    if (num === null || num === undefined || isNaN(num)) {
      return 0;
    }
    if (this.countDecimals(num) <= decimals) {
      return num;
    }
    const sign = Math.sign(num);
    const absNumber = Math.abs(num);
    const pow = Math.pow(10, decimals);
    console.log({pow, absNumber})
    const thirdDecimal = Math.floor((absNumber * pow) % 10);
    console.log({thirdDecimal})
    let roundedNumber;
    const checkValue = decimals < 5 ? 5 : (decimals + 1);
    if (thirdDecimal >= checkValue) {
      roundedNumber = Math.ceil(absNumber * pow) / pow;
    } else {
      roundedNumber = Math.floor(absNumber * pow) / pow;
    }
    return roundedNumber * sign;
  }

  isDateInBlackout(date: string, blackouts: BookingEnginePromotionBlackoutDate[]): boolean {
    return blackouts.some(blackout => this.isDateInRange(date, moment(blackout.from).startOf('days').format(DatetimeUtils.COMMON_DATETIME_FORMAT), moment(blackout.to).endOf('days').format(DatetimeUtils.COMMON_DATETIME_FORMAT)));
  }

  checkPromotionValidBookingDate(promotion: BookingEnginePromotion): boolean {
    if (!promotion) {
      return false;
    }
    const currentBookingDate = moment().format(DatetimeUtils.COMMON_DATETIME_FORMAT);
    console.log({ currentBookingDate })
    // Check apply time booking date type
    if (promotion.applyTimeBookingDateType === BookingEnginePromotionApplyTimeType.PERIOD) {
      if (!this.isDateInRange(currentBookingDate, promotion.bookingDateFrom, promotion.bookingDateTo)) {
        return false;
      }
    };

    // Check apply blackout of booking date validity
    if (promotion.blackoutDateBookedDate && promotion.blackoutDateBookedDate.length > 0) {
      if (this.isDateInBlackout(currentBookingDate, promotion.blackoutDateBookedDate!)) {
        return false;
      };
    }

    return true;
  }

  isDateInRange(date: string, from?: string, to?: string): boolean {
    const targetDate = moment(date).toDate();
    if (from && targetDate < moment(from).toDate()) {
      return false;
    }
    if (to && targetDate > moment(to).toDate()) {
      return false;
    }
    return true;
  }

  calculateBestPromotion(cartItems: BookingCart[]): void {
    // Apply the best overall promotion for each cart item
    console.log({ cartItems })
    for (const cartItem of cartItems) {
      this.findBestPromotion(cartItem, cartItems);
    }
  }

  findBestPromotion(cartItem: BookingCart, allCartItems: BookingCart[]): void {
    const { price } = cartItem;
    const { promotions, totalPromotionAmount: bestNightPromotionAmount } = price;

    if (!promotions || promotions.length === 0) {
      return;
    }
    console.log({ cartItem })
    let bestPromotion: BookingEnginePromotion | null = null;
    let maxPromotionValue = bestNightPromotionAmount || 0;

    // Promotion by night is already calculated in BE and stored in bestNightPromotionAmount
    let bestPromotionByNight = {
      promotionId: price.promotionAppliedId,
      promotionCode: price.promotionAppliedCode,
      promotionAmount: price.totalPromotionAmount
    };
    // console.log({bestPromotionByNight});

    // Calculate best promotion by total value
    const bestPromotionByTotalValue = this.calculateBestTotalValuePromotion(cartItem, allCartItems);
    console.log({ bestPromotionByTotalValue })

    if (bestPromotion) {
      console.log({ bestPromotion })
      // cartItem.bestPromotion = bestPromotion;
      // cartItem.price.totalPrice = cartItem.price.totalPriceOriginal - bestPromotion.promotionAmount;
    }
  }

  calculateBestTotalValuePromotion(cartItem: BookingCart, allCartItems: BookingCart[]): BestPromotion {
    const { price } = cartItem;
    const samePriceItems = allCartItems.filter(item => item.price.id === price.id);
    let bestPromotion: BestPromotion = { promotionAmount: 0, promotionCode: '', promotionId: 0 };

    price.promotions.forEach(promotion => {
      if (promotion.promotionType?.code === '1002') {
        const applicablePrices: DailyPriceBookingEngine[] = [];
        samePriceItems.forEach(item => {
          const filteredPrices = this.getDaysApplicablePromotion(item.price.dailyPrices, promotion);
          applicablePrices.push(...filteredPrices);
        });
        console.log({ applicablePrices })
        if (applicablePrices.length > 0) {
          const totalPrice = samePriceItems.reduce((sum, item) => sum + (item.price.totalPriceOriginal ?? 0), 0);
          const totalPromotionAmount = promotion.promotionCondition.unit === 'PERCENT'
            ? totalPrice * Helper.round2d(promotion.promotionCondition.rate! / 100)
            : promotion.promotionCondition.rate!;

          if (totalPromotionAmount < bestPromotion.promotionAmount || bestPromotion.promotionAmount === 0) {
            bestPromotion = {
              promotionAmount: totalPromotionAmount,
              promotionCode: promotion.code ?? '',
              promotionId: promotion.id
            };
          }
        }
      }
    });

    return bestPromotion;
  }

  getDaysApplicablePromotion(dailyPrices: DailyPriceBookingEngine[], promotion: BookingEnginePromotion): DailyPriceBookingEngine[] {
    return dailyPrices.filter(dp => this.isApplicable(dp.date, promotion));
  }

  isApplicable(date: string, promotion: BookingEnginePromotion): boolean {
    return this.isDateInRange(date, promotion.stayingDateFrom, promotion.stayingDateTo) && !this.isDateInBlackout(date, promotion.blackoutDateStayingDate);
  }

  getBestPromotion(promotions: any[]): any {
    let bestPromotion: any = null;

    promotions.forEach(promotion => {
        if (promotion.promotionAmount < 0) {
            if (bestPromotion === null || bestPromotion.promotionAmount >= 0 || promotion.promotionAmount < bestPromotion.promotionAmount) {
                bestPromotion = promotion;
            }
        } else if (promotion.promotionAmount > 0) {
            if (bestPromotion === null || bestPromotion.promotionAmount >= 0 && (bestPromotion.promotionAmount === 0 || promotion.promotionAmount < bestPromotion.promotionAmount)) {
                bestPromotion = promotion;
            }
        } else if (promotion.promotionAmount === 0 && (bestPromotion === null || bestPromotion.promotionAmount === 0)) {
            bestPromotion = promotion;
        }
    });

    return bestPromotion;
}



}

export interface RoomTypeAvailability {
  date: string;
  roomTypeId: number;
  roomTypeName: string;
  room: number;
  adult: number;
  children: number;
  baby: number;
  netSize: number;
  description: string;
  view: string;
  prices: PriceBookingEngine[];
}


export interface PriceBookingEngine {
  id: number;
  name: string;
  priceTotal: number;
  extraGuestFee: number;
  maxGuest: number;
  priceServices: PriceService[];
  qty: number;
  description: string;
  dailyPrices: DailyPriceBookingEngine[];
  promotions: BookingEnginePromotion[];
  totalPriceOriginal?: number;
  totalPromotionAmount?: number;
  promotionAppliedId?: number;
  promotionAppliedCode?: string;
}

export interface DailyPriceBookingEngine {
  date: string;
  priceId: number;
  roomTypeId: number;
  isOpenPrice: boolean;
  roomPrice: number;
  totalPrice: number;
  adultTotal: number;
  childrenTotal: number;
  discountPercent: number;
  discountValue: number;
  priceOriginal?: number;
  promotionAmount?: number;
}


interface BookingEnginePromotion {
  id: number;
  code?: string;
  name?: string;
  hotelId: number;
  promotionTypeId: number;
  applyTimeBookingDateType?: BookingEnginePromotionApplyTimeType;
  bookingDateFrom?: string;
  bookingDateTo?: string;
  applyTimeStayingDateType?: BookingEnginePromotionApplyTimeType;
  stayingDateFrom?: string;
  stayingDateTo?: string;
  canRefund?: boolean;
  refundAt?: string;
  refundDay?: string;
  description: string;
  createdAt?: string;
  updatedAt?: string;
  createdBy?: number;
  updatedBy?: number;
  deletedAt?: string;
  deletedBy?: number;
  status?: COMMON_STATUS;
  promotionConditionId: number;
  blackoutDateBookedDate: BookingEnginePromotionBlackoutDate[];
  blackoutDateStayingDate: BookingEnginePromotionBlackoutDate[];
  bookingEnginePromotionRatePlans: BookingEnginePromotionRatePlan[];
  promotionCondition: BookingEnginePromotionCondition;
  isActive?: boolean;
  promotionType?: BookingEnginePromotionType;
}

interface BookingEnginePromotionBlackoutDate {
  id?: number;
  refId?: number;
  refType?: BlackoutDateRefType;
  blackoutDateType?: BlackoutDateType;
  createdAt?: string;
  updatedAt?: string;
  deletedAt?: string;
  createdBy?: number;
  updatedBy?: number;
  deletedBy?: number;
  status?: COMMON_STATUS;
  from?: string | Date;
  to?: string | Date;
  minToDate?: string | Date;
}

interface BookingEnginePromotionCondition {
  id: number;
  bookingEnginePromotionId: number;
  bookingEnginePromotionTypeId: number;
  applyAdjustmentType: BookingEnginePromotionConditioAdjustmentType;
  rate?: number;
  unit?: BookingEnginePromotionConditioApplyUnitType;
  minQuantityApply?: number;
  freeQuantity?: number;
  applyFor: BookingEnginePromotionConditionApplyForType;
  createdAt?: string;
  updatedAt?: string;
  createdBy?: number;
  updatedBy?: number;
}


interface BookingEnginePromotionRatePlan {
  id: number;
  bookingEnginePromotionId: number;
  ratePlanId?: number;
  createdAt?: string;
  updatedAt?: string;
  createdBy?: number;
  updatedBy?: number;
  deletedAt?: string;
  deletedBy?: number;
  status?: COMMON_STATUS;
  priceId?: number;
}

interface PriceService {
  id?: number;
  priceId?: number;
  serviceId?: number;
  forChild?: boolean;
  quantity?: number;
}

interface DynamicPriceItem {
  id?: number;
  dynamicPriceId?: number;
  isActive?: number;
  fromValue?: number;
  toValue?: number;
  monday?: number;
  tuesday?: number;
  wednesday?: number;
  thursday?: number;
  friday?: number;
  saturday?: number;
  sunday?: number;
}

interface BookingEnginePromotionType {
  id: number;
  code: string;
  name: string;
  description?: string;
  status: COMMON_STATUS;
}

interface BookingCart {
  checkIn: string;
  checkOut: string;
  roomTypeId: number;
  roomTypeName: string;
  maxRoom: number;
  maxAdult: number;
  maxChildren: number;
  maxBaby?: number;
  roomProperty: { id: number, type: string, refId: number, propId: number, propName: string }[];
  price: PriceBookingEngine;
  confirmCode?: string;
  hotelCode?: string;
  cartStatus?: string;
}

export interface DailyPriceBookingEngine {
  date: string;
  priceId: number;
  roomTypeId: number;
  isOpenPrice: boolean;
  roomPrice: number;
  totalPrice: number;
  adultTotal: number;
  childrenTotal: number;
  discountPercent: number;
  discountValue: number;
  promotionId?: number | null;
  promotionCode?: string;
  promotionAmount?: number;
}

export interface RoomTypeBookingEngine {
  date: string;
  roomTypeId: number;
  roomTypeName: string;
  room: number;
  adult: number;
  children: number;
  baby: number;
  netSize: number;
  description: string;
  view: string;
  prices: PriceBookingEngine[];
  property: Array<{
    id: boolean;
    propId: number;
    refId: number;
    type: string;
    propName: string;
  }>;
  images: Array<{
    id: number;
    src: string;
  }>;
}

type BestPromotion = {
  promotionAmount: number;
  promotionCode: string;
  promotionId: number;
};

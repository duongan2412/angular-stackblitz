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

  ngOnInit() {
    this.roomTypeData = source.filteredMinimumAvailabilities;
    this.roomTypeFilter = source.filter;
    this.bookingCart = cart;
    // this.checkPromotionApply(this.bookingCart);
    // this.applyPromotionsToPrices(this.roomTypeData);
    // const bo: BookingEnginePromotionBlackoutDate[] = [{blackoutDateType: BlackoutDateType.BOOKING_DATE, from: "2024-06-26 00:00:00", id: 39, refId: 4, to:"2024-06-26 23:59:59"}]
    // console.log('inrange', this.isDateInRange('2024-06-26 15:56:45', '2024-06-26 00:00:00', '2024-06-26 23:59:59'))
    // console.log('blackout', this.isDateInBlackout('2024-06-26 15:56:45', bo))
    this.calculateBestPromotion(this.bookingCart);
    const promotion = [{promotionAmount: 50}, {promotionAmount: 20}, {promotionAmount: 0}]
    console.log({pro: this.getBestPromotion(promotion)})
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

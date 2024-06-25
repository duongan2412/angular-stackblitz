import { Component, OnInit } from '@angular/core';
// import * as moment from 'moment';
import moment from 'moment';
import source from '../source/BookingEnginePromotion.json';
import { BlackoutDateRefType, BlackoutDateType, BookingEnginePromotionApplyTimeType, BookingEnginePromotionConditioAdjustmentType, BookingEnginePromotionConditioApplyUnitType, BookingEnginePromotionConditionApplyForType, COMMON_STATUS } from '../enum/enum';
import { DatetimeUtils } from '../models/datetime-utils';

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

  ngOnInit() {
    this.roomTypeData = source.filteredMinimumAvailabilities;
    this.roomTypeFilter = source.filter;
    // console.log(DatetimeUtils.todayStr(DatetimeUtils.COMMON_DATE_FORMAT))
    this.checkPromotionApply(this.roomTypeData);
  }

  isDateInBlackout(date: string, blackouts: BookingEnginePromotionBlackoutDate[]): boolean {
    return blackouts.some(blackout => this.isDateInRange(date, moment(blackout.from).format(DatetimeUtils.COMMON_DATE_FORMAT), moment(blackout.to).format(DatetimeUtils.COMMON_DATE_FORMAT)));
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

  checkPromotionApply(roomTypes: RoomTypeAvailability[]) {
    if (!roomTypes || roomTypes.length === 0) {
      return;
    };
    for (const roomType of roomTypes) {
      for (const price of roomType.prices) {
        if (price.promotions && price.promotions.length > 0) {
          price.promotions = this.checkPromotionValidBookingDate(price.promotions) ?? [];
        }
        price.appliedPromotion = this.checkPromotionBestValue(price);

        // console.log({ roomType: roomType.roomTypeId, price: price.id, promotions: price.promotions, appliedPromotion: price.appliedPromotion })
      }
    }
  }

  checkPromotionValidBookingDate(promotions: BookingEnginePromotion[]): BookingEnginePromotion[] | null {
    if (!promotions || promotions.length === 0) {
      return null;
    }
    const currentBookingDate = DatetimeUtils.todayStr();
    const appliedBookingDatePromotions = promotions.filter((promotion: BookingEnginePromotion) => {
      if (promotion.status !== COMMON_STATUS.ACTIVE) {
        return false;
      };

      // Check apply booking date validity
      if (promotion.applyTimeBookingDateType === BookingEnginePromotionApplyTimeType.PERIOD) {
        if (!this.isDateInRange(currentBookingDate, promotion.bookingDateFrom, promotion.bookingDateTo)) {
          return false;
        }
      };

      // Check apply blackout of booking date validity
      if (this.isDateInBlackout(currentBookingDate, promotion.blackoutDateBookedDate)) {
        return false;
      };

      return true;
    });
    return appliedBookingDatePromotions
  }

  calPromotionByNight(price: any): BookingEnginePromotionApplied | null {
    const result: BookingEnginePromotionApplied = {};
    // Only check promotion type Every night and Total booking value
    const { dailyPrices, promotions } = price;
    if (promotions.length === 0) {
      return null;
    };

    // Compare value of each promotion type apply
    for (const promotion of promotions) {
      const applicablePrices = this.getDaysApplicablePromotion(dailyPrices, promotion);
      if (applicablePrices.length > 0) {
        const { totalPromotionAmount, promotionDetail } = this.calculatePromotion(price, applicablePrices, promotion);
        // console.log({ promotion, applicablePrices, totalPromotionAmount, promotionDetail })

      }
    }

    return result
  }

  checkPromotionBestValue(price: any): BookingEnginePromotionApplied | null {
    const result: BookingEnginePromotionApplied = {};
    // Only check promotion type Every night and Total booking value
    const { dailyPrices, promotions } = price;
    if (promotions.length === 0) {
      return null;
    };

    // Compare value of each promotion type apply
    for (const promotion of promotions) {
      const applicablePrices = this.getDaysApplicablePromotion(dailyPrices, promotion);
      // console.log({ promotion: promotion.code, applicablePrices, dailyPrices });
      if (applicablePrices.length > 0) {
        const { totalPromotionAmount, promotionDetail } = this.calculatePromotion(price, applicablePrices, promotion);
        // console.log({ promotion, applicablePrices, totalPromotionAmount, promotionDetail })
        console.table({totalPromotionAmount, promotionDetail :this.calculatePromotion(price, applicablePrices, promotion).promotionDetail})
      }
    }

    return result
  }

  getDaysApplicablePromotion(dailyPrices: DailyPrice[], promotion: BookingEnginePromotion): DailyPrice[] {
    return dailyPrices.filter((dp: DailyPrice) => {
      if (promotion.applyTimeStayingDateType === BookingEnginePromotionApplyTimeType.PERIOD) {
        // Check apply staying date validity
        if (!this.isDateInRange(dp.date, promotion.stayingDateFrom, promotion.stayingDateTo)) {
          return false;
        }
      }

      // Check apply blackout of staying date validity
      if (this.isDateInBlackout(dp.date, promotion.blackoutDateStayingDate)) {
        return false;
      }

      return true
    });
  }

  calculatePromotion(price: PriceBookingEngine, applicablePrices: DailyPrice[], promotion: BookingEnginePromotion): { totalPromotionAmount: number, promotionDetail: { promotionAmount: number, promotionId: number } } {
    const condition = promotion.promotionCondition;
    let totalPromotionAmount = 0;
    let promotionAmount = 0;

    const totalBookingValue = applicablePrices.reduce((curr: any, sum: any) => curr + (sum.totalPrice ?? 0), 0);

    // Every night promotion
    if (promotion.promotionType?.code === '1001') {
      applicablePrices.forEach(dp => {
        const dailyTotalPrice = dp.totalPrice;
        if (condition.unit === BookingEnginePromotionConditioApplyUnitType.PERCENT) {
          promotionAmount = condition.applyAdjustmentType === BookingEnginePromotionConditioAdjustmentType.DISCOUNT
            ? -1 * dailyTotalPrice * (condition.rate! / 100)
            : dailyTotalPrice * (condition.rate! / 100);
        } else {
          promotionAmount = condition.applyAdjustmentType === BookingEnginePromotionConditioAdjustmentType.DISCOUNT
            ? -1 * condition.rate!
            : condition.rate!;
        }

        totalPromotionAmount += promotionAmount;
        dp.promotionsLst = dp.promotionsLst || [];
        dp.promotionsLst.push({ promotionAmount, promotionId: promotion.id });
      });
    }

    // Total booking value promotion
    if (promotion.promotionType?.code === '1002' && price.qty > 0) {

      if (condition.unit === BookingEnginePromotionConditioApplyUnitType.PERCENT) {
        promotionAmount = condition.applyAdjustmentType === BookingEnginePromotionConditioAdjustmentType.DISCOUNT
          ? -1 * totalBookingValue * (condition.rate! / 100)
          : totalBookingValue * (condition.rate! / 100);
      } else {
        promotionAmount = condition.applyAdjustmentType === BookingEnginePromotionConditioAdjustmentType.DISCOUNT
          ? -1 * condition.rate!
          : condition.rate!;
      }

    }
    return { totalPromotionAmount, promotionDetail: { promotionAmount: totalPromotionAmount, promotionId: promotion.id } };
  }

  hasOverlappingRanges(items: DynamicPriceItem[]): boolean {
    // Sort the items by their fromValue
    const sortedItems = items.sort((a, b) => a.fromValue! - b.fromValue!);
    // Check for overlaps between consecutive items
    for (let i = 0; i < sortedItems.length - 1; i++) {
      const currentItem = sortedItems[i];
      const nextItem = sortedItems[i + 1];

      if (currentItem.toValue! >= nextItem.fromValue!) {
        return true; // Overlap found
      }
    }

    return false; // No overlaps
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

interface PriceBookingEngine {
  id: number;
  name: string;
  priceTotal: number;
  priceDeal: number;
  extraGuestFee: number;
  maxGuest: number;
  priceServices: PriceService[];
  qty: number;
  description: string;
  dailyPrices: DailyPrice[];
  promotions: BookingEnginePromotion[];
  appliedPromotion?: BookingEnginePromotionApplied | null;
}

interface BookingEnginePromotionApplied {

}

interface DailyPrice {
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
  promotionId: number | null;
  promotionAmount: number;
  promotionsLst: { promotionId: number, promotionAmount: number }[];
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
  id: number;
  refId: number;
  refType?: BlackoutDateRefType;
  blackoutDateType?: BlackoutDateType;
  createdAt?: string;
  updatedAt?: string;
  deletedAt?: string;
  createdBy: number;
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

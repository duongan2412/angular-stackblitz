export enum COMMON_STATUS {
    ACTIVE = "ACTIVE",
    CANCELED = "CANCELED",
    DELETED = "DELETED",
    INACTIVE = "INACTIVE"
}

export enum ActionAt {
    FOLIO = 'folio',
    SERVICE = 'service',
    PAYMENT = 'payment',
    FNB_BILL = 'fnb-bill',
    FNB_HALLPLANS = 'fnb'
}

export enum RATE_TYPE {
    RATE_CODE = 'RATE_CODE',
    RATE_PLAN = 'RATE_PLAN'
}

export enum BlackoutDateRefType {
    BOOKING_ENGINE_PROMOTION = 'BOOKING_ENGINE_PROMOTION',
    DYNAMIC_PRICE = 'DYNAMIC_PRICE',
    RATE_PLAN = 'RATE_PLAN',
    OTHER = 'OTHER'
}

export enum BlackoutDateType {
    BOOKING_DATE = 'BOOKING_DATE',
    STAYING_DATE = 'STAYING_DATE',
    OTHER = 'OTHER'
}

export enum BookingEnginePromotionApplyTimeType {
    ALWAYS = 'ALWAYS',
    PERIOD = 'PERIOD',
}

export enum BookingEnginePromotionConditioAdjustmentType {
    DISCOUNT = 'DISCOUNT',
    SURCHARGE = 'SURCHARGE',
}

export enum BookingEnginePromotionConditioApplyUnitType {
    PERCENT = 'PERCENT',
    AMOUNT = 'AMOUNT',
}

export enum BookingEnginePromotionConditionApplyForType {
    ROOMS = 'ROOMS',
    NIGHTS = 'NIGHTS',
}

export enum BookingEnginePromotionRefundAt {
    CHECKIN_DATE = 'CHECKIN_DATE',
}

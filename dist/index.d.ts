declare type VantevoMeta = {
    "duration"?: number;
    [key: string]: string | string[] | number;
};
declare type ParamsContext = {
    [key: string]: string;
};
declare type VantevoOptions = {
    "excludePath"?: string[];
    "dev"?: boolean;
    "hash"?: boolean;
    "domain"?: string;
    "proxyServer"?: string;
    "proxyServerEcommerce"?: string;
    "params"?: ParamsContext;
};
declare type VantevoEvent = (event?: string, meta?: VantevoMeta, callback?: () => void) => void;
declare type VantevoEcommerceItems = {
    "item_id": string;
    "item_name": string;
    "currency"?: string;
    "quantity"?: number;
    "price"?: number;
    "discount"?: number;
    "position"?: number;
    "brand"?: string;
    "category_1"?: string;
    "category_2"?: string;
    "category_3"?: string;
    "category_4"?: string;
    "category_5"?: string;
    "variant_1"?: string;
    "variant_2"?: string;
    "variant_3"?: string;
};
declare type VantevoEcommerceValues = {
    "total"?: number;
    "coupon"?: string;
    "coupon_value"?: number;
    "payment_type"?: number;
    "shipping_method"?: string;
    "items": VantevoEcommerceItems;
};
declare type VantevoEcommerce = (event?: string, values?: VantevoEcommerceValues, callback?: () => void) => void;
declare type CleanEvents = () => void;
declare type EnableTracker = () => CleanEvents;
declare type EnableOutboundLinks = () => CleanEvents;
declare type EnableTrackFiles = (extensions: string, saveExtension?: boolean) => CleanEvents;
declare function VantevoAnalytics(options?: VantevoOptions): {
    readonly vantevo: VantevoEvent;
    readonly trackEcommerce: VantevoEcommerce;
    readonly enableTracker: EnableTracker;
    readonly enableOutboundLinks: EnableOutboundLinks;
    readonly enableTrackFiles: EnableTrackFiles;
};

export { VantevoEcommerce, VantevoEvent, VantevoOptions, VantevoAnalytics as default };

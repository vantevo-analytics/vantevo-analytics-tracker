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
    "params"?: ParamsContext;
};
declare type VantevoEvent = (event?: string, meta?: VantevoMeta, callback?: () => void) => void;
declare type CleanEvents = () => void;
declare type EnableTracker = () => CleanEvents;
declare type EnableOutboundLinks = () => CleanEvents;
declare type EnableTrackFiles = (extensions: string, saveExtension?: boolean) => CleanEvents;
declare function VantevoAnalytics(options?: VantevoOptions): {
    readonly vantevo: VantevoEvent;
    readonly enableTracker: EnableTracker;
    readonly enableOutboundLinks: EnableOutboundLinks;
    readonly enableTrackFiles: EnableTrackFiles;
};

export { VantevoEvent, VantevoOptions, VantevoAnalytics as default };

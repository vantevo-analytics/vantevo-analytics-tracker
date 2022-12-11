declare var window: any;

export type VantevoMeta = {
    "duration"?: number,
    [key: string]: string | string[] | number;
};

export type ParamsContext = {
    [key: string]: string;
};

export type VantevoOptions = {
    "excludePath"?: string[];
    "dev"?: boolean;
    "hash"?: boolean;
    "domain"?: string;
    "proxyServer"?: string;
    "proxyServerEcommerce"?: string;
    "params"?: ParamsContext;
};

export type VantevoEvent = (
    event?: string,
    meta?: VantevoMeta,
    callback?: () => void
) => void;

export type VantevoEcommerceItems = {
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

export type VantevoEcommerceValues = {
    "total"?: number,
    "coupon"?: string,
    "coupon_value"?: number,
    "payment_type"?: number,
    "shipping_method"?: string,
    "items": VantevoEcommerceItems

};

export type VantevoEcommerce = (
    event?: string,
    values?: VantevoEcommerceValues,
    callback?: () => void
) => void;

type CleanEvents = () => void;
type EnableTracker = () => CleanEvents;
type EnableOutboundLinks = () => CleanEvents;
type EnableTrackFiles = (
    extensions: string,
    saveExtension?: boolean
) => CleanEvents;


const defaultValues = {
    "excludePath": [],
    "dev": false,
    "hash": false,
    "domain": null,
    "params": {},
    "proxyServer": "https://api.vantevo.io/event",
    "proxyServerEcommerce": "https://api.vantevo.io/event-ecommerce"
}

export default function VantevoAnalytics(options?: VantevoOptions): {
    readonly vantevo: VantevoEvent;
    readonly trackEcommerce: VantevoEcommerce;
    readonly enableTracker: EnableTracker;
    readonly enableOutboundLinks: EnableOutboundLinks;
    readonly enableTrackFiles: EnableTrackFiles;
} {

    var config = defaultValues;
    if (options) {
        config = { ...defaultValues, ...options };
    }
    const { dev, hash, excludePath, params, domain, proxyServer, proxyServerEcommerce } = config;

    var ignore_message = "Ignores hit on localhost.";
    var tag_param = "data-vantevo-";


    function localRegex(hostname) {
        return (/^localhost(.*)$|^127(\.[0-9]{1,3}){3}$/i.test(hostname))
    }

    function jsonToParameters(filters) {
        var paramters = Object.fromEntries(
            Object.entries(filters).filter(([_, v]) => v != null)
        );
        return Object.keys(paramters)
            .map(function (k) {
                return encodeURIComponent(k) + '=' + encodeURIComponent(filters[k]);
            })
            .join('&');
    }

    function getAttributes(link) {
        var list = {};
        for (let i = 0; i < link.attributes.length; i++) {
            var att = link.attributes[i];
            if (att.nodeName && att.nodeName.toLowerCase().indexOf(tag_param) == 0) {
                list[att.nodeName.toString().replace(tag_param, "")] = att.textContent || "1"
            }
        }
        return list;
    }

    function verifyBot() {
        if (window.__phantomas || window._phantom || window.__nightmare || window.navigator.webdriver || window.Cypress) {
            return true;
        }
        return false;
    }


    const trackEcommerce: VantevoEcommerce = (event, values, callback) => {
        if (verifyBot()) {
            return;
        }

        if (domain && (localRegex(domain))) {
            return console.warn(ignore_message);
        }

        if (!domain && !dev && (localRegex(window.location.hostname))) {
            return console.warn(ignore_message);
        }

        if (!event) {
            return console.warn("Event name is required.");
        }

        if (!values.items || !Array.isArray(values.items) || values.items.length == 0) {
            return console.warn("Items is required.");
        }

        var items = { ...values };;
        ['items', 'total', 'coupon_value', 'payment_type', 'shipping_method'].forEach(e => delete items[e]);

        var payload = {
            ts: new Date().getTime(),
            url: location.href,
            t: document.title,
            ref: document.referrer,
            w: window.innerWidth,
            h: window.innerHeight,
            params: params,
            event: event,
            items: values.items,
            total: values.total || 0,
            coupon: values.coupon || "",
            payment_type: values.payment_type || "",
            shipping_method: values.shipping_method || "",
            ...items
        };

        if (dev) {
            console.log("HIT ECOMMERCE:", JSON.stringify(payload));
            return callback && callback();
        }

        var endpoint = proxyServerEcommerce;
        const req = new XMLHttpRequest();
        req.open("POST", endpoint, true);
        req.setRequestHeader("Content-Type", "application/json");
        req.send(JSON.stringify(payload));
        req.onreadystatechange = function () {
            if (req.readyState == 4) {
                return callback && callback();
            }
        }
    }


    const vantevo: VantevoEvent = (event, meta = {}, callback) => {
        if (verifyBot()) {
            return;
        }
        var localFile = window.location.protocol === "file:";

        if (domain && (localRegex(domain) || localFile)) {
            return console.warn(ignore_message);
        }

        if (!domain && !dev && (localRegex(window.location.hostname) || localFile)) {
            return console.warn(ignore_message);
        }

        if ((!event || event == "pageview") && excludePath.length > 0) {
            var asPath = window.location.pathname.split("?")[0];
            for (var i = 0; i < excludePath.length; i++) {
                var reg = new RegExp('^' + excludePath[i].trim().replace(/\*\*/g, '.*').replace(/([^\.])\*/g, '$1[^\\s\/]*') + '\/?$');
                if (reg.test(asPath)) {
                    return dev ? console.warn('Exclude page') : false;
                }
            }
        }

        var obj_params = {};
        var str_params = "";
        if (domain) {
            obj_params = { ...params, domain: domain }
        }

        if (hash) {
            obj_params = { ...obj_params, hash: true }
        }

        if (event && event == 'pageview' && meta && meta["path"]) {
            obj_params = { ...obj_params, path: meta["path"] }
        }

        let _t: any = document.title;
        if ((!event || event == "pageview") && meta && meta.title) {
            _t = meta.title;
        }

        str_params = jsonToParameters(obj_params)
        var payload = {
            ts: new Date().getTime(),
            url: window.location.href,
            t: _t,
            ref: document.referrer,
            w: screen.width,
            h: screen.height,
            params: str_params,
            e_n: event || 'pageview',
            e_m: meta || {}
        };


        if (dev) {
            console.log("SUCCESS HIT!", JSON.stringify(payload));
            return callback && callback();
        }

        const req = new XMLHttpRequest();
        req.open("POST", proxyServer);
        req.setRequestHeader("Content-Type", "text/plain");
        req.send(JSON.stringify(payload));
        req.onreadystatechange = function (req: any) {
            if (req.readyState == 4) {
                callback && callback();
            }
        }
    }

    // Window addEventListener trigger
    var lastPage;
    function trigger() {
        if (!hash && (lastPage === window.location.pathname)) {
            return;
        }
        lastPage = window.location.pathname
        vantevo("pageview", {}, null);
    }


    //Enable Automatic Tracker
    const enableTracker: EnableTracker = () => {
        const pushState = window.history.pushState;
        if (pushState) {
            window.history.pushState = function () {
                pushState.apply(this, arguments);
                setTimeout(trigger, 0);
            }
            window.addEventListener("popstate", () => { setTimeout(trigger, 0) });
        }

        if (!document.body) {
            window.addEventListener("DOMContentLoaded", trigger);
        } else {
            trigger();
        }

        return function cleanEvents() {
            if (pushState) {
                window.history.pushState = pushState;
                window.removeEventListener('popstate', trigger);
            }
        };
    }

    //Outbound Links
    function triggerOutboundLinks(event) {
        var link = event.target;
        var middle = event.type == 'auxclick' && event.which == 2;
        var click = event.type == 'click';
        while (
            link &&
            (typeof link.tagName == 'undefined' ||
                link.tagName.toLowerCase() != 'a' ||
                !link.href)
        ) {
            link = link.parentNode;
        }

        if (link && link.href && link.host && link.host !== window.location.host) {
            var excludeOutbound = link.hasAttribute(tag_param + "exclude-outbound-link");
            if ((middle || click) && !excludeOutbound) {
                var _params = getAttributes(link);
                _params["url"] = link.href;
                vantevo('Outbound Link', _params, null);
            }
            if (!link.target || link.target.match(/^_(self|parent|top)$/i)) {
                if (!(event.ctrlKey || event.metaKey || event.shiftKey) && click) {
                    setTimeout(function () {
                        window.location.href = link.href;
                    }, 150);
                    event.preventDefault();
                }
            }
        }
    }

    //Enable Outbound Links
    const enableOutboundLinks: EnableOutboundLinks = () => {
        window.addEventListener('click', triggerOutboundLinks);
        window.addEventListener('auxclick', triggerOutboundLinks);

        return function cleanEvents() {
            window.removeEventListener('click', triggerOutboundLinks);
            window.removeEventListener('auxclick', triggerOutboundLinks);
        };
    }

    // Tracking Files
    const enableTrackFiles: EnableTrackFiles = (extensions = "", saveExtension = false) => {

        function triggerTrackerFiles(event) {
            var link = event.target;

            var middle = event.type == 'auxclick' && event.which == 2;
            var click = event.type == 'click';
            while (
                link &&
                (typeof link.tagName == 'undefined' ||
                    link.tagName.toLowerCase() != 'a' ||
                    !link.href)
            ) {
                link = link.parentNode;
            }
            var entry = false;
            if (link && link.href) {
                var excludeTrack = link.hasAttribute(tag_param + "exclude-track-file");

                var list = [];
                if (!excludeTrack) {

                    if (extensions && typeof extensions === "string") {
                        list = extensions.replace(/\s/g, '').split(",");
                    }

                    if ((middle || click) && list.length > 0) {
                        var fileExtension = link.href.split(".").pop();
                        var existExtension = list.some(function (ext) {
                            return ext == fileExtension
                        });

                        if (existExtension) {
                            entry = true;
                            var _params = getAttributes(link);
                            _params["url"] = link.href;
                            if (saveExtension || _params["save-extension"]) {
                                _params["extension"] = fileExtension;
                            }
                            vantevo('File Download', _params, null);
                        }
                    }
                }
            }

            if (entry && (!link.target || link.target.match(/^_(self|parent|top)$/i))) {
                if (!(event.ctrlKey || event.metaKey || event.shiftKey) && click) {
                    setTimeout(function () {
                        window.location.href = link.href;
                    }, 150);
                    event.preventDefault();
                }
            }
        }


        window.addEventListener('click', triggerTrackerFiles);
        window.addEventListener('auxclick', triggerTrackerFiles);
        return function cleanEvents() {
            window.removeEventListener('click', triggerTrackerFiles);
            window.removeEventListener('auxclick', triggerTrackerFiles);
        };
    }

    return {
        vantevo,
        trackEcommerce,
        enableTracker,
        enableTrackFiles,
        enableOutboundLinks
    };
}
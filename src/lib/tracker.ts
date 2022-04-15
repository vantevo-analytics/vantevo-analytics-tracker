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
    "params"?: ParamsContext;
};

export type VantevoEvent = (
    event?: string,
    meta?: VantevoMeta,
    callback?: () => void
) => void;


type CleanEvents = () => void;
type EnableTracker = () => CleanEvents;
type EnableOutboundLink = () => CleanEvents;
type EnableTrackFiles = (
    extensions?: string,
    saveExtension?: boolean
) => CleanEvents;


const defaultValues = {
    "excludePath": [],
    "dev": false,
    "hash": false,
    "domain": null,
    "params": {}
}

export default function VantevoAnalytics(options?: VantevoOptions): {
    readonly vantevo: VantevoEvent;
    readonly enableTracker: EnableTracker;
    readonly enableOutboundLink: EnableOutboundLink;
    readonly enableTrackFiles: EnableTrackFiles;
} {

    var config = defaultValues;
    if (options) {
        config = { ...defaultValues, ...options };
    }
    const { dev, hash, excludePath, params, domain } = config;

    var ignore_message = "Ignores hit on localhost.";

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

    const vantevo: VantevoEvent = (event, meta = {}, callback) => {
        if (window.__phantomas || window._phantom || window.__nightmare || window.navigator.webdriver || window.Cypress) {
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
        req.open("POST", "https://api.vantevo.io/event");
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
    function triggerOutboundLink(event) {
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
            if (middle || click) {
                vantevo('Outbound Link', { url: link.href }, null);
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

    // Tracking Files
    function triggerTrackerFiles(event, extension, saveExtension) {
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
            var list = [];
            if (extension) {
                list = extension.replace(/\s/g, '').split(",");
            }
   
            if ((middle || click) && list.length > 0) {
                var fileExtension = link.href.split(".").pop();
                var existExtension = list.some(function (ext) {
                    return ext == fileExtension
                });

                if (existExtension) {
                    var _params = { url: link.href };
                    if (saveExtension) {
                        _params["extension"] = fileExtension
                    }
                    vantevo('File Download', _params, null);
                    entry = true;
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

    const enableOutboundLink: EnableOutboundLink = () => {
        window.addEventListener('click', triggerOutboundLink);
        window.addEventListener('auxclick', triggerOutboundLink);

        return function cleanEvents() {
            window.removeEventListener('click', triggerOutboundLink);
            window.removeEventListener('auxclick', triggerOutboundLink);
        };
    }

    const enableTrackFiles: EnableTrackFiles = (extensions = "", saveExtension = false) => {
        window.addEventListener('click', (event) => { triggerTrackerFiles(event, extensions, saveExtension) });
        window.addEventListener('auxclick', (event) => { triggerTrackerFiles(event, extensions, saveExtension) });

        return function cleanEvents() {
            window.removeEventListener('click', (event) => { triggerTrackerFiles(event, extensions, saveExtension) });
            window.removeEventListener('auxclick', (event) => { triggerTrackerFiles(event, extensions, saveExtension) });
        };
    }

    return {
        vantevo,
        enableTracker,
        enableTrackFiles,
        enableOutboundLink
    };
}
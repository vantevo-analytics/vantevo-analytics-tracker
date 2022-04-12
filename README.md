# The analysis of your website, but simpler
 
**Vantevo Analytics** is the alternative platform to Google Analytics that respects privacy, because it does not need cookies not compliant with the GDPR. Easy to use, light and can be integrated into any website and back-end.
 
For more information visit the website [vantevo.io](https://vantevo.io?utm_source=npm&utm_medium=vantevo-analytics-tracker).
 
## Installation
 
`npm install vantevo-analytics-tracker`
 
## Usage
 
To start tracking page views and events, you need to initialize your tracker first:
 
```ts
import VantevoAnalytics from "vantevo-analytics-tracker";
 
const vantevo = VantevoAnalytics({
 excludePath: [],
 dev: false,
 hash: false,
 domain: null
});
```
 
These are the parameters available for the tracker settings, all fields are optional.
 
| Option      | Type      | Description                                                                                                                    | Default |
| ----------- | --------- | ------------------------------------------------------------------------------------------------------------------------------ | ------- |
| excludePath | `array`  (Optional) | You can exclude one or more pages from the statistics, [settings](https://vantevo.io/docs/come-escludere-una-pagina-dalle-statistiche?utm_source=npm&utm_medium=vantevo-analytics-tracker)          | `[]`    |
| dev         | `boolean` (Optional)| Tracker will not send data to server, please check browser console to view request information.                              | `false` |
| hash        | `boolean` (Optional)| Allows tracking based on URL hash changes.                                                            | `false` |
| domain      | `string` (Optional)| Use this option when the script is installed on a different domain than the one entered on Vantevo Analytics. | `null`  |
 
`VantevoAnalytics()` Returns the functions you can use to keep track of your events.
 
- `vantevo()`: Page views monitoring, event management and goals.
 
- `enableTracker()`: Allows you to track page views automatically, the script uses the `popstate` event to navigate the site.
 
- `enableOutboundLink()`: Allows you to monitor all outbound links from your site automatically, the script uses the `click` and` auxclick` events.
 
The script uses the `addEventListener ()` method for the `enableTracker ()` and `enableOutboundLink ()` functions, to remove the registered event listener each function will return a clean function `removeEventListener ()`:
 
```ts
import VantevoAnalytics from "vantevo-analytics-tracker";
 
const { enableTracker, enableOutboundLink } = VantevoAnalytics({...});
 
const cleanTracker = enableTracker();
const cleanOutboundLink = enableOutboundLink();
 
cleanTracker();
cleanOutboundLink();
```
 
## Page view monitoring and event management
 
### Simple Pageview
Submit a pageview using `location.href` as the request URL and` document.title` for the page title.
```ts
import VantevoAnalytics from "vantevo-analytics-tracker";
 
const { vantevo } = VantevoAnalytics({...});
 
vantevo();
/*** or ***/
vantevo("pageview˙");
```
 
### Pageview change pathname of url
 
You can submit a custom pageview where you can change the `pathname` of the page. In the example below, the page URL is https://example.com/blog?page=2 with the `pathname=/blog` and the`page=2` parameter (the page = 2 parameter will be ignored, see [guide] (https://vantevo.io/docs/query-parameters)), using the `pageview` event with the` meta` parameter of type `{path:"/blog/page/2"}` , the script will save as page pathname: `/blog/page/2`
 
 
```ts
import VantevoAnalytics from "vantevo-analytics-tracker";
 
const { vantevo } = VantevoAnalytics({...});
 
vantevo("pageview", { path: "/blog/page/2" }, () => {});
```

### Pageview change title page

Vantevo utilizza `document.title` per avere il titolo completo della pagina, in questo esempio vedrai come puoi cambiare il titolo della pagina.
 
```ts
...
import useVantevo from "react-vantevo";
...
 
export default function Page(){
   const { vantevo } = useVantevo();
 
   useEffect(() => {
       vantevo("pageview", { title: "New title of page" }, () => {});
   },[]);
 
   return (...);
}
```

 
## Event
 
An example of how to send an event with the name "Download" and with the information `meta_key = pdf` and` meta_value=presentation`, the `meta` parameter is a simple json.
 
Vantevo Analytics handles the `meta_key=duration`, the value of this field is of type` Number`. With the `duration` parameter it is possible to send a number (seconds) with the event that will be used to calculate the average duration of the event itself.
 
```ts
import VantevoAnalytics from "vantevo-analytics-tracker";
 
const { vantevo } = VantevoAnalytics({...});
 
vantevo("download", { pdf: "presentation" }, () => {});
/*** or ***/
vantevo("video", { title: "presentation", duration: 30 }, () => {});
 
```
 
#### Parametri
 
| Option | Type | Description | Default |
| -------------- | --------- | ---------------------------------------------------------------------------------------- | ------------------------ |
| event | `string` (Optional) | Event Name. | `pageview`|
| meta | `object` (Optional) | An object with custom properties for events. | `{}`|
| callback | `function` (Optional) | A function that is called once the event has been successfully logged. | `null` |
 
 
## 404  - Page Not Found
For the management of the error `404 - Page Not Found` page we have created a specific event. This function will automatically save a `404` event and the` pathname` of the page as a value.
 
You can find the information collected through this function on the `Events` page.
 
```ts
import VantevoAnalytics from "vantevo-analytics-tracker";
 
const { vantevo } = VantevoAnalytics({...});
 
vantevo("404", {}, () => {}));
```
 
 
## Vantevo Analytics guide
 
To see all the features and settings of Vantevo Analytics we recommend that you read our complete guide [here](https://vantevo.io/docs?utm_source=npm&utm_medium=vantevo-analytics-tracker).
 




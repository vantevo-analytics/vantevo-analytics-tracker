# The analytics of your website, but simpler
 
**Vantevo Analytics** is the alternative platform to Google Analytics that respects privacy, because it does not need cookies not compliant with the GDPR. Easy to use, light and can be integrated into any website and back-end.
 
For more information visit the website [vantevo.io](https://vantevo.io).
 
## Installation
 
`npm install vantevo-analytics-tracker`
 
## Usage
 
To start tracking page views and events, you need to initialize your tracker first:
 
```ts
import VantevoAnalytics from "vantevo-analytics-tracker";
 
const { vantevo } = VantevoAnalytics({
 "excludePath": [],
 "dev": false,
 "hash": false,
 "domain": null
});
```
 
These are the parameters available for the tracker settings, all fields are optional.
 
| Option      | Type      | Description                                                                                                                    | Default |
| ----------- | --------- | ------------------------------------------------------------------------------------------------------------------------------ | ------- |
| excludePath | `array`  (Optional) | You can exclude one or more pages from the statistics, [settings](https://vantevo.io/docs/)          | `[]`    |
| dev         | `boolean` (Optional)| Tracker will not send data to server, please check browser console to view request information.                              | `false` |
| hash        | `boolean` (Optional)| Allows tracking based on URL hash changes.                                                            | `false` |
| domain      | `string` (Optional)| Use this option when the script is installed on a different domain than the one entered on Vantevo Analytics. To use this function remember to authorize the domain to be able to save the statistics, for more information [read more](https://vantevo.io/docs/domain-settings/information#authorized-domains).  | `null`  |

 
`VantevoAnalytics()` returns the functions you can use to keep track of your events.
 
- `vantevo()`: Page views monitoring, event management and goals.
 
- `enableTracker()`: Allows you to track page views automatically, the script uses the `popstate` event to navigate the site.
 
- `enableOutboundLinks()`: Allows you to monitor all outbound links from your site automatically, the script uses the `click` and` auxclick` events.

- `enableTrackFiles(extensions , saveExtension)`: It allows you to automatically monitor all files to be downloaded from your site. The function has 2 parameters: `extensions`  and `saveExtension`.

| Parametro      |  Type    |  Description |   Default  |
| -------------- | ---------| ------------ | ---------- |
| extensions     | `string` (required) | `extensions` consists of a comma separated list of extensions, example: zip, mp4, avi, mp3. Whenever a user clicks on a link, the script checks if the file extension is in the list you entered in the parameter and sends a `File Download` event with the value `url`.| `null` |
| saveExtension  | `boolean` (optional) |`saveExtension` allows you to save in the event detail together with the `url` also the name of the file extension as `meta_key` to get more information and statistics about your files to download.| `false` |
The script uses the `click` and` auxclick` events.


The script uses the `addEventListener ()` method for the `enableTracker`, `enableOutboundLinks` and `enableTrackFiles` functions, to remove the registered event listener each function will return a clean function `removeEventListener()`:
 
```ts
import VantevoAnalytics from "vantevo-analytics-tracker";
 
const { enableTracker, enableOutboundLinks, enableTrackFiles } = VantevoAnalytics({...});
 
const cleanTracker = enableTracker();
const cleanOutboundLinks = enableOutboundLinks();
const cleanEnableTrackFiles = enableTrackFiles("zip,mp4,avi", true);
 
cleanTracker();
cleanOutboundLinks();
cleanEnableTrackFiles();
```
 
## Page view monitoring and event management
 
### Simple Pageview

Submit a pageview using `location.href` as the request URL and` document.title` for the page title.

```ts
import VantevoAnalytics from "vantevo-analytics-tracker";
 
const { vantevo } = VantevoAnalytics({...});
 
vantevo();
/*** or ***/
vantevo("pageview");
```
 
### Pageview change pathname of url
 
You can submit a custom pageview where you can change the `pathname` of the page. In the example below, the page URL is https://example.com/blog?page=2 with the `pathname=/blog` and the`page=2` parameter (the page = 2 parameter will be ignored, see [guide](https://vantevo.io/docs)), using the `pageview` event with the` meta` parameter of type `{path:"/blog/page/2"}` , the script will save as page pathname: `/blog/page/2`.
 
 
```ts
import VantevoAnalytics from "vantevo-analytics-tracker";
 
const { vantevo } = VantevoAnalytics({...});
 
vantevo("pageview", { path: "/blog/page/2" }, () => {});
```

### Pageview change title page

Vantevo uses `document.title` to get the full title of the page, in this example you will see how you can change the page title.
 
```ts
import VantevoAnalytics from "vantevo-analytics-tracker";
 
const { vantevo } = VantevoAnalytics({...});
 
vantevo("pageview", { title: "New Title Page" }, () => {});
```

 
## Event
 
An example of how to send an event with the name "Download" and with the information `meta_key=pdf` and` meta_value=presentation`, the `meta` parameter is a simple json.
 
Vantevo Analytics handles the `meta_key=duration`, the value of this field is of type `Number`. With the `duration` parameter it is possible to send a number (seconds) with the event that will be used to calculate the average duration of the event itself.
 
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
 




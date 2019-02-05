### Bugwall Browser Extensions

Extensions (chrome/firefox) for my [Bug tracker app](https://www.mysql.com/ "stasgar/Visual_Bugtracker"). It just makes screenshots for boards.
Content script binds click event on element with `id="screenshotBoard"`. The screenshot is sent to the url in `data-href` parameter of the element.

Screenshot is a blob `jpeg` object, generated from `base64` string.

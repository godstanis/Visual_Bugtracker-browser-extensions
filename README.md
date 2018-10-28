# bugwall-browser-extensions

Extension for my bug tracker project. Used to make screenshots for boards.
Content scripts binds click event on element with id="screenshotBoard". The screenshot is sent to the url in data-href parameter of the element. Screenshot is a blob jpeg object, generated from base64 string.

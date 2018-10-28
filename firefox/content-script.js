/*
    Hide all controlls, send a message to background
*/
function messagePageScript() {

    showEditorControls(false);

    let url = contentInvoker.getAttribute('data-href');
    let csrf = contentInvoker.getAttribute('data-token');
    
    setTimeout(function() {
        sendMessage(url, csrf);
    }, 100)
}

/*
    Send message with url to image saving module
*/
function sendMessage(url, csrf) {
    // Make a simple request:
    browser.runtime.sendMessage(
        {screenshot: {
            'user_id': 123,
            'project_id': 123,
            'url': url,
            'csrf': csrf,
        }},
        function(response) {}
    );
}

/*
    Show/hide all controls on page (to make a screenshot without editor buttons)
*/
function showEditorControls(show) {
    let controls_collection = document.getElementsByClassName('editor-controls');

    for(let i = 0; i < controls_collection.length; i++) {
        if(show === false) {
            controls_collection[i].style.display = 'none';
        } else {
            controls_collection[i].style.display = 'block';
        }
    }
}

browser.runtime.onMessage.addListener(function(msg, sender, sendResponse) {
   if (msg.action === 'showEditorControls') {
    console.log('show_elements');
        showEditorControls(true);
   }
});

/*
    Add messagePageScript() as a listener to click events on
    the "saveImage" element.
*/
let contentInvoker = document.getElementById("screenshotBoard");
contentInvoker.addEventListener("click", messagePageScript);
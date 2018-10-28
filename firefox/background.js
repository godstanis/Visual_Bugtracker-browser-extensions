// Screenshot on icon click

browser.browserAction.setBadgeBackgroundColor({color:"#1EBD1E"});

let loader_frames = ["◐", "◓", "◑", "◒"]; // circle loader
//let loader_frames = ["▁", "▂", "▃", "▅", "▆", "▇", "█", "▇", "▆", "▅", "▃", "▁"]; // bar up-down loader
let current_frame = 0;
let animate = true;

/*
    Badge loader animation function
*/
function animateLoadingBadge() {

    if (animate){
        if (current_frame < loader_frames.length-1) {
            current_frame++;
        } else {
            current_frame = 0;
        }
        browser.browserAction.setBadgeText({text:loader_frames[current_frame]});

        setTimeout(function(){animateLoadingBadge(animate)},80);
    } else {
        browser.browserAction.setBadgeText({text:""});
    }
}

/*
    Create a screenshot and send it to the server script
*/
function createImage(request) {

    browser.tabs.captureVisibleTab(function(base64_image) {
        
        console.log('captured: '+Date.now());

        function sendScreenshot(image) {

            // Generating a board name (Example: "Screenshot #c9i98")
            let uniqid_board_name = 'Screenshot #' + Math.random().toString(36).substr(2, 5);

            let formData = new FormData();
            formData.append('_token', request.screenshot.csrf);
            formData.append('image', image, 'image_file.jpg');
            formData.append('name', uniqid_board_name);

            // Send the image and board name to the bugwall server
            $.ajax({
                type: 'POST',
                url: request.screenshot.url,
                data: formData,
                processData: false,
                contentType: false,
                success: function (response) {
                    console.log('background: success - '+Date.now());
                    browser.tabs.query({active: true, currentWindow: true}, function(tabs) {
                        // Send a message to the content script, that it can show the controls back.
                        browser.tabs.sendMessage(tabs[0].id, {action: "showEditorControls"}, function(response) {});
                    });
                    animate = false;
                },
                beforeSend: function (data) {
                    console.log('background: before send');
                    animate = true;
                    animateLoadingBadge();
                }
            });
        }

        let image_file = dataURItoBlob(base64_image); // Convert the image from base64 to blob object
        sendScreenshot(image_file); // Send it to the server
  });
    
}

function dataURItoBlob(dataURI) {
    // convert base64/URLEncoded data component to raw binary data held in a string
    let byteString;
    if (dataURI.split(',')[0].indexOf('base64') >= 0) {
        byteString = atob(dataURI.split(',')[1]);
    } else {
        byteString = decodeURI(dataURI.split(',')[1]);
    }

    // separate out the mime component
    let mimeString = dataURI.split(',')[0].split(':')[1].split(';')[0];

    // write the bytes of the string to a typed array
    let ia = new Uint8Array(byteString.length);
    for (let i = 0; i < byteString.length; i++) {
        ia[i] = byteString.charCodeAt(i);
    }

    return new Blob([ia], {type:mimeString});
}

browser.runtime.onMessage.addListener(
  function(request, sender, sendResponse) {
    if (request.screenshot) {
        createImage(request);
    }
});

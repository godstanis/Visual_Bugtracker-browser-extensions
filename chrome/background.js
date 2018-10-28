// Screenshot on icon click

chrome.browserAction.setBadgeBackgroundColor({color:"#1EBD1E"});

let loader_frames = ["◐", "◓", "◑", "◒"]; // circle loader
//let loader_frames = ["▁", "▂", "▃", "▅", "▆", "▇", "█", "▇", "▆", "▅", "▃", "▁"]; // bar up-down loader
let current_frame = 0;
let animate = true;

/*
    Badge loader animation function
*/
function animateLoadingBadge(){

    if (animate){
        if (current_frame < loader_frames.length-1){
            current_frame++;
        }
        else{
            current_frame = 0;
        }
        chrome.browserAction.setBadgeText({text:loader_frames[current_frame]});

        setTimeout(function(){animateLoadingBadge(animate)},80);
    }
    else{
        chrome.browserAction.setBadgeText({text:""});
    }
}

/*
    Create image and send it to the server script
*/
function createImage(request) {

    chrome.tabs.captureVisibleTab(function(base64_image) {
        
        console.log('captured: '+Date.now());

        function sendScreenshot(image){
            
            let formData = new FormData();
            formData.append('_token', request.screenshot.csrf);
            formData.append('board_image', image, 'image_file.jpg');

            $.ajax({
                type: 'POST',
                url: request.screenshot.url,
                data: formData,
                processData: false,
                contentType: false,
                success: function (response) {
                    console.log('background: success - '+Date.now());

                    chrome.tabs.query({active: true, currentWindow: true}, function(tabs){
                        chrome.tabs.sendMessage(tabs[0].id, {action: "showEditorControls"}, function(response) {});
                        //console.log('background: show editor msg sent');
                    });

                    animate = false;

                    //console.log (response);
                    //console.log ('AJAX: success');
                },
                beforeSend: function (data) {

                    console.log('background: before send');

                    animate = true;
                    animateLoadingBadge();

                    //console.log ('AJAX: before send');
                }
            });

        }

        let image_file = dataURItoBlob(base64_image);

        sendScreenshot(image_file);
    
  });
    
}

function dataURItoBlob(dataURI) {
    // convert base64/URLEncoded data component to raw binary data held in a string
    let byteString;
    if (dataURI.split(',')[0].indexOf('base64') >= 0)
        byteString = atob(dataURI.split(',')[1]);
    else
        byteString = unescape(dataURI.split(',')[1]);

    // separate out the mime component
    let mimeString = dataURI.split(',')[0].split(':')[1].split(';')[0];

    // write the bytes of the string to a typed array
    let ia = new Uint8Array(byteString.length);
    for (let i = 0; i < byteString.length; i++) {
        ia[i] = byteString.charCodeAt(i);
    }

    return new Blob([ia], {type:mimeString});
}

chrome.runtime.onMessage.addListener(
  function(request, sender, sendResponse) {
    if (request.screenshot){
        createImage(request);
    }
});

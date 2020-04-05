
fetch(chrome.extension.getURL("widget/widget.html"))
    .then((response) => response.text())
    .then((result) => {
        var new_elem = document.createElement('div');
        new_elem.innerHTML = result;
        var something = document.querySelector('body').firstChild;
        document.querySelector('body').insertBefore(new_elem, something);

        let iconUrl = chrome.extension.getURL("images/app_icon_512.png");
        document.getElementById("skenicon").style.backgroundImage = "url(\'" + iconUrl + "\')";
        document.getElementById("skenicon").style.height = "50px";
        document.getElementById("skenicon").style.width = "50px";
        document.getElementById("skenicon").style.backgroundSize = "cover";
        document.getElementById("skenicon").style.backgroundRepeat = "no-repeat";


        let backgroundUrl = chrome.extension.getURL("images/popup_background.svg");
        document.getElementById("popup_background").style.backgroundImage = "url(\'" + backgroundUrl + "\')";
        document.getElementById("popup_background").style.backgroundRepeat = "no-repeat";


        let minusUrl = chrome.extension.getURL("images/minimize.svg");
        document.getElementById("sken-container-minimise").style.backgroundImage = "url(\'" + minusUrl + "\')";
        document.getElementById("sken-container-minimise").style.height = "20px";
        document.getElementById("sken-container-minimise").style.width = "20px";
        document.getElementById("sken-container-minimise").style.backgroundRepeat = "no-repeat";


        let closeUrl = chrome.extension.getURL("images/close.svg");
        document.getElementById("sken-container-close").style.backgroundImage = "url(\'" + closeUrl + "\')";
        document.getElementById("sken-container-close").style.height = "20px";
        document.getElementById("sken-container-close").style.width = "20px";
        document.getElementById("sken-container-close").style.backgroundRepeat = "no-repeat";

        loadExtensionState();
        addEventListnerForExtension();
        dragElement(document.getElementById("salesken_div"));

        thinClient();
    }).catch((error) => {
        console.error('Error:', error);
    });

function updateCallEvent(isCallstarted) {
    if (isCallstarted) {
    } else {
        updateCues();
    }
}



/* this is chrome listner for cues popup for updating sign in, getting realtime cues,updating search
chrome.runtime.onMessage recieve message from popup and backgroung js.
From popup we are updating the login
From background js we getting live cues and appending into the container
*/
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    //console.log(message);
    //console.log(sender);

    switch (message.action) {
        case "cues":
            if (message.cue) {
                console.log(message)
                appendCue(message.cue);
            }
            setTimeout(function () {
                sendResponse({ status: true });
            }, 1);
            break;
        case "tabchange":
            loadExtensionState();
            break;
        case "callstarted":
            if(message.senddata){

            }else{
                store("cues", null);
                emptyCueContainer();
            }
            shouldSearchShow();
            break;
        case "updatelogin":
            if(message.senddata){

            }else{
                store("callstarted", false);
                setTimeout(function () {
                   shouldSearchShow();
                }, 100);

            }
            updateSignInOutBtn();
            break;
        case "storingcues":
            if (message.senddata) {
                appendCue(message.senddata);
            }
            setTimeout(function () {
                sendResponse({ status: true });
            }, 1);
            break;
        default:
            break;
    }
});

/* end of  listner for cues popup for updating sign in, getting realtime cues,updating search */


/* every storage variable  will be stored as property in  saleskenobj*/
function store(propertyName, propertyValue) {
    chrome.storage.sync.get('saleskenobj', (result) => {
        var saleskenobj = result.saleskenobj;
        saleskenobj[propertyName] = propertyValue;
        chrome.storage.sync.set({ "saleskenobj": saleskenobj });
    });
}


// function highlight(text, child) {
//     for (let middleelem of child.children) {
//         for (let inputText of middleelem.children) {
//             inputText.innerHTML = inputText.innerHTML.split('<span class="salesken-cues-highlight">').join('')
//             inputText.innerHTML = inputText.innerHTML.split('</span>').join('');
//             console.log(inputText)
//             var originaHTML = inputText.innerHTML;
//             var innerHTML = inputText.innerHTML.toLowerCase();
//             var index = innerHTML.indexOf(text);

//             if (index >= 0) {
//                 originaHTML = originaHTML.substring(0, index) + "<span class='salesken-cues-highlight'>" + originaHTML.substring(index, index + text.length) + "</span>" + originaHTML.substring(index + text.length);
//                 inputText.innerHTML = originaHTML;
//             }
//         }

//     }
// }

function startCallThinClient(user_id, token){
    var url = config.host + "/user_stream_status?method=StartStream&user_id="+user_id;
    sendGetRequestThinClient(url, token);
}

function endCallThinClient(user_id, token){
    var url =  config.host + "/user_stream_status?method=StopStream&user_id="+user_id;
    sendGetRequestThinClient(url, token);
}

function sendGetRequestThinClient(url, token){
    fetch(url, {
        method: 'GET',
        headers: {
            'Authorization': 'Basic '+ token
        }
    }).then((response) => {
        if (response.status == 200) {
            //console.log(response)
            //return response.json();
        } else {
            //console.log("Unauthorized");
        }
    }).catch((error) => {
        console.error('Error:', error);
        alert.style.visibility = 'visible'
    });
}
thinClient = function (){
    chrome.storage.sync.get('saleskenobj', (result) => {
        var saleskenobj = result.saleskenobj;
        if (saleskenobj.userObject && saleskenobj.userObject.id) {
            // User is signed in, activate the logic
            if(saleskenobj.userObject.thinClientConfiguration.thinClientActive
                 && saleskenobj.userObject.thinClientConfiguration.thinClientMode == 'slack'){
                if(window.location.href.indexOf(saleskenobj.userObject.thinClientConfiguration.baseUrls[0])>-1){
                    startCallThinClient(saleskenobj.userObject.id, saleskenobj.userObject.token);
                    window.addEventListener('beforeunload', (event) => {
                        endCallThinClient(saleskenobj.userObject.id, saleskenobj.userObject.token);
                        // Cancel the event as stated by the standard.
                        event.preventDefault();
                        // Chrome requires returnValue to be set.
                        event.returnValue = '';
                      });
                }


                
            }
        } else {
            // User is signed out, deactivate any setIntervals if required
        }
    });
}

fetch(browser.extension.getURL("widget/widget.html"))
    .then((response) => response.text())
    .then((result) => {
        var new_elem = document.createElement('div');
        new_elem.innerHTML = result;
        var something = document.querySelector('body').firstChild;
        document.querySelector('body').insertBefore(new_elem, something);

        let iconUrl = browser.extension.getURL("images/app-icon(512x512).png");
        document.getElementById("skenicon").src = iconUrl;

        let backgroundUrl = browser.extension.getURL("images/popup_background.svg");
        document.getElementById("popup_background").src=backgroundUrl;

        let minusUrl = browser.extension.getURL("images/minimize.svg");
        document.getElementById("Minus_icon").src=minusUrl;

        let closeUrl = browser.extension.getURL("images/close.svg");
        document.getElementById("close_icon").src=closeUrl;

        loadExtensionState();
        addEventListnerForExtension();
        dragElement(document.getElementById("salesken_div"));
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
browser.runtime.onMessage recieve message from popup and backgroung js.
From popup we are updating the login
From background js we getting live cues and appending into the container
*/
browser.runtime.onMessage.addListener((message, sender, sendResponse) => {
    console.log(message);
    console.log(sender);

    switch (message.action) {
        case "cues":
            if (message.cue) {
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
            shouldSearchShow();
            break;
        case "updatelogin":
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
    browser.storage.sync.get('saleskenobj', (result) => {
        var saleskenobj = result.saleskenobj;
        saleskenobj[propertyName] = propertyValue;
        browser.storage.sync.set({ "saleskenobj": saleskenobj });
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


fetch(chrome.extension.getURL("widget/widget.html"))
    .then((response) => response.text())
    .then((result) => {
        var new_elem = document.createElement('div');
        new_elem.innerHTML = result;
        var something = document.querySelector('body').firstChild;
        document.querySelector('body').insertBefore(new_elem, something);

        let iconUrl = chrome.extension.getURL("images/app-icon(512x512).png");
        document.getElementById("skenicon").src = iconUrl;
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

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
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

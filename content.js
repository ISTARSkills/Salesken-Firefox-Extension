
fetch(chrome.extension.getURL("widget/widget.html"))
    .then((response) => response.text())
    .then((result) => {
        document.body.insertAdjacentHTML('beforeend', result);
        makeWidgetDraggable();
        attachJavascriptToWidget();
        showHideWidget();
        updateWidgetPosition();
    })
    .catch((error) => {
        console.error('Error:', error);
    });

var shownCues = [];

function updateWidgetPosition() {
    chrome.storage.sync.get(["skenX", "skenY"], (result) => {
        if (result.skenX && result.skenY) {
            let container = document.getElementsByClassName("sken-widget-container")[0];
            container.style.left = result.skenX;
            container.style.top = result.skenY;

            let chatContainer = document.getElementsByClassName("sken-chat-container")[0];

            console.log(result.skenX);
            console.log(result.skenY);

            if (parseInt(result.skenX.replace("px","")) < 340) {
                //chatContainer.style.left=340
                chatContainer.style.left = 0 + "px";
            } else {
                chatContainer.style.left = null;
            }
    
            if (parseInt(result.skenY.replace("px","")) < 550) {
                chatContainer.style.top = 0 + "px";
            } else {
                chatContainer.style.top = null;
            }

        }
    });
}

function showHideWidget() {
    chrome.storage.sync.get("isWidgetOpen", (result) => {
        if (result.isWidgetOpen) {
            document.getElementsByClassName("sken-chat-container")[0].style.display = "block";
        } else {
            document.getElementsByClassName("sken-chat-container")[0].style.display = "none";
        }
    });
}

function attachJavascriptToWidget() {
    let iconUrl = chrome.extension.getURL("images/app-icon(512x512).png");
    document.getElementById("skenicon").src = iconUrl;

    document.getElementsByClassName("skenicon")[0].addEventListener("click", (e) => {
        document.getElementsByClassName("sken-chat-container")[0].style.display = "block";

        chrome.storage.sync.set({ "isWidgetOpen": true });

        chrome.storage.sync.get('cues', (result) => {
            console.log(result.cues);
            if (result.cues) {
                let cueResult = JSON.parse(result.cues);
                for (let cue of cueResult) {
                    if (shownCues.indexOf(cue) == -1) {
                        shownCues.push(cue);
                        appendCue(cue);
                    }
                }
            }
        });

        updateSignInOutBtn();
    });

    document.getElementById("sken-container-minimise").addEventListener("click", () => {
        chrome.storage.sync.set({ "isWidgetOpen": false });
        document.getElementsByClassName("sken-chat-container")[0].style.display = "none";
    });

    document.getElementById("sken-container-close").addEventListener("click", () => {
        chrome.storage.sync.set({ "isWidgetOpen": false });
        document.getElementsByClassName("sken-chat-container")[0].style.display = "none";
    });

    let navimageUrl = chrome.extension.getURL("images/nav_icon.png");
    //document.getElementById("sken-image").src=navimageUrl;

    document.getElementsByClassName("sken-search-box-input")[0].addEventListener("search", (e) => {
        console.log(e.target.value);
        let value = e.target.value;

        if (value) {
            let nodes = document.getElementById("sken-cues-body").childNodes;

            for (let child of nodes) {
                if (child.className == "sken-cue-card") {
                    child.style.display = "none";
                }
            }

            for (let child of nodes) {
                if (child.className == "sken-cue-card") {
                    for (let p of child.childNodes) {
                        if (p.className == "sken-cue-title") {
                            if (p.innerText.includes(value)) {
                                p.parentNode.style.display = "block";
                            }
                        }
                    }
                }
            }
        } else {

        }
    });

    //document.getElementById("sken-sign-in-btn").addEventListener("click", signInSken());

    document.getElementById("sken-sign-out-btn").addEventListener("click", () => {
        chrome.storage.sync.remove("userid");
        chrome.storage.sync.remove("userObj");
        chrome.storage.sync.set({ "loggedIn": false });
        chrome.runtime.sendMessage({ loggedIn: false });
    });

    updateSignInOutBtn();

}


function updateSignInOutBtn() {
    chrome.storage.sync.get(['loggedIn', 'userObj'], (result) => {
        console.log(result);
        if (result.loggedIn != undefined && result.loggedIn) {
            console.log("called logged in");
            let email = result.userObj.email;
            document.getElementById("sken-email-id").innerText = email;
            document.getElementById("sken-sign-in-btn").style.display = "none";
            document.getElementById("sken-sign-out-btn").style.display = "block";
        } else {
            console.log("called logged out");
            document.getElementById("sken-email-id").innerText = "";
            document.getElementById("sken-sign-in-btn").style.display = "block";
            document.getElementById("sken-sign-out-btn").style.display = "none";
        }
    });
}


function makeWidgetDraggable() {
    interact('.sken-icon-draggable')
        .draggable({
            // enable inertial throwing
            inertia: false,
            // keep the element within the area of it's parent
            modifiers: [
                interact.modifiers.restrictRect({
                    restriction: 'parent',
                    endOnly: true
                })
            ],
            // enable autoScroll
            autoScroll: true,

            // call this function on every dragmove event
            onmove: dragMoveListener,
            // call this function on every dragend event
            onend: function (event) {
                let x = event.target.parentNode.style.left;
                let y = event.target.parentNode.style.top;

                chrome.storage.sync.set({ "skenX": x, "skenY": y });

                //     var textEl = event.target.querySelector('p')

                //     textEl && (textEl.textContent =
                //         'moved a distance of ' +
                //         (Math.sqrt(Math.pow(event.pageX - event.x0, 2) +
                //             Math.pow(event.pageY - event.y0, 2) | 0))
                //             .toFixed(2) + 'px')
            }
        });

    function dragMoveListener(event) {
        var target = event.target.parentNode;

        //console.log(event);

        let leftPos = Math.abs(event.client.x);
        let topPos = Math.abs(event.client.y);


        target.style.left = leftPos > window.innerWidth - 100 ? window.innerWidth - 100 : leftPos - 25 + "px";
        target.style.top = topPos > window.innerHeight - 100 ? window.innerHeight - 100 : topPos - 25 + "px";

        let chatContainer = document.getElementsByClassName("sken-chat-container")[0];

        if (leftPos < 340) {
            //chatContainer.style.left=340
            chatContainer.style.left = 0 + "px";
        } else {
            chatContainer.style.left = null;
        }

        if (topPos < 550) {
            chatContainer.style.top = 0 + "px";
        } else {
            chatContainer.style.top = null;
        }

    }
}

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    console.log(message);

    switch (message.action) {
        case "cue":
            if (message.cue) {
                shownCues.push(message.cue);
                appendCue(message.cue);
                //document.getElementsByClassName("sken-cues-body")[0].appendChild(html);
            }
            setTimeout(function () {
                sendResponse({ status: true });
            }, 1);
            break;
        case "closepopup":
            document.getElementsByClassName("sken-chat-container")[0].style.display = "none";
            break;
        case "tabchange":
            console.log("tab changed");
            showHideWidget();
            updateWidgetPosition();
            break;
        default:
            break;
    }



});

function appendCue(msg) {

    msg = JSON.parse(msg)
    let html = `
    <div class="sken-cue-card d-flex">
        <div class="d-flex flex-column">
            <div class="sken-cue-time">${formatAMPM(new Date())}</div>
            <div class="sken-cue-title">${msg.title}</div>
            <div class="sken-cue-text">${msg.text}</div>
        </div>
    </div>`;

    let containerBody = document.getElementsByClassName("sken-cues-body")[0];

    containerBody.innerHTML += html;

    //Scrolling to bottom
    containerBody.scrollTop = containerBody.scrollHeight;


}

function formatAMPM(date) {
    var hours = date.getHours();
    var minutes = date.getMinutes();
    var ampm = hours >= 12 ? 'pm' : 'am';
    hours = hours % 12;
    hours = hours ? hours : 12; // the hour '0' should be '12'
    minutes = minutes < 10 ? '0' + minutes : minutes;
    var strTime = hours + ':' + minutes + ' ' + ampm;
    return strTime;
}

// var pointerDownEvent = new PointerEvent("pointerdown", {
//     bubbles: true,
//     // any mouseEvent contructor value
// });
// el.dispatchEvent(pointerDownEvent);



// fetch('widget/widget.html').then(function(response) {
//     return response.text();
//   }).then(function(body) {
//     document.getElementsByTagName('body').appendChild("<iframe id='salesken-widget'>"+body +"<iframe>");
//   });


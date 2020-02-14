
var shownCues = [];
var welocomeCueHtml = `
    <div class="sken-cue-card">
        <div class="d-flex flex-column">
            <div class="sken-cue-title"> Welcome to Salesken!</div>
            <div class="sken-cue-text">Want to help every sales agent like a <b>champion !</b> </div>
            <div class="">
                <a type="button" href="https://salesken.ai/sign-in.html" class="sken-button-theme">START HERE</a>
            </div>
        </div>
    </div>`;
fetch(browser.extension.getURL("widget/widget.html"))
    .then((response) => response.text())
    .then((result) => {
        var new_elem = document.createElement('div');
        new_elem.innerHTML = result;
        var something = document.querySelector('body').firstChild;
        document.querySelector('body').insertBefore(new_elem, something);

        updateWidgetPosition();
        showHideWidget();
        updateSignInOutBtn();
        updateCues();
        updateSearch();
        shouldSearchShow();
        let iconUrl = browser.extension.getURL("images/app-icon(512x512).png");
        document.getElementById("skenicon").src = iconUrl;
        document.getElementById("skenicon").addEventListener("click", function (e) {
            document.getElementById("salesken-cue-container").style.display = "block";
            document.getElementById("skenicon").style.display = "none";
            console.log(e.clientX);



            var height = window.innerHeight
            var width = window.innerWidth
            
                       if (e.clientX > (width  - document.getElementById('mydiv').offsetWidth)) {
                           document.getElementById('mydiv').style.left = width  - document.getElementById('mydiv').offsetWidth - 40 + 'px'
                       }
                       if (e.clientY > (height  - document.getElementById('mydiv').offsetHeight)) {
                           document.getElementById('mydiv').style.top = height  - document.getElementById('mydiv').offsetHeight + 'px'
                       }
            browser.storage.sync.set({
                mymove: {
                    position_x: document.getElementById('mydiv').offsetLeft,
                    position_y: document.getElementById('mydiv').offsetTop
                }
            });

            browser.storage.sync.set({
                ispopupOpen: true
            });

        });

        document.getElementsByClassName("sken-search-box-input")[0].addEventListener("click", (e) => {
            document.getElementsByClassName("sken-search-box-input")[0].select();
        });

        document.getElementsByClassName("sken-search-box-input")[0].addEventListener("search", (e) => {
            console.log('searxh event',  e.target.value)
            browser.storage.sync.set({
                searchkey : ''
            })
            const ke = new KeyboardEvent("keyup", {
                bubbles: true, cancelable: true, keyCode: 13
            });
            document.getElementsByClassName("sken-search-box-input")[0].dispatchEvent(ke);
           
        
        });
        document.getElementsByClassName("sken-search-box-input")[0].addEventListener("keyup", (e) => {
            e.stopPropagation();
            console.log(e.target.value);
            let value = e.target.value;
            browser.storage.sync.set({
                searchkey : e.target.value
            })
            console.log("asdasdsdasad"+value)
            if (value) {
                let nodes = document.getElementById("sken-cues-body").childNodes;

                for (let child of nodes) {
                    if (child.className == "sken-cue-card") {
                        child.style.display = "none";
                    }
                    if (child.className == "sken-cue-card d-flex") {
                        child.style.display = "none";
                    }
                }

                for (let child of nodes) {
                    if(child.innerText){
                    if(child.innerText.trim().toLowerCase().indexOf(value.toLowerCase()) >-1){
                        child.style.display = "block";
                        console.log(child.innerText)
                        //highlight(value.toLowerCase(),child)
                        
                    }else{
                        child.style.display = "none";

                    }
                }
                }
            } else {
                let nodes = document.getElementById("sken-cues-body").childNodes;

                for (let child of nodes) {
                    if (child.className == "sken-cue-card") {
                        child.style.display = "block";
                    }
                    if (child.className == "sken-cue-card d-flex") {
                        child.style.display = "block";
                    }
                  
                }
                scrolltobottom();

            }
        });

        document.getElementById("sken-sign-out-btn").addEventListener("click", (event) => {

            browser.storage.sync.remove("userid");
            browser.storage.sync.remove("userObj");
            browser.storage.sync.set({ "loggedIn": false });
            browser.runtime.sendMessage({ loggedIn: false });
            updateSignInOutBtn();
        });
        document.getElementById("sken-sign-in-btn").addEventListener("click", (event) => {
            browser.runtime.sendMessage({ openOptions: true });

        });


        document.getElementById("sken-container-close").addEventListener("click", () => {
            document.getElementById("salesken-cue-container").style.display = "none";
            document.getElementById("skenicon").style.display = "block";
            browser.storage.sync.set({
                ispopupOpen: false
            });


        });

        document.getElementById("sken-container-minimise").addEventListener("click", () => {
            document.getElementById("salesken-cue-container").style.display = "none";
            document.getElementById("skenicon").style.display = "block";
            browser.storage.sync.set({
                ispopupOpen: false
            });


        });



        dragElement(document.getElementById("mydiv"));



    }).catch((error) => {
        console.error('Error:', error);
    });




function dragElement(elmnt) {
    var pos1 = 0, pos2 = 0, pos3 = 0, pos4 = 0;
    if (document.getElementById(elmnt.id + "header")) {
        /* if present, the header is where you move the DIV from:*/
        document.getElementById(elmnt.id + "header").onmousedown = dragMouseDown;
    } else {
        /* otherwise, move the DIV from anywhere inside the DIV:*/
        elmnt.onmousedown = dragMouseDown;
    }

    function dragMouseDown(e) {

        e = e || window.event;
        e.preventDefault();
        // get the mouse cursor position at startup:
        pos3 = e.clientX;
        pos4 = e.clientY;
        document.onmouseup = closeDragElement;
        // call a function whenever the cursor moves:
        document.onmousemove = elementDrag;
    }

    function elementDrag(e) {

        e = e || window.event;
        e.preventDefault();
        var winW = document.documentElement.clientWidth || document.body.clientWidth,
            winH = document.documentElement.clientHeight || document.body.clientHeight;


        maxX = winW - elmnt.offsetWidth - 1,
            maxY = winH - elmnt.offsetHeight - 1;

        // calculate the new cursor position:
        pos1 = pos3 - e.clientX;
        pos2 = pos4 - e.clientY;
        pos3 = e.clientX;
        pos4 = e.clientY;
        // set the element's new position:
        //console.log((elmnt.offsetLeft - pos1), maxY, (elmnt.offsetLeft - pos1), maxX);
        if ((elmnt.offsetTop - pos2) <= maxY && (elmnt.offsetTop - pos2) >= 0) {
            elmnt.style.top = (elmnt.offsetTop - pos2) + "px";
        } else {

        }
        if ((elmnt.offsetLeft - pos1) <= maxX && (elmnt.offsetLeft - pos1) >= 0) {
            elmnt.style.left = (elmnt.offsetLeft - pos1) + "px";
        }
    }

    function closeDragElement(event) {
        console.log(event.x)
        console.log(event.y)


        browser.storage.sync.set({
            mymove: {
                position_x: document.getElementById('mydiv').offsetLeft,
                position_y: document.getElementById('mydiv').offsetTop
            }
        });
        /* stop moving when mouse button is released:*/
        document.onmouseup = null;
        document.onmousemove = null;
    }
}
function updateSignInOutBtn() {
    browser.storage.sync.get(['loggedIn', 'userObj'], (result) => {
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

browser.runtime.onMessage.addListener((message, sender, sendResponse) => {
    console.log(message);
    console.log(sender);

    switch (message.action) {
        case "cue":
            if (message.cue) {
                //shownCues.push(message.cue);
                appendCue(message.cue);
                //document.getElementsByClassName("sken-cues-body")[0].appendChild(html);
            }
            setTimeout(function () {
                sendResponse({ status: true });
            }, 1);
            break;
        case "closepopup":
            updateSignInOutBtn();
            break;
        case "tabchange":
            console.log("tab changed");
            showHideWidget();
            updateWidgetPosition();
            updateCues();
            updateSignInOutBtn();
            updateSearch();
            shouldSearchShow();
            break;
        case "callevent":
            updateCallEvent(message.isCallstarted, );
            break;
        case "updatelogin":
            updateSignInOutBtn();
            break;
        case "shouldSearchShow":
            shouldSearchShow();
                break;


        default:
            break;
    }
});


function showHideWidget() {
    browser.storage.sync.get('ispopupOpen', (res) => {
        console.log('ispopupOpen')
        console.log(res);

        if (res.ispopupOpen) {
            document.getElementById("salesken-cue-container").style.display = "block";
            document.getElementById("skenicon").style.display = "none";

        } else {
            document.getElementById("salesken-cue-container").style.display = "none";
            document.getElementById("skenicon").style.display = "block";

        }
    });
}

function updateWidgetPosition() {
    browser.storage.sync.get('mymove', (res) => {
        if (res.mymove) {
            console.log('res hai ')
            document.getElementById('mydiv').style.left = res.mymove.position_x + 'px'
            document.getElementById('mydiv').style.top = res.mymove.position_y + 'px'
        } else {
            console.log('res nahi hai ')
            document.getElementById('mydiv').style.left = window.screenX + window.innerWidth - 100 + 'px';
            document.getElementById('mydiv').style.top = window.screenY + window.innerHeight - 150 + 'px';
        }
    })
}


function updateCallEvent(isCallstarted) {
    if (isCallstarted) {

    } else {



        updateCues();
    }
}

function updateCues() {
    browser.storage.sync.get('cues', (result) => {
        console.log(result.cues);
        emptyCueContainer();
        if (result.cues) {
            for (let cue of JSON.parse(result.cues)) {
                appendCue(cue);
            }
        }
    });
}

function emptyCueContainer() {
    let el = document.getElementById("sken-cues-body");
    //Below script will remove all elements inside the class
    while (el.firstChild) {
        el.removeChild(el.firstChild);
    }
    el.innerHTML += welocomeCueHtml;
    console.log("gayab")
}

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

    scrolltobottom();
    const ke = new KeyboardEvent("keyup", {
        bubbles: true, cancelable: true, keyCode: 13
    });
    document.getElementsByClassName("sken-search-box-input")[0].dispatchEvent(ke);;



}

function highlight(text,child) {
     for(let aewaii of child.children){
        for(let inputText of aewaii.children)
        {
            inputText.innerHTML=inputText.innerHTML.split('<span class="salesken-cues-highlight">').join('')
            inputText.innerHTML=inputText.innerHTML.split('</span>').join('');
            console.log(inputText)
            var originaHTML = inputText.innerHTML;
            var innerHTML = inputText.innerHTML.toLowerCase();
            var index = innerHTML.indexOf(text);
            
            if (index >= 0) { 
                originaHTML = originaHTML.substring(0,index) + "<span class='salesken-cues-highlight'>" + originaHTML.substring(index,index+text.length) + "</span>" + originaHTML.substring(index + text.length);
             inputText.innerHTML = originaHTML;
            }
        }
      
    }   
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

function updateSearch(){
    document.getElementsByClassName("sken-search-box-input")[0].value='';

    browser.storage.sync.get('searchkey', (result) => {
        if(result.searchkey ){
            document.getElementsByClassName("sken-search-box-input")[0].value=result.searchkey;
           ;
        }else{
            document.getElementsByClassName("sken-search-box-input")[0].value='';

        }
        const ke = new KeyboardEvent("keyup", {
            bubbles: true, cancelable: true, keyCode: 13
        });
        document.getElementsByClassName("sken-search-box-input")[0].dispatchEvent(ke);
        console.log(result)
    })
}

function shouldSearchShow(){
    browser.storage.sync.get('isSearchShow', (result) => {
        if(result.isSearchShow){
            document.getElementsByClassName('sken-search-box-input')[0].style.display="block";
        }else{
            document.getElementsByClassName('sken-search-box-input')[0].style.display="none";
            document.getElementsByClassName("sken-search-box-input")[0].value="";
        }
    })
}

function scrolltobottom(){
    let containerBody = document.getElementsByClassName("sken-cues-body")[0];
    //Scrolling to bottom
    containerBody.scrollTop = containerBody.scrollHeight;
}
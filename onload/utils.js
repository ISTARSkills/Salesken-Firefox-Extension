
/* this function will check all properties store in storage and maintains the state of the extension */
var welocomeCueHtml = `
    <div class="sken-cue-card">
        <div class="salesken-flex salesken-flex-column">
            <div class="sken-cue-title"> Welcome to Salesken!</div>
            <div class="sken-cue-text">Want to help every sales agent like a <b>champion !</b> </div>
            <div class="">
                <a type="button" href="https://salesken.ai/sign-in.html" class="sken-button-theme">START HERE</a>
            </div>
        </div>
    </div>`;

function loadExtensionState() {

    updateUIPosition();
    isCuePopUpShown();
    updateCues();
    updateSignInOutBtn();
    updateSearch();
    shouldSearchShow();
}

function updateUIPosition() {
    browser.storage.sync.get('saleskenobj', (res) => {
        console.log('widget ui');
        console.log(res)

        if (res.saleskenobj.divposition) {
            document.getElementById('salesken_div').style.left = res.saleskenobj.divposition.position_x + 'px'
            document.getElementById('salesken_div').style.top = res.saleskenobj.divposition.position_y + 'px'
        } else {
            console.log('res nahi hai ')
            document.getElementById('salesken_div').style.left = window.screenX + window.innerWidth - 100 + 'px';
            document.getElementById('salesken_div').style.top = window.screenY + window.innerHeight - 150 + 'px';
        }
    })
}

function isCuePopUpShown() {
    browser.storage.sync.get('saleskenobj', (res) => {
        console.log('ispopupOpen')
        console.log(res);
        if (res.saleskenobj.ispopupOpen) {
            document.getElementById("salesken-cue-container").style.display = "block";
            document.getElementById("skenicon").style.display = "none";

        } else {
            document.getElementById("salesken-cue-container").style.display = "none";
            document.getElementById("skenicon").style.display = "block";

        }
    });
}


function updateSignInOutBtn() {
    browser.storage.sync.get('saleskenobj', (result) => {
        console.log('update sign in')
        var saleskenobj = result.saleskenobj;
        console.log(saleskenobj)
        console.log(saleskenobj.userObject)
        //console.log(saleskenobj.userObject.email)

        if (saleskenobj.userObject && saleskenobj.userObject.id) {
            console.log("called logged in");
            let email = saleskenobj.userObject.email;
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

function updateCues() {
    browser.storage.sync.get('saleskenobj', (result) => {
        console.log(result);
        emptyCueContainer();
        if (result.saleskenobj.cues) {
            for (let cue of result.saleskenobj.cues) {
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

    let html = `
    <div class="sken-cue-card salesken-flex">
        <div class="salesken-flex salesken-flex-column">
            <div class="sken-cue-time">${msg.time}</div>
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
    document.getElementById("sken-search-box-input").dispatchEvent(ke);;
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

function updateSearch() {
    document.getElementById("sken-search-box-input").value = '';

    browser.storage.sync.get('saleskenobj', (result) => {
        if (result.saleskenobj.searchkey) {
            document.getElementById("sken-search-box-input").value = result.saleskenobj.searchkey;
            ;
        } else {
            document.getElementById("sken-search-box-input").value = '';

        }
        const ke = new KeyboardEvent("keyup", {
            bubbles: true, cancelable: true, keyCode: 13
        });
        document.getElementById("sken-search-box-input").dispatchEvent(ke);
        console.log(result)
    })
}

function shouldSearchShow() {
    browser.storage.sync.get('saleskenobj', (result) => {
        if (result.saleskenobj.callstarted) {
            document.getElementsByClassName('sken-search-box-input')[0].style.display = "block";
        } else {
            document.getElementsByClassName('sken-search-box-input')[0].style.display = "none";
            document.getElementById("sken-search-box-input").value = "";
            emptyCueContainer();

        }
    })
}

function scrolltobottom() {
    let containerBody = document.getElementsByClassName("sken-cues-body")[0];
    //Scrolling to bottom
    containerBody.scrollTop = containerBody.scrollHeight;
}
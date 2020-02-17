function addEventListnerForExtension() {


    /* start of salesken logo icon click to open cues pop window */
    document.getElementById("skenicon").addEventListener("click", function (e) {
        document.getElementById("salesken-cue-container").style.display = "block";
        document.getElementById("skenicon").style.display = "none";
        console.log(e.clientX);
        var height = window.innerHeight
        var width = window.innerWidth

        if (e.clientX > (width - document.getElementById('salesken_div').offsetWidth)) {
            document.getElementById('salesken_div').style.left = width - document.getElementById('salesken_div').offsetWidth - 40 + 'px'
        }
        if (e.clientY > (height - document.getElementById('salesken_div').offsetHeight)) {
            document.getElementById('salesken_div').style.top = height - document.getElementById('salesken_div').offsetHeight + 'px'
        }

        store("divposition", {
            position_x: document.getElementById('salesken_div').offsetLeft,
            position_y: document.getElementById('salesken_div').offsetTop
        });

        store("ispopupOpen", true);




    });
    /* end of salesken logo icon click to open cues pop window */


    /* start of putting focus on search input as its parent is draggable */
    document.getElementsByClassName("sken-search-box-input")[0].addEventListener("click", (e) => {
        document.getElementsByClassName("sken-search-box-input")[0].select();
    });
    /* End of putting focus on search input as its parent is draggable*/

    /* start of search input clear all event capture */
    document.getElementsByClassName("sken-search-box-input")[0].addEventListener("search", (e) => {
        console.log('searxh event', e.target.value)
        store("searchkey", '')

        const ke = new KeyboardEvent("keyup", {
            bubbles: true, cancelable: true, keyCode: 13
        });
        document.getElementsByClassName("sken-search-box-input")[0].dispatchEvent(ke);


    });
    /* End of search input clear all event capture */

    /* start of search input text change event*/
    document.getElementsByClassName("sken-search-box-input")[0].addEventListener("keyup", (e) => {
        e.stopPropagation();
        console.log(e.target.value);
        let value = e.target.value;
        store("searchkey", e.target.value)
        console.log("asdasdsdasad" + value)
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
                if (child.innerText) {
                    if (child.innerText.trim().toLowerCase().indexOf(value.toLowerCase()) > -1) {
                        child.style.display = "block";
                        console.log(child.innerText)
                        //highlight(value.toLowerCase(),child)

                    } else {
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
    /* end of search input text change event */

    /* start of sign out button click event */
    document.getElementById("sken-sign-out-btn").addEventListener("click", (event) => {
        chrome.runtime.sendMessage({ "action": "logout" });
    });
    /* end of sign out button click event*/



    /* start of sign In button click event*/
    document.getElementById("sken-sign-in-btn").addEventListener("click", (event) => {
        chrome.runtime.sendMessage({ "action": "openoption" });

    });
    /* end of sign In button click event */


    /* start of Cues pop up close click event */
    document.getElementById("sken-container-close").addEventListener("click", () => {
        document.getElementById("salesken-cue-container").style.display = "none";
        document.getElementById("skenicon").style.display = "block";
        store("ispopupOpen", false);



    });
    /* end of Cues pop up close click event */


    /* start of Cues pop up minimize click event*/
    document.getElementById("sken-container-minimise").addEventListener("click", () => {
        document.getElementById("salesken-cue-container").style.display = "none";
        document.getElementById("skenicon").style.display = "block";
        store("ispopupOpen", false);



    });
    /* End of Cues pop up minimize click event */

}
function addEventListnerForExtension() {


    /* start of salesken logo icon click to open cues pop window */
    document.getElementById("skenicon").addEventListener("click", function (e) {
        document.getElementById("salesken-cue-container").style.display = "block";
        document.getElementById("skenicon").style.display = "none";
        console.log(e.clientX);
        var height = window.innerHeight
        var width = window.innerWidth
        var salesken_div_height=document.getElementById('salesken_div').offsetHeight;
        var salesken_div_width=document.getElementById('salesken_div').offsetWidth;
        if (e.clientX > (width - salesken_div_width)) {
            document.getElementById('salesken_div').style.left = width - salesken_div_width - 20 + 'px'
        }
        if (e.clientY > (height -salesken_div_height)) {
            document.getElementById('salesken_div').style.top = height - salesken_div_height + 'px'
        }
        store("ratioGlobal", {
            x: document.getElementById('salesken_div').offsetLeft/window.innerWidth,
            y: document.getElementById('salesken_div').offsetTop/window.innerHeight
        }); 
        console.log(document.getElementById('salesken_div').offsetLeft);

        setTimeout(function(){ 
            store("ispopupOpen", true);
         }, 300);
    });
    /* end of salesken logo icon click to open cues pop window */

    /* start of resizing the window and changing popup location accordingly */
    var rtime;
    var timeout = false;
    var delta = 200;
    window.addEventListener("resize", function (e) {
        var height = window.innerHeight
        var width = window.innerWidth
        var salesken_div_height=document.getElementById('salesken_div').offsetHeight;
        var salesken_div_width=document.getElementById('salesken_div').offsetWidth;
        var left=document.getElementById('salesken_div').offsetLeft;
        var top=document.getElementById('salesken_div').offsetTop;
        //console.log("left:"+left+" width:"+(width- salesken_div_width)+" div_width:"+salesken_div_width)
        if (left >= (width - salesken_div_width-20)) {
            document.getElementById('salesken_div').style.left = width - salesken_div_width -20  + 'px'
            left=document.getElementById('salesken_div').offsetLeft;
            ratioGlobal.x=left/width;
        }else{
            document.getElementById('salesken_div').style.left=parseInt(width)*ratioGlobal.x+'px'
        }
        if (top >= (height -salesken_div_height-10)) {
            document.getElementById('salesken_div').style.top = height - salesken_div_height - 10 + 'px'
            top=document.getElementById('salesken_div').offsetTop;
            ratioGlobal.y=top/height;
        }else{
            document.getElementById('salesken_div').style.top=parseInt(height)*ratioGlobal.y+'px'
        }
        if(left<0){
            document.getElementById('salesken_div').style.left = 10+'px'
            ratioGlobal.x=10/width;
        }
        if(top<0){
            document.getElementById('salesken_div').style.top = 10+'px'
            ratioGlobal.y=10/width;
        }
        rtime = new Date();
        if (timeout === false) {
            timeout = true;
            setTimeout(resizeend, delta);
        }
    })
    function resizeend() {
        if (new Date() - rtime < delta) {
            setTimeout(resizeend, delta);
        } else {
            timeout = false;
            store("ratioGlobal", {
                x: document.getElementById('salesken_div').offsetLeft/window.innerWidth,
                y: document.getElementById('salesken_div').offsetTop/window.innerHeight
            }); 
        }               
    }
    /* end of resizing the window and changing popup location accordingly */

    /* start of putting focus on search input as its parent is draggable */
    document.getElementById("sken-search-box-input").addEventListener("click", (e) => {
        document.getElementById("sken-search-box-input").select();
    });
    /* End of putting focus on search input as its parent is draggable*/

    /* start of search input clear all event capture */
    document.getElementById("sken-search-box-input").addEventListener("search", (e) => {
        console.log('searxh event', e.target.value)
        store("searchkey", '')

        const ke = new KeyboardEvent("keyup", {
            bubbles: true, cancelable: true, keyCode: 13
        });
        document.getElementById("sken-search-box-input").dispatchEvent(ke);


    });
    /* End of search input clear all event capture */

    /* start of search input text change event*/
    document.getElementById("sken-search-box-input").addEventListener("keyup", (e) => {
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
                if (child.className == "sken-cue-card salesken-flex") {
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
                if (child.className == "sken-cue-card salesken-flex") {
                    child.style.display = "block";
                }

            }
            scrolltobottom();
        }
    });
    /* end of search input text change event */

    /* start of sign out button click event */
    document.getElementById("sken-sign-out-btn").addEventListener("click", (event) => {
        browser.runtime.sendMessage({ "action": "logout" });
    });
    /* end of sign out button click event*/



    /* start of sign In button click event*/
    document.getElementById("sken-sign-in-btn").addEventListener("click", (event) => {
        browser.runtime.sendMessage({ "action": "openoption" });
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
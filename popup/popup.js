

//import config from "../constants.js"


var config = {
    "host": "https://cue.salesken.ai/cueing",
    "socketurl": "wss://cue.salesken.ai/cueing/cueSubscriber/userId/token"
}
//console.log(config);


document.getElementById("salesken-password").onkeyup = function (e) {
    if (e.keyCode === 13) {
        document.getElementById("loginBtn").click();
    }
}

window.addEventListener("load", () => {
    //console.log("loaded");
    let salesken_icon = chrome.extension.getURL("images/nav_icon.png");
    var height =document.querySelector('#loginContent').offsetHeight;
    document.getElementById("forgotContent").style.height =height+'px';

    chrome.storage.sync.get('saleskenobj', (result) => {
        var saleskenobj = result.saleskenobj;
        if(saleskenobj.storedEmail){
            document.getElementById("salesken-email").value=saleskenobj.storedEmail;
        }
        if(saleskenobj.storedPwdKey){
            document.getElementById("salesken-password").value=saleskenobj.storedPwdKey;
        }


        if (saleskenobj.userObject) {
            document.getElementById("logged-out-container").style.display = "block";
            document.getElementById("logged-in-container").style.display = "none";
            document.getElementById("salesken-user-email").innerText = saleskenobj.userObject.name + " !";
            // document.getElementById("sken-username").innerText=result.userObj.name;


        } else {
            document.getElementById("logged-in-container").style.display = "block";
            document.getElementById("logged-out-container").style.display = "none";
        }
    });
});



document.getElementById("loginBtn").addEventListener("click", () => {
   
    let email = document.getElementById("salesken-email");
    let password = document.getElementById("salesken-password");
    storeProp('storedEmail',email.value);

    let alert = document.getElementById("salesken-alert");
    //let url = "https://api.talentify.in:8443/api/v1/user/authenticate"; 
    let url = config.host + "/api/v1/user/authenticate";
    alert.style.visibility = 'hidden'
    let data = { "email": email.value, "password": password.value };
    if (validateEmailPassword(data)) {
        fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Client-Id': 'BrowserExtensionChrome'
            },
            body: JSON.stringify(data)
        }).then((response) => {
            if (response.status == 200) {
                //console.log(response)
                return response.json();
            } else {
                //console.log("Unauthorized");
            }
        }).then((data) => {
            //console.log(data);
            let userObject = data
            // storePopup("loggedIn", true);
            //storePopup("userObj", userObject);

            document.getElementById("logged-out-container").style.display = "block";
            document.getElementById("logged-in-container").style.display = "none";
            document.getElementById("salesken-user-email").innerText = userObject.name + " !";
            storeProp('storedPwdKey',password.value);
            chrome.runtime.sendMessage({ "action": "loggedIn", "userObject": userObject });
            setTimeout(function () {
                window.close();
            }, 100);

        }).catch((error) => {
            console.error('Error:', error);
            alert.style.visibility = 'visible'
        });
    }


});


document.getElementById("logoutBtn").addEventListener("click", () => {

    document.getElementById("logged-out-container").style.display = "none";
    document.getElementById("logged-in-container").style.display = "block";

    chrome.runtime.sendMessage({ "action": "logout" });
    //window.close() 
});

document.getElementById("forgotBtn").addEventListener("click", () => {
    
    document.getElementById("salesken-alert").style.display = "none";
    document.getElementById("loginContent").style.display = "none";
    document.getElementById("forgotContent").style.display = "block";

   
    //window.close() forgotBtn
});

document.getElementById("backBtn").addEventListener("click", () => {

    document.getElementById("loginContent").style.display = "block";
    document.getElementById("forgotContent").style.display = "none";

   
    //window.close() 
});

document.getElementById("forgotSubmit").addEventListener("click", () => {
    document.getElementById("email-error").style.display = " none";

    if(document.getElementById("forgot-email").value){
   let url = config.host + "/api/v1/user/forgot?email="+document.getElementById("forgot-email").value;
    fetch(url, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Client-Id': 'BrowserExtensionChrome'
        },
    }).then((response) => {
        if (response.status == 200) {
            //console.log(response)
            return response.json();
        } else {
            //console.log("Unauthorized");
        }
    }).then((response) => {
        console.log(response);
        if(response.success){
            document.getElementById("generatedEmail").style.display = "block";
            document.getElementById("message_response").innerHTML='Check your Email "'+document.getElementById("forgot-email").value+'" to reset your password. The reset link will expire in 30 minutes'

            document.getElementById("forgotlayout").style.display = "none";
        }else{
            document.getElementById("forgot-email").classList.add("is-invalid");
            document.getElementById("email-error").innerHTML=response.message;
            document.getElementById("email-error").style.display = "block";
        }
       
    }).catch((error) => {
        document.getElementById("forgot-email").classList.add("is-invalid");
        document.getElementById("email-error").innerHTML="Please Check Your Internet Connection.";
        document.getElementById("email-error").style.display = "block";
    });;
}else{
    document.getElementById("forgot-email").classList.add("is-invalid");
    document.getElementById("email-error").innerHTML="Please enter an Email";
    document.getElementById("email-error").style.display = "block";

}
    //window.close() forgotSubmit
});

document.getElementById("salesken-icon").addEventListener("click", () => {
    let password = document.getElementById("salesken-password");
    if (password.type === "password") {
        password.type = "text"
        document.getElementById("salesken-icon").classList.remove("eye-grey");
        document.getElementById("salesken-icon").classList.add("eye-red");
    } else {
        password.type = "password"
        document.getElementById("salesken-icon").classList.remove("eye-red");
        document.getElementById("salesken-icon").classList.add("eye-grey");
    }
});


document.getElementById("salesken-email").addEventListener("keyup", () => {
    let email = document.getElementById("salesken-email");
    if ((isEmailValid(email.value))) {
        email.classList.remove("is-invalid");
        email.classList.add("is-valid");
    } else {
        email.classList.remove("is-valid");
        email.classList.add("is-invalid");
    }
});

document.getElementById("salesken-password").addEventListener("keyup", () => {
    let password = document.getElementById("salesken-password");
    if (password.value.length >= 6) {
        password.classList.remove("is-invalid");
        password.classList.add("is-valid");
    } else {
        password.classList.remove("is-valid");
        password.classList.add("is-invalid");
    }
});


function validateEmailPassword(data) {
    let email = document.getElementById("salesken-email");
    let password = document.getElementById("salesken-password");
    email.classList.remove("is-invalid");
    password.classList.remove("is-invalid");
    if (isEmailValid(data.email) && data.password.length > 6) {
        return true;
    } else {
        if (!isEmailValid(data.email)) {
            email.classList.add("is-invalid");
        }
        if (data.password.length < 6) {
            password.classList.add("is-invalid");
        }
        return false;
    }
}

function isEmailValid(email) {
    var re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    return re.test(String(email).toLowerCase());
}

function storeProp(propertyName, propertyValue) {
    chrome.storage.sync.get('saleskenobj', (result) => {
        var saleskenobj = result.saleskenobj;
        saleskenobj[propertyName] = propertyValue;
        chrome.storage.sync.set({ "saleskenobj": saleskenobj });
    });
}



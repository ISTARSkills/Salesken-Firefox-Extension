

//import config from "../constants.js"


var config = {
    "host": "https://api.talentify.in:8443",
    "socketurl": "wss://api.talentify.in:8443/cueSubscriber/userId"
}
console.log(config);


document.getElementById("salesken-password").onkeyup = function (e) {
    if (e.keyCode === 13) {
        document.getElementById("loginBtn").click();
    }
}

window.addEventListener("load", () => {
    console.log("loaded");
    let salesken_icon = chrome.extension.getURL("images/nav_icon.png");


    chrome.storage.sync.get('saleskenobj', (result) => {
        var saleskenobj = result.saleskenobj;
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
    let alert = document.getElementById("salesken-alert");
    //let url = "https://api.talentify.in:8443/api/v1/user/authenticate"; 
    let url = config.host + "/api/v1/user/authenticate";
    alert.style.visibility = 'hidden'
    let data = { "email": email.value, "password": password.value };
    if (validateEmailPassword(data)) {
        fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(data)
        }).then((response) => {
            if (response.status == 200) {
                console.log(response)
                return response.json();
            } else {
                console.log("Unauthorized");
            }
        }).then((data) => {
            console.log(data);
            let userObject = {
                name: data.name,
                profileImage: data.profileImage,
                mobile: data.mobile,
                language: data.language,
                email: data.email,
                id: data.id
            }
            // storePopup("loggedIn", true);
            //storePopup("userObj", userObject);


            chrome.runtime.sendMessage({ "action": "loggedIn", "userObject": userObject });
            document.getElementById("logged-out-container").style.display = "block";
            document.getElementById("logged-in-container").style.display = "none";
            document.getElementById("salesken-user-email").innerText = userObject.name + " !";
           


        }).catch((error) => {
          //  console.error('Error:', error);
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







document.getElementById("loginBtn").addEventListener("click", () => {

    let email = document.getElementById("email");
    let password = document.getElementById("password");


    //let url = "https://api.talentify.in:8443/api/v1/user/authenticate"; 

    let url = "http://192.168.1.46:8080/api/v1/user/authenticate";

    postData(url, { "email": email.value, "password": password.value })
        .then((data) => {
            console.log(data); // JSON data parsed by `response.json()` call
        });
});



async function postData(url = '', data = {}) {
    // Default options are marked with *
    const response = await fetch(url, {
        method: 'POST', // *GET, POST, PUT, DELETE, etc.
        headers: {
            'Content-Type': 'application/json'
            // 'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: JSON.stringify(data) // body data type must match "Content-Type" header
    });
    return await response.json(); // parses JSON response into native JavaScript objects
}
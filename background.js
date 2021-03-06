var config = {
  "host": "https://cue.salesken.ai/cueing",
  "socketurl": "wss://cue.salesken.ai/cueing/cueSubscriber/userId/token"
}

var websocket = null;
chrome.runtime.onInstalled.addListener(function () {
  chrome.storage.sync.remove("saleskenobj");
  chrome.storage.sync.set({ "saleskenobj": {} });
});


chrome.runtime.onMessage.addListener(
  function (request, sender, sendResponse) {
    switch (request.action) {
      case "loggedIn":
        connectWebsocket(request.userObject.id, request.userObject.token);
        storeBackground("userObject", request.userObject, request.userObject);

        break
      case "logout":
        storeBackground("userObject", null, null);
        setTimeout(function () {
          disconnectWebsocket();
          sendLogoutBackend(request.userObject.token);
        }, 1500);
        break;
      case "openoption":
        chrome.runtime.openOptionsPage();
        break;
    }
  });

chrome.tabs.onActivated.addListener(function (activeInfo) {
  chrome.tabs.sendMessage(activeInfo.tabId, { action: "tabchange" });
});

function disconnectWebsocket() {
  if (websocket) {
    websocket.close();
    websocket = null;
  }
}

function connectWebsocket(userId, token) {

  websocket = new WebSocket(config.socketurl.replace('userId', userId).replace('token', token));
  websocket.onopen = function () {
  };

  websocket.onmessage = function (e) {
    // console.log('Message:', e.data);
    let msg = JSON.parse(e.data);
    msg.time = formatAMPM(new Date())
    if (msg.action) {
      if (msg.action == "CallStarted") {
        storeBackground("callstarted", true, true);
      } else if (msg.action == "CallEnded") {
        storeBackground("callstarted", false, false);
      }
    } else {
      chrome.storage.sync.get('saleskenobj', (result) => {
        if (result.saleskenobj && result.saleskenobj.cues) {
          e.data = JSON.stringify(msg)
          let cuesResult = result.saleskenobj.cues;
          cuesResult.push(msg);
          storeBackground("cues", cuesResult, msg);
        } else {
          let cues = [];
          cues.push(msg);
          storeBackground("cues", cues, msg);
        }
      });
    }
  };

  websocket.onclose = function (e) {
    setTimeout(function () {
      chrome.storage.sync.get('saleskenobj', (result) => {
        var saleskenobj = result.saleskenobj;
        if (saleskenobj.userObject && saleskenobj.userObject.id) {
          if (websocket.readyState === WebSocket.CLOSED) {
            connectWebsocket(saleskenobj.userObject.id, saleskenobj.userObject.token);
          }
        }
      });
    }, 3000);
  };

  websocket.onerror = function (err) {
    console.error('Socket encountered error: ', err.message, 'Closing socket');
    websocket.close();
  };
}


function storeBackground(propertyName, propertyValue, incomingdata) {
  chrome.storage.sync.get('saleskenobj', (result) => {
    var saleskenobj = result.saleskenobj;
    saleskenobj[propertyName] = propertyValue;
    chrome.storage.sync.set({ "saleskenobj": saleskenobj }, function () {
      chrome.tabs.query({}, function (tabs) {
        let sendAction = "updatelogin";
        let data = incomingdata;
        switch (propertyName) {
          case "userObject":
            sendAction = "updatelogin";
            break;
          case "callstarted":
            sendAction = "callstarted";
            break;
          case "cues":
            sendAction = "storingcues";
            break;
        }
        var message = { action: sendAction, senddata: data };
        for (var i = 0; i < tabs.length; i++) {
          chrome.tabs.sendMessage(tabs[i].id, message);
        }
      });
    });
  });
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

function sendLogoutBackend(token) {
  var url =  config.host + "/api/v1/user/logout";
  fetch(url, {
    method: 'GET',
    headers: {
      'Authorization': 'Basic ' + token
    }
  }).then((response) => {
    if (response.status == 200) {
      //console.log(response)
      //return response.json();
    } else {
      //console.log("Unauthorized");
    }
  }).catch((error) => {
    console.error('Error:', error);
    alert.style.visibility = 'visible'
  });
}
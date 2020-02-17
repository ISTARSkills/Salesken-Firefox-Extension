var config = {
  "host": "https://api.talentify.in:8443",
  "socketurl": "wss://api.talentify.in:8443/cueSubscriber/userId"
}

var websocket = null;
chrome.runtime.onInstalled.addListener(function () {
  console.log("Installed salesken");
  chrome.storage.sync.remove("saleskenobj");
  chrome.storage.sync.set({ "saleskenobj": {} });
});


chrome.runtime.onMessage.addListener(
  function (request, sender, sendResponse) {
    console.log(sender.tab ?
      "from a content script:" + sender.tab.url :
      "from the extension");
    console.log(request)
    console.log(sender)
    switch (request.action) {
      case "loggedIn":
        console.log('i m in login')
        connectWebsocket(request.userObject.id);
        storeBackground("userObject", request.userObject, "");
        break
      case "logout":
        storeBackground("userObject", null, "");
        disconnectWebsocket();
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

function connectWebsocket(userId) {

  websocket = new WebSocket(config.socketurl.replace('userId', userId));
  websocket.onopen = function () {
    // subscribe to some channels
    console.log("connection opened");

    // /websocket.send("Hello");

  };

  websocket.onmessage = function (e) {
    console.log('Message:', e.data);
    let msg = JSON.parse(e.data);
    if (msg.action) {
      if (msg.action == "CallStarted") {
        storeBackground("callstarted", true, "");
      } else if (msg.action == "CallEnded") {
        storeBackground("callstarted", false, "");
      }
    } else {
      chrome.storage.sync.get('saleskenobj', (result) => {
        if (result.saleskenobj && result.saleskenobj.cues) {
          let cuesResult = result.saleskenobj.cues;
          cuesResult.push(e.data);
          storeBackground("cues", cuesResult, e.data);
        } else {
          let cues = [];
          cues.push(e.data);
          storeBackground("cues", cues, e.data);
        }
      });

      // chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
      //   try {
      //     if (tabs !== undefined && tabs.length > 0) {
      //       chrome.tabs.sendMessage(tabs[0].id, { cue: e.data, action: "cue" }, function (response) {
      //         console.log(JSON.stringify(response))
      //       });
      //     } else {
      //       console.log('there is no active tab to update cues')
      //     }
      //   } catch (error) {

      //   }

      // });

    }
  };

  websocket.onclose = function (e) {
    console.log('Socket is closed. Reconnect will be attempted in 1 second.', e.reason);
    setTimeout(function () {
      chrome.storage.sync.get('userid', (result) => {
        console.log('Trying to reconnect websocket for: ' + result);
        connectWebsocket(result.userid);
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
    console.log('bg bg bg')

    console.log(saleskenobj)
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

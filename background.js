var config = {
  "host": "https://api.talentify.in:8443",
  "socketurl": "wss://api.talentify.in:8443/cueSubscriber/userId"
}

var websocket = null;
chrome.runtime.onInstalled.addListener(function () {
  console.log("Installed salesken");

  chrome.storage.sync.remove("cues");
  chrome.storage.sync.remove("loggedIn");
  chrome.storage.sync.remove("userObj");
  chrome.storage.sync.remove("userid");

  chrome.storage.sync.remove("skenX");
  chrome.storage.sync.remove("skenY");
  chrome.storage.sync.remove("isWidgetOpen");
});


chrome.runtime.onMessage.addListener(
  function (request, sender, sendResponse) {
    console.log(sender.tab ?
      "from a content script:" + sender.tab.url :
      "from the extension");
    if (request.loggedIn) {
      console.log("logged in");
      connectWebsocket(request.userObject.id);
      //TODO open a subscriber websocket connection
      //Register for events
      //On message send the cue to the content script
    } else {
      console.log("logged out");
      disconnectWebsocket();

      chrome.tabs.query({}, function (tabs) {
        var message = { action: "closepopup" };
        for (var i = 0; i < tabs.length;i++) {
          chrome.tabs.sendMessage(tabs[i].id, message);
        }
      });
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
    chrome.storage.sync.get('cues', (result) => {
      console.log(result.cues);
      if (result.cues) {
        let cuesResult = JSON.parse(result.cues);
        if (cuesResult.indexOf(e.data) == -1) {
          cuesResult.push(e.data);
          chrome.storage.sync.set({ "cues": JSON.stringify(cuesResult) });
        }
      } else {
        let cues = [];
        cues.push(e.data);
        chrome.storage.sync.set({ "cues": JSON.stringify(cues) });
      }
    });

    chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
      try {
        if (tabs !== undefined && tabs.length > 0) {
          chrome.tabs.sendMessage(tabs[0].id, { cue: e.data,action:"cue" }, function (response) {
            console.log(JSON.stringify(response))
          });
        } else {
          console.log('there is no active tab to update cues')
        }
      } catch (error) {

      }

    });
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


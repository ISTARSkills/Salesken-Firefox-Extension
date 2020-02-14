var config = {
  "host": "https://api.talentify.in:8443",
  "socketurl": "wss://api.talentify.in:8443/cueSubscriber/userId"
}

var websocket = null;
browser.runtime.onInstalled.addListener(function () {
  console.log("Installed salesken");

  browser.storage.sync.remove("cues");
  browser.storage.sync.remove("loggedIn");
  browser.storage.sync.remove("userObj");
  browser.storage.sync.remove("userid");

  browser.storage.sync.remove("skenX");
  browser.storage.sync.remove("skenY");
  browser.storage.sync.remove("isWidgetOpen");
  browser.storage.sync.remove("searchkey");

});


browser.runtime.onMessage.addListener(
  function (request, sender, sendResponse) {
    console.log(sender.tab ?
      "from a content script:" + sender.tab.url :
      "from the extension");

    if (request.openOptions) {
      browser.runtime.openOptionsPage();
    } else {


      if (request.loggedIn) {
        console.log("logged in");
        connectWebsocket(request.userObject.id);

        browser.tabs.query({}, function (tabs) {
          var message = { action: "updatelogin" };
          for (var i = 0; i < tabs.length; i++) {
            browser.tabs.sendMessage(tabs[i].id, message);
          }
        });
        //TODO open a subscriber websocket connection
        //Register for events
        //On message send the cue to the content script
      } else {
        console.log("logged out");
        disconnectWebsocket();

        browser.tabs.query({}, function (tabs) {
          var message = { action: "closepopup" };
          for (var i = 0; i < tabs.length; i++) {
            browser.tabs.sendMessage(tabs[i].id, message);
          }
        });
      }
    }


  });

browser.tabs.onActivated.addListener(function (activeInfo) {
  browser.tabs.sendMessage(activeInfo.tabId, { action: "tabchange" });
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
      let callstarted = false;

      if (msg.action == "CallStarted") {
        browser.storage.sync.set({ "callstarted": true });
        browser.storage.sync.set({ "isSearchShow": true });

        callstarted = true;

      } else if (msg.action == "CallEnded") {
        browser.storage.sync.set({ "callstarted": false });
        browser.storage.sync.set({ "isSearchShow": false });

        browser.storage.sync.remove('cues');
        callstarted = false;

      }

      browser.tabs.query({ active: true, currentWindow: true }, function (tabs) {
        browser.tabs.sendMessage(tabs[0].id, { action: "callevent", isCallstarted: callstarted});
      });

      browser.tabs.query({ active: true, currentWindow: true }, function (tabs) {
        browser.tabs.sendMessage(tabs[0].id, { action: "shouldSearchShow"});
      });

    } else {
      browser.storage.sync.get('cues', (result) => {
        console.log(result.cues);
        if (result.cues) {
          let cuesResult = JSON.parse(result.cues);
          if (cuesResult.indexOf(e.data) == -1) {
            cuesResult.push(e.data);
            browser.storage.sync.set({ "cues": JSON.stringify(cuesResult) });
          }
        } else {
          let cues = [];
          cues.push(e.data);
          browser.storage.sync.set({ "cues": JSON.stringify(cues) });
        }
      });

      browser.tabs.query({ active: true, currentWindow: true }, function (tabs) {
        try {
          if (tabs !== undefined && tabs.length > 0) {
            browser.tabs.sendMessage(tabs[0].id, { cue: e.data, action: "cue" }, function (response) {
              console.log(JSON.stringify(response))
            });
          } else {
            console.log('there is no active tab to update cues')
          }
        } catch (error) {

        }

      });
    }
  };

  websocket.onclose = function (e) {
    console.log('Socket is closed. Reconnect will be attempted in 1 second.', e.reason);
    setTimeout(function () {
      browser.storage.sync.get('userid', (result) => {
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


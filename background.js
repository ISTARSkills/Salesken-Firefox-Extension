var config = {
  "host": "https://api.talentify.in:8443",
  "socketurl": "wss://api.talentify.in:8443/cueSubscriber/userId"
}

var websocket = null;
browser.runtime.onInstalled.addListener(function () {
  console.log("Installed salesken");
  browser.storage.sync.remove("saleskenobj");
  browser.storage.sync.set({ "saleskenobj": {} });
});


browser.runtime.onMessage.addListener(
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
        browser.runtime.openOptionsPage();
        break;
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
    msg.time=formatAMPM(new Date())
    if (msg.action) {
      if (msg.action == "CallStarted") {
        storeBackground("callstarted", true, true);
      } else if (msg.action == "CallEnded") {
        storeBackground("callstarted", false, false);
      }
    } else {
      browser.storage.sync.get('saleskenobj', (result) => {
        if (result.saleskenobj && result.saleskenobj.cues) {
          e.data=JSON.stringify(msg)
          let cuesResult = result.saleskenobj.cues;
          cuesResult.push(msg);

          storeBackground("cues", cuesResult, msg);
        } else {
          let cues = [];
          cues.push(msg);
          storeBackground("cues", cues, msg);
        }
      });

      // browser.tabs.query({ active: true, currentWindow: true }, function (tabs) {
      //   try {
      //     if (tabs !== undefined && tabs.length > 0) {
      //       browser.tabs.sendMessage(tabs[0].id, { cue: e.data, action: "cue" }, function (response) {
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


function storeBackground(propertyName, propertyValue, incomingdata) {
  browser.storage.sync.get('saleskenobj', (result) => {
    var saleskenobj = result.saleskenobj;
    console.log('bg bg bg')

    console.log(saleskenobj)
    saleskenobj[propertyName] = propertyValue;
    browser.storage.sync.set({ "saleskenobj": saleskenobj }, function () {
      browser.tabs.query({}, function (tabs) {
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
          browser.tabs.sendMessage(tabs[i].id, message);
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
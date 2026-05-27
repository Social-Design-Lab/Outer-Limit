let time;
let endexp = false;
let uid;
let group;
let options = 0;
const EXPERIMENT_POST_URL = 'https://old.reddit.com/r/VACCINES/comments/1rsvsp8/mmr_vaccine_while_on_tremfya/';
// Define a variable in the popup

//let myUrl = `http://www.example.com/?param=${uid}`;
document.addEventListener('DOMContentLoaded', function () {
  hideAllSections();
  load();
  //document.querySelector('#start').addEventListener('click', startExp);

  document.getElementById("start").addEventListener("click", function () {
    var participantId = document.getElementById("pid").value;
    if (participantId === "") {
      alert("Participant ID is required");
    } else {
      startExp(openExperimentPost);
    }
  });
/*   $("#btnReset").onclick = e => {
    //console.log("btnHighlight is clicked")
    //alert("btnReset: "+ options)
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      chrome.scripting.executeScript(
        {
          target: { tabId: tabs[0].id },
          files: ['content.js'],
        },
        () => {
          chrome.tabs.sendMessage(tabs[0].id, { message: "send_options", optionalValue: -1 }, function (response) {
            // Handle the response from the content script, if needed
          });
        }
      );
    });

  } */


});

function load() {


  // Send a message to the background script
  chrome.runtime.sendMessage({ message: "everything_for_timer" }, function (response) {
    if (chrome.runtime.lastError || !response) {
      console.error("Unable to load popup state from background:", chrome.runtime.lastError && chrome.runtime.lastError.message);
      loadFromStorage();
      return;
    }

    renderPopupState(response);
  });
}

function loadFromStorage() {
  chrome.storage.local.get(['userpid', 'endexp', 'survey', 'group'], function (result) {
    renderPopupState({
      user_id: result.userpid,
      end_exp: result.endexp,
      survey: result.survey,
      user_group: result.group
    });
  });
}

function renderPopupState(state) {
  uid = state && state.user_id;
  endexp = !!(state && state.end_exp);
  group = state && state.user_group;

  if (!uid) {
    showOnly("settings");
    return;
  }

  configurePostSurveyLink(uid, group);

  showOnly("endexp");
}

function configurePostSurveyLink(userId, userGroup) {
  const myLink = document.getElementById("my-link");
  if (!myLink) {
    return;
  }

  const newUrl = `https://lehigh.co1.qualtrics.com/jfe/form/SV_cVjSqBQgEqOkI2G?uid=${encodeURIComponent(userId)}&group=${encodeURIComponent(userGroup || '')}`;
  myLink.setAttribute("href", newUrl);

  if (!myLink.dataset.outerLimitListenerAttached) {
    myLink.addEventListener('click', function (e) {
      e.preventDefault();
      chrome.tabs.create({ url: this.href });
    });
    myLink.dataset.outerLimitListenerAttached = "true";
  }
}

function hideAllSections() {
  hide("settings");
  hide("endexp");
}

function showOnly(section) {
  hideAllSections();
  show(section);
}

function show(section) {
  const element = document.getElementById(section);
  if (element) {
    element.style.display = "block";
  }
}

function hide(section) {
  const element = document.getElementById(section);
  if (element) {
    element.style.display = "none";
  }
}

// call setExp function from background.js
function startExp(onReady) {
  const startButton = document.getElementById("start");
  if (startButton) {
    startButton.disabled = true;
    startButton.textContent = "Starting...";
  }

  uid = document.getElementById("pid").value;
  chrome.runtime.sendMessage({ message: "send_userid_from_timerjs", userId: uid }, function (response) {
    if (chrome.runtime.lastError) {
      console.error(chrome.runtime.lastError.message);
      if (startButton) {
        startButton.disabled = false;
        startButton.textContent = "Submit";
      }
      return;
    }

    chrome.runtime.sendMessage({ message: "call_function" });
    if (response && response.user_group) {
      group = response.user_group;
      configurePostSurveyLink(uid, group);
    }
    showOnly("endexp");
    if (typeof onReady === "function") {
      onReady();
    }
  });
}

function openExperimentPost() {
  chrome.tabs.create({ url: EXPERIMENT_POST_URL, active: true }, function () {
    if (chrome.runtime.lastError) {
      console.error(chrome.runtime.lastError.message);
    }
  });
}

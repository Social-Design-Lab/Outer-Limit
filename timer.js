let time;
let endexp = false;
let uid;
let pop_survey = false;
let options = 0;
// Define a variable in the popup

//let myUrl = `http://www.example.com/?param=${uid}`;
document.addEventListener('DOMContentLoaded', function () {
  load();
  //document.querySelector('#start').addEventListener('click', startExp);

  document.getElementById("start").addEventListener("click", function () {
    var participantId = document.getElementById("pid").value;
    if (participantId === "") {
      alert("Participant ID is required");
    } else {
      // Your code to submit the form
      alert("The experiment has started. Scroll down the Reddit Home Page (Outer Limit will open a new tab of the Reddit Home Page for you) to view the first 10 posts. Do not uninstall Outer Limit until you complete the post-survey, as you will need it for the survey.");
      startExp();
      var newTab = window.open('http://old.reddit.com', '_blank');
          if (newTab) {
            newTab.focus();
          } else {
            console.log("Popup blocked. Please allow popups for this site.");
          }
    }
  });
  document.getElementById("midpop-submit").addEventListener("click", function () {
    const selectedQ1 = document.querySelector('[data-question-group="q1"].active');
    const selectedQ2 = document.querySelector('[data-question-group="q2"].active');
    //alert('Selected value for Q1: ' + selectedQ1.textContent + '\nSelected value for Q2: ' + selectedQ2.textContent);

    chrome.runtime.sendMessage({
      message: "send_question_data_from_timerjs_chrome",
      data: {
        q1selected: selectedQ1.textContent,
        q2selected: selectedQ2.textContent
      }
    });
    chrome.runtime.sendMessage({ action: 'changeSurveyValue', newValue: false });
    hide("settings");
    show("display");
    hide("endexp");
    hide("midpop");
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
    uid = response.user_id;
    endexp = response.end_exp;
    pop_survey = response.survey;

    if (uid == null) {
      // User ID is null

      show("settings");
      hide("display");
      hide("endexp");
      hide("midpop");

    } 
    else {
      // User ID is not null and experiment is ended
      hide("settings");
      hide("display");
      show("endexp");
      hide("midpop");
      const newUrl = `http://lehigh.co1.qualtrics.com/jfe/form/SV_50BCu68Dhap6vBk?uid=${uid}`;
      // Get a reference to the link element
      const myLink = document.getElementById("my-link");

      
      // Change the href attribute of the link
      myLink.setAttribute("href", newUrl);


     
      if (myLink) {
        // Change the href attribute of the link
        myLink.setAttribute("href", newUrl);
    
        // Add click event listener to open the link in a new tab
        myLink.addEventListener('click', function (e) {
          e.preventDefault(); // Stop the default action of the link
          chrome.tabs.create({url: this.href}); // Use Chrome's API to open a new tab
        });
      }
      
    }

  });
}

function show(section) {
  document.getElementById(section).style.display = "block";
}

function hide(section) {
  document.getElementById(section).style.display = "none";
}

// call setExp function from background.js
function startExp() {
  chrome.runtime.sendMessage({ message: "call_function" });
  hide("settings");
  hide("endexp");
  show("display");
  hide("midpop");
  uid = document.getElementById("pid").value;
  chrome.runtime.sendMessage({ message: "send_userid_from_timerjs", userId: uid });
}




// Add this script block inside the head
// Add this script block inside the head
document.addEventListener("DOMContentLoaded", function () {
  const buttons = document.querySelectorAll(".btn-scale");

  buttons.forEach((button) => {
    button.addEventListener("click", function () {
      const questionGroup = this.dataset.questionGroup;
      const sameGroupButtons = document.querySelectorAll(`[data-question-group="${questionGroup}"]`);

      sameGroupButtons.forEach((btn) => {
        btn.classList.remove("active");
      });

      this.classList.add("active");
    });
  });
});






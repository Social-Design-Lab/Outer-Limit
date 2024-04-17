let startDate;
var likesDate;
var bgDate;
let endexp = false;
let userpid;
let change_bgcolor = false;
let change_bgcolor_condition2 = false;
let ifstartexp = false;
let activetime = 0;
let activetime_start_date = new Date().toLocaleDateString();
let survey;
let endDate;


/**
 * chrome.storage API to store, retrieve, and track changes to user data.
 */ 
chrome.storage.local.get(
  [
    'userpid',
    'change_bgcolor',
    'change_bgcolor_condition2',
    'ifstartexp',
    'endexp',
    'activetime',
    'activetime_start_date',
    'survey',
    'startDate',
    'endDate'
  ],
  function (result) {
    if (result.userpid === null || result.userpid === undefined) {
      console.log('userpid has not been stored yet');
    } else {
      userpid = result.userpid;
    }
    if (result.activetime === null || result.activetime === undefined) {
      console.log('activetime has not been stored yet');
    } else {
      activetime = result.activetime;
    }
    if (result.survey === null || result.survey === undefined) {
      console.log('survey has not been stored yet');
    } else {
      survey = result.survey;
    }

    if (result.activetime_start_date === null || result.activetime_start_date === undefined) {
      console.log('activetime_start_date has not been stored yet');
    } else {
      activetime_start_date = result.activetime_start_date;
    }

    if (result.endexp === null || result.endexp === undefined) {
      console.log('endexp has not been stored yet');
    } else {
      endexp = result.endexp;
    }
    if (result.startDate === null || result.startDate === undefined) {
      console.log('startDate has not been stored yet');
    } else {
      startDate = new Date(result.startDate);
    }
    if (result.endDate === null || result.endDate === undefined) {
      console.log('endDate has not been stored yet');
    } else {
      endDate = new Date(result.endDate);
    }



    if (
      result.change_bgcolor === null ||
      result.change_bgcolor === undefined
    ) {
      console.log('change_bgcolor has not been stored yet');
    } else {
      change_bgcolor = result.change_bgcolor;
    }

    if (
      result.change_bgcolor_condition2 === null ||
      result.change_bgcolor_condition2 === undefined
    ) {
      console.log('change_bgcolor_condition2 has not been stored yet');
    } else {
      change_bgcolor_condition2 = result.change_bgcolor_condition2;
    }

    if (
      result.ifstartexp === null ||
      result.ifstartexp === undefined
    ) {
      console.log('ifstartexp has not been stored yet');
    } else {
      ifstartexp = result.ifstartexp;
    }
  }
);

/**
 * Listens for tab URL updates. If the new URL contains "reddit.com" and is a post,
 * it sends a message to invoke content scripts on that tab.
 */
chrome.tabs.onUpdated.addListener(function (tabId, changeInfo, tab) {
  if (changeInfo.url) {
    console.log("The tab URL has changed");
    if (changeInfo.url.includes("reddit.com")) {
      if (changeInfo.url.includes("/r/") || changeInfo.url.includes("/comments/")) {
        console.log("The URL is a post and we want to call content js ");
        chrome.tabs.sendMessage(tabId, { message: "run_my_code" }, function(response) {
          if (chrome.runtime.lastError) {
              console.error(chrome.runtime.lastError.message);
              // Handle the error or perform other actions
          } else {
              // Process the response or perform other actions
          }
        });
      }
      else {
        console.log("The URL is the Reddit home page");
      }
    }
  }
});

/**
 * Here, we are listening for incoming messages from the popup script
 * 
 * When a message is received with a specific key ("send_userid_from_timerjs") and contains a userId:
 * 1. The userId is stored in a local variable for immediate use.
 * 2. The userId is also stored persistently using chrome.storage.local to ensure its availability across sessions.
 * 3. The current tab is forcibly refreshed.
 * 4. Additional functions (`insertdata` and `read_csv`) are invoked with the received userId.
 */
chrome.runtime.onMessage.addListener(function (message, sender, sendResponse) {
  if (message.message === "send_userid_from_timerjs" && message.userId) {
    // Do something with the user ID
    userpid = message.userId;

    // store the userpid on local so it does not disappear later
    chrome.storage.local.set({ userpid: userpid }, function () {
      console.log('userpid stored successfully.');
    });

    function forceRefreshTab(tabId) {
      chrome.tabs.reload(tabId);
    }

    chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
      if (tabs && tabs[0]) {
        forceRefreshTab(tabs[0].id);
      }
    });

    insertdata(userpid);
    read_csv(userpid);
    console.log(`Background Received user ID from timer js: ${message.userId}`);
  }
});

//give all setup to content js when the experiment already started and user opened a new tab
chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
  if (request.message === "get_all_setup") {
    sendResponse({
      ifstartexp: ifstartexp
        });
        }
});


/**
 * Initializes an experiment by setting start and end times, storing them in chrome.storage.
 * Sends a message to the content script of the active tab to kick off the experiment.
 */
function setExp() {
    startDate = new Date();
    chrome.storage.local.set({ startDate: startDate.toString() }, function () {
        console.log('startDate stored successfully.');
    });
    //add 5 seconds
    endDate = new Date(startDate.getTime() + 60000);
    ifstartexp = true;

    chrome.storage.local.set({ ifstartexp: ifstartexp }, function () {
        console.log('ifstartexp stored successfully.');
    });

    chrome.storage.local.set({ endDate: endDate.getTime() }, function() { });

    // start the experiment(listening the upvote and downvote buttons)
    chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
            if (tabs.length === 0) {
                console.error("No active tabs found");
                return;
            }
            // Send a message to the content script
            chrome.tabs.sendMessage(tabs[0].id, { message: "start experiment" }, function(response) {
            if (chrome.runtime.lastError) {
                console.error(chrome.runtime.lastError.message);
                // Handle the error or perform other actions
            } else {
                // Process the response or perform other actions
            }
        });
    });
}

/**
 * function used to check the time, and see if the experiment has ended
 * if the time is passed the limit for when the experiment ends
 * 1. Set a variable endexp to true and store it in chrome.storage
 * 2. A user will fill out the qualtrics survey and the extension will be uninstalled
 */
function checkTime() {
  var now = new Date();
  //console.log("endexp: ", endexp);
  if (now > endDate && endexp === false) {
    endexp = true;
    chrome.storage.local.set({ endexp: endexp }, function () {
      console.log('endexp stored successfully.');
    });
    console.log("exp ended from background");
    chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
      if (tabs.length === 0) {
        console.error("No active tabs found");
        return;
      }

      // Send a message to the content script
      chrome.tabs.sendMessage(tabs[0].id, { message: "exp_ended" }, function(response) {
        if (chrome.runtime.lastError) {
            console.error(chrome.runtime.lastError.message);
            // Handle the error or perform other actions
        } else {
            // Process the response or perform other actions
        }
      });

    });
    
    // Set the badge text
    chrome.action.setBadgeText({ text: 'Click' });

    // Set the badge background color
    chrome.action.setBadgeBackgroundColor({ color: '#FF0000' });

      clearInterval(intervalId);  // Stop the interval after handling the event
  }
}

const intervalDuration = 1000 * 60;  // Check every minute. Adjust as needed.

  
const intervalId = setInterval(checkTime, intervalDuration);

const unintervalId = setInterval(uninstall, intervalDuration);


/**
 * function used to uninstall the extension after the experiment has ended
 */
function uninstall(){
  var now = new Date();
  var newEndDate = new Date(endDate); // Clone the original date
  newEndDate.setMinutes(newEndDate.getMinutes() + 30);  // Adds 30 minutes
  if (now > newEndDate) {
    chrome.management.uninstallSelf({}, function() {
      if (chrome.runtime.lastError) {
          console.error("Error uninstalling:", chrome.runtime.lastError);
      }
  });
  }
}


/*
* Listener for requests to retrieve the experiment's start time. 
* Responds with the `startDate` when a "get_time" message is received.
*/ 
chrome.runtime.onMessage.addListener(
  function (request, sender, sendResponse) {
    if (request.message === "get_time") {
      sendResponse({ value: startDate });
    }
  }
);

/*
* Listener for requests signaling the end of the experiment.
// Responds with the `endexp` value when an "end_exp" message is received.
*/ 
chrome.runtime.onMessage.addListener(
  function (request, sender, sendResponse) {
    if (request.message === "end_exp") {
      sendResponse({ value: endexp });
    }
  }
);

/*
* // Listener for requests to retrieve the user's ID (uid).
// Responds with the `userpid` and logs the request when a "need_uid_from_backgroun" message is received.
*/ 
chrome.runtime.onMessage.addListener(
  function (request, sender, sendResponse) {
    if (request.message === "need_uid_from_backgroun") {
      sendResponse({ value: userpid });
      console.log("recived request from timer js for uid: " + userpid);
    }
  }
);

// call background setExp function from timer.js this is send response 
chrome.runtime.onMessage.addListener(
  function (request, sender, sendResponse) {
    if (request.message === "call_function") {
      setExp();
    }
  }
);

// open db as the function name
function openDB() {
  openRequest.onsuccess = function () {
    let db = openRequest.result;
    console.log('Successfully opened database');

    // Your database operations here
  };

  openRequest.onerror = function (error) {
    console.error('Failed to open database:', error);
  };
}



// Listen for messages from the content script for insert data into database 
chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
  if (request.message === "voteComment") {
    console.log("Received data from content script: ", request.data);
    insertUserVoteComments(userpid, request.data.action, request.data.comment, request.data.post);
    sendResponse({ message: "voteCommentSuccess" });
  } else if (request.message === "replyPost") {
    console.log("Received data from content script: ", request.data);
    insertUserReplyPosts(userpid, request.data.content, request.data.post, request.data.like,request.data.time );
    sendResponse({ message: "replyPostSuccess" });
  } else if (request.message === "votePost") {
    console.log("Received data from content script: ", request.data);
    insertUserVotePosts(userpid, request.data.action, request.data.post);
    sendResponse({ message: "votePostSuccess" });
  } else if (request.message === "replyComment") {
    console.log("Received data from content script: ", request.data);
    insertUserReplyComments(userpid, request.data.content, request.data.comment, request.data.post);
    sendResponse({ message: "replyCommentSuccess" });
  } else if (request.message === "updateViewedPost") {
    console.log("Received data from content script: ", request.data);
    updateUserViewedPost(userpid, request.data.post_url);
    sendResponse({ message: "updateViewedPostSuccess" });
  }
  else if (request.message === "updateuserVotefakecontent") {
    console.log("Received data from content script: ", request.data);
    updateUserVoteFakeContent(userpid, request.data.useraction, request.data.fakecontent);
    sendResponse({ message: "updateuserVotefakecontent" });
  }
  else if (request.message === "deleteuserVotefakecontent") {
    console.log("Received data from content script: ", request.data);
    deleteUserVoteFakeContent(userpid, request.data.fakecontent);
    sendResponse({ message: "deleteuserVotefakecontent" });
  }
});

/**
 * Sends a POST request to insert user-specific data into a remote database.
 * The data includes actions like commenting on posts and even comments,
 *
 * @param {string} uid - The unique identifier of the user.
 */
function insertdata(uid) {
  //var insert_date=  new Date();
  fetch("https://redditchrome.herokuapp.com/api/insert", {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({

      userid: uid,
      user_vote_onPosts: [],
      user_reply_onPosts: [],
      user_vote_onComments: [],
      user_reply_onComments: [],
      browser_history: [],
      active_onReddit: [],
      surveypopup_selections: [],
      user_comment_in_fake_post: [],
      user_reply_tofakecomment: [],
      user_vote_fake:[],
    })
  })
    .then(response => {
      if (response.ok) {
        return response.json();
      } else {
        throw new Error("Failed to insert data");
      }
    })
    .then(data => {
      console.log("Data inserted successfully:", data);
    })
    .catch(error => {
      console.error(error);
    });
}

/**
 * Send a POST request to log user's voting actions on Reddit comments into the database.
 * The data includes the user's action, the comment they interacted with, and the  post.
 *
 * @param {string} uid - The unique identifier of the user.
 * @param {string} action - The type of vote action the user performed (e.g., upvote or downvote).
 * @param {string} comment - the contents of the comment the user voted on.
 * @param {string} post - the post the user has just interacted with.
 */ 
function insertUserVoteComments(uid, action, comment, post) {
  const insert_date = new Date();
  fetch("https://redditchrome.herokuapp.com/api/updateUserVote_Comments", {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      userid: uid,
      user_vote_onComments: [{
        action_date: insert_date,
        user_action: action,
        action_comment: comment,
        action_post: post
      }]
    })
  })
    .then(response => {
      if (response.ok) {
        return response.json();
      } else {
        throw new Error("Failed to insert user vote on comments ");
      }
    })
    .then(data => {
      console.log("User vote on comments inserted successfully:", data);
    })
    .catch(error => {
      console.error(error);
    });
}


/**
 * Sends a POST request to log details of user's interactions with fake comments on Reddit into a remote database.
 * The data encompasses the fake comment details such as its ID, the user who made the comment, its content, 
 * and its associated post URL, among other attributes.
 *
 * @param {string} uid - The unique identifier of the user.
 * @param {string} comment_id - The unique ID of the fake comment.
 * @param {string} user_name - The username who made the comment.
 * @param {string} comment_content - Content of the fake comment.
 * @param {number} insert_index - The position/index where the comment should be inserted.
 * @param {string} post_url - The URL of the associated Reddit post.
 * @param {number} like - Number of likes/upvotes for the comment.
 * @param {Date} time - Time when the comment was made.
 */ 

function insertFakeComments(uid, comment_id, user_name, comment_content, insert_index, post_url, like, time) {
  var insert_date = new Date();
  fetch("https://redditchrome.herokuapp.com/api/updateuserFakeComment_infakepost", {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      userid: uid,
      user_comment_in_fake_post
: [{
        fake_comment_id: comment_id,
        user_name: user_name,
        content: comment_content,
        where_to_insert: insert_index,
        post_url: post_url, 
        like:like,
        time:insert_date
      }]
    })
  })
    .then(response => {
      if (response.ok) {
        return response.json();
      } else {
        throw new Error("Failed to insert fake comments on comments ");
      }
    })
    .then(data => {
      console.log("fake comments inserted successfully:", data);
    })
    .catch(error => {
      console.error('Error:', error);

      // Check if the error has a response
      if (error.response) {
        console.error('Response status:', error.response.status);
        console.error('Response text:', error.response.statusText);
      } else {
        console.error('No response from server.');
      }
    });
}


/**
 * Sends a POST request to record details of fake Reddit posts into a remote database.
 * This function captures and logs various attributes of the fake post such as its URL, title, 
 * content, associated image, and the position or index where it appears. This aids in tracking 
 * user interactions with artificially injected content on Reddit.
 *
 * @param {string} uid - The unique identifier of the user.
 * @param {string} fakepost_url - The URL of the fake Reddit post.
 * @param {number} fakepost_index - The index on the HTML where the post should appear.
 * @param {string} fakepost_title - The title of the fake post.
 * @param {string} fakepost_content - Content or body of the fake post.
 * @param {string} fakepost_image - The image associated with the fake post.
 */
function insertFakePosts(uid, fakepost_url, fakepost_index, fakepost_title, fakepost_content, fakepost_image) {
  const insert_date = new Date();
  fetch("https://redditchrome.herokuapp.com/api/updateFakePost", {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      userid: uid,
      fake_post: [{
        fakepost_url: fakepost_url,
        fakepost_index: fakepost_index,
        fakepost_title: fakepost_title,
        fakepost_content: fakepost_content,
        fakepost_image: fakepost_image
      }]
    })
  })
    .then(response => {
      if (response.ok) {
        return response.json();
      } else {
        throw new Error("Failed to insert fake post");
      }
    })
    .then(data => {
      console.log("Fake post inserted successfully:", data);
    })
    .catch(error => {
      console.error(error);
    });
}

/**
 * Add a listener for messages from the content script to insert fake posts into the database.
 */
chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
  if (request.message === "insert user reply in fake comments to db") {

    // Process the variables received from the content script
    insertUserReplyFakeComments(userpid, request.commentId, request.userRedditName, request.commentContent, request.like, request.time);
    // Send a response back to the content script if needed
    sendResponse({ success: true });
  }
});

/**
 * Sends a POST request to record user replies to fake comments on Reddit into a remote database.
 * This function captures and logs details of the user's interaction with a fake comment, 
 * tracking attributes such as the comment's ID, the Reddit username of the user, the content 
 * of their reply, whether they liked the comment, and the time of the interaction. 
 * It aids in analyzing user reactions to artificially injected comments on Reddit.
 *
 * @param {string} uid - The unique identifier of the user.
 * @param {string} comment_id - The ID of the fake comment the user replied to.
 * @param {string} userRedditName - The Reddit username of the user.
 * @param {string} comment_content - The content of the user's reply.
 * @param {boolean} like - Indicates if the user liked the fake comment or not.
 */ 
function insertUserReplyFakeComments(uid, comment_id, userRedditName, comment_content, like) {
  var insert_date = new Date();
  fetch("https://redditchrome.herokuapp.com/api/updateUserReplyToFakeComment", {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      userid: uid,
      user_reply_tofakecomment: [{
        fake_comment_id: comment_id,
        userRedditName: userRedditName,
        userReplyInFake: comment_content,
        like: like,
        time: insert_date,

      }]
    })
  })
    .then(response => {
      if (response.ok) {
        return response.json();
      } else {
        throw new Error("Failed to insert user reply to fake comments ");
      }
    })
    .then(data => {
      console.log("user reply fake comments inserted successfully:", data);
    })
    .catch(error => {
      console.error(error);
    });
}

/**
 * Sends a POST request to record users' replies to posts, tracking attributes such as the
 * user's unique ID, the ID of the post they replied to, the content of their reply, whether
 * they liked the post, and the time of the interaction.
 *
 * @param {string} uid - The unique identifier of the user.
 * @param {string} content - The content of the user's reply.
 * @param {string} post - The ID of the post the user replied to.
 * @param {boolean} like - Indicates if the user liked the post or not.
 * @param {Date} time - The time of the interaction.
 */ 
function insertUserReplyPosts(uid, content, post, like, time) {
  const insert_date = new Date();
  fetch("https://redditchrome.herokuapp.com/api/updateUserReply_Posts", {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      userid: uid,
      user_reply_onPosts: [{
        action_date: insert_date,
        reply_content: content,
        reply_post: post, 
        like: like, 
        time: time
      }]
    })
  })
    .then(response => {
      if (response.ok) {
        return response.json();
      } else {
        throw new Error("Failed to insert user vote on comments ");
      }
    })
    .then(data => {
      console.log("User vote on comments inserted successfully:", data);
    })
    .catch(error => {
      console.error(error);
    });
}


/**
 * Sends a POST request to recteord a user's vo on a post. It tracks attributes such as the
 * user's ID, the action they took (e.g., upvote, downvote), and the ID of the post
 * they voted on.
 *
 * @param {string} uid - The unique identifier of the user.
 * @param {string} action - The action the user took (e.g., "upvote", "downvote").
 * @param {string} post - The ID of the post the user voted on.
 */
function insertUserVotePosts(uid, action, post) {
  const insert_date = new Date();
  fetch("https://redditchrome.herokuapp.com/api/updateUserVote_Posts", {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      userid: uid,
      user_vote_onPosts: [{
        action_date: insert_date,
        user_action: action,
        action_post: post
      }]
    })
  })
    .then(response => {
      if (response.ok) {
        return response.json();
      } else {
        throw new Error("Failed to insert user vote on Posts");
      }
    })
    .then(data => {
      console.log("User vote on posts inserted successfully:", data);
    })
    .catch(error => {
      console.error(error);
    });
}

/**
 * Sends a POST request to recteord a user's vo on a post. It tracks attributes such as the
 * user's ID, the action they took (e.g., upvote, downvote), and the ID of the post
 * they voted on.
 *
 * @param {string} userid - The unique identifier of the user.
 * @param {string} useraction - The action the user took.
 * @param {string} fakeContent - The content which the user is placing a fake vote on.
 */
function updateUserVoteFakeContent(userid, useraction, fakeContent) {
  
  fetch("https://redditchrome.herokuapp.com/api/updateUserVoteFakeContent", {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      userid: userid,
      user_vote_fake: [{
        user_action: useraction,
        fake_content: fakeContent,
      }]
    })
  })
    .then(response => {
      if (response.ok) {
        return response.json();
      } else {
        throw new Error("Failed to update user vote fake content");
      }
    })
    .then(data => {
      console.log("User like fake content updated successfully:", data);
    })
    .catch(error => {
      console.error(error);
    });
}


/**
 * Sends a POST request to record a user's removal of a vote entirely on a post. It tracks attributes such as the
 * user's ID, the action they took, and the ID of the post
 * they voted on.
 * 
 * @param {string} userid - The unique identifier of the user.
 * @param {string} fakeContent - The fake content which the user is removing a vote on.
 */
function deleteUserVoteFakeContent(userid, fakeContent) {
  fetch("https://redditchrome.herokuapp.com/api/deleteUserVoteFakeContent", {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      userid: userid,
      fake_content: fakeContent
    })
  })
    .then(response => {
      if (response.ok) {
        return response.json();
      } else {
        throw new Error("Failed to delete user vote fake content");
      }
    })
    .then(data => {
      console.log("User like fake content deleted successfully:", data);
    })
    .catch(error => {
      console.error(error);
    });
}


/**
 * Sends a POST request to record a user's reply to a comment on a post. It tracks attributes such as the
 * user's ID, what their reply content is, the ID of the comment they replied to (auto generated), and the ID of the 
 * post.
 *
 * @param {string} uid - The unique identifier of the user.
 * @param {string} content - The content of the user's reply.
 * @param {string} comment - The ID of the comment the user replied to.
 * @param {string} post - The ID of the post associated with the comment the user replied to.
 */
function insertUserReplyComments(uid, content, comment, post) {
  const insert_date = new Date();
  fetch("https://redditchrome.herokuapp.com/api/updateUserReply_Comments", {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      userid: uid,
      user_reply_onComments: [{
        action_date: insert_date,
        reply_content: content,
        reply_comment: comment,
        reply_post: post
      }]
    })
  })
    .then(response => {
      if (response.ok) {
        return response.json();
      } else {
        throw new Error("Failed to insert user vote on Posts");
      }
    })
    .then(data => {
      console.log("User vote on posts inserted successfully:", data);
    })
    .catch(error => {
      console.error(error);
    });
}



/**
 * Sends a POST request to record a user's browser history. It tracks attributes such as the
 * user's unique ID and the browsed URL along with the time of the browsing activity. Throughout the 
 * experiment, any time a user decides to open a new tab, we add an event listener to the tab, and append
 * the URL to the user's browser history which is an array of objects.
 *
 * @param {string} uid - The unique identifier of the user.
 * @param {string} browserUrl - The URL the user browsed.
 */
function insertBrowserHistory(uid, browserUrl) {
  const browserDate = new Date();
  const requestBody = {
    userid: uid,
    browser_history: [
      {
        browser_date: browserDate,
        browser_url: browserUrl,
      },
    ],
  };

  fetch("https://redditchrome.herokuapp.com/api/updateBrowserHistory", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(requestBody),
  })
    .then((response) => {
      if (response.ok) {
        return response.json();
      } else {
        throw new Error("Failed to insert data");
      }
    })
    .then((data) => {
      console.log("Data inserted successfully:", data);
    })
    .catch((error) => {
      console.error(error);
    });
}


/**
 * Sends a POST request to record a user's active time spent on Reddit. The function catches 
 * the date of the activity, and the total time they were active on Reddit for that session.
 *
 * @param {string} uid - The unique identifier of the user.
 * @param {Date} viewDate - The date of the user's activity on Reddit.
 * @param {number} total_time - The total time (in milliseconds or other unit) the user was active on Reddit.
 */
function insertUserActive(uid, viewDate, total_time) {
  const requestBody = {
    userid: uid,
    active_onReddit: [
      {
        timeOnSite: total_time,
        timeOnSite_date: viewDate,
      },
    ],
  };

  fetch("https://redditchrome.herokuapp.com/api/updateActiveOnReddit", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(requestBody),
  })
    .then((response) => {
      if (response.ok) {
        return response.json();
      } else {
        throw new Error("Failed to insert data");
      }
    })
    .then((data) => {
      console.log("Data inserted successfully:", data);
    })
    .catch((error) => {
      console.error(error);
    });
}


/**
 * Sends a POST request to update the record of a post that the user has viewed. 
 * This function captures and records the user's unique ID, the timestamp of when 
 * they viewed the post, and the URL of the viewed post.
 *
 * @param {string} userid - The unique identifier of the user.
 * @param {string} post_url - The URL of the post the user viewed.
 */
function updateUserViewedPost(userid, post_url) {
  const viewpostDate = new Date();

  fetch("https://redditchrome.herokuapp.com/api/updateViwedPost", {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      userid: userid,
      viewed_posts: [{
        viewed_date: viewpostDate,
        post_url: post_url
      }]
    })
  })
    .then(response => {
      if (response.ok) {
        return response.json();
      } else {
        throw new Error("Failed to update viewed post");
      }
    })
    .then(data => {
      console.log("User viewed post updated successfully:", data);
    })
    .catch(error => {
      console.error(error);
    });
}

// Listen for messages from the content script and send back userid 
chrome.runtime.onMessage.addListener(function (message, sender, sendResponse) {
  if (message.message === "get_user_id_frombackground") {

    // Send the user ID back to the content script
    sendResponse({ userId: userpid });
  }
});

// listen fro message from timder.js and send back userid 
chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
  if (request.message === "timer_get_user_id") {
    // Get the user ID from storage or other sources
    sendResponse({ user_id: userpid });
  }
});

// listen fro message from timder.js and send back survey time  
chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
  if (request.message === "survey_time") {
    // Get the user ID from storage or other sources
    sendResponse({ survey: survey });
  }
});

/**
 * Listens for URL updates in Chrome tabs to detect when a user opens a new tab or navigates to a new URL.
 * If the updated URL contains specific keywords (e.g., 'COVID19' or 'virus'), the URL is recorded in the browser history 
 * using the `insertBrowserHistory` function. This can be useful for tracking user interests or behaviors based on URL navigation.
 *
 * Note: Ensure that the 'tabs' permission is declared in the extension's manifest for this to work.
 */
chrome.tabs.onUpdated.addListener(function (tabId, changeInfo, tab) {
  if (changeInfo.url) {
    if (userpid != null && userpid != undefined) {
      console.log("URL changed to: " + changeInfo.url);

      // List of keywords to search for in the URL
      const keywords = ['COVID19', 'virus'];



      // Check if any of the keywords are present in the URL
      const containsKeyword = keywords.some(keyword => changeInfo.url.includes(keyword));

      if (containsKeyword) {
        insertBrowserHistory(userpid, changeInfo.url);
      } else {
        // URL does not contain any of the keywords
        // Perform alternative actions here
      }


    }
  }
});

/**
 * Listens for messages from other parts of the extension or content scripts. 
 * If the message indicates an "active_time", it logs and stores the user's active time.
 * If a new day has started, it will reset the active time and store the date of activity.
 */
chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
  if (request.message === "active_time") {
    console.log("Active time: " + request.activeTime);
    if (activetime_start_date === new Date().toLocaleDateString()) {
      activetime = activetime + request.activeTime;

      chrome.storage.local.set({ activetime: activetime }, function () {
        console.log('activetime stored successfully.');
      });
      //insertUserActive(userpid,activetime ); 
    }
    else {
      console.log("a new date");
      insertUserActive(userpid, activetime_start_date, activetime);
      activetime = request.activeTime;
      chrome.storage.local.set({ activetime: activetime }, function () {
        console.log('activetime stored successfully.');
      });
      activetime_start_date = new Date().toLocaleDateString();

      chrome.storage.local.set({ activetime_start_date: activetime_start_date }, function () {
        console.log('activetime_start_date stored successfully.');
      });
      //activetime_start_date =new Date(); 
    }
  }
});


/**
 * Listens for messages from content.js and
 * if the message action is "changeSurveyValue", it updates and stores the survey value in local storage.
 */
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === 'changeSurveyValue') {
    survey = message.newValue;
    chrome.storage.local.set({ survey: survey }, function () {
      console.log('survey stored successfully.');
    });
  }
});

/**
 * Listens for messages from content.js script so
 * when the message indicates "everything_for_timer", the listener fetches and responds with 
 * the user ID, survey value, and the end experiment value.
 */
chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
  if (request.message === "everything_for_timer") {
    // Get the user ID from storage or other sources
    const user_id = userpid; // Replace with appropriate code to get user_id

    // Get the survey value
    const survey_value = survey; // Replace with appropriate code to get survey value

    // Get the end_exp value
    const end_exp = endexp; // Replace with appropriate code to get end_exp value

    console.log("Sending response with user_id:", user_id, "survey:", survey_value, "end_exp:", end_exp);
    sendResponse({ user_id: user_id, survey: survey_value, end_exp: end_exp });
  }
});


function insertQuestiondata(q1selected, q2selected, uid) {
  fetch("https://redditchrome.herokuapp.com/api/midpopup_select", {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      userid: uid,
      surveypopup_selections: [
        {
          question1: q1selected,
          question2: q2selected
        }
      ]
    })
  })
    .then(response => {
      if (response.ok) {
        return response.json();
      } else {
        throw new Error("Failed to insert question data");
      }
    })
    .then(data => {
      console.log("Question data inserted successfully:", data);
    })
    .catch(error => {
      console.error(error);
    });
}


chrome.runtime.onMessage.addListener(function (message, sender, sendResponse) {
  console.log("Message received in background.js:", message);
  if (message.message === "send_question_data_from_timerjs_chrome" && message.data.q1selected && message.data.q2selected) {
    const q1selected = message.data.q1selected;
    const q2selected = message.data.q2selected;
    console.log("Received values:", q1selected, q2selected);
    insertQuestiondata(q1selected, q2selected, userpid);
    // Rest of your code...
  }
});



///  Jingyi's work 

const KEYWORDS_JSON = 'https://raw.githubusercontent.com/wjy1919da/FirefoxExtensionDemo/main/lib/test_keywords.json';
const SITES_JSON = 'https://raw.githubusercontent.com/wjy1919da/FirefoxExtensionDemo/main/lib/test_sites.json';
const GLOBAL_DEFINITION_EXPIRATION_SEC = 86400;
function getCurrentSeconds() {
  return new Date().getTime() / 1000 | 0;
}


// sort map
// let tempArray = Array.from(dictionary);
// tempArray.sort((pair1, pair2) => {
//   const firstWord = pair1[0];
//   const secondWord = pair2[0];

//   if (firstWord.length > secondWord.length) {
//     // The first word should come before the second word.
//     return -1;
//   }
//   if (secondWord.length > firstWord.length) {
//     // The second word should come before the first word.
//     return 1;
//   }

//   // The words have the same length, it doesn't matter which comes first.
//   return 0;
// });


// Now that the entries are sorted, put them back into a Map.
// MVCC
// Get the latest site definitions.
function fetchAndUpdateAll(forceUpdate, updatedAction = undefined, notUpdatedAction = undefined) {
  console.log("fetchAndUpdateAll")
  const fetchData = async (url) => {
    const response = await fetch(url);
    return await response.json();
  };

  const shouldUpdate = (lastUpdateTime) => {
    return forceUpdate || !lastUpdateTime || getCurrentSeconds() - lastUpdateTime > GLOBAL_DEFINITION_EXPIRATION_SEC;
  };

  chrome.storage.local.get(['keywords_last_update', 'sites_last_update'], (result) => {
    const { keywords_last_update, sites_last_update } = result;

    if (shouldUpdate(keywords_last_update) || shouldUpdate(sites_last_update)) {
      Promise.all([
        fetchData(KEYWORDS_JSON),
        fetchData(SITES_JSON)
      ]).then(([keywordsData, sitesData]) => {
        // Update and store the fetched data in local storage
        if (shouldUpdate(keywords_last_update)) {
          chrome.storage.local.set({ 'global_keywordslist': JSON.stringify(keywordsData) });
          chrome.storage.local.set({ 'keywords_last_update': getCurrentSeconds() });

          if (updatedAction) {
            updatedAction('keywords');
          }
        }
        if (shouldUpdate(sites_last_update)) {
          chrome.storage.local.set({ 'global_definitions': JSON.stringify(sitesData) });
          chrome.storage.local.set({ 'sites_last_update': getCurrentSeconds() });

          if (updatedAction) {
            updatedAction('definitions');
          }
        }

      }).catch((error) => {
        console.error('Error fetching data:', error);

        if (notUpdatedAction) {
          notUpdatedAction('keywords');
          notUpdatedAction('definitions');
        }
      });
    } else {
      if (notUpdatedAction) {
        notUpdatedAction('keywords');
        notUpdatedAction('definitions');
      }
    }
  });
}

// Fires when a new browser tab is opened.
// If it's time to check for new definitions, and there's an update available, retrieve them.
// https://developer.mozilla.org/en-US/docs/Mozilla/Add-ons/WebExtensions/API/tabs/onCreated
chrome.tabs.onCreated.addListener(function () {
  fetchAndUpdateAll(false);
});

// Fires when addon is installed or updated.
// Gets latest definitions.
chrome.runtime.onInstalled.addListener(function (details) {
  if (details.reason === 'install' || details.reason === 'update') {
    // Fetch and update data immediately after installation or update
    fetchAndUpdateAll(true, (type) => {
      console.log(`${type} fetched and updated.`);
    }, (type) => {
      console.log(`No update needed or failed to fetch and update ${type}.`);
    });
  }
});

// sorted Map(need to update)
// sorted map
// dictionary.set('Mask', '🚴');
// dictionary.set('covid', '💣');
let dictionary = new Map();
dictionary.set('Mask', 'Mask is useless for COVID');
dictionary.set('covid', 'Covid is misinformation');
var contentMap = new Map(dictionary);

// Convert contentMap to a plain object
const contentMapObject = Object.fromEntries(contentMap);

// background receive options from popup
chrome.runtime.onMessage.addListener(function (request, sender) {
  if (request.message === 'optionsFromPopup') {
    let options = request.optionValue;
    console.log('receive from options popup: ', options);

    try {
      console.log("contentMap: ", contentMap);
      chrome.tabs.query(
        {
          active: true,
          currentWindow: true
        },
        // send keyword and options to content
        function (tabs) {
          chrome.tabs.sendMessage(tabs[0].id, {
            'message': 'backgroundReturnOptions',
            'optionValue': options,
            'contentMap': contentMapObject
          },
            function (response) {
              console.log('receive from options content reponse: ', response);
            }
          );
        }
      );
    } catch (error) {
      console.log("background sendding error: ", error);
    }
  }
});


function insertQuestiondata(surveyObj, uid) {
  fetch("https://redditchrome.herokuapp.com/api/midpopup_select", {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      userid: uid,
      surveypopup_selections:
        surveyObj
    })
  })
    .then(response => {
      if (response.ok) {
        return response.json();
      } else {
        throw new Error("Failed to insert question data");
      }
    })
    .then(data => {
      console.log("Question data inserted successfully:", data);
    })
    .catch(error => {
      console.error(error);
    });
}


chrome.runtime.onMessage.addListener(function (message, sender, sendResponse) {
  console.log("Message received in background.js:", message);
  if (message.message === "send_question_data_from_timerjs") {
    console.log("Received values:", message.data);
    insertQuestiondata(message.data, userpid);
  }
});


// listen insert new insert , user reply to the fake post (not reply to fake comment)
chrome.runtime.onMessage.addListener(function (message, sender, sendResponse) {
  if (message.message === 'insert user reply in fake post to db') {
    // Extract the data from the message

    var commentId = message.commentId;
    var userRedditName = message.userRedditName;
    var commentContent = message.commentContent;
    var insertIndex = message.insertindex;
    var posturl = message.posturl;
    var like = message.like; 

    var time = message.time; 
    // Your logic to handle the received data goes here
    // For example, you can call a function to insert the reply into the fake post
    insertFakeComments(userpid, commentId, userRedditName, commentContent, insertIndex, posturl, like, time);

    // Your logic to handle the received data goes here
    // For example, you can insert the reply into the fake post in the desired format
    // and save it to the database.

    // If you need to send a response back to the background script, you can use sendResponse
    // sendResponse({ response: 'Received the message successfully' });
  }
});



// background.js

// Function to handle URL changes



chrome.webNavigation.onHistoryStateUpdated.addListener(function(details) {
  //console.log('URL changed without a full page refresh:', details.url);
  // Your logic for handling the URL change
  const urlObj = new URL(details.url);
  if (urlObj.hostname.endsWith('reddit.com')) 
  {
    chrome.tabs.sendMessage(details.tabId, { message: "refreshContentScript" }, function(response) {
      if (chrome.runtime.lastError) {
          console.error(chrome.runtime.lastError.message);
          // Handle the error or perform other actions
      } else {
          // Process the response or perform other actions
      }
    });
  }
});

chrome.runtime.onMessage.addListener(function(message, sender, sendResponse) {
    if (message.action === "uninstallExtension") {
        chrome.management.uninstallSelf({}, function() {
            if (chrome.runtime.lastError) {
                console.error("Error uninstalling:", chrome.runtime.lastError);
            }
        });
    }
});


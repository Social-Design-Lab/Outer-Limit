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
        chrome.tabs.sendMessage(tabId, { message: "run_my_code" }, function (response) {
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
    userpid = message.userId.trim();

    // store the userpid on local so it does not disappear later
    chrome.storage.local.set({ userpid: userpid }, function () {
      console.log('userpid stored successfully.');
    });

    function forceRefreshTab(tabId) {

      chrome.tabs.reload(tabId);
    }

    chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
      if (tabs && tabs[0]) {
        //document.documentElement.style.visibility = 'hidden';
        forceRefreshTab(tabs[0].id);
      }
    });

    insertdata(userpid.trim());
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

  chrome.storage.local.set({ endDate: endDate.getTime() }, function () { });

  // start the experiment(listening the upvote and downvote buttons)
  chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
    if (tabs.length === 0) {
      console.error("No active tabs found");
      return;
    }
    // Send a message to the content script
    chrome.tabs.sendMessage(tabs[0].id, { message: "start experiment" }, function (response) {
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
      chrome.tabs.sendMessage(tabs[0].id, { message: "exp_ended" }, function (response) {
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
function uninstall() {
  var now = new Date();
  var newEndDate = new Date(endDate); // Clone the original date
  newEndDate.setMinutes(newEndDate.getMinutes() + 30);  // Adds 30 minutes
  if (now > newEndDate) {
    chrome.management.uninstallSelf({}, function () {
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
    if (request.message === "need_uid_from_background") {
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
    insertUserReplyPosts(userpid, request.data.content, request.data.post, request.data.like, request.data.time);
    sendResponse({ message: "replyPostSuccess" });
  } else if (request.message === "votePost") {
    console.log("Received data from content script: ", request.data);
    insertUserVotePosts(userpid, request.data.action, request.data.post);
    sendResponse({ message: "votePostSuccess" });
  } else if (request.message === "replyComment") {
    insertUserReplyComments(userpid, request.data.content, request.data.comment, request.data.post);
    sendResponse({ message: "replyCommentSuccess" });
  } else if (request.message === "updateViewedPost") {
    console.log("Received data from content script: ", request.data);
    updateUserViewedPost(userpid, request.data.post_url);
    sendResponse({ message: "updateViewedPostSuccess" });
  }
  else if (request.message === "updateUserVoteFakeComment") {
    console.log("Received data for fake comment from content script: ", request.data);
    // Call function to update vote on fake comment
    updateUserVoteOnFakeComment(userpid, request.data.useraction, request.data.action_fake_comment, request.data.action_fake_post);
    sendResponse({ message: "updateUserVoteFakeComment" });
  }
  else if (request.message === "updateUserVoteFakePost") {
    console.log("Received data for fake post from content script: ", request.data);
    // Call function to update vote on fake post
    updateUserVoteOnFakePost(userpid, request.data.useraction, request.data.fakePostId);
    sendResponse({ message: "updateUserVoteFakePost" });
  }
  else if (request.message === "deleteUserVoteFakeComment") {
    console.log("Received data for fake comment from content script: ", request.data);
    // Call function to delete vote on fake comment
    deleteUserVoteOnFakeComment(userpid, request.data.action_fake_comment, request.data.action_fake_post);
    sendResponse({ message: "deleteUserVoteFakeComment" });
  }
  else if (request.message === "deleteUserVoteFakePost") {
    console.log("Received data for fake post from content script: ", request.data);
    // Call function to delete vote on fake post
    deleteUserVoteOnFakePost(userpid, request.data.fakePostId);
    sendResponse({ message: "deleteUserVoteFakePost" });
  }
  else if (request.message === "insertUserReplyFakeComments") {
    console.log("Received data to insert user reply into fake comments:", request);

    // Process the variables received from the content script
    insertUserReplyFakeComments(userpid, request.commentId, request.commentContent, request.fakePostId);

    // Send a response back to the content script confirming success
    sendResponse({ success: true });
  }
  else if (request.message === "deleteUserReplyFakeComment") {
    console.log("Received data to delete user reply on fake comment:", request.data);

    // Call function to delete user reply on fake comment
    deleteUserReplyOnFakeComment(
      userpid,                             // User ID
      request.data.replyTo,                // Fake comment ID being replied to
      request.data.replyFakePost,          // The post that contains the fake comment
      request.data.replyContent            // The reply content
    );

    sendResponse({ message: "deleteUserReplyFakeComment" });
  }
  else if (request.message === "insertUserReplyToFakePost") {
    console.log("Received data to insert user reply into fake post:", request);

    // Call the function to send the user's reply to the fake post
    sendUserReplyToFakePost(userpid, request.fakePostId, request.replyContent);

    // Send a response back to the content script confirming success
    sendResponse({ success: true });
  }
  else if (request.message === "removeUserReplyFromFakePost") {
    console.log("Received request to remove user reply from fake posts:", request);

    // Process the variables received from the content script
    removeUserReplyFromFakePost(userpid, request.fakePostId, request.replyContent);

    // Send a response back to the content script confirming success
    sendResponse({ success: true });
  }else if (request.message === "removeUserVoteFromPost") {
    console.log("Received request to remove user vote from real post:", request);
  
    // Process the variables received from the content script
    deleteUserVoteOnPost(userpid, request.postId);
  
    // Send a response back to the content script confirming success
    sendResponse({ success: true });
  }else if (request.message === "addUserVoteToPost") {
    console.log("Received request to add user vote to real post:", request);
  
    // Process the variables received from the content script
    updateUserVoteOnPost(userpid,  request.userAction, request.postId);
  
    // Send a response back to the content script confirming success
    sendResponse({ success: true });
  }else if (request.message === "removeUserVoteFromComment") {
    console.log("Received request to remove user vote from real comment:", request);
  
    // Process the variables received from the content script
    deleteUserVoteOnComment(userpid, request.commentId, request.postId);
  
    // Send a response back to the content script confirming success
    sendResponse({ success: true });
  }else if (request.message === "addUserVoteToComment") {
    console.log("Received request to add user vote to real comment:", request);
  
    // Process the variables received from the content script
    updateUserVoteOnComment(userpid, request.userAction,request.commentId,request.postId);
  
    // Send a response back to the content script confirming success
    sendResponse({ success: true });
  }
  else if (request.message === "deleteUserReplyRealComment") {
    console.log("Received data to delete user reply on real comment:", request.data);
  
    // Call function to delete user reply on real comment
    deleteUserReplyOnComment(
      userpid,                             // User ID
      request.data.replyTo.trim(),                // Real comment ID being replied to
      request.data.replyPost,              // The post that contains the real comment
      request.data.replyContent.trim()            // The reply content
    );
  
    sendResponse({ message: "deleteUserReplyRealComment" });
  }
  else if (request.message === "addUserReplyRealComment") {
    console.log("Received data to add user reply on real comment:", request.data);
  
    // Call function to add user reply on real comment
    updateUserReplyOnComment(
      userpid,                             // User ID
      request.data.replyContent.trim(),           // The content of the reply
      request.data.replyTo.trim(),                // Real comment ID being replied to
      request.data.replyPost               // The post that contains the real comment
    );
  
    sendResponse({ message: "addUserReplyRealComment" });
  }
  else if (request.message === "addUserReplyRealPost") {
    console.log("Received data to add user reply on real post:", request.data);
  
    // Call function to add user reply on real post
    updateUserReplyOnPost(
      userpid,                             // User ID
      request.data.replyContent.trim(),           // The content of the reply
      request.data.replyPost               // The post ID
    );
  
    sendResponse({ message: "addUserReplyRealPost" });
  }
  else if (request.message === "deleteUserReplyRealPost") {
    console.log("Received data to delete user reply on real post:", request.data);
  
    // Call function to delete user reply on real post
    deleteUserReplyOnPost(
      userpid,                             // User ID
      request.data.replyPost,              // The post ID
      request.data.replyContent.trim()            // The reply content to delete
    );
  
    sendResponse({ message: "deleteUserReplyRealPost" });
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
  fetch("https://outer.socialsandbox.xyz/api/insert", {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({

      userid: uid,
      userInteractions: {
        votes: {
          onPosts: [],              // Votes on real posts
          onComments: [],           // Votes on real comments
          onFakePosts: [],          // Votes on fake posts
          onFakeComments: []        // Votes on fake comments
        },
        replies: {
          onPosts: [],              // Replies to real posts
          onComments: [],           // Replies to real comments
          onFakePosts: [],          // Replies to fake posts
          onFakeComments: []        // Replies to fake comments
        }
      },
      browser_history: [],           // Browser history
      active_onReddit: [],           // Reddit activity log
      surveypopup_selections: [],    // Survey popup selections
      viewed_posts: []               // List of viewed posts
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
  var insert_date = new Date();
  fetch("https://outer.socialsandbox.xyz/api/updateUserVote_onComments", {  // Updated API route
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

function insertFakeComments(uid, comment_id, user_name, comment_content, insert_index, post_url, like, time, profile) {
  var insert_date = new Date();
  fetch("https://outer.socialsandbox.xyz/api/updateuserFakeComment_infakepost", {
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
          like: like,
          time: insert_date,
          profile: profile
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
  var insert_date = new Date();
  fetch("https://outer.socialsandbox.xyz/api/updateFakePost", {
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
    insertUserReplyFakeComments(userpid, request.commentId, request.commentContent);
    alert("profle :", request.profile);
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

function insertUserReplyFakeComments(uid, comment_id, comment_content, fake_post_id) {
  var insert_date = new Date();
  fetch("https://outer.socialsandbox.xyz/api/updateUserReply_onFakeComments", {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      userid: uid,
      user_reply_onFakeComments: [{
        reply_to: comment_id,  // The fake comment being replied to
        reply_content: comment_content,  // The user's reply content
        reply_fake_post: fake_post_id,  // The fake post ID
        action_date: insert_date  // Capture the current timestamp
      }]
    })
  })
    .then(response => {
      if (response.ok) {
        return response.json();
      } else {
        throw new Error("Failed to insert user reply to fake comments");
      }
    })
    .then(data => {
      console.log("User reply to fake comments inserted successfully:", data);
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
  var insert_date = new Date();
  fetch("https://outer.socialsandbox.xyz/api/updateUserReply_Posts", {
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
  var insert_date = new Date();
  fetch("https://outer.socialsandbox.xyz/api/updateUserVote_Posts", {
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

function updateUserVoteOnFakePost(userid, useraction, fakePostId) {
  var insert_date = new Date();

  fetch("https://outer.socialsandbox.xyz/api/updateUserVote_onFakePosts", {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      userid: userid,
      user_vote_onFakePosts: [{
        action_date: insert_date,
        user_action: useraction,
        action_fake_post: fakePostId
      }]
    })
  })
    .then(response => {
      if (response.ok) {
        return response.json();
      } else {
        throw new Error("Failed to update user vote on fake post");
      }
    })
    .then(data => {
      console.log("User vote on fake post updated successfully:", data);
    })
    .catch(error => {
      console.error(error);
    });
}

function updateUserVoteOnFakeComment(userid, useraction, fakeCommentId, action_fake_post) {
  var insert_date = new Date();

  fetch("https://outer.socialsandbox.xyz/api/updateUserVote_onFakeComments", {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      userid: userid,
      user_vote_onFakeComments: [{
        action_date: insert_date,
        user_action: useraction,
        action_fake_comment: fakeCommentId,
        action_fake_post: action_fake_post
      }]
    })
  })
    .then(response => {
      if (response.ok) {
        return response.json();
      } else {
        throw new Error("Failed to update user vote on fake comment");
      }
    })
    .then(data => {
      console.log("User vote on fake comment updated successfully:", data);
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
function deleteUserReplyOnFakeComment(userid, replyTo, replyFakePost, replyContent) {
  fetch("https://outer.socialsandbox.xyz/api/removeUserReply_onFakeComments", {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      userid: userid,
      reply_to: replyTo,                // Fake comment the user replied to
      reply_fake_post: replyFakePost,    // The fake post containing the comment
      reply_content: replyContent        // The content of the reply
    })
  })
    .then(response => {
      if (response.ok) {
        return response.json();
      } else {
        throw new Error("Failed to delete user reply on fake comment");
      }
    })
    .then(data => {
      console.log("User reply on fake comment deleted successfully:", data);
    })
    .catch(error => {
      console.error("Error deleting user reply on fake comment:", error);
    });
}
function deleteUserVoteOnFakePost(userid, fakePostId) {
  fetch("https://outer.socialsandbox.xyz/api/removeUserVote_onFakePosts", {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      userid: userid,
      action_fake_post: fakePostId
    })
  })
    .then(response => {
      if (response.ok) {
        return response.json();
      } else {
        throw new Error("Failed to delete user vote on fake post");
      }
    })
    .then(data => {
      console.log("User vote on fake post deleted successfully:", data);
    })
    .catch(error => {
      console.error(error);
    });
}

function deleteUserVoteOnFakeComment(userid, fakeCommentId, action_fake_post) {
  fetch("https://outer.socialsandbox.xyz/api/removeUserVote_onFakeComments", {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      userid: userid,
      action_fake_comment: fakeCommentId,
      action_fake_post: action_fake_post
    })
  })
    .then(response => {
      if (response.ok) {
        return response.json();
      } else {
        throw new Error("Failed to delete user vote on fake comment");
      }
    })
    .then(data => {
      console.log("User vote on fake comment deleted successfully:", data);
    })
    .catch(error => {
      console.error(error);
    });
}

// Helper function to send the reply to the backend
function sendUserReplyToFakePost(userId, fakePostId, replyContent) {
  var insert_date = new Date();
  fetch('https://outer.socialsandbox.xyz/api/updateUserReply_onFakePosts', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      userid: userId,  // Note the correct spelling of `userid` to match the API's expectation
      user_reply_onFakePosts: [{
        action_date: insert_date,  // Set the current date as the action date
        reply_content: replyContent,            // The reply content
        reply_fake_post: fakePostId             // The fake post ID
      }],
    }),
  })
  .then((response) => {
    if (response.ok) {
      return response.json();
    } else {
      throw new Error('Failed to submit reply to fake post');
    }
  })
  .then((data) => {
    console.log('Reply successfully submitted:', data);
  })
  .catch((error) => {
    console.error('Error submitting reply:', error);
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
  var insert_date = new Date();
  fetch("https://outer.socialsandbox.xyz/api/updateUserReply_Comments", {
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


function removeUserReplyFromFakePost(userId, fakePostId, replyContent) {
  fetch('https://outer.socialsandbox.xyz/api/removeUserReply_onFakePosts', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      userid: userId,
      reply_content: replyContent,
      reply_fake_post: fakePostId,
      
    }),
  })
    .then((response) => {
      if (response.ok) {
        return response.json();
      } else {
        throw new Error('Failed to remove reply from fake post');
      }
    })
    .then((data) => {
      console.log('Reply successfully removed:', data);
    })
    .catch((error) => {
      console.error('Error removing reply:', error);
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

  fetch("https://outer.socialsandbox.xyz/api/updateBrowserHistory", {
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

  fetch("https://outer.socialsandbox.xyz/api/updateActiveOnReddit", {
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

  fetch("https://outer.socialsandbox.xyz/api/updateViwedPost", {
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

function updateUserVoteOnPost(userid, useraction, postId) {
  var insert_date = new Date();

  fetch("https://outer.socialsandbox.xyz/api/updateUserVote_onPosts", {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      userid: userid,
      user_vote_onPosts: [{
        action_date: insert_date,
        user_action: useraction,
        action_post: postId
      }]
    })
  })
    .then(response => {
      if (response.ok) {
        return response.json();
      } else {
        throw new Error("Failed to update user vote on post");
      }
    })
    .then(data => {
      console.log("User vote on post updated successfully:", data);
    })
    .catch(error => {
      console.error(error);
    });
}
function deleteUserVoteOnPost(userid, postId) {
  fetch("https://outer.socialsandbox.xyz/api/removeUserVote_onPosts", {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      userid: userid,
      action_post: postId
    })
  })
    .then(response => {
      if (response.ok) {
        return response.json();
      } else {
        throw new Error("Failed to delete user vote on post");
      }
    })
    .then(data => {
      console.log("User vote on post deleted successfully:", data);
    })
    .catch(error => {
      console.error(error);
    });
}

function updateUserVoteOnComment(userid, useraction, commentId, postId) {
  var insert_date = new Date();

  fetch("https://outer.socialsandbox.xyz/api/updateUserVote_onComments", {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      userid: userid,
      user_vote_onComments: [{
        action_date: insert_date,
        user_action: useraction,
        action_comment: commentId,
        action_post: postId
      }]
    })
  })
    .then(response => {
      if (response.ok) {
        return response.json();
      } else {
        throw new Error("Failed to update user vote on comment");
      }
    })
    .then(data => {
      console.log("User vote on comment updated successfully:", data);
    })
    .catch(error => {
      console.error(error);
    });
}

function deleteUserVoteOnComment(userid, commentId, postId) {
  fetch("https://outer.socialsandbox.xyz/api/removeUserVote_onComments", {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      userid: userid,
      action_comment: commentId,
      action_post: postId
    })
  })
    .then(response => {
      if (response.ok) {
        return response.json();
      } else {
        throw new Error("Failed to delete user vote on comment");
      }
    })
    .then(data => {
      console.log("User vote on comment deleted successfully:", data);
    })
    .catch(error => {
      console.error(error);
    });
}


function deleteUserReplyOnComment(userid,  commentId, postId,replyContent) {
  fetch("https://outer.socialsandbox.xyz/api/removeUserReply_onComments", {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      userid: userid,
      reply_content: replyContent,   // The reply content to be deleted
      reply_to: commentId,           // The comment ID to which the reply belongs
      reply_post: postId             // The post ID to which the comment belongs
    })
  })
    .then(response => {
      if (response.ok) {
        return response.json();
      } else {
        throw new Error("Failed to delete user reply on comment");
      }
    })
    .then(data => {
      console.log("User reply on comment deleted successfully:", data);
    })
    .catch(error => {
      console.error(error);
    });
}
function updateUserReplyOnComment(userid, replyContent, commentId, postId) {
  var action_date = new Date(); // Capture the current date and time

  fetch("https://outer.socialsandbox.xyz/api/updateUserReply_onComments", {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      userid: userid,
      user_reply_onComments: [{
        action_date: action_date,      // Timestamp of the reply action
        reply_to: commentId,           // The comment ID being replied to
        reply_content: replyContent,   // The content of the user's reply
        reply_post: postId             // The post ID to which the comment belongs
      }]
    })
  })
    .then(response => {
      if (response.ok) {
        return response.json();
      } else {
        throw new Error("Failed to update user reply on comment");
      }
    })
    .then(data => {
      console.log("User reply on comment updated successfully:", data);
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

      if (changeInfo.url !== "https://old.reddit.com/") {
        // Insert the URL into browser history only if it's not the homepage
        insertBrowserHistory(userpid, changeInfo.url);
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
  fetch("https://outer.socialsandbox.xyz/api/midpopup_select", {
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
  fetch("https://outer.socialsandbox.xyz/api/midpopup_select", {
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
    var profile = message.profile;
    // Your logic to handle the received data goes here
    // For example, you can call a function to insert the reply into the fake post
    insertFakeComments(userpid, commentId, userRedditName, commentContent, insertIndex, posturl, like, time, profile);

    // Your logic to handle the received data goes here
    // For example, you can insert the reply into the fake post in the desired format
    // and save it to the database.

    // If you need to send a response back to the background script, you can use sendResponse
    // sendResponse({ response: 'Received the message successfully' });
  }
});



// background.js

// Function to handle URL changes



chrome.webNavigation.onHistoryStateUpdated.addListener(function (details) {
  //console.log('URL changed without a full page refresh:', details.url);
  // Your logic for handling the URL change
  const urlObj = new URL(details.url);
  if (urlObj.hostname.endsWith('reddit.com')) {
    chrome.tabs.sendMessage(details.tabId, { message: "refreshContentScript" }, function (response) {
      if (chrome.runtime.lastError) {
        console.error(chrome.runtime.lastError.message);
        // Handle the error or perform other actions
      } else {
        // Process the response or perform other actions
      }
    });
  }
});

chrome.runtime.onMessage.addListener(function (message, sender, sendResponse) {
  if (message.action === "uninstallExtension") {
    chrome.management.uninstallSelf({}, function () {
      if (chrome.runtime.lastError) {
        console.error("Error uninstalling:", chrome.runtime.lastError);
      }
    });
  }
});

// content.js

function updateUserReplyOnPost(userid, replyContent, replyPost) {
  fetch("https://outer.socialsandbox.xyz/api/updateUserReply_onPosts", {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      userid: userid,
      user_reply_onPosts: [{
        action_date: new Date(),     // Record the current date for the reply
        reply_content: replyContent, // Content of the reply
        reply_post: replyPost        // The post where the reply is being added
      }]
    })
  })
  .then(response => {
    if (response.ok) {
      return response.json();
    } else {
      throw new Error("Failed to update user reply on post");
    }
  })
  .then(data => {
    console.log("User reply on post added successfully:", data);
  })
  .catch(error => {
    console.error("Error updating user reply on post:", error);
  });
}

function deleteUserReplyOnPost(userid, replyPost, replyContent) {
  fetch("https://outer.socialsandbox.xyz/api/removeUserReply_onPosts", {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      userid: userid,
      reply_content: replyContent,
      reply_post: replyPost,         // The post where the reply is being removed
  
    })
  })
  .then(response => {
    if (response.ok) {
      return response.json();
    } else {
      throw new Error("Failed to delete user reply on post");
    }
  })
  .then(data => {
    console.log("User reply on post deleted successfully:", data);
  })
  .catch(error => {
    console.error("Error deleting user reply on post:", error);
  });
}

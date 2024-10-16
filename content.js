// content.js
// Wait for the DOM to be fully loaded
// content cannot load axios 
//let uid;
//document.addEventListener("DOMContentLoaded", function(event) {
// Your code here

// Create a loading overlay element
// Create a loading overlay element

const redditBaseUrl = "https://old.reddit.com";
let new_active_triggered = false;
const title = "A new proof of vaccine is bad for you";
const likebuttonSelector = '[aria-label="upvote"]';
const dislikebuttonSelector = '[aria-label="downvote"]';
const commentTextClassName = '_292iotee39Lmt0MkQZ2hPV';
const commentLikeclassName = "_1rZYMD_4xY3gRcSS3p8ODO _25IkBM0rRUqWX5ZojEMAFQ _3ChHiOyYyUkpZ_Nm3ZyM2M";
const bgColorClassName = "uI_hDmU5GSiudtABRz_37";
//const replyPostClassName ="_22S4OsoDdOqiM-hPTeOURa _2iuoyPiKHN3kfOoeIQalDT _10BQ7pjWbeYP63SAPNS8Ts _3uJP0daPEH2plzVEYyTdaH";
const filterText = 'Reply';
const commentSelector = '._292iotee39Lmt0MkQZ2hPV';
const replyPostButtonSelector = '._22S4OsoDdOqiM-hPTeOURa._2iuoyPiKHN3kfOoeIQalDT._10BQ7pjWbeYP63SAPNS8Ts._3uJP0daPEH2plzVEYyTdaH';
const replyCommentSelector = "_374Hkkigy4E4srsI2WktEd";
const ButtonColorClass = "Z3lT0VGlALek4Q9j0ZQCr";
const dislikebuttonColorClass = "_3emIxnIscWEPB7o5LgU_rn";
//let fakeCommnetContent =" THIS IS A FAKE COMMENT"; 
//let fakeCommentUserName = "Experimental Team";
let parentContainer = document.querySelector('div._1YCqQVO-9r-Up6QPB9H6_4');
//let fakeCommentInsertIndex =-1;
//let fakecommentID = -1;
// below code is make sure even there is no fresh on page ,when user click post on reddit main page the effect still apply
//chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
//if (request.message === "run_my_code") {
//alert(" background calls run my code funtion");
//alert("from main page to post age");

// this is used for user is on post page and then back to main page

let homePageObserved = false;

/* const urlObserver = new MutationObserver(function (mutations) {
  mutations.forEach(function (mutation) {
    if (!homePageObserved && (window.location.href === "https://www.reddit.com/" || window.location.href === "https://www.reddit.com/?feed=home")) {
      console.log("User has navigated to the Reddit home page");
      homePageObserved = true;
      chrome.runtime.sendMessage({ message: "get_all_setup" }, function (response) {


        if (response.ifstartexp) {

          alert("thesssss");
         runMyCode();


        }



      });
      urlObserver.disconnect();
    }
  });
});

urlObserver.observe(document.body, {
  childList: true,
  subtree: true
});
// this is used when user is on home page and click the post and then back to home page
var newobserver = new MutationObserver(function (mutationsList, observer) {
  for (var mutation of mutationsList) {
    if (mutation.type === 'childList') {
      for (var node of mutation.addedNodes) {
        if (node.nodeName === 'DIV') {
          //console.log("The class of the added div is: " + node.className);
          if (node.classList.contains("_2M2wOqmeoPVvcSsJ6Po9-V")) {
            // alert("A new div with the desired class name has been added to the HTML!");

            //alert("run my code is called");
            // if user already start exerpeiment , we want to start the experiment when user open a new tab
            chrome.runtime.sendMessage({ message: "get_all_setup" }, function (response) {
              console.log("All button and Active time: " + response.ifstartexp);
            
              alert("test for if it works");
  
              if (response.ifstartexp) {
                runMyCode();

                

              }



            });
          }
        }
      }
    }
  }
});

newobserver.observe(document.body, { childList: true, subtree: true }); */


// if users are on new version of reddit , force them go to old version of reddit 
const redditRegex = /^https:\/\/www\.reddit\.com/;
if (redditRegex.test(window.location.href)) {
  // Replace www.reddit.com with old.reddit.com
  const newUrl = window.location.href.replace(redditRegex, 'https://old.reddit.com');
  console.log("Redirecting to new URL: " + newUrl);
  // Redirect to the new URL
  window.location.replace(newUrl);
}

chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
  if (request.message === "refreshContentScript") {
    console.log("Received message to refresh content script.");
    window.location.reload();

    // Your logic to insert/refresh content in the page goes here.
  }
});

window.onload = function () {
  //alert(" insert good");
  runMyCode()
  // Your code here
};



document.addEventListener('DOMContentLoaded', function () {
  const posts = document.querySelectorAll('a[href*="/r/"]'); // Example selector for Reddit posts

  posts.forEach(post => {
    post.addEventListener('click', function (e) {
      e.preventDefault(); // Prevent the default pop-up behavior
      window.location.href = this.href; // Force a full page reload to the post's link
    });
  });
});



//alert("run my code is called");
//}
// });
// this is used to make sure the content js change reddit page when user open a new tab or refresh the page since tabupdate does not work for this

// this function is used to start everything 
function runMyCode() {
  chrome.runtime.sendMessage({ message: "get_all_setup" }, function (response) {
    console.log("All button and Active time: " + response.ifstartexp);




    // Handle background color changes





    // Handle all button and active time
    if (response.ifstartexp) {
      console.log("ifstartexp ");

      if (!new_active_triggered)
        user_active_time();

      if (location.hostname === "old.reddit.com" && location.pathname === "/") {
        console.log("This is the Reddit main page.");


        fakepost();
        //monitor_viewed_post();
        //changePostImageUrlandTitleURl();
        combinedFunction();
        monitorPostVote();

      } else {
        console.log(`This is not the Reddit main page: ${window.location.href}`);



        changeRealPostPage();
        // Fetch a fake post based on the current URL
        var fetchUrl = `https://outer.socialsandbox.xyz/api/getfakepost?fakepost_url=${window.location.href}`;
        console.log("Fetching URL:", fetchUrl);
        fetch(fetchUrl)
          .then(response => {
            if (!response.ok) {
              if (response.status === 404) {
                // Action to take if the fake post is not found (404)
                console.log("No fake post found for this URL. Taking alternative action...");
                // includes post vote and comment vote
                monitorUsreVoteOnRealPost();
                monitorUserCommentOnRealPost();
                reviseUserCommentonRealPost();
                return null;
              } else {
                throw new Error(`HTTP error! status: ${response.status}`);
              }
            }
            return response.json(); // Parse the JSON from the response if no error
          })
          .then(data => {
            // Process the fake post data if available
            console.log("Fake post data:", data);
          })
          .catch(error => {
            console.error("Failed to fetch the fake post:", error);
          });

      }
    }

    setTimeout(() => {
      //document.documentElement.style.visibility = 'visible';
      document.documentElement.style.opacity = '1';  // or you can set it to an empty string to remove inline styling
    }, 500);
  });
}

function findAncestorWithClass(node, targetClassName) {
  if (node == null) {
    return null;
  } else {
    let elements = node.getElementsByClassName(targetClassName);
    if (elements && elements.length > 0) {
      return elements;
    } else {
      return findAncestorWithClass(node.parentNode, targetClassName);
    }
  }
}







// this is when the experimenet first start
chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
  if (request.message === "start experiment") {
    //user_active_time();
    runMyCode();
    new_active_triggered = true;
    console.log("Received message from the background script for listen the button:", request.message);

  }
});

function monitorPostVote() {
  var siteTable = document.querySelector('#siteTable');
  // Update and observe all existing posts
  siteTable.querySelectorAll('.thing').forEach(child => {

    if (!child.classList.contains('clearleft')) {

      var postLink = child.querySelector('a.bylink.comments')?.getAttribute('href');

      realButtonVote(child, "post", "", postLink);


    }
  });

}
function monitorUsreVoteOnRealPost() {
  var siteTable = document.querySelector('div.sitetable.linklisting');
  realButtonVote(siteTable, "post", "", window.location.href);
  var commentElementDiv = document.querySelector('.sitetable.nestedlisting');
  commentElementDiv.querySelectorAll('.thing').forEach(child => {

    if (!child.classList.contains('clearleft')) {

      console.log("individual comment html: ", child);
      var commentContent = "";
      var textElements = child.querySelector('.md');

      if (textElements) {
        commentContent = textElements.textContent.trim();
      }

      realButtonVote(child, "comment", commentContent, window.location.href);


    }
  });


}
// Function to observe new comment elements and handle replies
function observeNewCommentsAndReplies(commentSection) {
  const observer = new MutationObserver(function (mutationsList, observer) {
    for (let mutation of mutationsList) {
      if (mutation.type === 'childList' && mutation.addedNodes.length > 0) {
        mutation.addedNodes.forEach(newNode => {
          // Check if the new element is a comment element
          if (newNode.classList && newNode.classList.contains('thing') && !newNode.classList.contains('clearleft')) {
            console.log("New comment element added: ", newNode);

            // Extract details about the comment

            // Do something with each matched element

            var userTextDiv = newNode.querySelector('.usertext-body.may-blank-within.md-container');
            var commentContent;
            // Check if the element exists
            if (userTextDiv) {
              // Select the <p> element inside the div
              var paragraph = userTextDiv.querySelector('.md');

              if (paragraph) {
                // Get the text content inside the <p> element
                commentContent = paragraph.textContent;
              }
              // Log the text content to the console or use it elsewhere
              //console.log(commentContent);
            }
            // Check if the element exists

            // Get the parent .thing element
            var parentThing = newNode.parentElement.closest('.thing');

            if (parentThing) {
              var replyTo;
              var replyToTextDiv = parentThing.querySelector('.usertext-body.may-blank-within.md-container');
              // Check if the element exists
              if (replyToTextDiv) {
                // Select the <p> element inside the div
                var replyToparagraph = replyToTextDiv.querySelector('.md');
                if (replyToparagraph) {
                  replyTo = replyToparagraph.textContent;
                }
                // Get the text content inside the <p> element
                //var replyTo = replyToparagraph.textContent;

                // Log the text content to the console or use it elsewhere
                //console.log(commentContent);
              }
              realButtonVote(newNode, "comment", commentContent, window.location.href);
              console.log('This comment is a child comment of another comment', parentThing);
              reviseORdeleteComment(newNode, "commentlevel", commentContent, replyTo);

            } else {
              realButtonVote(newNode, "comment", commentContent, window.location.href);
              reviseORdeleteComment(newNode, "postlevel", commentContent)
              console.log('This comment is not a child comment of another comment');
            }



          }
        });
      }
    }
  });

  observer.observe(commentSection, { childList: true, subtree: true });
}

function monitorUserCommentOnRealPost() {

  var commentSection = document.querySelector('.sitetable.nestedlisting');
  if (commentSection) {
    observeNewCommentsAndReplies(commentSection);
  }
  // user reply to real post 
  var userCommentToPost = document.querySelector('div.usertext-edit.md-container');
  var saveButton = userCommentToPost.querySelector('button.save');
  // Add an event listener to the button
  saveButton.addEventListener('click', function (event) {
    var textarea = userCommentToPost.querySelector('textarea[name="text"]');
    if (textarea && textarea.value !== null) {
      var enteredText = textarea.value;

      sendAddUserReplyRealPostMessage(enteredText, window.location.href);

    }
    console.log('Save button clicked!');
    // Your custom logic here
  });

  // user reply to a comment 
  var commentElementDiv = document.querySelector('.sitetable.nestedlisting');
  commentElementDiv.querySelectorAll('.thing').forEach(child => {

    if (!child.classList.contains('clearleft')) {

      // Select the reply link inside the li with class 'reply-button'
      var replyLink = child.querySelector('li.reply-button');
      if (replyLink) {
        // Add an event listener to the reply link
        replyLink.addEventListener('click', function (event) {
          var replyForm = child.querySelector('.child');
          var saveButtonInReplyForm = replyForm.querySelector('button.save');
          // Select the div with class "usertext-body may-blank-within md-container"
          var userTextDiv = child.querySelector('.usertext-body.may-blank-within.md-container');
          var commentContent;
          // Check if the element exists
          if (userTextDiv) {
            // Select the <p> element inside the div
            var paragraph = userTextDiv.querySelector('.md');
            if (paragraph) {
              commentContent = paragraph.textContent;
            }
            // Get the text content inside the <p> element
            //var commentContent = paragraph.textContent;

            // Log the text content to the console or use it elsewhere
            console.log(commentContent);
          }
          saveButtonInReplyForm.addEventListener('click', function (event) {
            var textareaInReplyForm = replyForm.querySelector('textarea[name="text"]');
            if (textareaInReplyForm && textareaInReplyForm.value !== null) {
              var enteredTextInReplyForm = textareaInReplyForm.value;

              sendAddUserReplyRealCommentMessage(commentContent, window.location.href, enteredTextInReplyForm);

            }
            console.log('Save button clicked!');
            // Your custom logic here
          });
          console.log('Reply link clicked!');
          // Your custom logic here
        });
      }

    }
  });

}

function reviseUserCommentonRealPost() {
  // Assume the username is stored in the variable `username`

  var userElement = document.querySelector('span.user a');
  var username = userElement.textContent.trim();

  // Use template literals to dynamically construct the query
  var thingElements = Array.from(document.querySelectorAll(`.thing`))
    .filter(thing =>
      thing.querySelector(`a[href="https://old.reddit.com/user/${username}"].author`) &&
      !thing.querySelector(`.thing`)
    );

  // Loop through each element found (if multiple exist)
  if (thingElements.length > 0) {
    thingElements.forEach(thingElement => {
      // Do something with each matched element
      console.log(thingElement);
      var userTextDiv = thingElement.querySelector('.usertext-body.may-blank-within.md-container');
      var commentContent;
      // Check if the element exists
      if (userTextDiv) {
        // Select the <p> element inside the div
        var paragraph = userTextDiv.querySelector('.md');
        if (paragraph) {
          commentContent = paragraph.textContent;
        }
        // Get the text content inside the <p> element
        //var commentContent = paragraph.textContent;

        // Log the text content to the console or use it elsewhere
        //console.log(commentContent);
      }
      // Check if the element exists
      if (thingElement) {
        // Get the parent .thing element
        var parentThing = thingElement.parentElement.closest('.thing');

        if (parentThing) {
          var replyTo;
          var replyToTextDiv = parentThing.querySelector('.usertext-body.may-blank-within.md-container');
          // Check if the element exists
          if (replyToTextDiv) {
            // Select the <p> element inside the div
            var replyToparagraph = replyToTextDiv.querySelector('.md');
            if (replyToparagraph) {
              replyTo = replyToparagraph.textContent;
            }
            // Get the text content inside the <p> element
            // var replyTo = replyToparagraph.textContent;

            // Log the text content to the console or use it elsewhere
            //console.log(commentContent);
          }

          console.log('This comment is a child comment of another comment', parentThing);
          reviseORdeleteComment(thingElement, "commentlevel", commentContent, replyTo);

        } else {
          reviseORdeleteComment(thingElement, "postlevel", commentContent)
          console.log('This comment is not a child comment of another comment');
        }
      }
      else {
        console.log("cannot find it ");
      }
    });
  }
  else {
    console.log("No elements found for the specified username.");
  }
}

function reviseORdeleteComment(parentDiv, commentType, replyContent, replyTo) {
  // Select the <a> element with the class 'yes'
  var deleteFrom = parentDiv.querySelector('form.toggle.del-button');
  if (deleteFrom) {
    var yesLink = deleteFrom.querySelector('a.yes');
    console.log("reviseORdeleteComment is called");

    // Check if the element exists
    if (yesLink) {
      console.log("Found the 'yes' link:", yesLink); // Add a log here to verify

      // Add an event listener to the element
      yesLink.addEventListener('click', function (event) {

        console.log('Custom Yes link clicked');

        // Check commentType and call appropriate function
        if (commentType === "postlevel") {
          console.log("Deleting reply on real post");
          sendDeleteUserReplyRealPostMessage(window.location.href, replyContent);
        }
        else if (commentType === "commentlevel") {
          console.log("Deleting reply on real comment", replyTo, window.location.href, replyContent);
          sendDeleteUserReplyRealCommentMessage(replyTo, window.location.href, replyContent);
        }

        // Let the original inline event handler run as well (no preventDefault or stopPropagation)
      });
    } else {
      console.error("Cannot find the 'yes' button");

    }
    var editUserTextLink = parentDiv.querySelector('li > a.edit-usertext');

    // Check if the element exists
    if (editUserTextLink) {
      console.log("Element found:", editUserTextLink);

      // Add an event listener to the element
      editUserTextLink.addEventListener('click', function (event) {
        var saveButtonInReplyForm = parentDiv.querySelector('button.save');
        saveButtonInReplyForm.addEventListener('click', function (event) {
          var textareaInReplyForm = parentDiv.querySelector('textarea[name="text"]');
          if (textareaInReplyForm && textareaInReplyForm.value !== null) {
            var enteredTextInReplyForm = textareaInReplyForm.value;

            if (commentType === "postlevel") {
              console.log("Deleting reply on real post");
              sendDeleteUserReplyRealPostMessage(window.location.href, replyContent);
              sendAddUserReplyRealPostMessage(enteredTextInReplyForm, window.location.href);
            }
            else if (commentType === "commentlevel") {
              console.log("Deleting reply on real comment", replyTo, window.location.href, replyContent);
              sendDeleteUserReplyRealCommentMessage(replyTo, window.location.href, replyContent);
              sendAddUserReplyRealCommentMessage(replyTo, window.location.href, enteredTextInReplyForm);
            }


          }
          console.log('Save button clicked!');
          // Your custom logic here
        });
        console.log('Edit link clicked!');
        // Your custom logic here
      });

    } else {
      console.log("Element not found.");
    }
  }
}

function realButtonVote(parentDiv, voteType, comment, url) {
  var upvoteButton = parentDiv.querySelector('[aria-label="upvote"]');
  var downvoteButton = parentDiv.querySelector('[aria-label="downvote"]');
  if (upvoteButton && downvoteButton) {
    // Upvote button functionality
    upvoteButton.setAttribute('outer-limit-monitored', 'true');
    downvoteButton.setAttribute('outer-limit-monitored', 'true');

    upvoteButton.addEventListener('click', function (event) {

      if (upvoteButton.classList.contains('upmod')) {

        sendDeleteRealVoteMessage(voteType, comment, url);
      } else {
        // If downvote was previously clicked, reset it
        if (downvoteButton.classList.contains('downmod')) {

          sendDeleteRealVoteMessage(voteType, comment, url);
        }
        sendRealVoteMessage("upvote", voteType, comment, url);
      }
    }, true);  // Using capture phase to prevent Reddit's listener

    // Downvote button functionality
    downvoteButton.addEventListener('click', function (event) {

      if (downvoteButton.classList.contains('downmod')) {
        // Undo the downvote (reset to unvoted state)

        console.log('Downvote undone');
        sendDeleteRealVoteMessage(voteType, comment, url);
      } else {
        // If upvote was previously clicked, reset it
        if (upvoteButton.classList.contains('upmod')) {

          sendDeleteRealVoteMessage(voteType, comment, url);
        }
        console.log('Downvoted');
        sendRealVoteMessage("downvote", voteType, comment, url);
      }
    }, true);
  }
}

// fake comments insertation insert 
function insertFakeComments(postElement, fakeComments, fakePostID) {

  fakeComments.forEach(comment => {

    var commentHTML = `<div class="thing   comment noncollapsed"  onclick="click_thing(this)"  data-type="comment" data-gildings="0" data-subreddit="aww" data-subreddit-prefixed="r/aww" data-subreddit-fullname="t5_2qh1o" data-subreddit-type="public" data-author="${comment.user_name}"  data-replies="0" data-permalink="/r/aww/comments/1c1eyde/full_aussie_wrasslin_with_mini_corgiaussie/kz2wn14/"><p class="parent"><a name="kz2wn14"></a></p><div class="midcol unvoted"><div class="arrow up login-required access-required" data-event-action="upvote" role="button" aria-label="upvote" tabindex="0"></div><div class="arrow down login-required access-required" data-event-action="downvote" role="button" aria-label="downvote" tabindex="0"></div></div><div class="entry unvoted"><p class="tagline"><a href="javascript:void(0)" class="expand" onclick="return togglecomment(this)">[–]</a><a href="https://old.reddit.com/user/${comment.user_name}" class="author may-blank ">${comment.user_name}</a><span class="userattrs"></span> <span class="score dislikes" title="0">${parseInt(comment.likes) + 1} points</span><span class="score unvoted" title="1">${comment.likes} point</span><span class="score likes" title="2">${parseInt(comment.likes) + 1} points</span> <time title="Thu Apr 11 14:24:23 2024 UTC" datetime="2024-04-11T14:24:23+00:00" class="">${comment.time}</time>&nbsp;<a href="javascript:void(0)" class="numchildren" onclick="return togglecomment(this)">(0 children)</a></p><form action="#" class="usertext warn-on-unload" onsubmit="return post_form(this, 'editusertext')" ><input type="hidden" name="thing_id" ><div class="usertext-body may-blank-within md-container "><div class="md"><p>${comment.content}</p></div></div></form><ul class="flat-list buttons"><li class="first"><a href="https://old.reddit.com/r/aww/comments/1c1eyde/full_aussie_wrasslin_with_mini_corgiaussie/" data-event-action="permalink" class="bylink" rel="nofollow">permalink</a></li><li><a href="javascript:void(0)" data-comment="/r/aww/comments/1c1eyde/full_aussie_wrasslin_with_mini_corgiaussie/kz2wn14/" data-media="www.redditmedia.com" data-link="/r/aww/comments/1c1eyde/full_aussie_wrasslin_with_mini_corgiaussie/" data-root="true" data-title="Full Aussie wrasslin with mini Corgi/Aussie" class="embed-comment">embed</a></li><li class="comment-save-button save-button login-required"><a href="javascript:void(0)">save</a></li><li class="report-button login-required"><a href="javascript:void(0)" class="reportbtn access-required" data-event-action="report">report</a></li><li class="reply-button login-required"><a>reply</a></li></ul><div class="reportform "></div></div><div class="child"></div><div class="clearleft"></div></div><div class="clearleft"></div>`

    var range = document.createRange();
    var commentElement = range.createContextualFragment(commentHTML).firstChild;
    //postElement.insertAdjacentHTML('beforeend', commentHTML);
    for (var key in comment) {
      // Check if the key has any hidden characters related to "fake_comment_id"
      if (key.includes("fake_comment_id")) {
        comment.fake_comment_id = comment[key]; // Assign to a new key with a clean name
        delete comment[key]; // Clean up the old key
      }
    }

    // Ensure that fake_comment_id is available and log it
    console.log("Fake Comment ID:", comment.fake_comment_id);
    var authorElement = commentElement.querySelector('.author');
    authorElement.addEventListener('mouseover', function () {
      // Code to execute when the mouse hovers over the element
      console.log('Mouse is hovering over the author element');
      event.preventDefault();  // Prevent Reddit's action
      event.stopPropagation();
    });
    insertCommentFormORReplyFakeComment(commentElement, comment.fake_comment_id, fakePostID);
    applyUserVoteOnElement(commentElement, getUserVoteOnFakeComment, comment.fake_comment_id);
    handleVoteButtons(commentElement, "fakecomment", comment.fake_comment_id, window.location.href);
    postElement.appendChild(commentElement);
  });

}




/// send user actions to backgroun then send to database section
function send_voteComment_to_background(action, comment, post) {
  chrome.runtime.sendMessage({
    message: "voteComment",
    data: {
      action: action,
      comment: comment,
      post: post
    }
  });
}

function send_replyPost_to_background(content, post) {
  chrome.runtime.sendMessage({
    message: "replyPost",
    data: {
      content: content,
      post: post
    }
  });
}

function send_votePost_to_background(action, post) {
  chrome.runtime.sendMessage({
    message: "votePost",
    data: {
      action: action,
      post: post
    }
  });
}

function send_replyComment_to_background(content, comment, post) {
  chrome.runtime.sendMessage({
    message: "replyComment",
    data: {
      content: content,
      comment: comment,
      post: post
    }
  });
}

function send_uservotefake_to_background(useraction, fakecontent) {
  chrome.runtime.sendMessage({
    message: "updateuserVotefakecontent",
    data: {
      useraction: useraction,
      fakecontent: fakecontent,
    }
  });
}

function delete_uservotefake_to_background(fakecontent) {
  chrome.runtime.sendMessage({
    message: "deleteuserVotefakecontent",
    data: {
      fakecontent: fakecontent,
    }
  });
}




/// send of the section 

// alert user the experiment has ended 
function end_exp_alert() {
  alert("The experiment has ended. Please check the chrome extension for next step.");
}
// listen to end of experiment from backend js 
chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
  if (request.message === "exp_ended") {
    // handle the message
    end_exp_alert();
    console.log("experiment has ended from content js");
  }
});

// dont need user id anymore
/* function get_user_id_from_background() {
  // Send a message to the background script to request the user ID
  chrome.runtime.sendMessage({ message: "get_user_id_frombackground" }, function(response) {
    // Handle the response from the background script
    if (response && response.userId) {
      // Do something with the user ID
      var uid = response.userId;
      console.log(`Content received user ID from background: ${uid}`);
      return uid;
    } else {
      console.log("User ID not found");
      return null;
    }
  });
}
 */


// set up user makes  new comments 
function monitor_new_comment(replyPostButtonSelector, replyCommentSelector, filterText, commentSelector) {
  //_3MknXZVbkWU8JL9XGlzASi
  //console.log("monitor_new_comment is called");
  // reply to the post 
  //const div = document.querySelector('._3MknXZVbkWU8JL9XGlzASi');
  var firstSubmitButtons = document.querySelector(replyPostButtonSelector);
  //console.log(firstSubmitButtons);
  //console.log(firstSubmitButtons.hasEventListener);
  //console.log("top submit comments: " ,firstSubmitButtons);
  //const firstSubmitButtons = document.querySelector('button[type="submit"]');
  //console.log(commentSubmitButton);

  if (firstSubmitButtons && !firstSubmitButtons.hasEventListener & !firstSubmitButtons.hasAttribute('data-listening')) {
    firstSubmitButtons.addEventListener('click', function (event) {
      console.log('Comment submit button clicked!');
      var currentNode = firstSubmitButtons;

      // Go up the tree until a node has innerText

      while (currentNode) {
        const childWithTextbox = currentNode.querySelector('[role="textbox"]');
        if (childWithTextbox) {
          // Found the nearest ancestor with a child having role="textbox"
          console.log('Nearest ancestor with textbox:', currentNode);
          break;
        }
        currentNode = currentNode.parentNode;
      }

      if (!currentNode) {
        console.log('No ancestor with textbox found');
      }
      //console.log('My span: 2', currentNode.innerText);
      //currentNode.innerText = '';

      var spanElement = currentNode.querySelector("span[data-text='true']");
      console.log('My span: 2', spanElement.textContent);

      //if URL does not follow pattern https://old.reddit.com/r/aww/
      var currentURL = window.location.href;

      // Check if the URL contains the specific substring
      if (currentURL.includes('https://preview.redd.it/')) {
        console.log('URL indicates a fake post not triggering send_replyPost_to_background');
      } else {
        console.log('URL does not indicate a fake post trigger _replyPost_to_background');
        send_replyPost_to_background(spanElement.textContent, window.location.href);
      }

      spanElement.textContent = '';
    });
    // Set flag to indicate that event listener has been added
    firstSubmitButtons.hasEventListener = true;
  }
  //user reply new comments to the comments in the post 

  const replyButtons = selectButtonsByClassAndInnerText(replyCommentSelector, filterText);


  replyButtons.forEach(replyButton => {
    if (replyButton && !replyButton.hasEventListener) {
      //const listeners = getEventListeners(replyButton);

      //console.log(listeners);

      replyButton.addEventListener('click', function (event) {
        console.log('Reply button clicked!');
        const formContainer = replyButton.parentNode.parentNode.parentNode;
        const observer = new MutationObserver((mutationsList, observer) => {
          for (const mutation of mutationsList) {
            if (mutation.type === 'childList') {
              // The DOM inside formContainer has changed
              //console.log('DOM inside formContainer has changed');
              const commentSubmitButtons = formContainer.querySelector('button[type="submit"]');
              //console.log(commentSubmitButton);
              if (commentSubmitButtons && !commentSubmitButtons.hasEventListener) {
                commentSubmitButtons.addEventListener('click', function (event) {
                  console.log('Comment submit button clicked!');
                  var currentNode = commentSubmitButtons;

                  // Go up the tree until a node has innerText
                  console.log(currentNode);
                  while (currentNode) {
                    const childWithTextbox = currentNode.querySelector('[role="textbox"]');
                    if (childWithTextbox) {
                      // Found the nearest ancestor with a child having role="textbox"
                      console.log('Nearest ancestor with textbox:', currentNode);
                      break;
                    }
                    currentNode = currentNode.parentNode;
                  }
                  var spanElement = currentNode.querySelector("span[data-text='true']");
                  //console.log('My span: 1', spanElement.textContent);


                  var current = commentSubmitButtons;
                  while (current && !current.querySelector(commentSelector)) {
                    current = current.parentNode;
                  }

                  if (current != undefined && current != null) {
                    current = current.querySelector(commentSelector);
                    const reply_to = current.innerText;
                    const post_link = window.location.href;
                    //console.log('My span: 1', spanElement.textContent);
                    send_replyComment_to_background(spanElement.textContent, reply_to, window.location.href);
                  }
                });
                // Set flag to indicate that event listener has been added
                commentSubmitButtons.hasEventListener = true;
              }
            }
          }
        });

        // Start observing the formContainer for changes
        observer.observe(formContainer, { childList: true, subtree: true });
      });
      replyButton.hasEventListener = true;
    }
  });
}


function selectButtonsByClassAndInnerText(className, innerText) {
  const allButtons = document.querySelectorAll(`button.${className}`);
  const replyButtons = Array.from(allButtons).filter(button => button.innerText === innerText);
  return replyButtons;
}



chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
  if (request.message === "newcomments_buttons") {
    monitor_new_comment(replyPostButtonSelector, replyCommentSelector, filterText, commentSelector);
    console.log("Received message from the background script for listen new comments:", request.message);

  }
});

function user_active_time() {
  var idleTime = 0;
  var activetime = 0;
  var lastactivetime = 0;
  console.log("user active time is inserted");
  document.addEventListener("mousemove", function (e) {
    idleTime = 0;
  });
  document.addEventListener("keypress", function (e) {
    idleTime = 0;
  });
  document.addEventListener("click", function (e) {
    idleTime = 0;
  });

  document.addEventListener('scroll', function () {
    idleTime = 0;
  });

  let idleInterval = setInterval(timerIncrement, 1000);

  function timerIncrement() {
    idleTime = idleTime + 1;
    if (idleTime > 5) {
      console.log("The user is inactive");
      if (lastactivetime !== 0) {
        activetime = Date.now() - lastactivetime;
        lastactivetime = 0;
        // send active time to background script
        try {
          if (chrome.runtime.id) {
            chrome.runtime.sendMessage({
              message: "active_time",
              activeTime: activetime
            });
          }
        } catch (error) {
          console.error(error);
        }

        console.log(activetime);
      }
    } else {
      if (lastactivetime === 0) {
        lastactivetime = Date.now();
      }
      console.log("The user is active");
    }
  }
}

function combinedFunction() {
  var siteTable = document.querySelector('#siteTable');

  // Function to update the links of each post
  function updateLinks(child) {
    if (!child.classList.contains('clearleft')) {
      var thumbnailLink = child.querySelector('a.thumbnail');
      var titleLink = child.querySelector('p.title a');
      var commentsLink = child.querySelector('a.bylink.comments')?.getAttribute('href');

      if (commentsLink) {
        // Update thumbnail link
        if (thumbnailLink) {
          thumbnailLink.addEventListener('click', function () {
            thumbnailLink.setAttribute('href', commentsLink);
            console.log('Updated thumbnail link on click:', thumbnailLink.getAttribute('href'));
            window.location.href = commentsLink; // Redirect after setting the link
          });

          thumbnailLink.addEventListener('mouseover', function () {
            thumbnailLink.setAttribute('href', commentsLink);
            console.log('Updated thumbnail link on hover:', thumbnailLink.getAttribute('href'));
          });
        }

        // Update title link
        if (titleLink) {
          titleLink.addEventListener('click', function () {
            titleLink.setAttribute('href', commentsLink);
            console.log('Updated title link on click:', titleLink.getAttribute('href'));
            window.location.href = commentsLink; // Redirect after setting the link
          });

          titleLink.addEventListener('mouseover', function () {
            titleLink.setAttribute('href', commentsLink);
            console.log('Updated title link on hover:', titleLink.getAttribute('href'));
          });
        }
      } else {
        console.log('Comments link not found.');
      }
    }
  }

  // Function to handle when elements intersect (come into or out of view)
  function handleIntersect(entries, observer) {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        console.log(`Element has been viewed:`, entry.target);
        var fetchUrl = `https://outer.socialsandbox.xyz/api/getfakepost`;

        var commentLink = entry.target.querySelector('li.first a');
        var dataRank = entry.target.getAttribute('data-rank');
        var commentUrl = commentLink.getAttribute('href');

        console.log("Comment URL:", commentUrl);

        fetch(fetchUrl)
          .then(response => {
            if (!response.ok) {
              throw new Error(`HTTP error! status: ${response.status}`);
            }
            return response.json();
          })
          .then(data => {
            if (Array.isArray(data)) {
              if (data.length === 0) {
                console.log("No fake posts found.");
              } else {
                var Isfakepost = false;
                data.forEach(fakePost => {
                  const { fakepost_url, fakepost_index } = fakePost;
                  if (commentUrl === fakepost_url) {
                    sendUpdateViewedPostToBackground(fakepost_index);
                    Isfakepost = true;
                  }
                  if (fakepost_index == dataRank) {

                    Isfakepost = true;
                  }
                });
                if (!Isfakepost) {
                  sendUpdateViewedPostToBackground(commentUrl);
                }
              }
            }
          })
          .catch(error => {
            console.error("Failed to fetch fake post:", error);
          });
      }
    });
  }

  // Set up observer options for IntersectionObserver
  const options = {
    root: null,
    rootMargin: '0px',
    threshold: 1 // 100% of the element needs to be visible to trigger
  };

  // Create a new IntersectionObserver with the handleIntersect function as callback
  const intersectObserver = new IntersectionObserver(handleIntersect, options);

  // Function to observe new elements
  function observeNewElements(newNode) {
    if (newNode.classList && newNode.classList.contains('thing') && !newNode.classList.contains('clearleft')) {
      intersectObserver.observe(newNode); // Start observing the new element
      updateLinks(newNode); // Update links for new elements
    }
  }

  // Update and observe all existing posts
  siteTable.querySelectorAll('.thing').forEach(child => {

    if (!child.classList.contains('clearleft')) {
      intersectObserver.observe(child); // Start observing the child element
      updateLinks(child); // Update links for existing elements
    }
  });

  // MutationObserver to monitor changes to the DOM and handle new/removed elements
  const mutationObserver = new MutationObserver(mutations => {
    mutations.forEach(mutation => {
      mutation.addedNodes.forEach(node => {
        if (node.nodeType === Node.ELEMENT_NODE && node.classList.contains('thing')) {
          observeNewElements(node); // Observe and update links for newly added nodes
        }
      });

      mutation.removedNodes.forEach(removedNode => {
        if (removedNode.nodeType === Node.ELEMENT_NODE && removedNode.classList.contains('thing')) {
          intersectObserver.unobserve(removedNode); // Stop observing removed elements
          console.log("Stopped observing removed element:", removedNode);
        }
      });
    });
  });

  // Start observing the siteTable for added or removed elements
  mutationObserver.observe(siteTable, {
    childList: true,
    subtree: true // Observe all children, not just immediate
  });
}



function sendUpdateViewedPostToBackground(post_url) {
  chrome.runtime.sendMessage({
    message: "updateViewedPost",
    data: {
      post_url: post_url
    }
  });
}


// create fakepost in reddit home page 
function fakepost() {

  // Define the fetch URL without hardcoding it
  var fetchUrl = `https://outer.socialsandbox.xyz/api/getfakepost`; // No URL provided here, this will fetch all posts
  console.log("Fetching URL:", fetchUrl);

  // Fetch the data
  fetch(fetchUrl)
    .then(response => {
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return response.json(); // Parse the JSON from the response
    })
    .then(data => {
      // Check if the result is an array (when no URL is provided)
      if (Array.isArray(data)) {
        if (data.length === 0) {
          console.log("No fake posts found.");
        } else {
          // Loop through all fake posts in the array
          data.forEach(fakePost => {
            console.log("Fake post data:", fakePost);

            // Destructure fake post details
            var {
              _id: id,
              fakepost_id,
              fakepost_url,
              fakepost_index,
              fakepost_title,
              fakepost_content,
              fakepost_image,
              fakepost_likes,
              fakepost_time,
              fakepost_community,
              fakepost_poster,
              fake_comments
            } = fakePost;

            // Handle comments
            var commentsCount = 0;
            if (Array.isArray(fake_comments)) {
              commentsCount = fake_comments.length;
              console.log(`Post titled '${fakepost_title}' has ${commentsCount} comments.`);
            } else {
              console.log(`Post titled '${fakepost_title}' has no comments.`);
            }

            var postFeedDiv = document.querySelector('div.sitetable.linklisting');

            var expandoDiv;
            var fakepostHTML;
            var newElement
            let styleTag = document.querySelector('div.content[role="main"] > style');

            // Check if the style tag exists
            if (styleTag) {
              // Use a regular expression to find the current value of .midcol-spacer width
              let currentWidthMatch = styleTag.innerHTML.match(/\.midcol-spacer\s*{\s*width:\s*(\d+\.?\d*)ex\s*}/);

              if (currentWidthMatch && parseFloat(currentWidthMatch[1]) < 6.1) {
                // If the current width is less than 6.1ex, replace it with 6.1ex
                styleTag.innerHTML = styleTag.innerHTML.replace(/\.midcol-spacer\s*{\s*width:\s*(\d+\.?\d*)ex\s*}/, '.midcol-spacer { width: 6.1ex }');
                console.log('midcol-spacer width changed to 6.1ex');
              } else {
                console.log('Current width is greater than or equal to 6.1ex, no changes made.');
              }
            } else {
              console.log('Style tag not found');
            }
            if (!fakepost_image) { // Text-only fake post
              // no image fake post , it is only text based
              fakepostHTML = `<div class="thing odd link self" onclick="click_thing(this)" data-fullname="t3_1fsnypx" data-type="link" data-gildings="0" data-whitelist-status="all_ads" data-is-gallery="false" data-author="${fakepost_poster}" data-author-fullname="t2_a1ylwv6td" data-subreddit="books" data-subreddit-prefixed="${fakepost_community}" data-subreddit-fullname="t5_2qh4i" data-subreddit-type="public" data-timestamp="1727672815000" data-url="/r/books/comments/1fsnypx/books_that_make_you_feel_loved_as_if_getting_a/" data-permalink="/r/books/comments/1fsnypx/books_that_make_you_feel_loved_as_if_getting_a/" data-domain="self.books" data-rank="13" data-comments-count="${commentsCount}" data-score="${fakepost_likes}" data-promoted="false" data-nsfw="false" data-spoiler="false" data-oc="false" data-num-crossposts="0" data-context="listing"><p class="parent"></p><span class="rank">${fakepost_index}</span><div class="midcol unvoted"><div class="arrow up login-required access-required" data-event-action="upvote" role="button" aria-label="upvote" tabindex="0"></div><div class="score dislikes" title="604">${parseInt(fakepost_likes) - 1}</div><div class="score unvoted" title="605">${fakepost_likes}</div><div class="score likes" title="606">${parseInt(fakepost_likes) + 1}</div><div class="arrow down login-required access-required" data-event-action="downvote" role="button" aria-label="downvote" tabindex="0"></div></div><a class="thumbnail invisible-when-pinned self may-blank loggedin" data-event-action="thumbnail" href="/r/books/comments/1fsnypx/books_that_make_you_feel_loved_as_if_getting_a/"></a><div class="entry unvoted"><div class="top-matter"><p class="title"><a class="title may-blank loggedin" data-event-action="title" href="/r/books/comments/1fsnypx/books_that_make_you_feel_loved_as_if_getting_a/" tabindex="1">${fakepost_title}</a> </p><div class="expando-button hide-when-pinned selftext collapsed"></div><p class="tagline">submitted <time title="Mon Sep 30 05:06:55 2024 UTC" datetime="2024-09-30T05:06:55+00:00" class="live-timestamp">${fakepost_time}</time> <time class="edited-timestamp" title="last edited 21 hours ago" datetime="2024-09-30T05:12:44+00:00">*</time> by <a href="https://old.reddit.com/user/${fakepost_poster}" class="author may-blank">${fakepost_poster}</a><span class="userattrs"></span> to <a href="https://old.reddit.com/${fakepost_community}/" class="subreddit hover may-blank">${fakepost_community}</a></p><ul class="flat-list buttons"><li class="first"><a href="${fakepost_url}" data-event-action="comments" class="bylink comments may-blank" rel="nofollow">${commentsCount} comments</a></li><li class="share"><a class="post-sharing-button" href="javascript: void 0;">share</a></li><li class="link-save-button save-button login-required"><a href="#">save</a></li><li><form action="/post/hide" method="post" class="state-button hide-button"><span><a href="javascript:void(0)" class="" data-event-action="hide" onclick="change_state(this, \'hide\', hide_thing);">hide</a></span></form></li><li class="report-button login-required"><a href="javascript:void(0)" class="reportbtn access-required" data-event-action="report">report</a></li><li class="crosspost-button"><a class="post-crosspost-button" href="javascript: void 0;" data-crosspost-fullname="t3_1fsnypx">crosspost</a></li></ul><div class="reportform"></div></div><div class="expando" style="display: none;" data-pin-condition="function() {return this.style.display != \'none\';}"></div></div><div class="child"></div><div class="clearleft"></div></div><div class="clearleft"></div>`;
              // Create a temporary element to hold the HTML
              var tempDiv = document.createElement('div');
              tempDiv.innerHTML = fakepostHTML;

              // Extract the new element
              newElement = tempDiv.firstElementChild;
              insertCachedHTMLandMonitorExpandoButton(newElement);
              // Handle the expando logic
              expandoDiv = newElement.querySelector('.expando');
              var textHTML = `<form action="#" class="usertext warn-on-unload" onsubmit="return post_form(this, 'editusertext')" id="form-t3_1fsnypxij2"><input type="hidden" name="thing_id" value="t3_1fsnypx"><div class="usertext-body may-blank-within md-container"><div class="md"></div></div></form>`;
              expandoDiv.insertAdjacentHTML('beforeend', textHTML);
              // Only append text content if available
              if (fakepost_content) {
                var paragraphArray = fakepost_content.split('\n');
                var mdDiv = expandoDiv.querySelector('.md');

                // Append paragraphs to the md div
                paragraphArray.forEach(paragraphText => {
                  var newParagraph = document.createElement('p');
                  newParagraph.textContent = paragraphText.trim();
                  mdDiv.appendChild(newParagraph);
                });



              }

            }
            else { // Image and/or Text fake post
              fakepostHTML = `<div class="thing odd link" onclick="click_thing(this)" data-fullname="t3_1fspb50" data-type="link" data-gildings="0" data-whitelist-status="all_ads" data-is-gallery="false" data-author="gazman70k" data-author-fullname="t2_osz9r6jj" data-subreddit="rolex" data-subreddit-prefixed="${fakepost_community}" data-subreddit-fullname="t5_2qy0y" data-subreddit-type="public" data-timestamp="1727678513000" data-url="" data-permalink="/r/rolex/comments/1fspb50/enjoying_this_5513/" data-domain="i.redd.it" data-rank="38" data-comments-count="4" data-score="56" data-promoted="false" data-nsfw="false" data-spoiler="false" data-oc="false" data-num-crossposts="0" data-context="listing"><p class="parent"></p><span class="rank">${fakepost_index}</span><div class="midcol unvoted"><div class="arrow up login-required access-required" data-event-action="upvote" role="button" aria-label="upvote" tabindex="0"></div><div class="score dislikes" title="55">${parseInt(fakepost_likes) + 1}</div><div class="score unvoted" title="56">${fakepost_likes}</div><div class="score likes" title="57">${parseInt(fakepost_likes) + 1}</div><div class="arrow down login-required access-required" data-event-action="downvote" role="button" aria-label="downvote" tabindex="0"></div></div><a class="thumbnail invisible-when-pinned may-blank loggedin outbound" data-event-action="thumbnail" href="{fakepost_url}" data-href-url="https://i.redd.it/umr0xp767wrd1.jpeg" data-outbound-url="https://i.redd.it/umr0xp767wrd1.jpeg" data-outbound-expiration="0" rel="nofollow ugc"><img src="${fakepost_image}" width="70" height="70" alt=""></a><div class="entry unvoted"><div class="top-matter"><p class="title"><a class="title may-blank loggedin outbound" data-event-action="title" href="${fakepost_url}" tabindex="1" data-href-url="https://i.redd.it/umr0xp767wrd1.jpeg" data-outbound-url="https://i.redd.it/umr0xp767wrd1.jpeg" data-outbound-expiration="0" rel="nofollow ugc">${fakepost_title}</a> <span class="domain">(<a href="/domain/i.redd.it/">i.redd.it</a>)</span></p><div class="expando-button hide-when-pinned video collapsed"></div><p class="tagline ">submitted <time title="Mon Sep 30 06:41:53 2024 UTC" datetime="2024-09-30T06:41:53+00:00" class="live-timestamp">${fakepost_time}</time> by <a href="https://old.reddit.com/user/${fakepost_poster}" class="author may-blank">${fakepost_poster}</a><span class="userattrs"></span> to <a href="https://old.reddit.com/${fakepost_community}/" class="subreddit hover may-blank">${fakepost_community}</a></p><ul class="flat-list buttons"><li class="first"><a href="${fakepost_url}" data-event-action="comments" class="bylink comments may-blank" rel="nofollow">${commentsCount} comments</a></li><li class="share"><a class="post-sharing-button" href="javascript: void 0;">share</a></li><li class="link-save-button save-button login-required"><a href="#">save</a></li><li><form action="/post/hide" method="post" class="state-button hide-button"><span><a href="javascript:void(0)" class="" data-event-action="hide" onclick="change_state(this, \'hide\', hide_thing);">hide</a></span></form></li><li class="report-button login-required"><a href="javascript:void(0)" class="reportbtn access-required" data-event-action="report">report</a></li><li class="crosspost-button"><a class="post-crosspost-button" href="javascript: void 0;" data-crosspost-fullname="t3_1fspb50">crosspost</a></li></ul><div class="reportform"></div></div><div class="expando" style="display: none;" data-cachedhtml=\'<div class="media-preview" style="max-width: 576px"><div class="media-preview-content"><a href="${fakepost_url}" class="may-blank post-link"><img class="preview" src="${fakepost_image}" width="576" height="768"></a></div></div><div class="usertext usertext-body"><div class="md"></div></div>\'></div></div><div class="child"></div><div class="clearleft"></div></div><div class="clearleft"></div><div class="clearleft"></div>`;
              // Create a temporary element to hold the HTML
              var tempDiv = document.createElement('div');
              tempDiv.innerHTML = fakepostHTML;

              // Extract the new element
              newElement = tempDiv.firstElementChild;
              var expandoDiv = newElement.querySelector('.expando');

              insertCachedHTMLandMonitorExpandoButton(newElement);
              // Only append text content if available
              if (fakepost_content) {
                var paragraphArray = fakepost_content.split('\n');
                var mdDiv = newElement.querySelector('.md');

                // Append paragraphs to the md div
                paragraphArray.forEach(paragraphText => {
                  var newParagraph = document.createElement('p');
                  newParagraph.textContent = paragraphText.trim();
                  mdDiv.appendChild(newParagraph);
                });
              }
              else {
                console.log("fakepost_content is null, proceeding to remove the usertext-body element.");

                // Find the element with the class "usertext usertext-body"
                var userTextBody = newElement.querySelector('.usertext.usertext-body');

                // Check if the element exists
                if (userTextBody) {
                  // Remove the element from the DOM
                  userTextBody.remove();
                  console.log('Removed element with class "usertext usertext-body".', userTextBody);
                } else {
                  console.log('Element with class "usertext usertext-body" not found.');
                }
              }



            }
            var authorElement = newElement.querySelector('.author');
            authorElement.addEventListener('mouseover', function () {
              // Code to execute when the mouse hovers over the element
              console.log('Mouse is hovering over the author element');
              event.preventDefault();  // Prevent Reddit's action
              event.stopPropagation();
            });
            applyUserVoteOnElement(newElement, getUserVoteOnFakePost, fakepost_url);
            handleVoteButtons(newElement, "fakepost", "", fakepost_url);
            for (var i = 0; i < postFeedDiv.children.length; i++) {
              var rankElement = postFeedDiv.children[i].querySelector('span.rank');

              // Log the rankElement to verify its content
              if (rankElement) {
                console.log("Rank found:", rankElement.textContent);

                // Check if rankElement.textContent matches fakepost_index
                if (rankElement.textContent === fakepost_index) {
                  console.log("Match found at index", i, "with rank:", fakepost_index);
                  var oldChild = postFeedDiv.children[i];


                  // replace the child element
                  postFeedDiv.replaceChild(newElement, oldChild);


                  console.log("Replaced element with rank:", fakepost_index);

                  // Break the loop once a match is found
                  break;
                }
              } else {
                console.log("No rank element found in child", i);
              }
            }

            // Optionally, render the fake post details on the page
            // document.querySelector("#post-details").innerHTML += `<p>${fakepost_title}</p>`;
          });
        }
      }
    })
    .catch(error => {
      console.error("Failed to fetch fake post:", error);
      // Optionally, handle the error (e.g., show an error message to the user)
      document.querySelector("#post-status").textContent = "Failed to fetch the fake post.";
    });


}


function removeDivs() {
  const commentDivs = document.querySelectorAll('div.Comment');

  commentDivs[1].remove();
  commentDivs[3].remove();
  console.log(`Length of commentDivs: ${commentDivs.length}`);

  const targetDivs = document.querySelectorAll('div._3_mqV5-KnILOxl1TvgYtCk');
  targetDivs.forEach(div => div.remove());
}

function changecomment_content(cd, username, content) {
  var pElement = cd.querySelector('p');
  var aElement = cd.querySelector('a.wM6scouPXXsFDSZmZPHRo');

  // Change the content of the <p> element
  aElement.textContent = username;

  // Change the content of the <a> element
  pElement.textContent = content;


}

////  dan 
var surveyQuestionsCoutner = 0,
  surveyPopup,
  surveyInterval;
let q1selected = 0,
  q2selected = 0;


var surveyQuestions = [
  [`1 is bad, 10 is good (i.e., "How happy are you feeling today?")`,
    `How likely are you to do this experiment again (i.e. "1 least likely and
        10 most likely")`
  ],
  [`To what extent are you feeling tense while using the Reddit interface?`,
    `To what extent are you disinterested in the content you are viewing?`
  ],
  [`How captivating do you find the content you are viewing?`,
    `How valuable do you find the information presented in the content you are viewing?`
  ],
  [`To what extent are you invested in the content you are viewing?`,
    `How joyful do you feel about the content you are viewing?`
  ],
  [`To what extent are you annoyed while using the Reddit interface?`,
    `How comprehensible do you find the content you are viewing?`
  ],
];

function getSurveyHTML() {
  return `
<div id='midpop' class="container">
<div class="row">
    <div class="col-xs-12">
        <p class="page-header">${surveyQuestions[surveyQuestionsCoutner][0]}</p>
        <div class="chart-scale">
            <button class="q1 btn btn-scale btn-scale-desc-1">1</button>
            <button class="q1 btn btn-scale btn-scale-desc-2">2</button>
            <button class="q1 btn btn-scale btn-scale-desc-3">3</button>
            <button class="q1 btn btn-scale btn-scale-desc-4">4</button>
            <button class="q1 btn btn-scale btn-scale-desc-5">5</button>
            <button class="q1 btn btn-scale btn-scale-desc-6">6</button>
            <button class="q1 btn btn-scale btn-scale-desc-7">7</button>
            <button class="q1 btn btn-scale btn-scale-desc-8">8</button>
            <button class="q1 btn btn-scale btn-scale-desc-9">9</button>
            <button class="q1 btn btn-scale btn-scale-desc-10">10</button>
            <hr>
            </div>

            <p class="page-header">${surveyQuestions[surveyQuestionsCoutner][1]}</p>
            <div class="chart-scale">
                <button class="q2 btn btn-scale btn-scale-desc-1">1</button>
                <button class="q2 btn btn-scale btn-scale-desc-2">2</button>
                <button class="q2 btn btn-scale btn-scale-desc-3">3</button>
                <button class="q2 btn btn-scale btn-scale-desc-4">4</button>
                <button class="q2 btn btn-scale btn-scale-desc-5">5</button>
                <button class="q2 btn btn-scale btn-scale-desc-6">6</button>
                <button class="q2 btn btn-scale btn-scale-desc-7">7</button>
                <button class="q2 btn btn-scale btn-scale-desc-8">8</button>
                <button class="q2 btn btn-scale btn-scale-desc-9">9</button>
                <button class="q2 btn btn-scale btn-scale-desc-10">10</button>
            </div>

    </div>

    <button type="submit" id="midpop-submit" class="btn btn-success" onsumbit="">Submit</button>
</div>
</div>
`
}

function surveyPopupShow() {
  surveyPopup = new smq.Popup({
    title: 'Reddit Extension Survey',
    innerHtml: getSurveyHTML()
  });
  surveyPopup.show();
}



function initSurveyQ() {
  var arr = document.querySelectorAll(".btn-scale");

  for (var i = 0; i < arr.length; i++) {
    arr[i].addEventListener("click", surveyButtonSelect);
  }
}

function surveyButtonSelect(event) {
  var array = event.target.classList;

  for (var i = 0; i < array.length; i++) {
    if (array[i] == "q1") {
      if (q1selected != 0) {
        // remove highlight class from previously selected button
        document.querySelector(".q1.btn-scale-desc-" + q1selected).classList.remove("highlight");
      }
      q1selected = event.target.innerHTML;
      // add highlight class to selected button
      event.target.classList.add("highlight");
    } else if (array[i] == "q2") {
      if (q2selected != 0) {
        // remove highlight class from previously selected button
        document.querySelector(".q2.btn-scale-desc-" + q2selected).classList.remove("highlight");
      }
      q2selected = event.target.innerHTML;
      // add highlight class to selected button
      event.target.classList.add("highlight");
    }
  }
}


function surveySubmit() {


  var surveyObj = {
    q1: {
      q: surveyQuestions[surveyQuestionsCoutner][0],
      a: q1selected,
    },
    q2: {
      q: surveyQuestions[surveyQuestionsCoutner][1],
      a: q2selected,
    }
  }

  chrome.runtime.sendMessage({
    message: "send_question_data_from_timerjs",
    data: surveyObj
  });

  surveyPopup.close();
  console.log(surveyObj);
  /*chrome.runtime.sendMessage({
      message: "send_question_data_from_timerjs",
      q1selected: q1selected,
      q2selected: q2selected
  });
  chrome.runtime.sendMessage({
      message: "question_submitted"
  });*/
}

function startSurveyPopup() {
  surveyPopupShow();
  initSurveyQ();
  document.querySelector("#midpop-submit").addEventListener("click", surveySubmit);
  surveyQuestionsCoutner += 1;
}

/* chrome.storage.local.get('fakepost_fullUrl', (result) => {
  console.log('Retrieved fakepost_fullUrl value:', result.fakepost_fullUrl);
});

function onFakePostPageLoaded() {
  
  if (window.location.href === fakepost_fullUrl) {
    // Perform your action here when the fake post URL is fully loaded
    console.log('Fake post URL loaded:', fakepost_fullUrl);
  }
}

// Listen for the load event to check if the URL has changed and is fully loaded
window.addEventListener('load', onFakePostPageLoaded);

// Check the initial URL when the content script is loaded
onFakePostPageLoaded(); */






var smq = {

  Popup: function (config) {

    this.conf = config || {};

    this.init = function () {
      var conf = config || {};
      //if there are <smq-popup>, remove nodes
      var existingNodes = document.getElementsByTagName("smq-popup");
      if (existingNodes && existingNodes.length > 0) {
        for (var i = 0; i < existingNodes.length; i++) {
          document.body.removeChild(existingNodes[i]);
        }
      }

      //create popup nodes
      this.nodePopup = document.createElement("smq-popup");
      this.nodePopup.innerHTML = '<div class="window"><header class="api-header"><h1 class="api-title"></h1></header><div class="api-content"></div></div>';
      this.nodePopup.getElementsByClassName("api-title")[0].innerHTML = this.conf.title || "";
      this.nodePopup.getElementsByClassName("api-content")[0].innerHTML = this.conf.innerHtml || "";



    };

    this.show = function () {
      //insert nodePopup in body
      document.body.appendChild(this.nodePopup);
    };

    this.close = function () {
      this.nodePopup ? document.body.removeChild(this.nodePopup) : null;
      this.nodePopup = undefined;
    };

    this.init(config);

  }
};

// Daniel's work lets comment it out for now 
/* chrome.tabs.insertCSS(tabId, {
  file: 'popup.css'
}); */

/// this is for reddit post page fake post 
function changeRealPostPage() {

  // Get the current page URL
  //var currentURL = window.location.href;
  var fetchUrl = `https://outer.socialsandbox.xyz/api/getfakepost?fakepost_url=${window.location.href}`;
  console.log("Fetching URL:", fetchUrl);
  // Modify the fetch request to include the current URL in the API call
  fetch(fetchUrl)
    .then(response => {
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return response.json(); // Parse the JSON from the response
    })
    .then(data => {
      // Check if the fake post was found
      if (Object.keys(data).length === 0) {
        console.log("This is a real post.");
        // Display a message on the page indicating that this is a real post
        document.querySelector("#post-status").textContent = "This is a real post.";
      } else {
        // Handle the fake post data (fake post and comments)
        console.log("Fake post data:", data);


        var {
          _id: id,
          fakepost_id,
          fakepost_url,
          fakepost_index,
          fakepost_title,
          fakepost_content,
          fakepost_image,
          fakepost_likes,
          fakepost_time,
          fakepost_community,
          fakepost_poster,
          fake_comments
        } = data;
        var commentsCount = 0;
        if (Array.isArray(fake_comments)) {
          commentsCount = fake_comments.length;  // Get the length of the comments array
        } else {
          console.log("No comments available.");
        }

        monitorUserReplyToFakePost(fakepost_id);
        // Replace its inner HTML
        var parentDiv = document.querySelector('div.sitetable.linklisting');

        // Check if the parent div was found
        if (parentDiv) {


          insertCachedHTMLandMonitorExpandoButton(parentDiv);


          updatePostContent(parentDiv, fakepost_image, fakepost_content);





          // Replace with your dynamic value

          // Select the <a> element with the class "author"
          var authorElement = parentDiv.querySelector('p.tagline a.author');

          // Check if the author element was found
          if (authorElement) {
            // Change the displayed text (author's name) to the value of newUsername
            authorElement.textContent = fakepost_poster;

            // Change the href attribute (author's URL) using the value of newUsername
            authorElement.href = `https://old.reddit.com/user/${fakepost_poster}`;
            authorElement.addEventListener('mouseover', function () {
              // Code to execute when the mouse hovers over the element
              console.log('Mouse is hovering over the author element');
              event.preventDefault();  // Prevent Reddit's action
              event.stopPropagation();
            });

            console.log('Author name and URL updated to:', authorElement.textContent, authorElement.href);
          } else {
            console.log('No <a> element with class "author" found');
          }


          // Select the <a> element with the class "thumbnail invisible-when-pinned may-blank loggedin outbound"
          var anchorElement = parentDiv.querySelector('a.thumbnail.invisible-when-pinned.may-blank.loggedin.outbound');

          // Check if the anchor element was found
          if (anchorElement) {
            // Find the img element inside the <a> tag
            var imgElement = anchorElement.querySelector('img');

            // Check if the img element exists
            if (imgElement) {
              // Change the src attribute
              imgElement.src = fakepost_image; // Replace with your new image URL
              console.log('Image src changed to:', imgElement.src);
            } else {
              console.log('No img element found inside the <a> tag');
            }
          } else {
            console.log('No <a> element found with the specified class');
          }
          // Select the <a> element with the class "title may-blank loggedin outbound"
          var titleofcurrentpost = parentDiv.querySelector('a.title.may-blank');

          // Check if the anchor element was found
          if (titleofcurrentpost) {
            // Change the inner text of the anchor element
            titleofcurrentpost.textContent = fakepost_title; // Replace with the new text you want
            console.log('Text content changed to:', titleofcurrentpost.textContent);
          } else {
            console.log('No <a> element found with the specified class');
          }

          // Select the <time> element within the <p> with the class "tagline"
          var timeElement = parentDiv.querySelector('p.tagline time');

          // Check if the time element was found
          if (timeElement) {
            // Change the text inside the time element
            timeElement.textContent = fakepost_time; // Replace with the new time you want

            console.log('Time element updated to:', timeElement.textContent);
          } else {
            console.log('No <time> element found');
          }
          // Find the div with class "score dislikes" inside the parent div
          var dislikesDiv = parentDiv.querySelector('div.score.dislikes');

          // Find the div with class "score likes" inside the parent div
          var likesDiv = parentDiv.querySelector('div.score.likes');

          // Find the div with class "score unvoted" inside the parent div
          var unvotedDiv = parentDiv.querySelector('div.score.unvoted');

          // Check if the dislikes div was found and modify it
          if (dislikesDiv) {
            dislikesDiv.textContent = parseInt(fakepost_likes) - 1; // Replace with the new value

            console.log('Dislikes score changed to:', dislikesDiv.textContent);
          } else {
            console.log('No div with class "score dislikes" found');
          }

          // Check if the likes div was found and modify it
          if (likesDiv) {
            likesDiv.textContent = parseInt(fakepost_likes) + 1; // Replace with the new value

            console.log('Likes score changed to:', likesDiv.textContent);
          } else {
            console.log('No div with class "score likes" found');
          }

          // Check if the unvoted div was found and modify it
          if (unvotedDiv) {
            unvotedDiv.textContent = fakepost_likes; // Replace with the new value

            console.log('Unvoted score changed to:', unvotedDiv.textContent);
          } else {
            console.log('No div with class "score unvoted" found');
          }

          // Select the upvote, downvote, and score elements then stop it from default action 
          applyUserVoteOnElement(parentDiv, getUserVoteOnFakePost, window.location.href);
          // Check if the elements are found
          handleVoteButtons(parentDiv, "fakepost", "", window.location.href);
          // change number of comments 
          // Select the <a> element that contains the number of comments
          var commentsElement = parentDiv.querySelector('a.bylink.comments.may-blank');

          // Check if the element was found
          if (commentsElement) {
            // Change the number of comments to the value of newCommentCount
            commentsElement.removeAttribute('href');
            commentsElement.textContent = `${commentsCount} comments`;

            console.log('Number of comments updated to:', commentsElement.textContent);
          } else {
            console.log('No element with class "bylink comments may-blank" found');
          }

          ////////// end of post content level ////below is discussion section 


          // Select the div with the class "panestack-title"
          var paneStackTitleDiv = document.querySelector('.panestack-title');

          // Check if the div exists
          if (paneStackTitleDiv) {
            // Select the span with the class "title" inside the div
            var titleSpan = paneStackTitleDiv.querySelector('.title');

            // Check if the span exists
            if (titleSpan) {
              // Change the content of the span to include the commentsCount
              titleSpan.textContent = `all ${commentsCount} comments`;  // Dynamically set the comment count
              console.log('Title content updated to:', titleSpan.textContent);
            } else {
              console.log('No span with class "title" found');
            }
          } else {
            console.log('No div with class "panestack-title" found');
          }

          var postElement = document.querySelector('.sitetable.nestedlisting');

          // Call the function, passing the element
          removeAllCommentsFromSpecificPost(postElement);

          insertFakeComments(postElement, fake_comments, fakepost_id);
          getUserRepliesOnFakePost(fakepost_id)
            .then(replies => {
              if (replies) {

                var userElement = document.querySelector('span.user a');
                replies.forEach(reply => {
                  console.log('Reply content:', reply.reply_content);  // Should print "another test 23232"
                  // Check if the element exists and extract the username
                  if (userElement) {
                    var username = userElement.textContent.trim();

                    insertUserReplyFakePost(postElement, username, reply.reply_content, fakepost_id);
                  }

                });

              } else {
                console.log('No replies for this post.');
              }
            })
            .catch(error => {
              console.error('Failed to retrieve replies:', error);
            });


        } else {
          console.log('No parent div with class "sitetable linklisting" found');
        }


      }
    })
    .catch(error => {
      console.error("Failed to fetch fake post:", error);
      // Optionally, handle the error (e.g., show an error message to the user)
    });




}




function getUserVoteOnFakePost(postId) {

  console.log("called");
  return new Promise((resolve, reject) => {
    // Send a message to the background script to get the user ID
    chrome.runtime.sendMessage({ message: "need_uid_from_background" }, function (response) {
      if (!response || !response.value) {
        console.error("No valid response or userId received from background script.");
        return reject("No valid response or userId received from background script.");
      }

      const userId = response.value;
      console.log("Received userId from background script:", userId);

      // Fetch the user's votes on fake posts from the server
      fetch(`https://outer.socialsandbox.xyz/api/getUserVotes_onFakePosts?userid=${userId}`)
        .then(response => {
          // Check if the response is okay and if it's a JSON response
          if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
          }
          const contentType = response.headers.get("content-type");
          if (!contentType || !contentType.includes("application/json")) {
            throw new Error("Response is not JSON");
          }
          return response.json();
        })
        .then(data => {
          // Check if the data contains the expected structure
          if (data && data.userInteractions && data.userInteractions.votes && Array.isArray(data.userInteractions.votes.onFakePosts)) {
            var userVotesOnFakePosts = data.userInteractions.votes.onFakePosts;

            console.log("User votes on fake posts retrieved successfully:", userVotesOnFakePosts);

            // Process each user vote for a fake post
            var vote = userVotesOnFakePosts.find(vote => vote.action_fake_post === postId);
            if (vote) {
              // If a vote is found, resolve with the vote action
              if (vote.user_action === "upvote") {
                resolve("upvote");
              } else if (vote.user_action === "downvote") {
                resolve("downvote");
              }
            } else {
              // If no vote was found for the post
              resolve("novote");
            }
          } else {
            console.log("Unexpected data structure:", data);
            reject("Unexpected data structure");
          }
        })
        .catch(error => {
          console.error("Error retrieving user votes on fake posts:", error);
          reject(error);
        });
    });
  });
}


function getUserVoteOnFakeComment(commentId) {

  console.log("called for fake comment");
  return new Promise((resolve, reject) => {
    // Send a message to the background script to get the user ID
    chrome.runtime.sendMessage({ message: "need_uid_from_background" }, function (response) {
      if (!response || !response.value) {
        console.error("No valid response or userId received from background script.");
        return reject("No valid response or userId received from background script.");
      }

      const userId = response.value;
      console.log("Received userId from background script:", userId);

      // Fetch the user's votes on fake comments from the server
      fetch(`https://outer.socialsandbox.xyz/api/getUserVotes_onFakeComments?userid=${userId}`)
        .then(response => {
          // Check if the response is okay and if it's a JSON response
          if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
          }
          const contentType = response.headers.get("content-type");
          if (!contentType || !contentType.includes("application/json")) {
            throw new Error("Response is not JSON");
          }
          return response.json();
        })
        .then(data => {
          // Check if the data contains the expected structure
          if (data && data.userInteractions && data.userInteractions.votes && Array.isArray(data.userInteractions.votes.onFakeComments)) {
            const userVotesOnFakeComments = data.userInteractions.votes.onFakeComments;

            console.log("User votes on fake comments retrieved successfully:", userVotesOnFakeComments);

            // Process each user vote for a fake comment
            const vote = userVotesOnFakeComments.find(vote => vote.action_fake_comment === commentId);
            if (vote) {
              // If a vote is found, resolve with the vote action
              if (vote.user_action === "upvote") {
                resolve("upvote");
              } else if (vote.user_action === "downvote") {
                resolve("downvote");
              }
            } else {
              // If no vote was found for the comment
              resolve("novote");
            }
          } else {
            console.log("Unexpected data structure:", data);
            reject("Unexpected data structure");
          }
        })
        .catch(error => {
          console.error("Error retrieving user votes on fake comments:", error);
          reject(error);
        });
    });
  });
}

function getUserRepliesOnFakeComment(commentId) {
  console.log("Called for retrieving user replies on fake comment");

  return new Promise((resolve, reject) => {
    // Send a message to the background script to get the user ID
    chrome.runtime.sendMessage({ message: "need_uid_from_background" }, function (response) {
      if (!response || !response.value) {
        console.error("No valid response or userId received from background script.");
        return reject("No valid response or userId received from background script.");
      }

      const userId = response.value;
      console.log("Received userId from background script:", userId);

      // Fetch the user's replies on fake comments from the server
      fetch(`https://outer.socialsandbox.xyz/api/getUserComments_onFakeComments?userid=${userId}`)
        .then(response => {
          // Check if the response is okay and if it's a JSON response
          if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
          }
          const contentType = response.headers.get("content-type");
          if (!contentType || !contentType.includes("application/json")) {
            throw new Error("Response is not JSON");
          }
          return response.json();
        })
        .then(data => {
          // Check if the data contains the expected structure
          if (data && data.userInteractions && data.userInteractions.replies && Array.isArray(data.userInteractions.replies.onFakeComments)) {
            const userRepliesOnFakeComments = data.userInteractions.replies.onFakeComments;

            console.log("User replies on fake comments retrieved successfully:", userRepliesOnFakeComments);

            // Process each user reply for a fake comment
            const reply = userRepliesOnFakeComments.find(reply => reply.reply_to === commentId);
            if (reply) {
              // Resolve with the entire reply object
              resolve(reply);
            } else {
              // If no reply was found for the comment
              resolve(null);
            }
          } else {
            console.log("Unexpected data structure:", data);
            reject("Unexpected data structure");
          }
        })
        .catch(error => {
          console.error("Error retrieving user replies on fake comments:", error);
          reject(error);
        });
    });
  });
}

function getUserRepliesOnFakePost(postId) {
  console.log("Called for retrieving user replies on fake post");

  return new Promise((resolve, reject) => {
    // Send a message to the background script to get the user ID
    chrome.runtime.sendMessage({ message: "need_uid_from_background" }, function (response) {
      if (!response || !response.value) {
        console.error("No valid response or userId received from background script.");
        return reject("No valid response or userId received from background script.");
      }

      const userId = response.value;
      console.log("Received userId from background script:", userId);

      // Fetch the user's replies on fake posts from the server
      fetch(`https://outer.socialsandbox.xyz/api/getUserComments_onFakePosts?userid=${userId}`)
        .then(response => {
          if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
          }
          return response.json();
        })
        .then(data => {
          // Check if the user has replies on fake posts
          if (data.userInteractions && data.userInteractions.replies && data.userInteractions.replies.onFakePosts) {
            // Filter replies based on the specific fake postId
            const replies = data.userInteractions.replies.onFakePosts.filter(reply => reply.reply_fake_post === postId);

            if (replies.length > 0) {
              console.log('User reply to fake post:', replies);
              resolve(replies); // Return the array of replies
            } else {
              console.log('No replies found for this fake post.');
              resolve(null); // No replies found for the specified postId
            }
          } else {
            console.log('No replies found for this user.');
            resolve(null); // No replies found
          }
        })
        .catch(error => {
          console.error('Error retrieving user reply:', error);
          reject(error);
        });
    });
  });
}



// Function to get the src attribute of the  user profile imgage element
function getImgSrc() {
  // Select the img element with the specific class
  const imgElement = document.querySelector('img.ScrrUjzznpAqm92uwgnvO');

  // Check if the element exists
  if (imgElement) {
    // Get the src attribute
    const imgSrc = imgElement.getAttribute('src');
    return imgSrc;
  } else {
    const imgSrc = "https://www.redditstatic.com/avatars/defaults/v2/avatar_default_0.png";
    return imgSrc;
  }
}
window.addEventListener('beforeunload', function (event) {
  event.stopImmediatePropagation();
});


/// fake post delete and update 
function sendVoteFakePostMessage(useraction, fakePostId) {
  chrome.runtime.sendMessage({
    message: "updateUserVoteFakePost",  // This is the message type the background script will handle
    data: {
      useraction: useraction,            // The user's vote action (e.g., 1 for upvote, 0 for downvote)
      fakePostId: fakePostId             // The ID of the fake post being voted on
    }
  }, function (response) {
    if (response && response.message === "updateUserVoteFakePost") {
      console.log("Vote on fake post processed successfully.");
    } else {
      console.error("Failed to process vote on fake post.");
    }
  });
}

function sendDeleteUserReplyFakeCommentMessage(replyTo, replyFakePost, replyContent) {
  chrome.runtime.sendMessage({
    message: "deleteUserReplyFakeComment",  // The message type for removing a reply on a fake comment
    data: {
      replyTo: replyTo,               // The ID of the fake comment being replied to
      replyFakePost: replyFakePost,   // The fake post containing the comment
      replyContent: replyContent      // The content of the reply
    }
  }, function (response) {
    if (response && response.message === "deleteUserReplyFakeComment") {
      console.log("User reply on fake comment deleted successfully.");
    } else {
      console.error("Failed to delete user reply on fake comment.");
    }
  });
}

function sendDeleteVoteFakePostMessage(fakePostId) {
  chrome.runtime.sendMessage({
    message: "deleteUserVoteFakePost",  // The message type for removing a vote on a fake post
    data: {
      fakePostId: fakePostId             // The ID of the fake post
    }
  }, function (response) {
    if (response && response.message === "deleteUserVoteFakePost") {
      console.log("Vote on fake post deleted successfully.");
    } else {
      console.error("Failed to delete vote on fake post.");
    }
  });
}

// fake comments action delete and update 
function sendVoteFakeCommentMessage(useraction, fakeCommentId, fakePostId) {
  // Send a message to the background script with the necessary data to update the vote on a fake comment
  chrome.runtime.sendMessage({
    message: "updateUserVoteFakeComment",  // This is the message type the background script will handle
    data: {
      useraction: useraction,              // The user's vote action (e.g., 1 for upvote, 0 for downvote)
      action_fake_comment: fakeCommentId,  // The ID of the fake comment being voted on
      action_fake_post: fakePostId         // The ID of the fake post the comment belongs to
    }
  }, function (response) {
    // Check the response from the background script
    if (response && response.message === "updateUserVoteFakeComment") {
      console.log("Vote on fake comment processed successfully.");
    } else {
      console.error("Failed to process vote on fake comment.");
    }
  });
}

function sendDeleteVoteFakeCommentMessage(action_fake_comment, action_fake_post) {
  // Send a message to the background script with the necessary data to delete the fake comment vote
  chrome.runtime.sendMessage({
    message: "deleteUserVoteFakeComment",  // The message type for removing a vote on a fake comment
    data: {
      action_fake_comment: action_fake_comment,        // The ID of the fake comment
      action_fake_post: action_fake_post               // The ID of the fake post (if needed)
    }
  }, function (response) {
    // Check the response from the background script
    if (response && response.message === "deleteUserVoteFakeComment") {
      console.log("Vote on fake comment deleted successfully.");
    } else {
      console.error("Failed to delete vote on fake comment.");
    }
  });
}

/// this function is used to update fake post content and image. 
// we need this function since each post is different some may has hidden button while some may not 
function updatePostContent(parentDiv, fakepost_image, fakepost_content) {
  var mediaPreviewDiv = parentDiv.querySelector('.media-preview');

  // Check if the div was found
  if (mediaPreviewDiv) {
    // Find the image element inside the media-preview div
    var imgElement = mediaPreviewDiv.querySelector('img');

    // Check if the image element exists
    if (imgElement) {
      // Set a new source for the image
      imgElement.src = fakepost_image; // Replace with your new image URL
      console.log('Image source changed to:', imgElement.src);
    } else {
      console.log('No image found in the media-preview div');
    }
  } else {
    console.log('No div with class name media-preview found');
  }

  //// below is the case where nothing hidden NOTHING hidden 
  // Select the div with class name 'usertext-body'
  var usertextBodyDiv = parentDiv.querySelector('.usertext-body');
  if (usertextBodyDiv) {
    // Select the child div with class name 'md' inside the 'usertext-body' div
    var mdDiv = usertextBodyDiv.querySelector('.md');

    // Remove all <p> elements inside the 'md' div
    var paragraphs = mdDiv.querySelectorAll('p');
    paragraphs.forEach(p => p.remove());

    // Insert a new <p> element with the fake_content inside the 'md' div
    // Assuming 'fake_content' contains the content you want to insert
    var paragraphArray = fakepost_content.split('\n');


    // Insert each paragraph as a new <p> element inside the 'md' div
    paragraphArray.forEach(paragraphText => {
      var newParagraph = document.createElement('p');
      newParagraph.textContent = paragraphText.trim(); // Ensure that extra whitespace is removed
      mdDiv.appendChild(newParagraph); // Add the new <p> element to the 'md' div
    });
  }
}


/// this fucntion is used to decode the cache html
function decodeHTMLEntities(text) {
  var parser = new DOMParser();
  var decodedString = parser.parseFromString(text, "text/html").body.innerHTML;
  return decodedString;
}

function removeAllCommentsFromSpecificPost(containerElement) {
  // Check if the passed element is valid
  if (!containerElement) {
    console.log('Container element not found or not provided');
    return;
  }

  // Select all comment divs inside the container element
  var commentDivs = containerElement.querySelectorAll('div.comment');

  // Loop through each comment div and hide it by setting display to 'none'
  commentDivs.forEach((commentDiv) => {
    commentDiv.style.display = 'none'; // This hides the comment from the DOM
    console.log('Comment removed:', commentDiv);
  });

  // Log if no comments were found
  if (commentDivs.length === 0) {
    console.log('No comments found to remove inside container');
  }

  // Select all clearleft divs inside the container element
  var clearleftDivs = containerElement.querySelectorAll('div.clearleft');

  // Loop through each clearleft div and remove it
  clearleftDivs.forEach((clearleftDiv) => {
    clearleftDiv.remove(); // This removes the element from the DOM
    console.log('clearleft div removed:', clearleftDiv);
  });

  // Log if no clearleft divs were found
  if (clearleftDivs.length === 0) {
    console.log('No clearleft divs found to remove inside container');
  }
}

function applyUserVoteOnElement(parentDiv, voteFunction, postOrCommentId) {
  var upvoteButton = parentDiv.querySelector('[aria-label="upvote"]');
  var downvoteButton = parentDiv.querySelector('[aria-label="downvote"]');
  var midcolDiv = parentDiv.querySelector('.midcol');
  var entryDiv = parentDiv.querySelector('.entry');

  voteFunction(postOrCommentId)
    .then(result => {
      if (result === "upvote") {
        console.log("User has upvoted the post/comment.");
        upvoteButton.classList.remove('up');
        upvoteButton.classList.add('upmod');
        midcolDiv.classList.remove('unvoted');
        midcolDiv.classList.add('likes');
        if (entryDiv) {
          entryDiv.classList.remove('unvoted');
          entryDiv.classList.add('likes');
        }
        // Add logic for upvote
      } else if (result === "downvote") {
        console.log("User has downvoted the post/comment.");
        downvoteButton.classList.remove('down');
        downvoteButton.classList.add('downmod');
        midcolDiv.classList.remove('unvoted');
        midcolDiv.classList.add('dislikes');
        if (entryDiv) {
          entryDiv.classList.remove('unvoted');
          entryDiv.classList.add('dislikes');
        }
        // Add logic for downvote
      } else if (result === "novote") {
        console.log("User has not voted on the post/comment.");

        midcolDiv.classList.remove('dislikes');
        midcolDiv.classList.remove('likes');
        midcolDiv.classList.add('unvoted');

        downvoteButton.classList.remove('downmod');
        downvoteButton.classList.add('down');

        upvoteButton.classList.remove('upmod');
        upvoteButton.classList.add('up');

        entryDiv.classList.remove('likes');
        entryDiv.classList.remove('dislikes');
        entryDiv.classList.add('unvoted');



        // Add logic for no vote
      }
    })
    .catch(error => {
      console.error("Error retrieving user vote:", error);
      // Handle error case
    });
}

function handleVoteButtons(parentDiv, voteType, fakeCommentId, url) {
  var upvoteButton = parentDiv.querySelector('[aria-label="upvote"]');
  var downvoteButton = parentDiv.querySelector('[aria-label="downvote"]');
  var midcolDiv = parentDiv.querySelector('.midcol');
  var entryDiv = parentDiv.querySelector('.entry');
  // Check if the elements are found
  if (upvoteButton && downvoteButton) {
    // Upvote button functionality
    upvoteButton.setAttribute('outer-limit-monitored', 'true');
    downvoteButton.setAttribute('outer-limit-monitored', 'true');

    upvoteButton.addEventListener('click', function (event) {
      event.preventDefault();  // Prevent Reddit's action
      event.stopPropagation(); // Stop the event from bubbling up to Reddit's listener
      console.log('Custom upvote - No data sent to Reddit');

      if (upvoteButton.classList.contains('upmod')) {
        // Undo the upvote (reset to unvoted state)
        upvoteButton.classList.remove('upmod');
        upvoteButton.classList.add('up');
        midcolDiv.classList.remove('likes');
        midcolDiv.classList.add('unvoted');
        console.log('Upvote undone');
        if (entryDiv) {
          entryDiv.classList.remove('likes');
          entryDiv.classList.add('unvoted');
        }
        sendDeleteVoteMessage(voteType, fakeCommentId, url);
      } else {
        // If downvote was previously clicked, reset it
        if (downvoteButton.classList.contains('downmod')) {
          downvoteButton.classList.remove('downmod');
          downvoteButton.classList.add('down');
          midcolDiv.classList.remove('dislikes');
          midcolDiv.classList.add('unvoted');
          if (entryDiv) {
            entryDiv.classList.remove('dislikes');
            entryDiv.classList.add('unvoted');
          }
          sendDeleteVoteMessage(voteType, fakeCommentId, url);
        }

        // Apply the upvote changes
        upvoteButton.classList.remove('up');
        upvoteButton.classList.add('upmod');
        midcolDiv.classList.remove('unvoted');
        midcolDiv.classList.add('likes');
        if (entryDiv) {
          entryDiv.classList.remove('unvoted');
          entryDiv.classList.add('likes');
        }
        console.log('Upvoted');
        sendVoteMessage("upvote", voteType, fakeCommentId, url);
      }
    }, true);  // Using capture phase to prevent Reddit's listener

    // Downvote button functionality
    downvoteButton.addEventListener('click', function (event) {
      event.preventDefault();  // Prevent Reddit's action
      event.stopPropagation(); // Stop the event from bubbling up to Reddit's listener
      console.log('Custom downvote - No data sent to Reddit');

      if (downvoteButton.classList.contains('downmod')) {
        // Undo the downvote (reset to unvoted state)
        downvoteButton.classList.remove('downmod');
        downvoteButton.classList.add('down');
        midcolDiv.classList.remove('dislikes');
        midcolDiv.classList.add('unvoted');
        if (entryDiv) {
          entryDiv.classList.remove('dislikes');
          entryDiv.classList.add('unvoted');
        }
        console.log('Downvote undone');
        sendDeleteVoteMessage(voteType, fakeCommentId, url);
      } else {
        // If upvote was previously clicked, reset it
        if (upvoteButton.classList.contains('upmod')) {
          upvoteButton.classList.remove('upmod');
          upvoteButton.classList.add('up');
          midcolDiv.classList.remove('likes');
          midcolDiv.classList.add('unvoted');
          if (entryDiv) {
            entryDiv.classList.remove('likes');
            entryDiv.classList.add('unvoted');
          }
          sendDeleteVoteMessage(voteType, fakeCommentId, url);
        }

        // Apply the downvote changes
        downvoteButton.classList.remove('down');
        downvoteButton.classList.add('downmod');
        midcolDiv.classList.remove('unvoted');
        midcolDiv.classList.add('dislikes');
        if (entryDiv) {
          entryDiv.classList.remove('unvoted');
          entryDiv.classList.add('dislikes');
        }
        console.log('Downvoted');
        sendVoteMessage("downvote", voteType, fakeCommentId, url);
      }
    }, true);  // Using capture phase to prevent Reddit's listener
  } else {
    console.log('Required elements not found');
  }
}

// Function to send vote // this function is used to deal with different vote , fake post levele and fake comments level 
function sendVoteMessage(voteAction, voteType, targetId, url) {
  if (voteType === 'fakepost') {

    // Add logic to send vote for fake post
    sendVoteFakePostMessage(voteAction, url);
  } else if (voteType === 'fakecomment') {
    sendVoteFakeCommentMessage(voteAction, targetId, url);
    // Add logic to send vote for comment
  }
}

// Function to delete vote
function sendDeleteVoteMessage(voteType, targetId, url) {
  if (voteType === 'fakepost') {
    sendDeleteVoteFakePostMessage(url);
    // Add logic to delete vote for fake post
  } else if (voteType === 'fakecomment') {
    sendDeleteVoteFakeCommentMessage(targetId, url);
    // Add logic to delete vote for comment
  }
}


// Function to send real  vote // this function is used to deal with different vote , fake post levele and fake comments level 
function sendRealVoteMessage(voteAction, voteType, targetId, url) {
  if (voteType === 'post') {

    // Add logic to send vote for fake post
    sendVoteRealPostMessage(url, voteAction);
  } else if (voteType === 'comment') {
    sendVoteRealCommentMessage(targetId, url, voteAction);
    // Add logic to send vote for comment
  }
}

// Function to delete real vote
function sendDeleteRealVoteMessage(voteType, targetId, url) {
  if (voteType === 'post') {
    sendDeleteVoteRealPostMessage(url);
    // Add logic to delete vote for fake post
  } else if (voteType === 'comment') {
    sendDeleteVoteRealCommentMessage(targetId, url);
    // Add logic to delete vote for comment
  }
}
function sendVoteRealPostMessage(postId, userAction) {
  chrome.runtime.sendMessage(
    {
      message: "addUserVoteToPost",
      postId: postId,
      userAction: userAction // e.g., "upvote" or "downvote"
    },
    function (response) {
      if (response.success) {
        console.log("Successfully added user vote to post:", postId);
      } else {
        console.error("Failed to add user vote to post:", postId);
      }
    }
  );
}
function sendVoteRealCommentMessage(commentId, postId, userAction) {
  chrome.runtime.sendMessage(
    {
      message: "addUserVoteToComment",
      commentId: commentId,
      postId: postId,
      userAction: userAction // e.g., "upvote" or "downvote"
    },
    function (response) {
      if (response.success) {
        console.log("Successfully added user vote to comment:", commentId);
      } else {
        console.error("Failed to add user vote to comment:", commentId);
      }
    }
  );
}
function sendDeleteVoteRealPostMessage(postId) {
  chrome.runtime.sendMessage(
    {
      message: "removeUserVoteFromPost",
      postId: postId
    },
    function (response) {
      if (response.success) {
        console.log("Successfully removed user vote from post:", postId);
      } else {
        console.error("Failed to remove user vote from post:", postId);
      }
    }
  );
}
function sendDeleteVoteRealCommentMessage(commentId, postId) {
  chrome.runtime.sendMessage(
    {
      message: "removeUserVoteFromComment",
      commentId: commentId,
      postId: postId
    },
    function (response) {
      if (response.success) {
        console.log("Successfully removed user vote from comment:", commentId);
      } else {
        console.error("Failed to remove user vote from comment:", commentId);
      }
    }
  );
}

function insertCommentFormORReplyFakeComment(parentDiv, fakeCommentID, fakePostId) {
  var replyButton = parentDiv.querySelector('.reply-button');
  var childDiv = parentDiv.querySelector('div.child');
  getUserRepliesOnFakeComment(fakeCommentID)
    .then(reply => {
      if (reply) {
        console.log("Reply details:", reply);
        var userElement = document.querySelector('span.user a');
        changeReplyButtonToReplied(parentDiv);
        // Check if the element exists and extract the username
        if (userElement) {
          var username = userElement.textContent.trim();  // Get the text inside the anchor tag
          var content = reply.reply_content;
          insertUserReplyFakeComments(childDiv, username, content, fakeCommentID, fakePostId);
          addDeleteCommentListener(childDiv, fakeCommentID, fakePostId, reply.reply_content);
          console.log('Username:', username);
        } else {
          console.error('User element not found.');
        }
        // You can access the full reply object here
      } else {
        console.log("No reply found for this comment.");
        // then we need to attach the reply box to the reply button
        if (replyButton && replyButton.querySelector('a')) {

          // Add event listener to the <a> tag inside the <li> element
          function replyHandler(event) {
            event.preventDefault(); // Prevent default action
            event.stopPropagation();
            console.log('reply button clicked');

            var commentFormHTML = `<form action="#" class="usertext cloneable warn-on-unload trackcommentform" onsubmit="return post_form(this, 'comment')" id="commentreply_t1_lp30szd" style="display: block;"><input type="hidden" name="thing_id" value="t1_lp30szd"><div class="usertext-edit md-container" style="width: 500px;"><div class="md"><textarea rows="1" cols="1" name="text" class="" data-event-action="comment" data-type="link" style=""></textarea></div><div class="bottom-area"><span class="help-toggle toggle" style=""><a class="option active " href="#" tabindex="100" onclick="return toggle(this, helpon, helpoff)">formatting help</a><a class="option " href="#">hide help</a></span><a href="/help/contentpolicy" class="reddiquette" target="_blank" tabindex="100">content policy</a><span class="error CANT_REPLY field-parent" style="display:none"></span><span class="error TOO_LONG field-text" style="display:none"></span><span class="error RATELIMIT field-ratelimit" style="display:none"></span><span class="error NO_TEXT field-text" style="display:none"></span><span class="error SUBREDDIT_LINKING_DISALLOWED field-text" style="display:none"></span><span class="error SUBREDDIT_OUTBOUND_LINKING_DISALLOWED field-text" style="display:none"></span><span class="error USERNAME_LINKING_DISALLOWED field-text" style="display:none"></span><span class="error USERNAME_OUTBOUND_LINKING_DISALLOWED field-text" style="display:none"></span><span class="error TOO_OLD field-parent" style="display:none"></span><span class="error THREAD_LOCKED field-parent" style="display:none"></span><span class="error DELETED_COMMENT field-parent" style="display:none"></span><span class="error USER_BLOCKED field-parent" style="display:none"></span><span class="error USER_MUTED field-parent" style="display:none"></span><span class="error USER_BLOCKED_MESSAGE field-parent" style="display:none"></span><span class="error INVALID_USER field-parent" style="display:none"></span><span class="error MUTED_FROM_SUBREDDIT field-parent" style="display:none"></span><span class="error QUARANTINE_REQUIRES_VERIFICATION field-user" style="display:none"></span><span class="error TOO_MANY_COMMENTS field-text" style="display:none"></span><span class="error SUBMIT_VALIDATION_BODY_REQUIRED field-body" style="display:none"></span><span class="error SUBMIT_VALIDATION_BODY_NOT_ALLOWED field-body" style="display:none"></span><span class="error SUBMIT_VALIDATION_BODY_BLACKLISTED_STRING field-body" style="display:none"></span><span class="error SUBMIT_VALIDATION_BODY_NOT_ALLOWED field-body" style="display:none"></span><span class="error SUBMIT_VALIDATION_BODY_REQUIRED field-body" style="display:none"></span><span class="error SUBMIT_VALIDATION_BODY_REQUIREMENT field-body" style="display:none"></span><span class="error SUBMIT_VALIDATION_REGEX_TIMEOUT field-body" style="display:none"></span><span class="error SUBMIT_VALIDATION_BODY_REGEX_REQUIREMENT field-body" style="display:none"></span><span class="error SUBMIT_VALIDATION_MAX_LENGTH field-body" style="display:none"></span><span class="error SUBMIT_VALIDATION_MIN_LENGTH field-body" style="display:none"></span><span class="error SOMETHING_IS_BROKEN field-parent" style="display:none"></span><span class="error COMMENT_GUIDANCE_VALIDATION_FAILED field-text" style="display:none"></span><span class="error placeholder field-body" style="display:none"></span><span class="error placeholder field-text" style="display:none"></span><div class="usertext-buttons"><button type="submit" onclick="" class="save">save</button><button type="button" onclick="return cancel_usertext(this);" class="cancel" style="">cancel</button><span class="status"></span></div></div><div class="markhelp" style="display:none"><p></p><p>reddit uses a slightly-customized version of <a href="http://daringfireball.net/projects/markdown/syntax">Markdown</a> for formatting. See below for some basics, or check <a href="/wiki/commenting">the commenting wiki page</a> for more detailed help and solutions to common issues.</p><p></p><table class="md"><tbody><tr style="background-color: #ffff99; text-align: center"><td><em>you type:</em></td><td><em>you see:</em></td></tr><tr><td>*italics*</td><td><em>italics</em></td></tr><tr><td>**bold**</td><td><b>bold</b></td></tr><tr><td>[reddit!](https://reddit.com)</td><td><a href="https://reddit.com">reddit!</a></td></tr><tr><td>* item 1<br>* item 2<br>* item 3</td><td><ul><li>item 1</li><li>item 2</li><li>item 3</li></ul></td></tr><tr><td>&gt; quoted text</td><td><blockquote>quoted text</blockquote></td></tr><tr><td>Lines starting with four spaces<br>are treated like code:<br><br><span class="spaces">&nbsp;&nbsp;&nbsp;&nbsp;</span>if 1 * 2 &lt; 3:<br><span class="spaces">&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;</span>print "hello, world!"<br></td><td>Lines starting with four spaces<br>are treated like code:<br><pre>if 1 * 2 &lt; 3:<br>&nbsp;&nbsp;&nbsp;&nbsp;print "hello, world!"</pre></td></tr><tr><td>~~strikethrough~~</td><td><strike>strikethrough</strike></td></tr><tr><td>super^script</td><td>super<sup>script</sup></td></tr></tbody></table></div></div></form>`;

            if (childDiv) {
              var existingForm = childDiv.querySelector('.trackcommentform');
              if (!existingForm) {
                // Insert the comment form inside the 'child' div
                childDiv.insertAdjacentHTML('beforeend', commentFormHTML);
                console.log('Comment form inserted successfully into the child div');
                // Select the save button
                var saveButton = childDiv.querySelector('.usertext-buttons .save');
                // Select the cancel button
                var cancelButton = childDiv.querySelector('.usertext-buttons .cancel');

                // Add event listener to the save button
                saveButton.addEventListener('click', function (event) {
                  event.preventDefault();
                  event.stopPropagation();
                  console.log('Save button clicked');
                  var textarea = childDiv.querySelector('textarea[name="text"]');
                  if (textarea && textarea.value !== null) {
                    var enteredText = textarea.value;

                    changeReplyButtonToReplied(parentDiv);
                    replyButton.removeEventListener('click', replyHandler);
                    var commentFormElement = childDiv.querySelector('form');
                    if (commentFormElement) {
                      commentFormElement.remove();
                      sendUserReplyFakeComment(fakeCommentID, enteredText, fakePostId);
                      // Select the element containing the username
                      var userElement = document.querySelector('span.user a');

                      // Check if the element exists and extract the username
                      if (userElement) {
                        var username = userElement.textContent.trim();  // Get the text inside the anchor tag
                        insertUserReplyFakeComments(childDiv, username, enteredText, fakeCommentID, fakePostId);
                        addDeleteCommentListener(childDiv, fakeCommentID, fakePostId, enteredText);
                        console.log('Username:', username);
                      } else {
                        console.error('User element not found.');
                      }

                    }
                  }

                });

                // Add event listener to the cancel button
                cancelButton.addEventListener('click', function (event) {
                  event.preventDefault();
                  event.stopPropagation();
                  console.log('Cancel button clicked');
                  var commentFormElement = childDiv.querySelector('form');
                  if (commentFormElement) {
                    commentFormElement.remove();

                  }
                  // Your custom logic here
                });

              }
            } else {
              console.error('No div with class "child" found');
            }
          }
          replyButton.addEventListener('click', replyHandler);


        } else {
          console.error('Reply button not found');
        }
      }
    })
    .catch(error => {
      console.error("Error:", error);
    });



}
function sendUserReplyFakeComment(commentId, commentContent, fakePostId) {
  chrome.runtime.sendMessage({
    message: "insertUserReplyFakeComments",  // Message type
    commentId: commentId,                    // The ID of the comment being replied to
    commentContent: commentContent,          // The content of the user's reply
    fakePostId: fakePostId,                  // The ID of the fake post
  }, function (response) {
    if (response && response.success) {
      console.log("User reply inserted successfully.");
    } else {
      console.error("Failed to insert user reply.");
    }
  });
}

function addDeleteCommentListener(parentDiv, replyTo, replyFakePost, replyContent) {
  // Select the element using the provided selector

  var yesButtons = parentDiv.querySelectorAll('a.yes');

  // Check if there are at least two 'yes' buttons
  if (yesButtons.length >= 2) {
    var yesButton = yesButtons[1]; // Select the second one (index starts from 0)

    // Add an event listener to the second 'yes' button
    yesButton.addEventListener('click', function (event) {
      event.preventDefault();
      event.stopPropagation();
      console.log('Second Yes button clicked');
      sendDeleteUserReplyFakeCommentMessage(replyTo, replyFakePost, replyContent);
      // Select the form element with the 'del-button' class
      /// change it to deleted 
      var delForm = parentDiv.querySelector('form.toggle.del-button');

      // Check if the element exists
      if (delForm) {
        // Replace the form's inner HTML with 'deleted'
        delForm.innerHTML = 'deleted';
        console.log('Form successfully replaced.');
      } else {
        console.error('Form not found.');
      }

      // Your custom logic here
    });
  }
  // Check if the element exists

}

function addDeleteUserReplyFakePostListener(parentDiv, replyFakePost, replyContent) {
  // Select the element using the provided selector

  var yesButtons = parentDiv.querySelectorAll('a.yes');

  // Check if there are at least two 'yes' buttons
  if (yesButtons.length >= 2) {
    var yesButton = yesButtons[1]; // Select the second one (index starts from 0)

    // Add an event listener to the second 'yes' button
    yesButton.addEventListener('click', function (event) {
      event.preventDefault();
      event.stopPropagation();
      console.log('Second Yes button clicked');
      sendRemoveUserReplyFromFakePostMessage(replyFakePost, replyContent);
      // Select the form element with the 'del-button' class
      /// change it to deleted 
      var delForm = parentDiv.querySelector('form.toggle.del-button');

      // Check if the element exists
      if (delForm) {
        // Replace the form's inner HTML with 'deleted'
        delForm.innerHTML = 'deleted';
        console.log('Form successfully replaced.');
      } else {
        console.error('Form not found.');
      }

      // Your custom logic here
    });
  }
  // Check if the element exists

}

function changeReplyButtonToReplied(parentDiv) {
  // Select the <li> element with the class 'reply-button'
  var replyButton = parentDiv.querySelector('.reply-button');

  // Check if the element exists
  if (replyButton) {
    // Replace the inner HTML with 'replied'
    replyButton.innerHTML = 'replied';

    console.log('Reply button successfully replaced.');
  } else {
    console.error('Reply button not found.');
  }
}

function insertUserReplyFakeComments(childDiv, username, content, fakeCommentId, fakePostId) {

  var newSubCommentHTML = `<div class="sitetable" id="siteTable_t1_kz2wn14"><div class=" thing id-t1_lp45j2y noncollapsed odd  comment " id="thing_t1_lp45j2y" onclick="click_thing(this)" data-fullname="t1_lp45j2y" data-type="comment" data-gildings="0" data-subreddit="aww" data-subreddit-prefixed="r/aww" data-subreddit-fullname="t5_2qh1o" data-subreddit-type="public" data-author=${username} data-author-fullname="t2_h9y9uxsgw" data-permalink="/r/aww/comments/1c1eyde/full_aussie_wrasslin_with_mini_corgiaussie/lp45j2y/" style="display: flex;"><p class="parent"><a name="lp45j2y"></a></p><div class="midcol likes"><div class="arrow upmod login-required access-required" data-event-action="upvote" role="button" aria-label="upvote" tabindex="0"></div><div class="arrow down login-required access-required" data-event-action="downvote" role="button" aria-label="downvote" tabindex="0"></div></div><div class="entry likes"><p class="tagline"><a href="javascript:void(0)" class="expand" onclick="return togglecomment(this)">[–]</a><a href="https://old.reddit.com/user/${username}" class="author may-blank id-t2_h9y9uxsgw">${username}</a><span class="userattrs"></span> <span class="score dislikes" title="-1">-1 points</span><span class="score unvoted" title="0">0 points</span><span class="score likes" title="1">1 point</span> <time title="Fri Sep 27 01:09:23 2024 UTC" datetime="2024-09-27T01:09:23+00:00" class="live-timestamp">just now</time>&nbsp;<a href="javascript:void(0)" class="numchildren" onclick="return togglecomment(this)">(0 children)</a></p><form action="#" class="usertext warn-on-unload" onsubmit="return post_form(this, 'editusertext')" id="form-t1_lp45j2y7kt"><input type="hidden" name="thing_id" value="t1_lp45j2y"><div class="usertext-body may-blank-within md-container "><div class="md"><p>${content}</p></div></div><div class="usertext-edit md-container" style="display: none"><div class="md"><textarea rows="1" cols="1" name="text" class="">${content}</textarea></div><div class="bottom-area"><span class="help-toggle toggle" style="display: none"><a class="option active " href="#" tabindex="100" onclick="return toggle(this, helpon, helpoff)">formatting help</a><a class="option " href="#">hide help</a></span><a href="/help/contentpolicy" class="reddiquette" target="_blank" tabindex="100">content policy</a><span class="error CANT_REPLY field-parent" style="display:none"></span><span class="error TOO_LONG field-text" style="display:none"></span><span class="error RATELIMIT field-ratelimit" style="display:none"></span><span class="error NO_TEXT field-text" style="display:none"></span><span class="error SUBREDDIT_LINKING_DISALLOWED field-text" style="display:none"></span><span class="error SUBREDDIT_OUTBOUND_LINKING_DISALLOWED field-text" style="display:none"></span><span class="error USERNAME_LINKING_DISALLOWED field-text" style="display:none"></span><span class="error USERNAME_OUTBOUND_LINKING_DISALLOWED field-text" style="display:none"></span><span class="error TOO_OLD field-parent" style="display:none"></span><span class="error THREAD_LOCKED field-parent" style="display:none"></span><span class="error DELETED_COMMENT field-parent" style="display:none"></span><span class="error USER_BLOCKED field-parent" style="display:none"></span><span class="error USER_MUTED field-parent" style="display:none"></span><span class="error USER_BLOCKED_MESSAGE field-parent" style="display:none"></span><span class="error INVALID_USER field-parent" style="display:none"></span><span class="error MUTED_FROM_SUBREDDIT field-parent" style="display:none"></span><span class="error QUARANTINE_REQUIRES_VERIFICATION field-user" style="display:none"></span><span class="error TOO_MANY_COMMENTS field-text" style="display:none"></span><span class="error SUBMIT_VALIDATION_BODY_REQUIRED field-body" style="display:none"></span><span class="error SUBMIT_VALIDATION_BODY_NOT_ALLOWED field-body" style="display:none"></span><span class="error SUBMIT_VALIDATION_BODY_BLACKLISTED_STRING field-body" style="display:none"></span><span class="error SUBMIT_VALIDATION_BODY_NOT_ALLOWED field-body" style="display:none"></span><span class="error SUBMIT_VALIDATION_BODY_REQUIRED field-body" style="display:none"></span><span class="error SUBMIT_VALIDATION_BODY_REQUIREMENT field-body" style="display:none"></span><span class="error SUBMIT_VALIDATION_REGEX_TIMEOUT field-body" style="display:none"></span><span class="error SUBMIT_VALIDATION_BODY_REGEX_REQUIREMENT field-body" style="display:none"></span><span class="error SUBMIT_VALIDATION_MAX_LENGTH field-body" style="display:none"></span><span class="error SUBMIT_VALIDATION_MIN_LENGTH field-body" style="display:none"></span><span class="error SOMETHING_IS_BROKEN field-parent" style="display:none"></span><span class="error COMMENT_GUIDANCE_VALIDATION_FAILED field-text" style="display:none"></span><span class="error placeholder field-body" style="display:none"></span><span class="error placeholder field-text" style="display:none"></span><div class="usertext-buttons"><button type="submit" onclick="" class="save" style="display:none">save</button><button type="button" onclick="return cancel_usertext(this);" class="cancel" style="display:none">cancel</button><span class="status"></span></div></div><div class="markhelp" style="display:none"><p></p><p>reddit uses a slightly-customized version of <a href="http://daringfireball.net/projects/markdown/syntax">Markdown</a> for formatting. See below for some basics, or check <a href="/wiki/commenting">the commenting wiki page</a> for more detailed help and solutions to common issues.</p><p></p><table class="md"><tbody><tr style="background-color: #ffff99; text-align: center"><td><em>you type:</em></td><td><em>you see:</em></td></tr><tr><td>*italics*</td><td><em>italics</em></td></tr><tr><td>**bold**</td><td><b>bold</b></td></tr><tr><td>[reddit!](https://reddit.com)</td><td><a href="https://reddit.com">reddit!</a></td></tr><tr><td>* item 1<br>* item 2<br>* item 3</td><td><ul><li>item 1</li><li>item 2</li><li>item 3</li></ul></td></tr><tr><td>&gt; quoted text</td><td><blockquote>quoted text</blockquote></td></tr><tr><td>Lines starting with four spaces<br>are treated like code:<br><br><span class="spaces">&nbsp;&nbsp;&nbsp;&nbsp;</span>if 1 * 2 &lt; 3:<br><span class="spaces">&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;</span>print "hello, world!"<br></td><td>Lines starting with four spaces<br>are treated like code:<br><pre>if 1 * 2 &lt; 3:<br>&nbsp;&nbsp;&nbsp;&nbsp;print "hello, world!"</pre></td></tr><tr><td>~~strikethrough~~</td><td><strike>strikethrough</strike></td></tr><tr><td>super^script</td><td>super<sup>script</sup></td></tr></tbody></table></div></div></form><ul class="flat-list buttons"><li class="first"><a href="https://old.reddit.com/r/aww/comments/1c1eyde/full_aussie_wrasslin_with_mini_corgiaussie/lp45j2y/" data-event-action="permalink" class="bylink" rel="nofollow">permalink</a></li><li class="comment-save-button save-button login-required"><a href="javascript:void(0)">save</a></li><li><a href="https://old.reddit.com/r/aww/comments/1c1eyde/full_aussie_wrasslin_with_mini_corgiaussie/kz2wn14/" data-event-action="parent" class="bylink" rel="nofollow">parent</a></li><li><a class="edit-usertext" href="javascript:void(0)" onclick="return edit_usertext(this)">edit</a></li><li><form class="toggle sendreplies-button " action="#" method="get"><input type="hidden" name="executed" value="inbox replies disabled"><input type="hidden" name="state" value="False"><input type="hidden" name="id" value="t1_lp45j2y"><span class="option main active"><a href="#" class="togglebutton " onclick="return toggle(this)" data-event-action="disable_inbox_replies">disable inbox replies</a></span><span class="option error">are you sure?  <a href="#" class="yes" >yes</a> / <a href="javascript:void(0)" class="no" onclick="return toggle(this)">no</a></span></form></li><li><form class="toggle del-button " action="#" method="get"><input type="hidden" name="executed" value="deleted"><span class="option main active"><a href="#" class="togglebutton " onclick="return toggle(this)" data-event-action="delete">delete</a></span><span class="option error">are you sure?  <a href="#" class="yes" >yes</a> / <a href="javascript:void(0)" class="no" onclick="return toggle(this)">no</a></span></form></li><li class="reply-button login-required"><a class="access-required" href="javascript:void(0)" data-event-action="comment" onclick="return reply(this)">reply</a></li></ul><div class="reportform report-t1_lp45j2y"></div></div><div class="child"></div><div class="clearleft"></div></div><div class="clearleft"></div></div>`;
  childDiv.insertAdjacentHTML('beforeend', newSubCommentHTML);
  // Select the button using document.querySelector
  var saveButton = childDiv.querySelector('.usertext-buttons .save');
  saveButton.addEventListener('click', function (event) {
    event.preventDefault();
    event.stopPropagation();
    console.log('Save button clicked');

    var textarea = childDiv.querySelector('textarea[name="text"]');

    if (textarea && textarea.value !== null) {
      var enteredText = textarea.value;
      childDiv.innerHTML = '';  // Clears all content inside childDiv
      insertUserReplyFakeComments(childDiv, username, enteredText, fakeCommentId, fakePostId);
      // remove the old user reply to fake comment according to old conten
      //console.log(" test out the contet ere: ", content);
      sendDeleteUserReplyFakeCommentMessage(fakeCommentId, fakePostId, content);
      // add new comments acoording to new text 
      sendUserReplyFakeComment(fakeCommentId, enteredText, fakePostId);

    }

  });

}




function monitorUserReplyToFakePost(fakePostId) {
  // Select all the usertext-buttons containers
  var usertextButtons = document.querySelectorAll('.usertext-buttons');

  // Loop through each usertext-buttons container
  usertextButtons.forEach(buttonContainer => {
    // Find the cancel button within the container
    var cancelButton = buttonContainer.querySelector('.cancel');
    var saveButton = buttonContainer.querySelector('.save');

    // Check if both the cancel button has display: none and the save button exists
    if (cancelButton && cancelButton.style.display === 'none' && saveButton) {

      console.log('Correct save button selected:', saveButton);
      // Add an event listener for the form submission
      saveButton.addEventListener('click', function (event) {

        event.preventDefault(); // Prevent the default form submission behavior
        event.stopPropagation();

        var userCommentForm = saveButton.closest('.usertext-edit');
        var textarea = userCommentForm.querySelector('textarea[name="text"]');


        // Make sure reply content exists
        if (textarea && textarea.value !== null) {
          var enteredText = textarea.value;
          var postElement = document.querySelector('.sitetable.nestedlisting');
          var userElement = document.querySelector('span.user a');
          var username = userElement.textContent.trim();
          insertUserReplyFakePost(postElement, username, enteredText, fakePostId);

          // Send the user reply to the backend for further processing
          sendInsertUserReplyToFakePostMessage(fakePostId, enteredText);
          textarea.value = "";
          return;
        }


      });
      // Add your logic for the save button here
    }
  });


}


function insertUserReplyFakePost(childDiv, username, content, fakePostId, oldComment) {

  var newSubCommentHTML = `<div class=" thing id-t1_lplovn1 noncollapsed odd  comment " id="thing_t1_lplovn1" onclick="click_thing(this)" data-fullname="t1_lplovn1" data-type="comment" data-gildings="0" data-subreddit="aww" data-subreddit-prefixed="r/aww" data-subreddit-fullname="t5_2qh1o" data-subreddit-type="public" data-author="${username}" data-author-fullname="t2_h9y9uxsgw" data-permalink="/r/aww/comments/1c1eyde/full_aussie_wrasslin_with_mini_corgiaussie/lplovn1/" style="display: flex;"><p class="parent"><a name="lplovn1"></a></p><div class="midcol likes"><div class="arrow upmod login-required access-required" data-event-action="upvote" role="button" aria-label="upvote" tabindex="0"></div><div class="arrow down login-required access-required" data-event-action="downvote" role="button" aria-label="downvote" tabindex="0"></div></div><div class="entry likes"><p class="tagline"><a href="javascript:void(0)" class="expand" onclick="return togglecomment(this)">[–]</a><a href="https://old.reddit.com/user/${username}" class="author may-blank id-t2_h9y9uxsgw">${username}</a><span class="userattrs"></span> <span class="score dislikes" title="-1">-1 points</span><span class="score unvoted" title="0">0 points</span><span class="score likes" title="1">1 point</span> <time title="Mon Sep 30 04:02:10 2024 UTC" datetime="2024-09-30T04:02:10+00:00" class="live-timestamp">just now</time>&nbsp;<a href="javascript:void(0)" class="numchildren" onclick="return togglecomment(this)">(0 children)</a></p><form action="#" class="usertext warn-on-unload" onsubmit="return post_form(this, 'editusertext')" id="form-t1_lplovn1w7h"><input type="hidden" name="thing_id" value="t1_lplovn1"><div class="usertext-body may-blank-within md-container "><div class="md"><p>${content}</p></div></div><div class="usertext-edit md-container" style="display: none"><div class="md"><textarea rows="1" cols="1" name="text" class="">${content}</textarea></div><div class="bottom-area"><span class="help-toggle toggle" style="display: none"><a class="option active " href="#" tabindex="100" onclick="return toggle(this, helpon, helpoff)">formatting help</a><a class="option " href="#">hide help</a></span><a href="/help/contentpolicy" class="reddiquette" target="_blank" tabindex="100">content policy</a><span class="error CANT_REPLY field-parent" style="display:none"></span><span class="error TOO_LONG field-text" style="display:none"></span><span class="error RATELIMIT field-ratelimit" style="display:none"></span><span class="error NO_TEXT field-text" style="display:none"></span><span class="error SUBREDDIT_LINKING_DISALLOWED field-text" style="display:none"></span><span class="error SUBREDDIT_OUTBOUND_LINKING_DISALLOWED field-text" style="display:none"></span><span class="error USERNAME_LINKING_DISALLOWED field-text" style="display:none"></span><span class="error USERNAME_OUTBOUND_LINKING_DISALLOWED field-text" style="display:none"></span><span class="error TOO_OLD field-parent" style="display:none"></span><span class="error THREAD_LOCKED field-parent" style="display:none"></span><span class="error DELETED_COMMENT field-parent" style="display:none"></span><span class="error USER_BLOCKED field-parent" style="display:none"></span><span class="error USER_MUTED field-parent" style="display:none"></span><span class="error USER_BLOCKED_MESSAGE field-parent" style="display:none"></span><span class="error INVALID_USER field-parent" style="display:none"></span><span class="error MUTED_FROM_SUBREDDIT field-parent" style="display:none"></span><span class="error QUARANTINE_REQUIRES_VERIFICATION field-user" style="display:none"></span><span class="error TOO_MANY_COMMENTS field-text" style="display:none"></span><span class="error SUBMIT_VALIDATION_BODY_REQUIRED field-body" style="display:none"></span><span class="error SUBMIT_VALIDATION_BODY_NOT_ALLOWED field-body" style="display:none"></span><span class="error SUBMIT_VALIDATION_BODY_BLACKLISTED_STRING field-body" style="display:none"></span><span class="error SUBMIT_VALIDATION_BODY_NOT_ALLOWED field-body" style="display:none"></span><span class="error SUBMIT_VALIDATION_BODY_REQUIRED field-body" style="display:none"></span><span class="error SUBMIT_VALIDATION_BODY_REQUIREMENT field-body" style="display:none"></span><span class="error SUBMIT_VALIDATION_REGEX_TIMEOUT field-body" style="display:none"></span><span class="error SUBMIT_VALIDATION_BODY_REGEX_REQUIREMENT field-body" style="display:none"></span><span class="error SUBMIT_VALIDATION_MAX_LENGTH field-body" style="display:none"></span><span class="error SUBMIT_VALIDATION_MIN_LENGTH field-body" style="display:none"></span><span class="error SOMETHING_IS_BROKEN field-parent" style="display:none"></span><span class="error COMMENT_GUIDANCE_VALIDATION_FAILED field-text" style="display:none"></span><span class="error placeholder field-body" style="display:none"></span><span class="error placeholder field-text" style="display:none"></span><div class="usertext-buttons"><button type="submit" onclick="" class="save" style="display:none">save</button><button type="button" onclick="return cancel_usertext(this);" class="cancel" style="display:none">cancel</button><span class="status"></span></div></div><div class="markhelp" style="display:none"><p></p><p>reddit uses a slightly-customized version of <a href="http://daringfireball.net/projects/markdown/syntax">Markdown</a> for formatting. See below for some basics, or check <a href="/wiki/commenting">the commenting wiki page</a> for more detailed help and solutions to common issues.</p><p></p><table class="md"><tbody><tr style="background-color: #ffff99; text-align: center"><td><em>you type:</em></td><td><em>you see:</em></td></tr><tr><td>*italics*</td><td><em>italics</em></td></tr><tr><td>**bold**</td><td><b>bold</b></td></tr><tr><td>[reddit!](https://reddit.com)</td><td><a href="https://reddit.com">reddit!</a></td></tr><tr><td>* item 1<br>* item 2<br>* item 3</td><td><ul><li>item 1</li><li>item 2</li><li>item 3</li></ul></td></tr><tr><td>&gt; quoted text</td><td><blockquote>quoted text</blockquote></td></tr><tr><td>Lines starting with four spaces<br>are treated like code:<br><br><span class="spaces">&nbsp;&nbsp;&nbsp;&nbsp;</span>if 1 * 2 &lt; 3:<br><span class="spaces">&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;</span>print "hello, world!"<br></td><td>Lines starting with four spaces<br>are treated like code:<br><pre>if 1 * 2 &lt; 3:<br>&nbsp;&nbsp;&nbsp;&nbsp;print "hello, world!"</pre></td></tr><tr><td>~~strikethrough~~</td><td><strike>strikethrough</strike></td></tr><tr><td>super^script</td><td>super<sup>script</sup></td></tr></tbody></table></div></div></form><ul class="flat-list buttons"><li class="first"><a href="https://old.reddit.com/r/aww/comments/1c1eyde/full_aussie_wrasslin_with_mini_corgiaussie/lplovn1/" data-event-action="permalink" class="bylink" rel="nofollow">permalink</a></li><li class="comment-save-button save-button login-required"><a href="javascript:void(0)">save</a></li><li><a class="edit-usertext" href="javascript:void(0)" onclick="return edit_usertext(this)">edit</a></li><li><form class="toggle sendreplies-button " action="#" method="get"><input type="hidden" name="executed" value="inbox replies disabled"><input type="hidden" name="state" value="False"><input type="hidden" name="id" value="t1_lplovn1"><span class="option main active"><a href="#" class="togglebutton " onclick="return toggle(this)" data-event-action="disable_inbox_replies">disable inbox replies</a></span><span class="option error">are you sure?  <a href="javascript:void(0)" class="yes" onclick="change_state(this, &quot;sendreplies&quot;, null, undefined, null)">yes</a> / <a href="javascript:void(0)" class="no" onclick="return toggle(this)">no</a></span></form></li><li><form class="toggle del-button " action="#" method="get"><input type="hidden" name="executed" value="deleted"><span class="option main active"><a href="#" class="togglebutton " onclick="return toggle(this)" data-event-action="delete">delete</a></span><span class="option error">are you sure?  <a href="javascript:void(0)" class="yes" onclick="change_state(this, &quot;del&quot;, hide_thing, undefined, null)">yes</a> / <a href="javascript:void(0)" class="no" onclick="return toggle(this)">no</a></span></form></li><li class="reply-button login-required"><a class="access-required" href="javascript:void(0)" data-event-action="comment" onclick="return reply(this)">reply</a></li></ul><div class="reportform report-t1_lplovn1"></div></div><div class="child"></div><div class="clearleft"></div></div> <div class="clearleft"></div>`
  // Insert as the first child only if it is a new comment (isEdit is false)
  var insertedElement;
  if (oldComment) {
    oldComment.insertAdjacentHTML('beforebegin', newSubCommentHTML); // Insert new comment right before old one
    insertedElement = oldComment.previousElementSibling; // Select the newly inserted element
    childDiv.removeChild(oldComment); // Remove the old comment
  }

  else {
    childDiv.insertAdjacentHTML('afterbegin', newSubCommentHTML);
    insertedElement = childDiv.firstElementChild;
  }

  addDeleteUserReplyFakePostListener(insertedElement, fakePostId, content);
  // Select the button using document.querySelector
  var saveButton = childDiv.firstElementChild.querySelector('.usertext-buttons .save');
  console.log("saveButton from user reply to fake post: ", saveButton);

  // this is for edit , if user edit the comment 
  saveButton.addEventListener('click', function (event) {
    event.preventDefault();
    event.stopPropagation();


    var textarea = insertedElement.querySelector('textarea[name="text"]');

    if (textarea && textarea.value !== null) {
      var enteredText = textarea.value;



      // remove the old user reply to fake post comment ; 

      sendRemoveUserReplyFromFakePostMessage(fakePostId, content);
      sendInsertUserReplyToFakePostMessage(fakePostId, enteredText);
      insertUserReplyFakePost(childDiv, username, enteredText, fakePostId, insertedElement);



    }

  });

}

function sendInsertUserReplyToFakePostMessage(fakePostId, replyContent) {

  // Get the user ID (assuming userpid is available in your context)
  chrome.runtime.sendMessage({
    message: "insertUserReplyToFakePost",  // Message type for inserting user reply
    fakePostId: fakePostId,                // Fake post ID
    replyContent: replyContent             // The user's reply content
  }, function (response) {
    if (response && response.success) {
      console.log("User reply inserted successfully.");
    } else {
      console.error("Failed to insert user reply.");
    }
  });
}

function sendRemoveUserReplyFromFakePostMessage(fakePostId, replyContent) {
  // Get the user ID (assuming userpid is available in your context)
  chrome.runtime.sendMessage({
    message: "removeUserReplyFromFakePost",  // Message type for removing user reply
    fakePostId: fakePostId,                  // Fake post ID
    replyContent: replyContent               // The reply content to remove
  }, function (response) {
    if (response && response.success) {
      console.log("User reply removed successfully.");
    } else {
      console.error("Failed to remove user reply.");
    }
  });
}

function insertCachedHTMLandMonitorExpandoButton(parentDiv) {
  var expandoButtonDiv = parentDiv.querySelector('.expando-button');
  /// hide button 
  if (expandoButtonDiv) {
    // If the div exists
    console.log('The div with class "expando-button" exists.');

    var expandoDiv = parentDiv.querySelector('.expando');

    if (expandoDiv) {
      var cachedHTML = expandoDiv.getAttribute('data-cachedhtml');

      if (cachedHTML) {

        var decodedHTML = decodeHTMLEntities(cachedHTML);

        var cachedHTMLStartIndex = Array.from(expandoDiv.childNodes).findIndex(child => {
          return child.nodeType === Node.COMMENT_NODE || child.nodeType === Node.TEXT_NODE ? false : child.outerHTML === decodedHTML;
        });

        // Select the <span> element with the class 'error'
        var errorSpan = expandoDiv.querySelector('span.error');

        // Check if the element exists
        if (errorSpan) {
          // Remove the span element from the DOM
          errorSpan.remove();
          console.log('Removed the error span: loading...');
        } else {
          console.log('No span with class "error" found.');
        }

        expandoDiv.insertAdjacentHTML('beforeend', decodedHTML);
      }
    }

    expandoButtonDiv.addEventListener('click', function (event) {
      //event.preventDefault();  // Prevent Reddit's action
      event.stopPropagation(); // Stop the event from bubbling up to Reddit's listener

      if (expandoButtonDiv.classList.contains('expanded')) {
        // Change display to 'none' if it's expanded
        expandoDiv.style.display = 'none';
        console.log('The div was expanded, now changing display to none.');

        // toggle the class to 'collapsed'
        expandoButtonDiv.classList.remove('expanded');
        expandoButtonDiv.classList.add('collapsed');
      }
      // Check if the div has the 'collapsed' class
      else if (expandoButtonDiv.classList.contains('collapsed')) {
        // Change display to 'block' if it's collapsed
        expandoDiv.style.display = 'block';
        console.log('The div was collapsed, now changing display to block.');

        //  toggle the class to 'expanded'
        expandoButtonDiv.classList.remove('collapsed');
        expandoButtonDiv.classList.add('expanded');
      }
    }, true);

  }
}


function sendDeleteUserReplyRealCommentMessage(replyTo, replyPost, replyContent) {
  var message = {
    message: "deleteUserReplyRealComment",
    data: {
      replyTo: replyTo,             // The real comment ID being replied to
      replyPost: replyPost,         // The post ID where the real comment is
      replyContent: replyContent    // The content of the reply to be deleted
    }
  };

  chrome.runtime.sendMessage(message, function (response) {
    if (response.message === "deleteUserReplyRealComment") {
      console.log("User reply on real comment deleted successfully.");
    }
  });
}
function sendAddUserReplyRealCommentMessage(replyTo, replyPost, replyContent) {
  var message = {
    message: "addUserReplyRealComment",
    data: {
      replyContent: replyContent,   // The content of the user's reply
      replyTo: replyTo,             // The real comment ID being replied to
      replyPost: replyPost          // The post ID where the real comment is
    }
  };

  chrome.runtime.sendMessage(message, function (response) {
    if (response.message === "addUserReplyRealComment") {
      console.log("User reply on real comment added successfully.");
    }
  });
}

// messageHandlers.js

// Function to send a message to add a user reply to a real post
function sendAddUserReplyRealPostMessage(replyContent, replyPost) {
  const message = {
    message: "addUserReplyRealPost",
    data: {
      replyContent: replyContent,   // The content of the user's reply
      replyPost: replyPost          // The post ID where the real post is
    }
  };

  chrome.runtime.sendMessage(message, function (response) {
    if (response.message === "addUserReplyRealPost") {
      console.log("User reply on real post added successfully.");
    }
  });
}

// Function to send a message to delete a user reply on a real post
function sendDeleteUserReplyRealPostMessage(replyPost, replyContent) {
  const message = {
    message: "deleteUserReplyRealPost",
    data: {
      replyPost: replyPost,         // The post ID where the real post is
      replyContent: replyContent    // The content of the reply to delete
    }
  };

  chrome.runtime.sendMessage(message, function (response) {
    if (response.message === "deleteUserReplyRealPost") {
      console.log("User reply on real post deleted successfully.");
    }
  });
}

// Other functions (sendAddUserReplyRealCommentMessage, sendDeleteUserReplyRealCommentMessage) will remain here...
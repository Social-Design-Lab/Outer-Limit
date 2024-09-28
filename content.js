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
        monitor_viewed_post();
      } else {
        console.log(`This is not the Reddit main page: ${window.location.href}`);



        changeRealPostPage();
        monitor_new_comment(replyPostButtonSelector, replyCommentSelector, filterText, commentSelector);

        listentobuttons(likebuttonSelector, dislikebuttonSelector, commentTextClassName);
      }
    }

    setTimeout(() => {
      document.documentElement.style.visibility = 'visible';
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

// post page listen to buttons 
function listentobuttons(likebuttonSelector, dislikebuttonSelector = null, commentTextClassName) {
  const upvoteButtons = document.querySelectorAll(likebuttonSelector);
  upvoteButtons.forEach((button) => {
    if (!button.getAttribute('outer-limit-monitored')) {

      button.addEventListener('click', () => {
        //var post = button.parentNode.parentNode.parentNode.getElementsByClassName('_292iotee39Lmt0MkQZ2hPV');
        var post = findAncestorWithClass(button, commentTextClassName);
        var text = post[0].innerText;
        //var uid = get_user_id_from_background();
        if (text == '') {
          const currentUrl = window.location.href;
          console.log(`upvote button clicked for post: "${currentUrl}"`);
          send_votePost_to_background("upvote", currentUrl);

        }
        //var uid = get_user_id_from_background();

        else {
          console.log(`upvote button clicked for post comment teest: "${text}"`);
          //senddatatodb(uid,"upvote", text);
          send_voteComment_to_background("upvote", text, window.location.href);
          //alert("whyyyy");
        }


      });
      button.setAttribute('outer-limit-monitored', 'true');
    }
  });

  if (dislikebuttonSelector) {
    const downvoteButtons = document.querySelectorAll(dislikebuttonSelector);
    downvoteButtons.forEach((button) => {
      if (!button.getAttribute('outer-limit-monitored')) {
        button.addEventListener('click', () => {
          //var post = button.parentNode.parentNode.parentNode.getElementsByClassName('_292iotee39Lmt0MkQZ2hPV');
          var post = findAncestorWithClass(button, commentTextClassName);
          var text = post[0].innerText;
          if (text == '') {

            const currentUrl = window.location.href;
            console.log(`downvote button clicked for post: "${currentUrl}"`);
            send_votePost_to_background("downvote", currentUrl);
          }
          //var uid = get_user_id_from_background();

          else {

            console.log(`downvote button clicked for post comment: "${text}"`);
            //send_data_to_background("downvote_comment", text);
            send_voteComment_to_background("downvote", text, window.location.href);
          }
          //senddatatodb(uid,"downvote", text);

        });
        button.setAttribute('outer-limit-monitored', 'true');
      }
    });
  }




}





// this is when the experimenet first start
chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
  if (request.message === "start experiment") {
    user_active_time();
    runMyCode();
    new_active_triggered = true;
    console.log("Received message from the background script for listen the button:", request.message);

  }
});


/* chrome.runtime.onMessage.addListener(
    function(request, sender, sendResponse) {
        window.addEventListener('load', function() {
            // Select all elements with the class "_1rZYMD_4xjzK" (which represents the like button)
            const likeButtons = document.getElementsByClassName("_1rZYMD_4xY3gRcSS3p8ODO _25IkBM0rRUqWX5ZojEMAFQ _3ChHiOyYyUkpZ_Nm3ZyM2M");
        
            console.log("print out likebuttons length: ");
            console.log(likeButtons['length'] );
            // For each like button, change the text content to the desired number
            for (let i = 0; i < likeButtons['length']; i++) {
                likeButtons[i].textContent=0;
              }
          });
}); */


// fake comments insertation insert 
function insertFakeComments(postElement, fakeComments, fakePostID) {

  fakeComments.forEach(comment => {

    commentHTML = `<div class=" thing id-t1_lowvlb8 noncollapsed   comment " id="thing_t1_lowvlb8" " data-fullname="t1_lowvlb8" data-type="comment" data-gildings="0" data-subreddit="comicbooks" data-subreddit-prefixed="r/comicbooks" data-subreddit-fullname="t5_2qhon" data-subreddit-type="public" data-author="gooch_norris_" data-author-fullname="t2_vp5qd67n" data-replies="0" data-permalink="/r/comicbooks/comments/1fpawnh/who_is_a_lesser_known_hero_with_great_comics/lowvlb8/"><p class="parent"><a name="lowvlb8"></a></p><div class="midcol unvoted"><div class="arrow up login-required access-required" data-event-action="upvote" role="button" aria-label="upvote" tabindex="0"></div><div class="arrow down login-required access-required" data-event-action="downvote" role="button" aria-label="downvote" tabindex="0"></div></div><div class="entry unvoted"><p class="tagline"><a href="javascript:void(0)" class="expand" >[–]</a><a href="https://old.reddit.com/user/gooch_norris_" class="author may-blank id-t2_vp5qd67n">${comment.user_name}</a><span class="userattrs"></span> <span class="score dislikes" title="2">${parseInt(comment.likes) - 1} points</span><span class="score unvoted" title="3">${comment.likes} points</span><span class="score likes" title="4">${parseInt(comment.likes) + 1} points</span> <time title="Wed Sep 25 20:25:03 2024 UTC" datetime="2024-09-25T20:25:03+00:00" class="live-timestamp">${comment.time}</time>&nbsp;<a href="javascript:void(0)" class="numchildren" >(0 children)</a></p><form action="#" class="usertext warn-on-unload" onsubmit="return false" id="form-t1_lowvlb8aux"><input type="hidden" name="thing_id" value="t1_lowvlb8"><div class="usertext-body may-blank-within md-container "><div class="md"><p>${comment.content}</p>
  </div>
  </div></form><ul class="flat-list buttons"><li class="first"><a href="https://old.reddit.com/r/comicbooks/comments/1fpawnh/who_is_a_lesser_known_hero_with_great_comics/lowvlb8/" data-event-action="permalink" class="bylink" rel="nofollow">permalink</a></li><li><a href="javascript:void(0)" data-comment="/r/comicbooks/comments/1fpawnh/who_is_a_lesser_known_hero_with_great_comics/lowvlb8/" data-media="www.redditmedia.com" data-link="/r/comicbooks/comments/1fpawnh/who_is_a_lesser_known_hero_with_great_comics/" data-root="true" data-title="Who is a lesser known hero with great comics?" class="embed-comment">embed</a></li><li class="comment-save-button save-button login-required"><a href="javascript:void(0)">save</a></li><li class="report-button login-required"><a href="javascript:void(0)" class="reportbtn access-required" data-event-action="report">report</a></li><li class="reply-button login-required"><a class="access-required" href="javascript:void(0)" data-event-action="comment" >reply</a></li></ul><div class="reportform report-t1_lowvlb8"></div></div><div class="child"></div><div class="clearleft"></div></div><div class="clearleft"></div>` ;

    let range = document.createRange();
    let commentElement = range.createContextualFragment(commentHTML).firstChild;
    //postElement.insertAdjacentHTML('beforeend', commentHTML);
    for (let key in comment) {
      // Check if the key has any hidden characters related to "fake_comment_id"
      if (key.includes("fake_comment_id")) {
        comment.fake_comment_id = comment[key]; // Assign to a new key with a clean name
        delete comment[key]; // Clean up the old key
      }
    }

    // Ensure that fake_comment_id is available and log it
    console.log("Fake Comment ID:", comment.fake_comment_id);
    let authorElement = commentElement.querySelector('.author');
    authorElement.addEventListener('mouseover', function () {
      // Code to execute when the mouse hovers over the element
      console.log('Mouse is hovering over the author element');
      event.preventDefault();  // Prevent Reddit's action
      event.stopPropagation();
    });
    insertCommentFormORReplyFakeComment(commentElement, comment.fake_comment_id, fakePostID);
    applyUserVoteOnElement(commentElement, getUserVoteOnFakeComment, comment.fake_comment_id);
    handleVoteButtons(commentElement, "fakecomment", comment.fake_comment_id);
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
  const firstSubmitButtons = document.querySelector(replyPostButtonSelector);
  //console.log(firstSubmitButtons);
  //console.log(firstSubmitButtons.hasEventListener);
  //console.log("top submit comments: " ,firstSubmitButtons);
  //const firstSubmitButtons = document.querySelector('button[type="submit"]');
  //console.log(commentSubmitButton);

  if (firstSubmitButtons && !firstSubmitButtons.hasEventListener & !firstSubmitButtons.hasAttribute('data-listening')) {
    firstSubmitButtons.addEventListener('click', function (event) {
      console.log('Comment submit button clicked!');
      let currentNode = firstSubmitButtons;

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
                  let currentNode = commentSubmitButtons;

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


                  let current = commentSubmitButtons;
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

function monitor_viewed_post() {
  console.log("monitor new post is called");
  function isInViewport(el) {
    var rect = el.getBoundingClientRect();


    if (rect.top === 0 && rect.left === 0 && rect.bottom === 0 && rect.right === 0) {
      return false;
    } else {


      var elemTop = rect.top;
      var elemBottom = rect.bottom;

      // Only completely visible elements return true:
      var isVisible = (elemTop >= 0) && (elemBottom <= window.innerHeight);
      // Partially visible elements return true:
      //isVisible = elemTop < window.innerHeight && elemBottom >= 0;
      return isVisible;
    }
  }

  let elements = document.querySelectorAll('._1RYN-7H8gYctjOQeL8p2Q7');
  let filteredElements = Array.from(elements).filter(element => !element.classList.contains("promotedlink"));

  // Function to add event listeners to upvote and downvote buttons
  function addVoteEventListeners(elements) {
    elements.forEach((element) => {
      const upvoteButton = element.querySelector('[aria-label="upvote"]');
      if (upvoteButton && !upvoteButton.getAttribute("outer-limit-monitored")) {
        upvoteButton.addEventListener("click", () => {

          var text = element.querySelector(`[data-click-id="body"][class="SQnoC3ObvgnGjWt90zD9Z _2INHSNB8V5eaWp4P0rY_mE"]`).getAttribute("href");
          const fullUrl = redditBaseUrl + text;
          console.log(`upvote button clicked for post: "${fullUrl}"`);
          //send_data_to_background("upvote_post", fullUrl);
          send_votePost_to_background("upvote", fullUrl);
        });
        upvoteButton.setAttribute("outer-limit-monitored", "true");
      }

      const downvoteButton = element.querySelector('[aria-label="downvote"]');
      if (downvoteButton && !downvoteButton.getAttribute("outer-limit-monitored")) {
        downvoteButton.addEventListener("click", () => {
          //var post = downvoteButton.parentNode.parentNode.parentNode.getElementsByClassName("_292iotee39Lmt0MkQZ2hPV");
          var text = element.querySelector(`[data-click-id="body"][class="SQnoC3ObvgnGjWt90zD9Z _2INHSNB8V5eaWp4P0rY_mE"]`).getAttribute("href");
          const fullUrl = redditBaseUrl + text;
          console.log(`downvote button clicked for post: "${fullUrl}"`);
          //send_data_to_background("downvote_post", fullUrl);
          send_votePost_to_background("downvote", fullUrl)
        });
        downvoteButton.setAttribute("outer-limit-monitored", "true");
      }
    });
  }

  // Add event listeners to the initial filtered elements
  addVoteEventListeners(filteredElements);

  /// end of post vote section 

  const post_observer = new MutationObserver(function (mutations) {
    mutations.forEach(function (mutation) {
      //listentobuttons();
      elements = document.querySelectorAll('._1RYN-7H8gYctjOQeL8p2Q7');
      filteredElements = Array.from(elements).filter(element => !element.classList.contains("promotedlink"));
      addVoteEventListeners(filteredElements);
    });
  });

  post_observer.observe(document.body, {
    childList: true,
    subtree: true
  });
  //const viewedPosts = new Set();
  const viewedPosts = new Set();
  for (let i = 0; i < filteredElements.length; i++) {
    console.log("this is first time :", filteredElements[i]);
  }
  window.addEventListener("scroll", function () {

    for (let i = 0; i < filteredElements.length; i++) {
      //console.log("is the element in viewport:",  isInViewport(filteredElements[i]));
      //console.log("index number: ", i+1);

      if (isInViewport(filteredElements[i])) {
        const post_url = filteredElements[i].querySelector(`[data-click-id="body"][class="SQnoC3ObvgnGjWt90zD9Z _2INHSNB8V5eaWp4P0rY_mE"]`).getAttribute("href");
        const fullUrl = post_url;
        if (!viewedPosts.has(fullUrl)) {
          //console.log(filteredElements[i].getBoundingClientRect());
          //const fullUrl = redditBaseUrl + post_url;

          console.log("The href of the post", fullUrl, " has been viewed and sent to database.");
          //send_data_to_background("viewed_post", fullUrl);
          sendUpdateViewedPostToBackground(fullUrl);
          viewedPosts.add(fullUrl);
          //console.log(Array.from(viewedPosts));
        }
      }
    }
  });
}



// this function is used for only post page(sub reddit page ) when user scroll the page or clicked more reply(new elements added into the DOM)
function add_all_event() {
  // this funciton is used for update number of likes when user
  window.addEventListener('scroll', function () {
    // Your code here will run when the user scrolls the page

    chrome.runtime.sendMessage({ message: "get_all_setup" }, function (response) {
      if (response.ifstartexp) {

        listentobuttons(likebuttonSelector, dislikebuttonSelector, commentTextClassName);
        monitor_new_comment(replyPostButtonSelector, replyCommentSelector, filterText, commentSelector);

      }
    });
  });
  // this is used to monitor if any elemenet added into the post page then we want to update the likes and listen button
  const post_individual_observer = new MutationObserver(function (mutations) {
    mutations.forEach(function (mutation) {
      if (mutation.type === 'childList') {
        mutation.addedNodes.forEach(function (addedNode) {
          // Check if the added node is an element
          if (addedNode.nodeType === Node.ELEMENT_NODE) {

            chrome.runtime.sendMessage({ message: "get_all_setup" }, function (response) {

              if (response.ifstartexp) {

                listentobuttons(likebuttonSelector, dislikebuttonSelector, commentTextClassName);
                monitor_new_comment(replyPostButtonSelector, replyCommentSelector, filterText, commentSelector);


              }
            });
          }
        });
      }
    });
  });

  // Start observing the entire document
  post_individual_observer.observe(document, {
    childList: true,
    subtree: true
  });
}
// end of the section 


if (location.href === "https://old.reddit.com/") {


} else {
  //alert("this triggered");
  add_all_event();

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

  chrome.runtime.sendMessage({ message: "need_uid_from_backgroun" }, function (response) {
    const userpid = response.value;
    console.log("Received userpid from background script 1:", userpid);


    fetch(`https://outer.socialsandbox.xyz/api/fake_posts`)
      .then(response => response.json())
      .then(data => {
        // Check if the data contains the expected structure
        if (Array.isArray(data) && data.length > 0) {
          var fakePosts = data;
          console.log("Fake post retrieved successfully 1:", fakePosts);

          // Process each fake comment
          fakePosts.forEach(post => {
            // Access the properties of each comment
            var { id, fakepost_url, fakepost_index, fakepost_title, fakepost_content, fakepost_image, fakepost_like, fakepost_time, fakepost_community, fakepost_poster } = post;
            fetch(`https://outer.socialsandbox.xyz/api/getViewedPosts?userid=${userpid}`)
              .then(response => {
                if (!response.ok) {
                  throw new Error('Network response was not ok');
                }
                return response.text();
              })
              .then(responseText => {
                console.log('Raw response content:', responseText);
                const data = JSON.parse(responseText); // Parse the response content as JSON
                if (data.viewed_posts && data.viewed_posts.length > 0) {
                  return data.viewed_posts;
                } else {
                  // If 'viewed_posts' is not available or empty, proceed with an empty array
                  console.log("No viewed posts available, proceeding with empty data.");
                  return [];
                }
              })
              .then(viewedp => { // 'viewedp' now directly references the array
                //console.log("Viewed posts array:", viewedp);
                if (Array.isArray(viewedp)) {
                  console.log("Viewed post retrieved successfully 1:", viewedp);

                  if (viewedp.some(item => item.post_url === fakepost_url)) {
                    console.log("Array contains the specific URL.");
                  } else {
                    console.log("Array does not contain the specific URL.");
                    // alert(" You made it! The Outer Limit is working on your reddit page now.");
                    chrome.runtime.sendMessage({ message: "get_time" }, function (response) {
                      // Process the response received from the background script
                      console.log("Received start time from background script:", response.value);

                      // Access the value property in the response object
                      if (response && response.value) {
                        var startDate = new Date();
                        console.log("startDate:", startDate);

                        var startTime = new Date(response.value);
                        console.log("startTime:", startTime);
                        var time = fakepost_time;
                        var diff = startDate - startTime;
                        var minutes = Math.floor(diff / 60000); // 1 minute = 60000 milliseconds
                        var hours = Math.floor(minutes / 60);
                        var days = Math.floor(hours / 24);
                        var months = Math.floor(days / 30); // Assuming 30 days in a month
                        var years = Math.floor(months / 12);

                        console.log("old time: ", time);
                        console.log("first diff: ", diff);

                        if (years >= 1) {

                          if (!time.includes("yr")) {
                            time = years + " yr. ago";
                          } else if (time.includes("yr")) {
                            let numInTime = parseInt(time);
                            let sum = years + numInTime;
                            time = sum + " yr. ago";
                          }
                        } else if (months >= 1) {
                          if (!time.includes("yr") && !time.includes("mo")) {
                            time = months + " mo. ago";
                          } else if (time.includes("mo")) {
                            let numInTime = parseInt(time);
                            let sum = months + numInTime;
                            time = sum + " mo. ago";
                          }
                        } else if (days >= 1) {
                          if (!time.includes("yr") && !time.includes("mo") && !time.includes("day")) {
                            if (days > 1) {
                              time = days + " days ago";
                            }
                            else {
                              time = days + " day ago";
                            }
                          } else if (time.includes("day")) {
                            let numInTime = parseInt(time);
                            let sum = days + numInTime;
                            if (sum > 1) {
                              time = sum + " days ago";
                            }
                            else {
                              time = sum + " day ago";
                            }
                          }
                        } else if (hours >= 1) {
                          if (!time.includes("yr") && !time.includes("mo") && !time.includes("day") && !time.includes("hr")) {
                            time = hours + " hr ago";
                          }
                          else if (time.includes("hr")) {
                            let numInTime = parseInt(time);
                            let sum = hours + numInTime;
                            time = sum + " hr. ago";
                          }
                        } else if (minutes >= 1) {

                          if (!time.includes("yr") && !time.includes("mo") && !time.includes("day") && !time.includes("hr") && !time.includes("min")) {
                            time = minutes + " min. ago";
                          }
                          else if (time.includes("min")) {
                            let numInTime = parseInt(time);
                            let sum = minutes + numInTime;
                            time = sum + " min. ago";

                          }
                        }
                        var combinedValue = fakepost_url;
                        getuservoteonFake(combinedValue)
                          .then(result => {
                            console.log("Vote result:", result); // "upvote", "downvote", or "novote"

                            // Conditionally perform actions based on the result
                            if (result === "upvote") {
                              //alert(" upvote");
                              // Perform actions for upvote
                              //console.log("User upvoted the content:");
                              fakepost_like = parseInt(fakepost_like) + 1;
                              var fakepost = document.createElement("div");
                              fakepost.innerHTML = `<div class="_1oQyIsiPHYt6nx7VOmd1sz _1RYN-7H8gYctjOQeL8p2Q7 scrollerItem _3Qkp11fjcAw9I9wtLo8frE _1qftyZQ2bhqP62lbPjoGAh  Post t3_14x007q " data-testid="post-container" id="t3_14x007q" tabindex="-1" data-adclicklocation="background"><div></div><div class="_23h0-EcaBUorIHC-JZyh6J" style="width:40px;border-left:4px solid transparent"><div class="_1E9mcoVn4MYnuBQSVDt1gC" id="vote-arrows-t3_14x007q"><button aria-label="upvote" aria-pressed="false" class="voteButton " data-click-id="upvote" data-adclicklocation="upvote" id="upvote-button-t3_14x007q" outer-limit-monitored="true"><span class="_2q7IQ0BUOWeEZoeAxN555e _3SUsITjKNQ7Tp0Wi2jGxIM qW0l8Af61EP35WIG6vnGk Z3lT0VGlALek4Q9j0ZQCr"><i class="icon icon-upvote_fill _2Jxk822qXs4DaXwsN7yyHA"></i></span></button><div class="_1rZYMD_4xY3gRcSS3p8ODO _3a2ZHWaih05DgAOtvu6cIo " style="color: rgb(255, 69, 0); ">${fakepost_like}</div><button aria-label="downvote" aria-pressed="false" class="voteButton" data-click-id="downvote" data-adclicklocation="downvote" outer-limit-monitored="true"><span class="_1iKd82bq_nqObFvSH1iC_Q Q0BxYHtCOJ_rNSPJMU2Y7 _2fe-KdD2OM0ciaiux-G1EL _3yQIOwaIuF6gn8db96Gu7y"><i class="icon icon-downvote ZyxIIl4FP5gHGrJDzNpUC"></i></span></button></div></div><div class="_1poyrkZ7g36PawDueRza-J _11R7M_VOgKO1RJyRSRErT3 " style="background:#FFFFFF" data-adclicklocation="background" data-click-id="background"><div class="_292iotee39Lmt0MkQZ2hPV RichTextJSON-root nAL34ZVf4KfyEoZIzUgmN _3hWVRt6y8PqOoC2VuZETZI"><p class="_1qeIAgB0cPwnLhDF9XSiJM">Because you've shown interest in a similar community</p></div><div class="_14-YvdFiW5iVvfe5wdgmET"><div class="_2dr_3pZUCk8KfJ-x0txT_l"><a data-click-id="subreddit" class="_3ryJoIoycVkA88fy40qNJc" href=""><img style="background-color:#EA0027" alt="Subreddit Icon" role="presentation" src="https://styles.redditmedia.com/t5_2qh1o/styles/communityIcon_0uzb28pnky3d1.png?width=256&s=800ad355a90445c717e938142607ed18a59926a2" class="_34CfAAowTqdbNDYXz5tBTW _1WX5Y5qFVBTdr6hCPpARDB "></a></div><div class="cZPZhMe-UCZ8htPodMyJ5"><div class="_3AStxql1mQsrZuUIFP9xSg nU4Je7n-eSXStTBAPMYt8" data-adclicklocation="top_bar"><div class="_2mHuuvyV9doV3zwbZPtIPG"><a data-click-id="subreddit" class="_3ryJoIoycVkA88fy40qNJc" href="">${fakepost_community}</a><div id="SubredditInfoTooltip--t3_14x007q--USPS"></div></div><span class="_3LS4zudUBagjFS7HjWJYxo _37gsGHa8DMRAxBmQS-Ppg8 _3V4xlrklKBP2Hg51ejjjvz" role="presentation">•</span><span style="color:#787C7E" class="_2fCzxBE1dlMh4OFc7B3Dun">Posted by</span><div class="_2mHuuvyV9doV3zwbZPtIPG"><div id="UserInfoTooltip--t3_14x007q"><a class="_2tbHP6ZydRpjI44J3syuqC  _23wugcdiaj44hdfugIAlnX oQctV4n0yUb0uiHDdGnmE" data-click-id="user" data-testid="post_author_link" href="" style="color: rgb(120, 124, 126);">${fakepost_poster}</a></div></div><span class="_2VF2J19pUIMSLJFky-7PEI" data-testid="post_timestamp" data-click-id="timestamp" style="color:#787C7E">${time}</span></div><div class="_2wFk1qX4e1cxk8Pkw1rAHk"></div><div class="_3XoW0oYd5806XiOr24gGdb"></div></div><button role="button" tabindex="0" id="subscribe-button-t3_14x007q" class="_35dG7dsi4xKTT-_2MB74qq _2iuoyPiKHN3kfOoeIQalDT _10BQ7pjWbeYP63SAPNS8Ts UEPNkU0rd1-nvbkOcBatc "><span>Join</span></button></div><div class="_2FCtq-QzlfuN-SwVMUZMM3 _3wiKjmhpIpoTE2r5KCm2o6 t3_14x007q" data-adclicklocation="title"><div class="y8HYJ-y_lTUHkQIc1mdCq _2INHSNB8V5eaWp4P0rY_mE"><a data-click-id="body" class="SQnoC3ObvgnGjWt90zD9Z _2INHSNB8V5eaWp4P0rY_mE" href=${fakepost_url}><div class="_2SdHzo12ISmrC8H86TgSCp _3wqmjmv3tb_k-PROt7qFZe " style="--posttitletextcolor:#222222"><h3 class="_eYtD2XCVieq6emjKBH3m">${fakepost_title}</h3></div></a></div><div class="_2xu1HuBz1Yx6SP10AGVx_I" data-ignore-click="false"><div class="lrzZ8b0L6AzLkQj5Ww7H1"></div><div class="lrzZ8b0L6AzLkQj5Ww7H1"><a href=""></a></div></div><div class="_1hLrLjnE1G_RBCNcN9MVQf"><img alt="" src="https://www.redditstatic.com/desktop2x/img/renderTimingPixel.png" style="width: 1px; height: 1px;" onload="(__markFirstPostVisible || function(){})();"></div><style>.t3_14x007q._2FCtq-QzlfuN-SwVMUZMM3 {--postTitle-VisitedLinkColor: #9b9b9b;--postTitleLink-VisitedLinkColor: #9b9b9b;--postBodyLink-VisitedLinkColor: #989898;}</style></div><div class="STit0dLageRsa2yR4te_b"><div class="m3aNC6yp8RrNM_-a0rrfa " data-click-id="media"><div class="_3gBRFDB5C34UWyxEe_U6mD" style="padding-bottom:133.28125%"></div><div class="_3JgI-GOrkmyIeDeyzXdyUD _2CSlKHjH7lsjx0IpjORx14"><div class="_1NSbknF8ucHV2abfCZw2Z1 "><a href=${fakepost_url}><div class="_3Oa0THmZ3f5iZXAQ0hBJ0k " style="max-height:512px;margin:0 auto"><div><img alt="Post image" class="_2_tDEnGMLxpM6uOa2kaDB3 ImageBox-image media-element _1XWObl-3b9tPy64oaG6fax" src=${fakepost_image} style="max-height:512px"></div></div></a></div></div></div></div><div class="_1ixsU4oQRnNfZ91jhBU74y"><div class="_1E9mcoVn4MYnuBQSVDt1gC _2oM1YqCxIwkvwyeZamWwhW uFwpR-OdmueYZxdY_rEDX" id="vote-arrows-t3_14x007q"><button aria-label="upvote" aria-pressed="false" class="voteButton " data-click-id="upvote" data-adclicklocation="upvote"><span class="_2q7IQ0BUOWeEZoeAxN555e _3SUsITjKNQ7Tp0Wi2jGxIM qW0l8Af61EP35WIG6vnGk _3emIxnIscWEPB7o5LgU_rn"><i class="icon icon-upvote _2Jxk822qXs4DaXwsN7yyHA"></i></span></button><div class="_1rZYMD_4xY3gRcSS3p8ODO _25IkBM0rRUqWX5ZojEMAFQ" style="color: rgb(255, 69, 0);s">${fakepost_like}</div><button aria-label="downvote" aria-pressed="false" class="voteButton" data-click-id="downvote" data-adclicklocation="downvote"><span class="_1iKd82bq_nqObFvSH1iC_Q Q0BxYHtCOJ_rNSPJMU2Y7 _2fe-KdD2OM0ciaiux-G1EL _3yQIOwaIuF6gn8db96Gu7y"><i class="icon icon-downvote ZyxIIl4FP5gHGrJDzNpUC"></i></span></button></div><div class="_3-miAEojrCvx_4FQ8x3P-s"><a rel="nofollow" data-click-id="comments" data-adclicklocation="comments" data-test-id="comments-page-link-num-comments" class="_1UoeAeSRhOKSNdY_h3iS1O _1Hw7tY9pMr-T1F4P1C-xNU _3U_7i38RDPV5eBv7m4M-9J _2qww3J5KKzsD7e5DO0BvvU" href=${fakepost_url}><i class="icon icon-comment _3DVrpDrMM9NLT6TlsTUMxC" role="presentation"></i><span class="FHCV02u6Cp2zYL0fhQPsO">2 comments</span></a><div data-ignore-click="false" class="_3U_7i38RDPV5eBv7m4M-9J" data-adclicklocation="fl_unknown"><button class="_10K5i7NW6qcm-UoCtpB3aK YszYBnnIoNY8pZ6UwCivd _3yh2bniLq7bYr4BaiXowdO _1EWxiIupuIjiExPQeK4Kud _28vEaVlLWeas1CDiLuTCap"><span class="pthKOcceozMuXLYrLlbL1"><i class="_3yNNYT3e1avhAAWVHd0-92 icon icon-award" id="View--GiveAward--t3_14x007q"></i></span><span class="_2-cXnP74241WI7fpcpfPmg _70940WUuFmpHbhKlj8EjZ">Award</span></button></div><div class="_JRBNstMcGxbZUxrrIKXe _3U_7i38RDPV5eBv7m4M-9J _3yh2bniLq7bYr4BaiXowdO _1pShbCnOaF7EGWTq6IvZux _28vEaVlLWeas1CDiLuTCap" id="t3_14x007q-share-menu"><button data-click-id="share" data-adclicklocation="fl_share" class="kU8ebCMnbXfjCWfqn0WPb"><i class="icon icon-share _1GQDWqbF-wkYWbrpmOvjqJ"></i><span class="_6_44iTtZoeY6_XChKt5b0">share</span></button></div><div data-ignore-click="false" class="_3U_7i38RDPV5eBv7m4M-9J" data-adclicklocation="fl_unknown"><button class="_10K5i7NW6qcm-UoCtpB3aK YszYBnnIoNY8pZ6UwCivd _3yh2bniLq7bYr4BaiXowdO _2sAFaB0tx4Hd5KxVkdUcAx _28vEaVlLWeas1CDiLuTCap"><span class="pthKOcceozMuXLYrLlbL1"><i class="_1Xe01txJfRB9udUU85DNeR icon icon-save"></i></span><span class="_2-cXnP74241WI7fpcpfPmg _70940WUuFmpHbhKlj8EjZ">save</span></button></div><div class="OccjSdFd6HkHhShRg6DOl"></div><div class="_3MmwvEEt6fv5kQPFCVJizH"><div><button aria-expanded="false" aria-haspopup="true" aria-label="more options" id="t3_14x007q-overflow-menu" data-adclicklocation="overflow_menu" class="_2pFdCpgBihIaYh9DSMWBIu _1EbinKu2t3KjaT2gR156Qp uMPgOFYlCc5uvpa2Lbteu"><i class="_38GxRFSqSC-Z2VLi5Xzkjy icon icon-overflow_horizontal"></i></button></div></div><div class="_21pmAV9gWG6F_UKVe7YIE0"></div></div></div></div></div>`;
                              let elements = document.querySelector('.rpBJOHq2PR60pnwJlUyP0');

                              var upvoteButton = fakepost.querySelector('[aria-label="upvote"]');
                              var downvoteButton = fakepost.querySelector('[aria-label="downvote"]');
                              upvoteButton.setAttribute("buttonclicked", "true");
                              if (upvoteButton) {
                                // Do something with the upvote button, like adding an event listener
                                upvoteButton.addEventListener('click', function () {
                                  event.preventDefault(); // Prevent the default behavior (i.e., navigating to fakepost_url)
                                  event.stopPropagation();
                                  var span = upvoteButton.querySelector('span');
                                  var i = span.querySelector('i');
                                  if (upvoteButton.hasAttribute("buttonclicked")) {
                                    // Update class names of the span element
                                    span.classList.add('_3emIxnIscWEPB7o5LgU_rn');
                                    span.classList.remove('Z3lT0VGlALek4Q9j0ZQCr');

                                    // Select the i element within the span

                                    // Update class name of the i element
                                    i.classList.add('icon-upvote');
                                    i.classList.remove('icon-upvote_fill');
                                    // Select the element by its class name
                                    var element = fakepost.querySelector('._1rZYMD_4xY3gRcSS3p8ODO');

                                    // Check if the element was found
                                    if (element) {
                                      // Change the color style to orginal color

                                      element.style.color = '#1A1A1B';
                                      element.textContent = parseInt(element.textContent) - 1;
                                      delete_uservotefake_to_background(fakepost_url);
                                    } else {
                                      console.log('Element not found');
                                    }
                                    upvoteButton.removeAttribute("buttonclicked");
                                  }
                                  else {

                                    upvoteButton.setAttribute("buttonclicked", "true");
                                    if (downvoteButton.hasAttribute("buttonclicked")) {

                                      // Select the i element within the span
                                      var downvotespan = downvoteButton.querySelector('span');
                                      // remove downvote button color 
                                      downvotespan.classList.remove('_3emIxnIscWEPB7o5LgU_rn');
                                      downvotespan.classList.add('_3yQIOwaIuF6gn8db96Gu7y');
                                      var downvotei = downvoteButton.querySelector('i');
                                      downvotei.classList.add('icon-downvote');
                                      downvotei.classList.remove('icon-downvote_fill');

                                      // remove downvotebutton color 
                                      var element = fakepost.querySelector('._1rZYMD_4xY3gRcSS3p8ODO');
                                      // Select the element by its class name
                                      if (element) {
                                        // Change the color style to orginal color

                                        element.style.color = 'rgb(255, 69, 0)';
                                        element.textContent = parseInt(element.textContent) + 2;
                                        delete_uservotefake_to_background(fakepost_url);
                                      } else {
                                        console.log('Element not found');
                                      }

                                      downvoteButton.removeAttribute("buttonclicked");

                                    }
                                    else {
                                      var element = fakepost.querySelector('._1rZYMD_4xY3gRcSS3p8ODO');

                                      // Check if the element was found
                                      if (element) {
                                        // Change the color style
                                        element.style.color = 'rgb(255, 69, 0)';
                                        element.textContent = parseInt(element.textContent) + 1;

                                      } else {
                                        console.log('Element not found');
                                      }
                                    }

                                    // Update class names of the span element
                                    downvotespan.classList.remove('_3emIxnIscWEPB7o5LgU_rn');
                                    span.classList.add('Z3lT0VGlALek4Q9j0ZQCr');
                                    // Update class name of the i element
                                    i.classList.remove('icon-upvote');
                                    i.classList.add('icon-upvote_fill');
                                    send_uservotefake_to_background("upvote", fakepost_url);


                                  }



                                  //alert("Upvote button clicked");
                                });

                              } else {
                                console.log('No element with aria-label="upvote" found.');
                              }
                              if (downvoteButton) {
                                // Do something with the upvote button, like adding an event listener
                                downvoteButton.addEventListener('click', function () {
                                  event.preventDefault(); // Prevent the default behavior (i.e., navigating to fakepost_url)
                                  event.stopPropagation();
                                  var span = downvoteButton.querySelector('span');
                                  var i = span.querySelector('i');
                                  if (downvoteButton.hasAttribute("buttonclicked")) {
                                    // Update class names of the span element
                                    span.classList.remove('_3emIxnIscWEPB7o5LgU_rn');
                                    span.classList.add('_3yQIOwaIuF6gn8db96Gu7y');
                                    // Select the i element within the span

                                    // Update class name of the i element
                                    i.classList.add('icon-downvote');
                                    i.classList.remove('icon-downvote_fill');
                                    // Select the element by its class name
                                    var element = fakepost.querySelector('._1rZYMD_4xY3gRcSS3p8ODO');

                                    // Check if the element was found
                                    if (element) {
                                      // Change the color style to orginal color

                                      element.style.color = '#1A1A1B';
                                      element.textContent = parseInt(element.textContent) + 1;
                                      delete_uservotefake_to_background(fakepost_url);
                                    } else {
                                      console.log('Element not found');
                                    }
                                    downvoteButton.removeAttribute("buttonclicked");
                                  }
                                  else {


                                    span.classList.remove('_3yQIOwaIuF6gn8db96Gu7y');
                                    span.classList.add('_3emIxnIscWEPB7o5LgU_rn');
                                    downvoteButton.setAttribute("buttonclicked", "true");
                                    if (upvoteButton.hasAttribute("buttonclicked")) {

                                      // Select the i element within the span
                                      var upvotespan = upvoteButton.querySelector('span');
                                      var downvotespan = downvoteButton.querySelector('span');
                                      // remove downvote button color 
                                      downvotespan.classList.add('_3emIxnIscWEPB7o5LgU_rn');
                                      upvotespan.classList.remove('Z3lT0VGlALek4Q9j0ZQCr');
                                      var upvotei = upvoteButton.querySelector('i');
                                      upvotei.classList.add('icon-upvote');
                                      upvotei.classList.remove('icon-upvote_fill');
                                      var element = fakepost.querySelector('._1rZYMD_4xY3gRcSS3p8ODO');
                                      i.classList.remove('icon-downvote');
                                      i.classList.add('icon-downvote_fill');
                                      // Check if the element was found
                                      if (element) {
                                        // Change the color style to orginal color

                                        element.style.color = 'rgb(113, 147, 255)';
                                        element.textContent = parseInt(element.textContent) - 2;
                                        delete_uservotefake_to_background(fakepost_url);
                                        //send_uservotefake_to_background("downvote",fakepost_url);
                                      } else {
                                        console.log('Element not found');
                                      }
                                      // remove downvotebutton color 

                                      // Select the element by its class name


                                      upvoteButton.removeAttribute("buttonclicked");

                                    }
                                    else {



                                      // Update class name of the i element
                                      i.classList.remove('icon-downvote');
                                      i.classList.add('icon-downvote_fill');

                                      var element = fakepost.querySelector('._1rZYMD_4xY3gRcSS3p8ODO');

                                      // Check if the element was found
                                      if (element) {
                                        // Change the color style
                                        element.style.color = 'rgb(113, 147, 255)';
                                        element.textContent = parseInt(element.textContent) - 1;

                                      } else {
                                        console.log('Element not found');
                                      }

                                      //send_uservotefake_to_background("downvote",fakepost_url);

                                    }

                                    send_uservotefake_to_background("downvote", fakepost_url);
                                  }



                                  //alert("Upvote button clicked");
                                });


                              } else {
                                console.log('No element with aria-label="upvote" found.');
                              }


                              // alert(fakepost_url);

                              fakepost.addEventListener('click', function () {
                                // Replace 'https://example.com' with the desired URL
                                window.location.href = fakepost_url;
                              });

                              // Insert the cloned post with the modified img src
                              elements.insertBefore(fakepost, elements.children[fakepost_index])
                            }
                            else if (result === "downvote") {
                              fakepost_like = parseInt(fakepost_like) - 1;
                              var fakepost = document.createElement("div");
                              fakepost.innerHTML = `<div class="_1oQyIsiPHYt6nx7VOmd1sz _1RYN-7H8gYctjOQeL8p2Q7 scrollerItem _3Qkp11fjcAw9I9wtLo8frE _1qftyZQ2bhqP62lbPjoGAh  Post t3_14x007q " data-testid="post-container" id="t3_14x007q" tabindex="-1" data-adclicklocation="background"><div></div><div class="_23h0-EcaBUorIHC-JZyh6J" style="width:40px;border-left:4px solid transparent"><div class="_1E9mcoVn4MYnuBQSVDt1gC" id="vote-arrows-t3_14x007q"><button aria-label="upvote" aria-pressed="false" class="voteButton " data-click-id="upvote" data-adclicklocation="upvote" id="upvote-button-t3_14x007q" outer-limit-monitored="true"><span class="_2q7IQ0BUOWeEZoeAxN555e _3SUsITjKNQ7Tp0Wi2jGxIM qW0l8Af61EP35WIG6vnGk _3emIxnIscWEPB7o5LgU_rn"><i class="icon icon-upvote _2Jxk822qXs4DaXwsN7yyHA"></i></span></button><div class="_1rZYMD_4xY3gRcSS3p8ODO _3a2ZHWaih05DgAOtvu6cIo " style="color: rgb(113, 147, 255);">${fakepost_like}</div><button aria-label="downvote" aria-pressed="false" class="voteButton" data-click-id="downvote" data-adclicklocation="downvote" outer-limit-monitored="true"><span class="_1iKd82bq_nqObFvSH1iC_Q Q0BxYHtCOJ_rNSPJMU2Y7 _2fe-KdD2OM0ciaiux-G1EL _3emIxnIscWEPB7o5LgU_rn"><i class="icon icon-downvote_fill ZyxIIl4FP5gHGrJDzNpUC"></i></span></button></div></div><div class="_1poyrkZ7g36PawDueRza-J _11R7M_VOgKO1RJyRSRErT3 " style="background:#FFFFFF" data-adclicklocation="background" data-click-id="background"><div class="_292iotee39Lmt0MkQZ2hPV RichTextJSON-root nAL34ZVf4KfyEoZIzUgmN _3hWVRt6y8PqOoC2VuZETZI"><p class="_1qeIAgB0cPwnLhDF9XSiJM">Because you've shown interest in a similar community</p></div><div class="_14-YvdFiW5iVvfe5wdgmET"><div class="_2dr_3pZUCk8KfJ-x0txT_l"><a data-click-id="subreddit" class="_3ryJoIoycVkA88fy40qNJc" href=""><img style="background-color:#EA0027" alt="Subreddit Icon" role="presentation" src="https://styles.redditmedia.com/t5_2qh1o/styles/communityIcon_0uzb28pnky3d1.png?width=256&s=800ad355a90445c717e938142607ed18a59926a2" class="_34CfAAowTqdbNDYXz5tBTW _1WX5Y5qFVBTdr6hCPpARDB "></a></div><div class="cZPZhMe-UCZ8htPodMyJ5"><div class="_3AStxql1mQsrZuUIFP9xSg nU4Je7n-eSXStTBAPMYt8" data-adclicklocation="top_bar"><div class="_2mHuuvyV9doV3zwbZPtIPG"><a data-click-id="subreddit" class="_3ryJoIoycVkA88fy40qNJc" href="">${fakepost_community}</a><div id="SubredditInfoTooltip--t3_14x007q--USPS"></div></div><span class="_3LS4zudUBagjFS7HjWJYxo _37gsGHa8DMRAxBmQS-Ppg8 _3V4xlrklKBP2Hg51ejjjvz" role="presentation">•</span><span style="color:#787C7E" class="_2fCzxBE1dlMh4OFc7B3Dun">Posted by</span><div class="_2mHuuvyV9doV3zwbZPtIPG"><div id="UserInfoTooltip--t3_14x007q"><a class="_2tbHP6ZydRpjI44J3syuqC  _23wugcdiaj44hdfugIAlnX oQctV4n0yUb0uiHDdGnmE" data-click-id="user" data-testid="post_author_link" href="" style="color: rgb(120, 124, 126);">${fakepost_poster}</a></div></div><span class="_2VF2J19pUIMSLJFky-7PEI" data-testid="post_timestamp" data-click-id="timestamp" style="color:#787C7E">${time}</span></div><div class="_2wFk1qX4e1cxk8Pkw1rAHk"></div><div class="_3XoW0oYd5806XiOr24gGdb"></div></div><button role="button" tabindex="0" id="subscribe-button-t3_14x007q" class="_35dG7dsi4xKTT-_2MB74qq _2iuoyPiKHN3kfOoeIQalDT _10BQ7pjWbeYP63SAPNS8Ts UEPNkU0rd1-nvbkOcBatc "><span>Join</span></button></div><div class="_2FCtq-QzlfuN-SwVMUZMM3 _3wiKjmhpIpoTE2r5KCm2o6 t3_14x007q" data-adclicklocation="title"><div class="y8HYJ-y_lTUHkQIc1mdCq _2INHSNB8V5eaWp4P0rY_mE"><a data-click-id="body" class="SQnoC3ObvgnGjWt90zD9Z _2INHSNB8V5eaWp4P0rY_mE" href=${fakepost_url}><div class="_2SdHzo12ISmrC8H86TgSCp _3wqmjmv3tb_k-PROt7qFZe " style="--posttitletextcolor:#222222"><h3 class="_eYtD2XCVieq6emjKBH3m">${fakepost_title}</h3></div></a></div><div class="_2xu1HuBz1Yx6SP10AGVx_I" data-ignore-click="false"><div class="lrzZ8b0L6AzLkQj5Ww7H1"></div><div class="lrzZ8b0L6AzLkQj5Ww7H1"><a href=""></div></div><div class="_1hLrLjnE1G_RBCNcN9MVQf"><img alt="" src="https://www.redditstatic.com/desktop2x/img/renderTimingPixel.png" style="width: 1px; height: 1px;" onload="(__markFirstPostVisible || function(){})();"></div><style>.t3_14x007q._2FCtq-QzlfuN-SwVMUZMM3 {--postTitle-VisitedLinkColor: #9b9b9b;--postTitleLink-VisitedLinkColor: #9b9b9b;--postBodyLink-VisitedLinkColor: #989898;}</style></div><div class="STit0dLageRsa2yR4te_b"><div class="m3aNC6yp8RrNM_-a0rrfa " data-click-id="media"><div class="_3gBRFDB5C34UWyxEe_U6mD" style="padding-bottom:133.28125%"></div><div class="_3JgI-GOrkmyIeDeyzXdyUD _2CSlKHjH7lsjx0IpjORx14"><div class="_1NSbknF8ucHV2abfCZw2Z1 "><a href=${fakepost_url}><div class="_3Oa0THmZ3f5iZXAQ0hBJ0k " style="max-height:512px;margin:0 auto"><div><img alt="Post image" class="_2_tDEnGMLxpM6uOa2kaDB3 ImageBox-image media-element _1XWObl-3b9tPy64oaG6fax" src=${fakepost_image} style="max-height:512px"></div></div></a></div></div></div></div><div class="_1ixsU4oQRnNfZ91jhBU74y"><div class="_1E9mcoVn4MYnuBQSVDt1gC _2oM1YqCxIwkvwyeZamWwhW uFwpR-OdmueYZxdY_rEDX" id="vote-arrows-t3_14x007q"><button aria-label="upvote" aria-pressed="false" class="voteButton " data-click-id="upvote" data-adclicklocation="upvote"><span class="_2q7IQ0BUOWeEZoeAxN555e _3SUsITjKNQ7Tp0Wi2jGxIM qW0l8Af61EP35WIG6vnGk _3emIxnIscWEPB7o5LgU_rn"><i class="icon icon-upvote _2Jxk822qXs4DaXwsN7yyHA"></i></span></button><div class="_1rZYMD_4xY3gRcSS3p8ODO _25IkBM0rRUqWX5ZojEMAFQ" style="color: rgb(113, 147, 255);">${fakepost_like}</div><button aria-label="downvote" aria-pressed="false" class="voteButton" data-click-id="downvote" data-adclicklocation="downvote"><span class="_1iKd82bq_nqObFvSH1iC_Q Q0BxYHtCOJ_rNSPJMU2Y7 _2fe-KdD2OM0ciaiux-G1EL _3emIxnIscWEPB7o5LgU_rn"><i class="icon icon-downvote_fill ZyxIIl4FP5gHGrJDzNpUC"></i></span></button></div><div class="_3-miAEojrCvx_4FQ8x3P-s"><a rel="nofollow" data-click-id="comments" data-adclicklocation="comments" data-test-id="comments-page-link-num-comments" class="_1UoeAeSRhOKSNdY_h3iS1O _1Hw7tY9pMr-T1F4P1C-xNU _3U_7i38RDPV5eBv7m4M-9J _2qww3J5KKzsD7e5DO0BvvU" href=${fakepost_url}><i class="icon icon-comment _3DVrpDrMM9NLT6TlsTUMxC" role="presentation"></i><span class="FHCV02u6Cp2zYL0fhQPsO">2 comments</span></a><div data-ignore-click="false" class="_3U_7i38RDPV5eBv7m4M-9J" data-adclicklocation="fl_unknown"><button class="_10K5i7NW6qcm-UoCtpB3aK YszYBnnIoNY8pZ6UwCivd _3yh2bniLq7bYr4BaiXowdO _1EWxiIupuIjiExPQeK4Kud _28vEaVlLWeas1CDiLuTCap"><span class="pthKOcceozMuXLYrLlbL1"><i class="_3yNNYT3e1avhAAWVHd0-92 icon icon-award" id="View--GiveAward--t3_14x007q"></i></span><span class="_2-cXnP74241WI7fpcpfPmg _70940WUuFmpHbhKlj8EjZ">Award</span></button></div><div class="_JRBNstMcGxbZUxrrIKXe _3U_7i38RDPV5eBv7m4M-9J _3yh2bniLq7bYr4BaiXowdO _1pShbCnOaF7EGWTq6IvZux _28vEaVlLWeas1CDiLuTCap" id="t3_14x007q-share-menu"><button data-click-id="share" data-adclicklocation="fl_share" class="kU8ebCMnbXfjCWfqn0WPb"><i class="icon icon-share _1GQDWqbF-wkYWbrpmOvjqJ"></i><span class="_6_44iTtZoeY6_XChKt5b0">share</span></button></div><div data-ignore-click="false" class="_3U_7i38RDPV5eBv7m4M-9J" data-adclicklocation="fl_unknown"><button class="_10K5i7NW6qcm-UoCtpB3aK YszYBnnIoNY8pZ6UwCivd _3yh2bniLq7bYr4BaiXowdO _2sAFaB0tx4Hd5KxVkdUcAx _28vEaVlLWeas1CDiLuTCap"><span class="pthKOcceozMuXLYrLlbL1"><i class="_1Xe01txJfRB9udUU85DNeR icon icon-save"></i></span><span class="_2-cXnP74241WI7fpcpfPmg _70940WUuFmpHbhKlj8EjZ">save</span></button></div><div class="OccjSdFd6HkHhShRg6DOl"></div><div class="_3MmwvEEt6fv5kQPFCVJizH"><div><button aria-expanded="false" aria-haspopup="true" aria-label="more options" id="t3_14x007q-overflow-menu" data-adclicklocation="overflow_menu" class="_2pFdCpgBihIaYh9DSMWBIu _1EbinKu2t3KjaT2gR156Qp uMPgOFYlCc5uvpa2Lbteu"><i class="_38GxRFSqSC-Z2VLi5Xzkjy icon icon-overflow_horizontal"></i></button></div></div><div class="_21pmAV9gWG6F_UKVe7YIE0"></div></div></div></div></div>`;


                              let elements = document.querySelector('.rpBJOHq2PR60pnwJlUyP0');

                              var upvoteButton = fakepost.querySelector('[aria-label="upvote"]');
                              var downvoteButton = fakepost.querySelector('[aria-label="downvote"]');
                              downvoteButton.setAttribute("buttonclicked", "true");
                              if (upvoteButton) {
                                // Do something with the upvote button, like adding an event listener
                                upvoteButton.addEventListener('click', function () {
                                  event.preventDefault(); // Prevent the default behavior (i.e., navigating to fakepost_url)
                                  event.stopPropagation();
                                  var span = upvoteButton.querySelector('span');
                                  var i = span.querySelector('i');
                                  if (upvoteButton.hasAttribute("buttonclicked")) {
                                    // Update class names of the span element
                                    span.classList.add('_3emIxnIscWEPB7o5LgU_rn');
                                    span.classList.remove('Z3lT0VGlALek4Q9j0ZQCr');

                                    // Select the i element within the span

                                    // Update class name of the i element
                                    i.classList.add('icon-upvote');
                                    i.classList.remove('icon-upvote_fill');
                                    // Select the element by its class name
                                    var element = fakepost.querySelector('._1rZYMD_4xY3gRcSS3p8ODO');

                                    // Check if the element was found
                                    if (element) {
                                      // Change the color style to orginal color

                                      element.style.color = '#1A1A1B';
                                      element.textContent = parseInt(element.textContent) - 1;
                                      delete_uservotefake_to_background(fakepost_url);
                                    } else {
                                      console.log('Element not found');
                                    }
                                    upvoteButton.removeAttribute("buttonclicked");
                                  }
                                  else {
                                    upvoteButton.setAttribute("buttonclicked", "true");
                                    if (downvoteButton.hasAttribute("buttonclicked")) {

                                      // Select the i element within the span
                                      var downvotespan = downvoteButton.querySelector('span');
                                      // remove downvote button color 
                                      downvotespan.classList.remove('_3emIxnIscWEPB7o5LgU_rn');
                                      downvotespan.classList.add('_3yQIOwaIuF6gn8db96Gu7y');
                                      var downvotei = downvoteButton.querySelector('i');
                                      downvotei.classList.add('icon-downvote');
                                      downvotei.classList.remove('icon-downvote_fill');

                                      // remove downvotebutton color 
                                      var element = fakepost.querySelector('._1rZYMD_4xY3gRcSS3p8ODO');
                                      // Select the element by its class name
                                      if (element) {
                                        // Change the color style to orginal color

                                        element.style.color = 'rgb(255, 69, 0)';
                                        element.textContent = parseInt(element.textContent) + 2;
                                        delete_uservotefake_to_background(fakepost_url);
                                      } else {
                                        console.log('Element not found');
                                      }

                                      downvoteButton.removeAttribute("buttonclicked");

                                    }
                                    else {
                                      var element = fakepost.querySelector('._1rZYMD_4xY3gRcSS3p8ODO');

                                      // Check if the element was found
                                      if (element) {
                                        // Change the color style
                                        element.style.color = 'rgb(255, 69, 0)';
                                        element.textContent = parseInt(element.textContent) + 1;

                                      } else {
                                        console.log('Element not found');
                                      }
                                    }

                                    // Update class names of the span element
                                    span.classList.remove('_3emIxnIscWEPB7o5LgU_rn');
                                    span.classList.add('Z3lT0VGlALek4Q9j0ZQCr');
                                    // Update class name of the i element
                                    i.classList.remove('icon-upvote');
                                    i.classList.add('icon-upvote_fill');
                                    send_uservotefake_to_background("upvote", fakepost_url);


                                  }



                                  //alert("Upvote button clicked");
                                });

                              } else {
                                console.log('No element with aria-label="upvote" found.');
                              }
                              if (downvoteButton) {
                                // Do something with the upvote button, like adding an event listener
                                downvoteButton.addEventListener('click', function () {
                                  event.preventDefault(); // Prevent the default behavior (i.e., navigating to fakepost_url)
                                  event.stopPropagation();
                                  var span = downvoteButton.querySelector('span');
                                  var i = span.querySelector('i');
                                  if (downvoteButton.hasAttribute("buttonclicked")) {
                                    // Update class names of the span element
                                    span.classList.remove('_3emIxnIscWEPB7o5LgU_rn');
                                    span.classList.add('_3yQIOwaIuF6gn8db96Gu7y');
                                    // Select the i element within the span

                                    // Update class name of the i element
                                    i.classList.add('icon-downvote');
                                    i.classList.remove('icon-downvote_fill');
                                    // Select the element by its class name
                                    var element = fakepost.querySelector('._1rZYMD_4xY3gRcSS3p8ODO');

                                    // Check if the element was found
                                    if (element) {
                                      // Change the color style to orginal color

                                      element.style.color = '#1A1A1B';
                                      element.textContent = parseInt(element.textContent) + 1;
                                      delete_uservotefake_to_background(fakepost_url);
                                    } else {
                                      console.log('Element not found');
                                    }
                                    downvoteButton.removeAttribute("buttonclicked");
                                  }
                                  else {
                                    span.classList.remove('_3yQIOwaIuF6gn8db96Gu7y');
                                    span.classList.add('_3emIxnIscWEPB7o5LgU_rn');
                                    downvoteButton.setAttribute("buttonclicked", "true");
                                    if (upvoteButton.hasAttribute("buttonclicked")) {

                                      // Select the i element within the span
                                      var upvotespan = upvoteButton.querySelector('span');
                                      // remove downvote button color 
                                      upvotespan.classList.add('_3emIxnIscWEPB7o5LgU_rn');
                                      upvotespan.classList.remove('Z3lT0VGlALek4Q9j0ZQCr');
                                      var upvotei = upvoteButton.querySelector('i');
                                      upvotei.classList.add('icon-upvote');
                                      upvotei.classList.remove('icon-upvote_fill');
                                      var element = fakepost.querySelector('._1rZYMD_4xY3gRcSS3p8ODO');
                                      i.classList.remove('icon-downvote');
                                      i.classList.add('icon-downvote_fill');
                                      // Check if the element was found
                                      if (element) {
                                        // Change the color style to orginal color

                                        element.style.color = 'rgb(113, 147, 255)';
                                        element.textContent = parseInt(element.textContent) - 2;
                                        delete_uservotefake_to_background(fakepost_url);
                                      } else {
                                        console.log('Element not found');
                                      }
                                      // remove downvotebutton color 

                                      // Select the element by its class name


                                      upvoteButton.removeAttribute("buttonclicked");

                                    }
                                    else {



                                      // Update class name of the i element
                                      i.classList.remove('icon-downvote');
                                      i.classList.add('icon-downvote_fill');

                                      var element = fakepost.querySelector('._1rZYMD_4xY3gRcSS3p8ODO');

                                      // Check if the element was found
                                      if (element) {
                                        // Change the color style
                                        element.style.color = 'rgb(113, 147, 255)';
                                        element.textContent = parseInt(element.textContent) - 1;

                                      } else {
                                        console.log('Element not found');
                                      }


                                      send_uservotefake_to_background("downvote", fakepost_url);
                                    }


                                  }



                                  //alert("Upvote button clicked");
                                });


                              } else {
                                console.log('No element with aria-label="upvote" found.');
                              }

                              fakepost.addEventListener('click', function () {
                                // Replace 'https://example.com' with the desired URL
                                window.location.href = fakepost_url;
                              });

                              // Insert the cloned post with the modified img src
                              elements.insertBefore(fakepost, elements.children[fakepost_index])
                            }
                            else {
                              var fakepost = document.createElement("div");
                              fakepost.innerHTML = `<div class="_1oQyIsiPHYt6nx7VOmd1sz _1RYN-7H8gYctjOQeL8p2Q7 scrollerItem _3Qkp11fjcAw9I9wtLo8frE _1qftyZQ2bhqP62lbPjoGAh  Post t3_14x007q " data-testid="post-container" id="t3_14x007q" tabindex="-1" data-adclicklocation="background"><div></div><div class="_23h0-EcaBUorIHC-JZyh6J" style="width:40px;border-left:4px solid transparent"><div class="_1E9mcoVn4MYnuBQSVDt1gC" id="vote-arrows-t3_14x007q"><button aria-label="upvote" aria-pressed="false" class="voteButton " data-click-id="upvote" data-adclicklocation="upvote" id="upvote-button-t3_14x007q" outer-limit-monitored="true"><span class="_2q7IQ0BUOWeEZoeAxN555e _3SUsITjKNQ7Tp0Wi2jGxIM qW0l8Af61EP35WIG6vnGk _3emIxnIscWEPB7o5LgU_rn"><i class="icon icon-upvote _2Jxk822qXs4DaXwsN7yyHA"></i></span></button><div class="_1rZYMD_4xY3gRcSS3p8ODO _3a2ZHWaih05DgAOtvu6cIo " style="color:#1A1A1B">${fakepost_like}</div><button aria-label="downvote" aria-pressed="false" class="voteButton" data-click-id="downvote" data-adclicklocation="downvote" outer-limit-monitored="true"><span class="_1iKd82bq_nqObFvSH1iC_Q Q0BxYHtCOJ_rNSPJMU2Y7 _2fe-KdD2OM0ciaiux-G1EL _3yQIOwaIuF6gn8db96Gu7y"><i class="icon icon-downvote ZyxIIl4FP5gHGrJDzNpUC"></i></span></button></div></div><div class="_1poyrkZ7g36PawDueRza-J _11R7M_VOgKO1RJyRSRErT3 " style="background:#FFFFFF" data-adclicklocation="background" data-click-id="background"><div class="_292iotee39Lmt0MkQZ2hPV RichTextJSON-root nAL34ZVf4KfyEoZIzUgmN _3hWVRt6y8PqOoC2VuZETZI"><p class="_1qeIAgB0cPwnLhDF9XSiJM">Because you've shown interest in a similar community</p></div><div class="_14-YvdFiW5iVvfe5wdgmET"><div class="_2dr_3pZUCk8KfJ-x0txT_l"><a data-click-id="subreddit" class="_3ryJoIoycVkA88fy40qNJc" href=""><img style="background-color:#EA0027" alt="Subreddit Icon" role="presentation" src="https://styles.redditmedia.com/t5_2qh1o/styles/communityIcon_0uzb28pnky3d1.png?width=256&s=800ad355a90445c717e938142607ed18a59926a2" class="_34CfAAowTqdbNDYXz5tBTW _1WX5Y5qFVBTdr6hCPpARDB "></a></div><div class="cZPZhMe-UCZ8htPodMyJ5"><div class="_3AStxql1mQsrZuUIFP9xSg nU4Je7n-eSXStTBAPMYt8" data-adclicklocation="top_bar"><div class="_2mHuuvyV9doV3zwbZPtIPG"><a data-click-id="subreddit" class="_3ryJoIoycVkA88fy40qNJc" href="">${fakepost_community}</a><div id="SubredditInfoTooltip--t3_14x007q--USPS"></div></div><span class="_3LS4zudUBagjFS7HjWJYxo _37gsGHa8DMRAxBmQS-Ppg8 _3V4xlrklKBP2Hg51ejjjvz" role="presentation">•</span><span style="color:#787C7E" class="_2fCzxBE1dlMh4OFc7B3Dun">Posted by</span><div class="_2mHuuvyV9doV3zwbZPtIPG"><div id="UserInfoTooltip--t3_14x007q"><a class="_2tbHP6ZydRpjI44J3syuqC  _23wugcdiaj44hdfugIAlnX oQctV4n0yUb0uiHDdGnmE" data-click-id="user" data-testid="post_author_link" href="" style="color: rgb(120, 124, 126);">${fakepost_poster}</a></div></div><span class="_2VF2J19pUIMSLJFky-7PEI" data-testid="post_timestamp" data-click-id="timestamp" style="color:#787C7E">${time}</span></div><div class="_2wFk1qX4e1cxk8Pkw1rAHk"></div><div class="_3XoW0oYd5806XiOr24gGdb"></div></div><button role="button" tabindex="0" id="subscribe-button-t3_14x007q" class="_35dG7dsi4xKTT-_2MB74qq _2iuoyPiKHN3kfOoeIQalDT _10BQ7pjWbeYP63SAPNS8Ts UEPNkU0rd1-nvbkOcBatc "><span>Join</span></button></div><div class="_2FCtq-QzlfuN-SwVMUZMM3 _3wiKjmhpIpoTE2r5KCm2o6 t3_14x007q" data-adclicklocation="title"><div class="y8HYJ-y_lTUHkQIc1mdCq _2INHSNB8V5eaWp4P0rY_mE"><a data-click-id="body" class="SQnoC3ObvgnGjWt90zD9Z _2INHSNB8V5eaWp4P0rY_mE" href=${fakepost_url}><div class="_2SdHzo12ISmrC8H86TgSCp _3wqmjmv3tb_k-PROt7qFZe " style="--posttitletextcolor:#222222"><h3 class="_eYtD2XCVieq6emjKBH3m">${fakepost_title}</h3></div></a></div><div class="_2xu1HuBz1Yx6SP10AGVx_I" data-ignore-click="false"><div class="lrzZ8b0L6AzLkQj5Ww7H1"></div><div class="lrzZ8b0L6AzLkQj5Ww7H1"><a href=""></a></div></div><div class="_1hLrLjnE1G_RBCNcN9MVQf"><img alt="" src="https://www.redditstatic.com/desktop2x/img/renderTimingPixel.png" style="width: 1px; height: 1px;" onload="(__markFirstPostVisible || function(){})();"></div><style>.t3_14x007q._2FCtq-QzlfuN-SwVMUZMM3 {--postTitle-VisitedLinkColor: #9b9b9b;--postTitleLink-VisitedLinkColor: #9b9b9b;--postBodyLink-VisitedLinkColor: #989898;}</style></div><div class="STit0dLageRsa2yR4te_b"><div class="m3aNC6yp8RrNM_-a0rrfa " data-click-id="media"><div class="_3gBRFDB5C34UWyxEe_U6mD" style="padding-bottom:133.28125%"></div><div class="_3JgI-GOrkmyIeDeyzXdyUD _2CSlKHjH7lsjx0IpjORx14"><div class="_1NSbknF8ucHV2abfCZw2Z1 "><a href=${fakepost_url}><div class="_3Oa0THmZ3f5iZXAQ0hBJ0k " style="max-height:512px;margin:0 auto"><div><img alt="Post image" class="_2_tDEnGMLxpM6uOa2kaDB3 ImageBox-image media-element _1XWObl-3b9tPy64oaG6fax" src=${fakepost_image} style="max-height:512px"></div></div></a></div></div></div></div><div class="_1ixsU4oQRnNfZ91jhBU74y"><div class="_1E9mcoVn4MYnuBQSVDt1gC _2oM1YqCxIwkvwyeZamWwhW uFwpR-OdmueYZxdY_rEDX" id="vote-arrows-t3_14x007q"><button aria-label="upvote" aria-pressed="false" class="voteButton " data-click-id="upvote" data-adclicklocation="upvote"><span class="_2q7IQ0BUOWeEZoeAxN555e _3SUsITjKNQ7Tp0Wi2jGxIM qW0l8Af61EP35WIG6vnGk _3emIxnIscWEPB7o5LgU_rn"><i class="icon icon-upvote _2Jxk822qXs4DaXwsN7yyHA"></i></span></button><div class="_1rZYMD_4xY3gRcSS3p8ODO _25IkBM0rRUqWX5ZojEMAFQ" style="color:#1A1A1B">${fakepost_like}</div><button aria-label="downvote" aria-pressed="false" class="voteButton" data-click-id="downvote" data-adclicklocation="downvote"><span class="_1iKd82bq_nqObFvSH1iC_Q Q0BxYHtCOJ_rNSPJMU2Y7 _2fe-KdD2OM0ciaiux-G1EL _3yQIOwaIuF6gn8db96Gu7y"><i class="icon icon-downvote ZyxIIl4FP5gHGrJDzNpUC"></i></span></button></div><div class="_3-miAEojrCvx_4FQ8x3P-s"><a rel="nofollow" data-click-id="comments" data-adclicklocation="comments" data-test-id="comments-page-link-num-comments" class="_1UoeAeSRhOKSNdY_h3iS1O _1Hw7tY9pMr-T1F4P1C-xNU _3U_7i38RDPV5eBv7m4M-9J _2qww3J5KKzsD7e5DO0BvvU" href=${fakepost_url}><i class="icon icon-comment _3DVrpDrMM9NLT6TlsTUMxC" role="presentation"></i><span class="FHCV02u6Cp2zYL0fhQPsO">2 comments</span></a><div data-ignore-click="false" class="_3U_7i38RDPV5eBv7m4M-9J" data-adclicklocation="fl_unknown"><button class="_10K5i7NW6qcm-UoCtpB3aK YszYBnnIoNY8pZ6UwCivd _3yh2bniLq7bYr4BaiXowdO _1EWxiIupuIjiExPQeK4Kud _28vEaVlLWeas1CDiLuTCap"><span class="pthKOcceozMuXLYrLlbL1"><i class="_3yNNYT3e1avhAAWVHd0-92 icon icon-award" id="View--GiveAward--t3_14x007q"></i></span><span class="_2-cXnP74241WI7fpcpfPmg _70940WUuFmpHbhKlj8EjZ">Award</span></button></div><div class="_JRBNstMcGxbZUxrrIKXe _3U_7i38RDPV5eBv7m4M-9J _3yh2bniLq7bYr4BaiXowdO _1pShbCnOaF7EGWTq6IvZux _28vEaVlLWeas1CDiLuTCap" id="t3_14x007q-share-menu"><button data-click-id="share" data-adclicklocation="fl_share" class="kU8ebCMnbXfjCWfqn0WPb"><i class="icon icon-share _1GQDWqbF-wkYWbrpmOvjqJ"></i><span class="_6_44iTtZoeY6_XChKt5b0">share</span></button></div><div data-ignore-click="false" class="_3U_7i38RDPV5eBv7m4M-9J" data-adclicklocation="fl_unknown"><button class="_10K5i7NW6qcm-UoCtpB3aK YszYBnnIoNY8pZ6UwCivd _3yh2bniLq7bYr4BaiXowdO _2sAFaB0tx4Hd5KxVkdUcAx _28vEaVlLWeas1CDiLuTCap"><span class="pthKOcceozMuXLYrLlbL1"><i class="_1Xe01txJfRB9udUU85DNeR icon icon-save"></i></span><span class="_2-cXnP74241WI7fpcpfPmg _70940WUuFmpHbhKlj8EjZ">save</span></button></div><div class="OccjSdFd6HkHhShRg6DOl"></div><div class="_3MmwvEEt6fv5kQPFCVJizH"><div><button aria-expanded="false" aria-haspopup="true" aria-label="more options" id="t3_14x007q-overflow-menu" data-adclicklocation="overflow_menu" class="_2pFdCpgBihIaYh9DSMWBIu _1EbinKu2t3KjaT2gR156Qp uMPgOFYlCc5uvpa2Lbteu"><i class="_38GxRFSqSC-Z2VLi5Xzkjy icon icon-overflow_horizontal"></i></button></div></div><div class="_21pmAV9gWG6F_UKVe7YIE0"></div></div></div></div></div>`;
                              let elements = document.querySelector('.rpBJOHq2PR60pnwJlUyP0');


                              var upvoteButton = fakepost.querySelector('[aria-label="upvote"]');
                              var downvoteButton = fakepost.querySelector('[aria-label="downvote"]');

                              if (upvoteButton) {
                                // Do something with the upvote button, like adding an event listener
                                upvoteButton.addEventListener('click', function () {
                                  event.preventDefault(); // Prevent the default behavior (i.e., navigating to fakepost_url)
                                  event.stopPropagation();

                                  var span = upvoteButton.querySelector('span');
                                  var i = span.querySelector('i');
                                  if (upvoteButton.hasAttribute("buttonclicked")) {
                                    // Update class names of the span element
                                    span.classList.add('_3emIxnIscWEPB7o5LgU_rn');
                                    span.classList.remove('Z3lT0VGlALek4Q9j0ZQCr');

                                    // Select the i element within the span

                                    // Update class name of the i element
                                    i.classList.add('icon-upvote');
                                    i.classList.remove('icon-upvote_fill');
                                    // Select the element by its class name
                                    var element = fakepost.querySelector('._1rZYMD_4xY3gRcSS3p8ODO');

                                    // Check if the element was found
                                    if (element) {
                                      // Change the color style to orginal color

                                      element.style.color = '#1A1A1B';
                                      element.textContent = parseInt(element.textContent) - 1;
                                      delete_uservotefake_to_background(fakepost_url);
                                    } else {
                                      console.log('Element not found');
                                    }
                                    upvoteButton.removeAttribute("buttonclicked");
                                  }
                                  else {

                                    upvoteButton.setAttribute("buttonclicked", "true");
                                    if (downvoteButton.hasAttribute("buttonclicked")) {

                                      // Select the i element within the span
                                      var downvotespan = downvoteButton.querySelector('span');
                                      // remove downvote button color 
                                      downvotespan.classList.remove('_3emIxnIscWEPB7o5LgU_rn');
                                      downvotespan.classList.add('_3yQIOwaIuF6gn8db96Gu7y');
                                      var downvotei = downvoteButton.querySelector('i');
                                      downvotei.classList.add('icon-downvote');
                                      downvotei.classList.remove('icon-downvote_fill');

                                      // remove downvotebutton color 
                                      var element = fakepost.querySelector('._1rZYMD_4xY3gRcSS3p8ODO');
                                      // Select the element by its class name
                                      if (element) {
                                        // Change the color style to orginal color

                                        element.style.color = 'rgb(255, 69, 0)';
                                        element.textContent = parseInt(element.textContent) + 2;
                                        delete_uservotefake_to_background(fakepost_url);
                                      } else {
                                        console.log('Element not found');
                                      }

                                      downvoteButton.removeAttribute("buttonclicked");

                                    }
                                    else {
                                      var element = fakepost.querySelector('._1rZYMD_4xY3gRcSS3p8ODO');

                                      // Check if the element was found
                                      if (element) {
                                        // Change the color style
                                        element.style.color = 'rgb(255, 69, 0)';
                                        element.textContent = parseInt(element.textContent) + 1;

                                      } else {
                                        console.log('Element not found');
                                      }
                                    }

                                    // Update class names of the span element
                                    //downvotespan.classList.remove('_3emIxnIscWEPB7o5LgU_rn');
                                    span.classList.add('Z3lT0VGlALek4Q9j0ZQCr');
                                    // Update class name of the i element
                                    i.classList.remove('icon-upvote');
                                    i.classList.add('icon-upvote_fill');
                                    //alert("send upvote to background");
                                    send_uservotefake_to_background("upvote", fakepost_url);


                                  }



                                  //alert("Upvote button clicked");
                                });

                              } else {
                                console.log('No element with aria-label="upvote" found.');
                              }
                              if (downvoteButton) {
                                // Do something with the upvote button, like adding an event listener
                                downvoteButton.addEventListener('click', function () {
                                  event.preventDefault(); // Prevent the default behavior (i.e., navigating to fakepost_url)
                                  event.stopPropagation();
                                  var span = downvoteButton.querySelector('span');
                                  var i = span.querySelector('i');
                                  if (downvoteButton.hasAttribute("buttonclicked")) {
                                    // Update class names of the span element
                                    span.classList.remove('_3emIxnIscWEPB7o5LgU_rn');
                                    span.classList.add('_3yQIOwaIuF6gn8db96Gu7y');
                                    // Select the i element within the span

                                    // Update class name of the i element
                                    i.classList.add('icon-downvote');
                                    i.classList.remove('icon-downvote_fill');
                                    // Select the element by its class name
                                    var element = fakepost.querySelector('._1rZYMD_4xY3gRcSS3p8ODO');

                                    // Check if the element was found
                                    if (element) {
                                      // Change the color style to orginal color

                                      element.style.color = '#1A1A1B';
                                      element.textContent = parseInt(element.textContent) + 1;
                                      delete_uservotefake_to_background(fakepost_url);
                                    } else {
                                      console.log('Element not found');
                                    }
                                    downvoteButton.removeAttribute("buttonclicked");
                                  }
                                  else {
                                    span.classList.remove('_3yQIOwaIuF6gn8db96Gu7y');
                                    span.classList.add('_3emIxnIscWEPB7o5LgU_rn');
                                    downvoteButton.setAttribute("buttonclicked", "true");
                                    if (upvoteButton.hasAttribute("buttonclicked")) {

                                      // Select the i element within the span
                                      var upvotespan = upvoteButton.querySelector('span');
                                      // remove downvote button color 
                                      span.classList.add('_3emIxnIscWEPB7o5LgU_rn');
                                      upvotespan.classList.remove('Z3lT0VGlALek4Q9j0ZQCr');
                                      var upvotei = upvoteButton.querySelector('i');
                                      upvotei.classList.add('icon-upvote');
                                      upvotei.classList.remove('icon-upvote_fill');
                                      var element = fakepost.querySelector('._1rZYMD_4xY3gRcSS3p8ODO');
                                      i.classList.remove('icon-downvote');
                                      i.classList.add('icon-downvote_fill');
                                      // Check if the element was found
                                      if (element) {
                                        // Change the color style to orginal color

                                        element.style.color = 'rgb(113, 147, 255)';
                                        element.textContent = parseInt(element.textContent) - 2;
                                        delete_uservotefake_to_background(fakepost_url);
                                      } else {
                                        console.log('Element not found');
                                      }
                                      // remove downvotebutton color 

                                      // Select the element by its class name


                                      upvoteButton.removeAttribute("buttonclicked");

                                    }
                                    else {



                                      // Update class name of the i element
                                      i.classList.remove('icon-downvote');
                                      i.classList.add('icon-downvote_fill');

                                      var element = fakepost.querySelector('._1rZYMD_4xY3gRcSS3p8ODO');

                                      // Check if the element was found
                                      if (element) {
                                        // Change the color style
                                        element.style.color = 'rgb(113, 147, 255)';
                                        element.textContent = parseInt(element.textContent) - 1;

                                      } else {
                                        console.log('Element not found');
                                      }


                                      send_uservotefake_to_background("downvote", fakepost_url);
                                    }


                                  }



                                  //alert("Upvote button clicked");
                                });


                              } else {
                                console.log('No element with aria-label="upvote" found.');
                              }


                              fakepost.addEventListener('click', function () {
                                // Replace 'https://example.com' with the desired URL
                                window.location.href = fakepost_url;
                              });

                              // Insert the cloned post with the modified img src
                              elements.insertBefore(fakepost, elements.children[fakepost_index])
                            }
                          })
                          .catch(error => {
                            console.error("Error:", error);
                          });

                        ;


                        // Select the element with class name "_2BMnTatQ5gjKGK5OWROgaG"




                        // Do further processing with the startDate variable
                      } else {
                        console.log("Response does not contain the expected data.");
                      }

                    });

                  }
                } else {
                  console.log("The response is not an array or is empty.");
                }
              })
              .catch(error => {
                console.error('An error occurred while fetching data:', error);
              });





            // Proceed with further actions using the decoded data
          });
        } else {
          console.error("Invalid data format received");
        }
      })
      .catch(error => console.error('Error:', error));


    // Proceed with further actions using the userpid
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


        // Replace its inner HTML
        let parentDiv = document.querySelector('div.sitetable.linklisting');

        // Check if the parent div was found
        if (parentDiv) {


          /// this is THE CASE WHERE THE CONTENT IS HIDDEN OR HAS HIDDEN BUTTON // Check if there is a div with the class name "expando-button"
          let expandoButtonDiv = parentDiv.querySelector('.expando-button');
          /// hide button 
          if (expandoButtonDiv) {
            // If the div exists
            console.log('The div with class "expando-button" exists.');

            let expandoDiv = parentDiv.querySelector('.expando');

            if (expandoDiv) {
              let cachedHTML = expandoDiv.getAttribute('data-cachedhtml');

              if (cachedHTML) {

                let decodedHTML = decodeHTMLEntities(cachedHTML);

                let cachedHTMLStartIndex = Array.from(expandoDiv.childNodes).findIndex(child => {
                  return child.nodeType === Node.COMMENT_NODE || child.nodeType === Node.TEXT_NODE ? false : child.outerHTML === decodedHTML;
                });

                // Select the <span> element with the class 'error'
                let errorSpan = expandoDiv.querySelector('span.error');

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



          updatePostContent(parentDiv, fakepost_image, fakepost_content);





          // Replace with your dynamic value

          // Select the <a> element with the class "author"
          let authorElement = parentDiv.querySelector('p.tagline a.author');

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
          let anchorElement = parentDiv.querySelector('a.thumbnail.invisible-when-pinned.may-blank.loggedin.outbound');

          // Check if the anchor element was found
          if (anchorElement) {
            // Find the img element inside the <a> tag
            let imgElement = anchorElement.querySelector('img');

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
          let titleofcurrentpost = parentDiv.querySelector('a.title.may-blank');

          // Check if the anchor element was found
          if (titleofcurrentpost) {
            // Change the inner text of the anchor element
            titleofcurrentpost.textContent = fakepost_title; // Replace with the new text you want
            console.log('Text content changed to:', titleofcurrentpost.textContent);
          } else {
            console.log('No <a> element found with the specified class');
          }

          // Select the <time> element within the <p> with the class "tagline"
          let timeElement = parentDiv.querySelector('p.tagline time');

          // Check if the time element was found
          if (timeElement) {
            // Change the text inside the time element
            timeElement.textContent = fakepost_time; // Replace with the new time you want

            console.log('Time element updated to:', timeElement.textContent);
          } else {
            console.log('No <time> element found');
          }
          // Find the div with class "score dislikes" inside the parent div
          let dislikesDiv = parentDiv.querySelector('div.score.dislikes');

          // Find the div with class "score likes" inside the parent div
          let likesDiv = parentDiv.querySelector('div.score.likes');

          // Find the div with class "score unvoted" inside the parent div
          let unvotedDiv = parentDiv.querySelector('div.score.unvoted');

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
          handleVoteButtons(parentDiv, "fakepost");
          // change number of comments 
          // Select the <a> element that contains the number of comments
          let commentsElement = parentDiv.querySelector('a.bylink.comments.may-blank');

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
          let paneStackTitleDiv = document.querySelector('.panestack-title');

          // Check if the div exists
          if (paneStackTitleDiv) {
            // Select the span with the class "title" inside the div
            let titleSpan = paneStackTitleDiv.querySelector('.title');

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
            const userVotesOnFakePosts = data.userInteractions.votes.onFakePosts;

            console.log("User votes on fake posts retrieved successfully:", userVotesOnFakePosts);

            // Process each user vote for a fake post
            const vote = userVotesOnFakePosts.find(vote => vote.action_fake_post === postId);
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
  let mediaPreviewDiv = parentDiv.querySelector('.media-preview');

  // Check if the div was found
  if (mediaPreviewDiv) {
    // Find the image element inside the media-preview div
    let imgElement = mediaPreviewDiv.querySelector('img');

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
  let usertextBodyDiv = parentDiv.querySelector('.usertext-body');
  if (usertextBodyDiv) {
    // Select the child div with class name 'md' inside the 'usertext-body' div
    let mdDiv = usertextBodyDiv.querySelector('.md');

    // Remove all <p> elements inside the 'md' div
    let paragraphs = mdDiv.querySelectorAll('p');
    paragraphs.forEach(p => p.remove());

    // Insert a new <p> element with the fake_content inside the 'md' div
    // Assuming 'fake_content' contains the content you want to insert
    let paragraphArray = fakepost_content.split('\n');


    // Insert each paragraph as a new <p> element inside the 'md' div
    paragraphArray.forEach(paragraphText => {
      let newParagraph = document.createElement('p');
      newParagraph.textContent = paragraphText.trim(); // Ensure that extra whitespace is removed
      mdDiv.appendChild(newParagraph); // Add the new <p> element to the 'md' div
    });
  }
}


/// this fucntion is used to decode the cache html
function decodeHTMLEntities(text) {
  let parser = new DOMParser();
  let decodedString = parser.parseFromString(text, "text/html").body.innerHTML;
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
  let upvoteButton = parentDiv.querySelector('[aria-label="upvote"]');
  let downvoteButton = parentDiv.querySelector('[aria-label="downvote"]');
  let midcolDiv = parentDiv.querySelector('.midcol.unvoted');
  let entryDiv = parentDiv.querySelector('.entry');

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
        // Add logic for no vote
      }
    })
    .catch(error => {
      console.error("Error retrieving user vote:", error);
      // Handle error case
    });
}

function handleVoteButtons(parentDiv, voteType, fakeCommentId) {
  let upvoteButton = parentDiv.querySelector('[aria-label="upvote"]');
  let downvoteButton = parentDiv.querySelector('[aria-label="downvote"]');
  let midcolDiv = parentDiv.querySelector('.midcol');
  let entryDiv = parentDiv.querySelector('.entry');
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
        sendDeleteVoteMessage(voteType, fakeCommentId);
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
          sendDeleteVoteMessage(voteType, fakeCommentId);
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
        sendVoteMessage("upvote", voteType, fakeCommentId);
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
        sendDeleteVoteMessage(voteType, fakeCommentId);
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
          sendDeleteVoteMessage(voteType, fakeCommentId);
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
        sendVoteMessage("downvote", voteType, fakeCommentId);
      }
    }, true);  // Using capture phase to prevent Reddit's listener
  } else {
    console.log('Required elements not found');
  }
}

// Function to send vote // this function is used to deal with different vote , fake post levele and fake comments level 
function sendVoteMessage(voteAction, voteType, targetId) {
  if (voteType === 'fakepost') {

    // Add logic to send vote for fake post
    sendVoteFakePostMessage(voteAction, window.location.href);
  } else if (voteType === 'fakecomment') {
    sendVoteFakeCommentMessage(voteAction, targetId, window.location.href);
    // Add logic to send vote for comment
  }
}

// Function to delete vote
function sendDeleteVoteMessage(voteType, targetId) {
  if (voteType === 'fakepost') {
    sendDeleteVoteFakePostMessage(window.location.href);
    // Add logic to delete vote for fake post
  } else if (voteType === 'fakecomment') {
    sendDeleteVoteFakeCommentMessage(targetId, window.location.href);
    // Add logic to delete vote for comment
  }
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
          insertUserReplyFakeComments(childDiv, username, content,fakeCommentID,fakePostId);
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

            var commentFormHTML = `<form action="#" class="usertext cloneable warn-on-unload" onsubmit="return post_form(this, 'comment')" id="commentreply_t1_lp30szd" style="display: block;"><input type="hidden" name="thing_id" value="t1_lp30szd"><div class="usertext-edit md-container" style="width: 500px;"><div class="md"><textarea rows="1" cols="1" name="text" class="" data-event-action="comment" data-type="link" style=""></textarea></div><div class="bottom-area"><span class="help-toggle toggle" style=""><a class="option active " href="#" tabindex="100" onclick="return toggle(this, helpon, helpoff)">formatting help</a><a class="option " href="#">hide help</a></span><a href="/help/contentpolicy" class="reddiquette" target="_blank" tabindex="100">content policy</a><span class="error CANT_REPLY field-parent" style="display:none"></span><span class="error TOO_LONG field-text" style="display:none"></span><span class="error RATELIMIT field-ratelimit" style="display:none"></span><span class="error NO_TEXT field-text" style="display:none"></span><span class="error SUBREDDIT_LINKING_DISALLOWED field-text" style="display:none"></span><span class="error SUBREDDIT_OUTBOUND_LINKING_DISALLOWED field-text" style="display:none"></span><span class="error USERNAME_LINKING_DISALLOWED field-text" style="display:none"></span><span class="error USERNAME_OUTBOUND_LINKING_DISALLOWED field-text" style="display:none"></span><span class="error TOO_OLD field-parent" style="display:none"></span><span class="error THREAD_LOCKED field-parent" style="display:none"></span><span class="error DELETED_COMMENT field-parent" style="display:none"></span><span class="error USER_BLOCKED field-parent" style="display:none"></span><span class="error USER_MUTED field-parent" style="display:none"></span><span class="error USER_BLOCKED_MESSAGE field-parent" style="display:none"></span><span class="error INVALID_USER field-parent" style="display:none"></span><span class="error MUTED_FROM_SUBREDDIT field-parent" style="display:none"></span><span class="error QUARANTINE_REQUIRES_VERIFICATION field-user" style="display:none"></span><span class="error TOO_MANY_COMMENTS field-text" style="display:none"></span><span class="error SUBMIT_VALIDATION_BODY_REQUIRED field-body" style="display:none"></span><span class="error SUBMIT_VALIDATION_BODY_NOT_ALLOWED field-body" style="display:none"></span><span class="error SUBMIT_VALIDATION_BODY_BLACKLISTED_STRING field-body" style="display:none"></span><span class="error SUBMIT_VALIDATION_BODY_NOT_ALLOWED field-body" style="display:none"></span><span class="error SUBMIT_VALIDATION_BODY_REQUIRED field-body" style="display:none"></span><span class="error SUBMIT_VALIDATION_BODY_REQUIREMENT field-body" style="display:none"></span><span class="error SUBMIT_VALIDATION_REGEX_TIMEOUT field-body" style="display:none"></span><span class="error SUBMIT_VALIDATION_BODY_REGEX_REQUIREMENT field-body" style="display:none"></span><span class="error SUBMIT_VALIDATION_MAX_LENGTH field-body" style="display:none"></span><span class="error SUBMIT_VALIDATION_MIN_LENGTH field-body" style="display:none"></span><span class="error SOMETHING_IS_BROKEN field-parent" style="display:none"></span><span class="error COMMENT_GUIDANCE_VALIDATION_FAILED field-text" style="display:none"></span><span class="error placeholder field-body" style="display:none"></span><span class="error placeholder field-text" style="display:none"></span><div class="usertext-buttons"><button type="submit" onclick="" class="save">save</button><button type="button" onclick="return cancel_usertext(this);" class="cancel" style="">cancel</button><span class="status"></span></div></div><div class="markhelp" style="display:none"><p></p><p>reddit uses a slightly-customized version of <a href="http://daringfireball.net/projects/markdown/syntax">Markdown</a> for formatting. See below for some basics, or check <a href="/wiki/commenting">the commenting wiki page</a> for more detailed help and solutions to common issues.</p><p></p><table class="md"><tbody><tr style="background-color: #ffff99; text-align: center"><td><em>you type:</em></td><td><em>you see:</em></td></tr><tr><td>*italics*</td><td><em>italics</em></td></tr><tr><td>**bold**</td><td><b>bold</b></td></tr><tr><td>[reddit!](https://reddit.com)</td><td><a href="https://reddit.com">reddit!</a></td></tr><tr><td>* item 1<br>* item 2<br>* item 3</td><td><ul><li>item 1</li><li>item 2</li><li>item 3</li></ul></td></tr><tr><td>&gt; quoted text</td><td><blockquote>quoted text</blockquote></td></tr><tr><td>Lines starting with four spaces<br>are treated like code:<br><br><span class="spaces">&nbsp;&nbsp;&nbsp;&nbsp;</span>if 1 * 2 &lt; 3:<br><span class="spaces">&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;</span>print "hello, world!"<br></td><td>Lines starting with four spaces<br>are treated like code:<br><pre>if 1 * 2 &lt; 3:<br>&nbsp;&nbsp;&nbsp;&nbsp;print "hello, world!"</pre></td></tr><tr><td>~~strikethrough~~</td><td><strike>strikethrough</strike></td></tr><tr><td>super^script</td><td>super<sup>script</sup></td></tr></tbody></table></div></div></form>`;

            if (childDiv) {
              var existingForm = childDiv.querySelector('#commentreply_t1_lp30szd');
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
                  let textarea = childDiv.querySelector('textarea[name="text"]');
                  if (textarea && textarea.value !== null) {
                    let enteredText = textarea.value;

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
                        insertUserReplyFakeComments(childDiv, username, enteredText,fakeCommentID,fakePostId);
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

    let textarea = childDiv.querySelector('textarea[name="text"]');

    if (textarea && textarea.value !== null) {
      let enteredText = textarea.value;
      childDiv.innerHTML = '';  // Clears all content inside childDiv
      insertUserReplyFakeComments(childDiv, username, enteredText, fakeCommentId, fakePostId);
      // remove the old user reply to fake comment according to old conten
      //console.log(" test out the contet ere: ", content);
      sendDeleteUserReplyFakeCommentMessage(fakeCommentId, fakePostId,content);
      // add new comments acoording to new text 
      sendUserReplyFakeComment(fakeCommentId, enteredText, fakePostId);

    }

  });
 
}


var user = null;
var is_mobile = !!navigator.userAgent.match(/iphone|android|blackberry/ig) || false;

function writeUserData(userId, name, email) {
  var userRef = firebase.database().ref('users/' + userId);

  userRef.once("value").then((snapshot) => {
    if (snapshot.exists()) { 
      
      console.log("exists");
    } else {
      console.log("new user");
      firebase.database().ref('users/' + userId).set({
      username: name,
      email: email,
        clout: 0,
        credits: 5,
        votes: 0,
        editor: false
    });
    }
  });
  console.log("update received");
}

function updateUser(userUpdate) {
    user = userUpdate;
    if (user) {

        var userInfo;
        var userUid;

        waitForRef();

        function waitForRef() {

          firebase.database().ref('users/' + user.uid).once('value').then(function(snapshot) {
            userInfo = snapshot.val();
            userUid = snapshot.key;
          });

          if (userInfo) {

            var authDivFixed = document.getElementById("topRightFixed");
            var authDivMove = document.getElementById("topright");

            while (authDivFixed.firstChild) {
              authDivFixed.removeChild(authDivFixed.firstChild);
            }

            while (authDivMove.firstChild) {
              authDivMove.removeChild(authDivMove.firstChild);
            }

            var topLeftOut = document.getElementById("topLeftOut");
            var topLeftIn = document.getElementById("topLeftIn")

            while (topLeftOut.firstChild) {
              topLeftOut.removeChild(topLeftOut.firstChild);
            }

            while (topLeftIn.firstChild) {
              topLeftIn.removeChild(topLeftIn.firstChild);
            }

            var cloutButton = document.createElement("button");
            cloutButton.className = "topButtonIn";
            cloutButton.innerHTML = "Leaderboard";
            cloutButton.setAttribute('onclick', "location.href='https://sliced.us/leaderboard'");
            topLeftIn.appendChild(cloutButton);

            var howToButton = document.createElement("button");
            howToButton.className = "topButtonIn";
            howToButton.innerHTML = "How To Slice"
            howToButton.setAttribute('onclick', "location.href='https://sliced.us/howto'");
            topLeftIn.appendChild(howToButton);

            var signOutButton = document.createElement("button");
            signOutButton.id = "signOut";
            signOutButton.className = "topButtonRight";
            signOutButton.innerHTML = "Log Out";
            signOutButton.addEventListener('click', function(event) {
              firebase.auth().signOut();
            });

            var myProfile = document.createElement("button");
            myProfile.className = "topButtonRight";
            myProfile.innerHTML = '<span style="vertical-align:middle;">My Profile </span><img src="' + userInfo.plane + '.jpg" id="buttonPizza">';
            var href = '"https://sliced.us/author.html?author=' + userUid + '"'; 
            myProfile.setAttribute('onclick', 'location.href=' + href);

            if (is_mobile) {
              topLeftIn.appendChild(myProfile);
              topLeftIn.appendChild(signOutButton);
            }
            else if (!is_mobile) {
              authDivMove.appendChild(signOutButton);
              authDivMove.appendChild(myProfile);
            }

          }
          else {
              setTimeout(waitForRef, 250);
          }
        }
    }
}

function openTab(evt, tabName) {
    // Declare all variables
    var i, tabcontent, tablinks;

    // Get all elements with class="tabcontent" and hide them
    tabcontent = document.getElementsByClassName("tabcontent");
    for (i = 0; i < tabcontent.length; i++) {
        tabcontent[i].style.display = "none";
    }

    // Get all elements with class="tablinks" and remove the class "active"
    tablinks = document.getElementsByClassName("tablinks");
    for (i = 0; i < tablinks.length; i++) {
        tablinks[i].className = tablinks[i].className.replace(" active", "");
    }

    // Show the current tab, and add an "active" class to the button that opened the tab
    document.getElementById(tabName).style.display = "block";
    evt.currentTarget.className += " active";
}

function loadText(articleID) {

    var read = document.getElementById("ReadText");
    // read.innerHTML = '';
    while (read.firstChild) {
      read.removeChild(read.firstChild);
    }
    var review = document.getElementById("ReviewText");
    // review.innerHTML = '';
    while (review.firstChild) {
      review.removeChild(review.firstChild);
    }
    var contribute = document.getElementById("ContributeText");
    // contribute.innerHTML = '';
    while (contribute.firstChild) {
      contribute.removeChild(contribute.firstChild);
    }

    var instructionsSpace = document.createElement("div");
    instructionsSpace.id = "instructionsSpace";
    var existingContributions = document.createElement("div");
    var candidateContributions = document.createElement("div");
    var buttonSpace = document.createElement("div");
    buttonSpace.id = "buttonSpace";

    contribute.appendChild(instructionsSpace);
    contribute.appendChild(existingContributions);
    contribute.appendChild(candidateContributions);
    contribute.appendChild(buttonSpace);

    var title;

    firebase.database().ref('posts/'  + String(articleID)).once('value').then(function(snapshot) {
      var article = snapshot.val();
      var title = article.title;
      var blurb = article.blurb;
      var titleSlot = document.createElement("h2");
      var blurbSlot = document.createElement("p");
      titleSlot.innerHTML = title;
      blurbSlot.innerHTML = blurb;
      var titleSpace = document.getElementById("titleSpace");
      while (titleSpace.firstChild){
        titleSpace.removeChild(titleSpace.firstChild);
      }
      titleSpace.appendChild(titleSlot);

      var blurbSpace = document.getElementById("blurbSpace");
      while (blurbSpace.firstChild){
        blurbSpace.removeChild(blurbSpace.firstChild);
      }
      blurbSpace.appendChild(blurbSlot);

    });

    firebase.database().ref('posts/'  + String(articleID) + '/title').once('value').then(function(snapshot) {
      title = snapshot.val();
      var titleSlot = document.createElement("h2");
      titleSlot.innerHTML = title;
      var titleSpace = document.getElementById("titleSpace");
      while (titleSpace.firstChild){
        titleSpace.removeChild(titleSpace.firstChild);
      }
      titleSpace.appendChild(titleSlot);
    });

    var paragraph_count = -1;

    firebase.database().ref('posts/'  + String(articleID) + '/paragraph_count').once('value').then(function(snapshot) {
      paragraph_count = snapshot.val();
    });

    waitForParaCount();

    function waitForParaCount() {
      if (paragraph_count !== -1){

        var i = 0;
        var rootRef = firebase.database().ref();
        var urlRef = rootRef.child("posts/" + String(articleID) + "/contributions").orderByChild("paragraph_number");
        urlRef.once("value", function(snapshot) {
          snapshot.forEach(function(child) {
            var contribution = child.val();
            var key = child.key;

            var dateTimestamp = new Date(contribution.timestamp);
            var countDownDate = dateTimestamp.addHours(48).getTime();
            var subtext = document.createElement("div");

            var now = new Date().getTime();

            // Find the distance between now an the count down date
            var distance = countDownDate - now;

            if (contribution.accepted == true) {
                var newReadPara = document.createElement("p");
                newReadPara.innerHTML = contribution.body;
                read.appendChild(newReadPara);

                var newReviewPara = document.createElement("h4");
                newReviewPara.innerHTML = contribution.body;
                var reviewInfoName = document.createElement("p");
                reviewInfoName.className = "reviewDetails";
                reviewInfoName.innerHTML = 'Author: <a href="author.html?author=' + contribution.uid + '" style="text-decoration: none; color: black;">' + contribution.author + "</a><br>Upvotes: " + contribution.upvotes + " Downvotes: " + contribution.downvotes;;
                newReviewPara.appendChild(reviewInfoName);
                review.appendChild(newReviewPara);

            }
          });
        });

        var rootRef = firebase.database().ref();
        var urlRef = rootRef.child("posts/" + String(articleID) + "/contributions");
        urlRef.once("value", function(snapshot) {
          snapshot.forEach(function(child) {
            var contribution = child.val();
            var key = child.key;

            var dateTimestamp = new Date(contribution.timestamp);
            var countDownDate = dateTimestamp.addHours(48).getTime();
            var subtext = document.createElement("div");

            var now = new Date().getTime();

            // Find the distance between now an the count down date
            var distance = countDownDate - now;
            if (contribution.accepted == false && user && distance > 0 && contribution.active == true) {
                var containerDiv = document.createElement("div");
                containerDiv.className = "containerDiv";
                var para = document.createElement("div");
                para.id = "leftjustify" + String(key);
                para.className = "conditional";
                var t = document.createTextNode(contribution.body);
                para.appendChild(t);

                var submitInfo = document.createElement("div");
                submitInfo.id = "rightjustify"

                containerDiv.appendChild(para);
                containerDiv.appendChild(submitInfo);
                candidateContributions.appendChild(containerDiv);

                addCountdown(submitInfo, contribution);
                addCounter(submitInfo, key, articleID);

                var earn = document.createElement("div");
                earn.className = "earnContent";
                earn.id = "earn" + String(key);
                candidateContributions.appendChild(earn);


                i++;
            }
            else if (contribution.accepted == false && user && distance <= 0 && contribution.active == true) {
              firebase.database().ref('posts/' + String(articleID)).once('value').then(function(snapshot) {
                post = snapshot.val();
                var newActivect = post.activect - 1;
                updates = {};
                updates['posts/' + String(articleID) + "/contributions/" + key + '/active'] = false;
                updates['posts/' + String(articleID) + '/activect'] = newActivect;
                firebase.database().ref().update(updates);
              });
            }
          });
          if (!user){
            var contributeAlert = document.createElement("p");
            contributeAlert.innerHTML = "Sign In to Contribute!"
            contribute.appendChild(contributeAlert);
          }
          else {
            var instructions = document.createElement("p");
            console.log(i);
            if (i > 0){
              instructions.innerHTML = "Vote on existing contributions to the article below. If something is missing, write your own!";
            }
            else if (i == 0) {
              instructions.innerHTML = "There are no active contributions.";
            }
            instructions.id = "instructions";
            instructionsSpace.appendChild(instructions);
          }

          
          if (user) {
            addButton(i,articleID,title);
          }
        });
      }
      else {
        setTimeout(waitForParaCount, 250);
      }
    }
}

function addTextBox(i,articleID,title) {

    var buttonSpace = document.getElementById("buttonSpace");
    console.log(buttonSpace);
    while (buttonSpace.firstChild) {
      buttonSpace.removeChild(buttonSpace.firstChild);
    }

    var txtBox = document.createElement("textarea");

    txtBox.cols = 75;
    txtBox.rows = 5;
    txtBox.maxLength = 650;
    txtBox.id = "txtbox" + String(i);

    var undoButton = document.createElement("button");
    undoButton.innerHTML = "Cancel";
    undoButton.setAttribute('onclick','addPrompt('+String(i)+','+'"'+String(articleID)+'"'+')');
    undoButton.className = "undoSubmit";

    var submitButton = document.createElement("button");
    submitButton.innerHTML = "Submit";
    submitButton.setAttribute('onclick','submitText('+String(i)+','+'"'+String(articleID)+'"'+','+'"'+String(title)+'"'+')');
    submitButton.className = "undoSubmit";

    var txtDiv = document.createElement("div")
    txtDiv.id = "addContribution";
    txtDiv.appendChild(txtBox);
    txtDiv.appendChild(submitButton);
    txtDiv.appendChild(undoButton);
    buttonSpace.appendChild(txtDiv);
}

function addButton(i,articleID,title) {

    var contributeButton = document.createElement("button");
    contributeButton.innerHTML = "Write your own!";
    contributeButton.setAttribute('onclick','addTextBox('+String(i)+','+'"'+String(articleID)+'"'+','+'"'+String(title)+'"'+')');
    contributeButton.id = "contributeButton";

    var buttonSpace = document.getElementById("buttonSpace");
    buttonSpace.appendChild(contributeButton);
}

function addPrompt(i,articleID) {
    var buttonSpace = document.getElementById("buttonSpace");
    while (buttonSpace.firstChild) {
      buttonSpace.removeChild(buttonSpace.firstChild);
    }
    addButton(i,articleID);

}

function submitText(i,articleID,title) {

    var votes = 0
    firebase.database().ref('users/' + user.uid).once('value').then(function(snapshot) {
      user_value = snapshot.val();
        if (user_value.votes >= 5 || user_value.free_contributions == 1) {
            var textInput = document.getElementById("txtbox" + String(i)).value;

            var now = new Date().getTime();

            var contributionID = writeNewContribution(textInput,0,0,false,user.displayName,user.uid,now,articleID,0,0,0,0,true,title);

            loadText(articleID);
            var updates = {};

            if (user_value.free_contributions == 1) {
              updates['users/' + user.uid + '/free_contributions'] = 0
            }
            else {
              updates['users/' + user.uid + '/votes'] = 0;
            }

            firebase.database().ref().update(updates);
        }
        else {
            alert("To contribute, you must have voted at least five times since your last contribution.");
        }
    });
}

Date.prototype.addHours = function(h) {    
   this.setTime(this.getTime() + (h*60*60*1000)); 
   return this;   
}


function addCountdown(subinfo, contribution) {

    var timestamp = contribution.timestamp;
    var justname = contribution.author;
    var uid = contribution.uid;
    var dateTimestamp = new Date(timestamp);
    var countDownDate = dateTimestamp.addHours(48).getTime();
    var subtext = document.createElement("div");
    subinfo.appendChild(subtext);

    // Update the count down every 1 second
    var x = setInterval(function() {

      // Get todays date and time
      var now = new Date().getTime();

      // Find the distance between now an the count down date
      var distance = countDownDate - now;

      // Time calculations for days, hours, minutes and seconds
      var days = Math.floor(distance / (1000 * 60 * 60 * 24));
      var hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      var minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
      var seconds = Math.floor((distance % (1000 * 60)) / 1000);

      var name = 'Submitted by:<br><a href="author.html?author=' + uid + '" style="text-decoration: none; color: black;">' + justname + '</a>';
      var b = document.createElement("br");

      if (days > 0) {
        var timeleft = document.createTextNode("Time left: " + days + "d " + hours + " h");
      }
      else if (hours > 0) {
        var timeleft = document.createTextNode("Time left: " + hours + "h ");
      }
      else {
        var timeleft = document.createTextNode("Time left: " + minutes + "m ");
      }

      while (subtext.firstChild) {
          subtext.removeChild(subtext.firstChild);
      }

      subtext.innerHTML = name;
      subtext.appendChild(b);
      subtext.appendChild(timeleft);

      subtext.color = "#484848";

      // If the count down is finished, write some text 
      if (distance < 0) {
        clearInterval(x);
        subtext.innerHTML = "EXPIRED";

      }
    }, 1000);    

}

function addCounter(subinfo, contributionID, articleID) {


    updown = document.createElement('div');
    upcounter = document.createElement('button');
    upcounter.id = "upper" + String(contributionID);
    upcounter.className = "voteButton";
    downcounter = document.createElement('button');
    downcounter.id = "downer" + String(contributionID);
    downcounter.className = "voteButton";

    upcounter.innerHTML = "Earn Upvote";
    downcounter.innerHTML = "Earn Downvote";

    upcounter.setAttribute('onclick','addEarn(' + '"upvotes",' + '"' + String(contributionID) + '"' + ',' + '"' + String(articleID) + '"' +')');
    downcounter.setAttribute('onclick','addEarn(' + '"downvotes",' + '"' + String(contributionID) + '"' + ',' + '"' + String(articleID) + '"'+')');


    upcount = document.createElement("p");
    upcount.id = "up" + String(contributionID);
    upcount.innerHTML = "0";
    upcount.className = "voteText";
    downcount = document.createElement("p");
    downcount.id = "down" + String(contributionID);
    downcount.innerHTML = "0";
    downcount.className = "voteText";

    upcounter.appendChild(upcount);
    updown.appendChild(upcounter);
    downcounter.appendChild(downcount);
    updown.appendChild(downcounter);
    subinfo.appendChild(updown);

    var upvoteRef = firebase.database().ref('posts/' + String(articleID) + '/contributions/' + contributionID + '/upvotes');
    upvoteRef.on('value', function(snapshot) {
        votes = document.getElementById("up" + String(contributionID))
        votes.innerHTML = String(snapshot.val());
    });

    var downvoteRef = firebase.database().ref('posts/' + String(articleID) + '/contributions/' + contributionID + '/downvotes');
    downvoteRef.on('value', function(snapshot) {
        votes = document.getElementById("down" + String(contributionID))
        votes.innerHTML = String(snapshot.val());
    });


}

function addEarn(direction, contributionID, articleID) {
  var authorUid = '';
  firebase.database().ref('posts/' + String(articleID) + '/contributions/' + contributionID + '/uid').once('value').then(function(snapshot) {
    authorUid = snapshot.val();
  });

  waitforUid();

  function waitforUid() {
    if (authorUid !== ''){

      if (authorUid !== user.uid) {

        content = document.getElementById("earn" + String(contributionID));
        var indefArticle;
        if (direction == "upvotes") {
          indefArticle = "an upvote";
        }
        else if (direction == "downvotes") {
          indefArticle = "a downvote";
        }

        // choose one of the community standards randomly
        communityStandards = ['No false claims. All claims of fact should be easily verifiable.', 'No hate speech. The contribution should make no statement attacking or discriminating against a person or group \
        based on race, religion, ethnic origin, national origin, sex, disability, sexual orientiation, or gender identity.', 'No spam. The contribution should be an earnest thought and not an attempt at vandalizing the article.']

        var randomStandard = shuffle(communityStandards).pop();

        content.innerHTML = "<span style='color:#484848;'><br>To earn " + indefArticle + " on the contribution above, help Sliced maintain its quality. Decide if the contribution shown below meets the following community standard:<br><br>" + randomStandard;
        var contributionArray = [];
        var n = 0;

        var rootRef = firebase.database().ref();
          var urlRef = rootRef.child("posts");
          urlRef.once("value", function(snapshot) {
            snapshot.forEach(function(child) {
              var contribution = child.val();
              var key = child.key;
              var val = '';

              postRef = urlRef.child(String(key));

              postRef.child('contributions').orderByChild('accepted').equalTo(false).on("value", function(snapshot) {
                  val = snapshot.val();
              });


              waitForBody();

              function waitForBody() {
                  if (val != '' && val !== null) {
                    for (x in val) {
                      if (val[x].active == true) {
                        contributionArray.push([key, x, val[x], contribution.title]);
                        n++;
                      }
                    }
                  }
                  else {
                      setTimeout(waitForBody, 250);
                  }
              }

            });

          });

          waitforArrayLoad();

          function waitforArrayLoad() {
              if (contributionArray.length == n && n !== 0) {

                  var readSpace = document.getElementById("readcontainer");

                  var shuffledArray = shuffle(contributionArray);

                  var pair = shuffledArray.pop();
                  var title = pair[3];
                  var contrib = pair[2];

                  var titleContainer = document.createElement("p");
                  titleContainer.innerHTML = "<span style='color:#484848; font-weight: normal;'> From: </span>" + title;

                  var reviewContainer = document.createElement("p")
                  reviewContainer.innerHTML = "<span style='color:#484848;'> Contribution: </span>" + contrib.body + '<br>'


                  content.appendChild(titleContainer);
                  content.appendChild(reviewContainer);

                  var ok = document.createElement("input");
                  ok.type = "radio";
                  ok.name = "choices";
                  ok.class = "radioButtons";
                  ok.value = "ok";
                  ok.id = "ok" + String(contributionID);
                  var slicedworthyLabel = document.createTextNode("SlicedWorthy");

                  var toxic = document.createElement("input");
                  toxic.type = "radio";
                  toxic.name = "choices";
                  toxic.class = "radioButtons";
                  toxic.value = "toxic";
                  toxic.id = "toxic" + String(contributionID);
                  var toxicLabel = document.createTextNode("Toxic")

                  var submit = document.createElement("input");
                  submit.type = "submit";
                  submit.className = "undoSubmit";
                  submit.setAttribute("onclick", "getRadioValues('" + String(articleID) + "','" + String(pair[1]) + "','" + String(direction) + "')");

                  var cancel = document.createElement("button");
                  cancel.innerHTML = "Cancel";
                  cancel.className = "undoSubmit";
                  cancel.setAttribute("onclick", "clearEarn('" + String(contributionID) + "')");

                  var brtag = document.createElement("p")

                  content.appendChild(ok);
                  content.appendChild(slicedworthyLabel);
                  content.appendChild(toxic);
                  content.appendChild(toxicLabel);
                  content.appendChild(submit);
                  content.appendChild(cancel);
                  content.appendChild(brtag);
                  content = document.getElementById("earn" + String(contributionID))

                  content.style.maxHeight = content.scrollHeight + "px";
                  waitForMaxScroll();

                  function waitForMaxScroll(){
                    if (content.style.maxHeight !== 0) {
                      setTimeout(window.scroll({left: 0, top: findPos(document.getElementById("leftjustify" + String(contributionID))),behavior: 'smooth'}),100);
                    }
                    else {
                      console.log("wait");
                      setTimeout(waitForMaxScroll, 250);
                    }

                  }
              }
              else {
                  setTimeout(waitforArrayLoad, 250);
              }
          }
      }
      else {
        alert("You can't vote on your own contributions. Check out what others have written!");
      }
    }
    else {
      setTimeout(waitforUid, 250);
    }

  }

  

}

function findPos(obj) {
    var curtop = 0;
    if (obj.offsetParent) {
        do {
            curtop += obj.offsetTop;
        } while (obj = obj.offsetParent);
    console.log(curtop);
    return [curtop];
    }
}

function shuffle(array) {
  var currentIndex = array.length, temporaryValue, randomIndex;

  // While there remain elements to shuffle...
  while (0 !== currentIndex) {

    // Pick a remaining element...
    randomIndex = Math.floor(Math.random() * currentIndex);
    currentIndex -= 1;

    // And swap it with the current element.
    temporaryValue = array[currentIndex];
    array[currentIndex] = array[randomIndex];
    array[randomIndex] = temporaryValue;
  }

  return array;
}

function getRadioValues(articleID, contributionID, direction) {
  console.log("getRadioValues");
  var postUpdateComplete;
  var checkValue;

  var ok = document.getElementById("ok"  + String(contributionID));
  var toxic = document.getElementById("toxic" + String(contributionID));

  if (ok.checked) {
    checkValue = ok.value;
  }
  else if (toxic.checked) {
    checkValue = toxic.value;
  }

  if (checkValue) {
    console.log(checkValue);
    firebase.database().ref('posts/' + articleID + '/contributions/' + contributionID).once('value').then(function(snapshot) {

      contribution0 = snapshot.val();

      // Make this figure out which community standard is being reviewed and send the right thing to DB.
      var 
      contribution0reviewct = contribution0.reviewct;
      contribution0toxicct = contribution0.toxicct;

      var newReviewct0 = contribution0reviewct + 1;
      if (checkValue == "toxic") {
        var newToxicct0 = contribution0toxicct + 1;
      }
      else {
        var newToxicct0 = contribution0toxicct;
      }

      var updates = {};

      updates['posts/' + articleID + '/contributions/' + contributionID + '/reviewct'] = newReviewct0;
      updates['posts/' + articleID + '/contributions/' + contributionID + '/toxicct'] = newToxicct0;

      firebase.database().ref().update(updates);

      postUpdateComplete = true;

    });

    clearEarn(contributionID);

    firebase.database().ref('users/' + user.uid + '/votes').once('value').then(function(snapshot) {

      var updates = {};

      var currentVotes = snapshot.val();
      if (currentVotes != null) {
        var newVotes = currentVotes + 1;
        updates['users/' + user.uid + '/votes'] = newVotes;
      }
      else {
        updates['users/' + user.uid + '/votes'] = 1;
      }
      // updates['users/' + user.uid + '/credits'] = newCredits;

      firebase.database().ref().update(updates);

    });

    var ref = firebase.database().ref('posts/' + String(articleID) + '/contributions/' + contributionID + '/' + direction);
    ref.transaction(function(currentClicks) {
    // If node/clicks has never been set, currentRank will be `null`.
      var newValue = (currentClicks || 0) + 1;

      if (newValue >= 10) {
        if (direction == 'upvotes') {
            integrateText(contributionID, articleID, authorUid);
        }
        else if (direction == 'downvotes') {
            removeText(contributionID, articleID);
        }
      }
      return newValue;
    });
  }

}

function clearEarn(contributionID) {
  var content = document.getElementById("earn" + String(contributionID));
  content.style.maxHeight = 0;

  function waitForZero() {
    if (content.style.maxHeight == 0){
      while (content.firstChild) {
        content.removeChild(content.firstChild);
      } 
    }
    else {
      setTimeout(waitForZero, 250);
    }
  }
}

function integrateText(contributionID, articleID, authorUid) {

    firebase.database().ref('posts/' + String(articleID)).once('value').then(function(snapshot) {
      var article = snapshot.val();
      var currentParagraphs = article.paragraph_count;
      var newParagraphCount = currentParagraphs + 1;

      var upvotes = article.contributions[String(contributionID)].upvotes;
      var downvotes = article.contributions[String(contributionID)].downvotes;

      var cloutBoost = upvotes - downvotes;

      var now = new Date().getTime();

      var updates = {};
      updates['posts/' + String(articleID) + '/contributions/' + contributionID + '/accepted'] = true;
      updates['posts/' + String(articleID) + '/contributions/' + contributionID + '/active'] = false;
      updates['posts/' + String(articleID) + '/contributions/' + contributionID + '/paragraph_number'] = newParagraphCount;
      updates['posts/' + String(articleID) + '/paragraph_count'] = newParagraphCount;
      updates['posts/' + String(articleID) + '/updatedTimestamp'] = now;
      updates['users/' + String(authorUid) + '/contributions/' + contributionID + '/accepted'] = true;
      updates['users/' + String(authorUid) + '/contributions/' + contributionID + '/active'] = false;
      firebase.database().ref().update(updates);

      firebase.database().ref('users/' + String(authorUid) + '/clout').transaction(function(currentClout) {
        var newClout = (currentClout || 0) + cloutBoost;
        return newClout;
      });

      firebase.database().ref('posts/' + String(articleID) + '/activect').transaction(function(currentActive) {
        var newValue = currentActive - 1;
        return newValue;
      });

      loadText(articleID);


    });
}

function removeText(contributionID, articleID) {
    //this should be updated at some point so that the content is logged.
    // var ref = firebase.database().ref('posts/' + String(articleID) + '/contributions/' + contributionID);
    // ref.remove();
    updates = {};
    updates['posts/' + String(contributionID) + '/' + String(articleID) + '/active'] = false
    updates['users/' + String(authorUid) + '/contributions/' + contributionID + '/active'] = false;
    firebase.database().ref().update(updates);

    loadText(articleID);
}


function writeNewContribution(body, upvotes, downvotes, accepted, author, uid, timestamp, articleID, reviewct, communitystandard0, communitystandard1, communitystandard2, active, title) {
  // A post entry.
  var contributionData = {
    body: body,
    upvotes: upvotes,
    downvotes: downvotes,
    accepted: accepted,
    author: author,
    uid: uid,
    timestamp: timestamp,
    articleID: articleID,
    reviewct: reviewct,
    communitystandard0: communitystandard0,
    communitystandard1: communitystandard1,
    communitystandard2: communitystandard2,
    active: active,
    title: title
  };

  // Get a key for a new Post.
  var newContributionKey = firebase.database().ref().child('posts/' + String(articleID) + '/contributions').push().key;

  // Write the new post's data simultaneously in the posts list and the user's post list.
  var updates = {};
  updates['posts/' + String(articleID) + '/contributions/' + newContributionKey] = contributionData;
  updates['users/' + String(uid) + '/contributions/' + newContributionKey] = contributionData;

  var datRef = firebase.database().ref();
  datRef.update(updates);

  console.log(articleID);
  firebase.database().ref('posts/' + String(articleID) + '/activect').transaction(function(currentActive) {
    var newValue = (currentActive || 0) + 1;
    console.log(newValue);

    return newValue;
  });

  return newContributionKey;

}

function increaseCredits() {
  var ref = firebase.database().ref('users/' + user.uid + '/credits');
  ref.transaction(function(currentCredits) {
    console.log(currentCredits);
  // If node/clicks has never been set, currentRank will be `null`.
    var newValue = (currentCredits || 0) + 5;

    return newValue;
  });
}

function voteButtonActions() {

  firebase.database().ref('posts').orderByChild('activect').limitToLast(1).once('value').then(function(snapshot) {
    snapshot.forEach(function(child) {
      key = child.key;
      location.href = 'https://sliced.us/article.html?article=' + String(key) + '#contribution';

    });
  });
    // location.href='https://sliced.us';
}

function contributeButtonActions() {
    location.href='https://sliced.us';
    alert("Go to the contribute section of any article to write your own contributions!");
}

function pageLoad() {
    if (window.location.hash === "#mostvote") {
      var contribTab = document.getElementById("contribTab");
      var readTab = document.getElementById("defaultOpen");
      var contribDiv = document.getElementById("Contribute");
      var readDiv = document.getElementById("Read");
      contribTab.className = "tablinks active";
      readTab.className = "tablinks";
      contribDiv.style = "display: block;";
      readDiv.style = "display: none";
      var snackbar = document.getElementById("snackbar");
      snackbar.innerHTML = "Here is the article with the most active contributions for you to vote on!"
      snackbar.className = "show";
      setTimeout(function(){ snackbar.className = snackbar.className.replace("show", ""); }, 10000);
    }
    if (window.location.hash === "#vote") {
      var contribTab = document.getElementById("contribTab");
      var readTab = document.getElementById("defaultOpen");
      var contribDiv = document.getElementById("Contribute");
      var readDiv = document.getElementById("Read");
      contribTab.className = "tablinks active";
      readTab.className = "tablinks";
      contribDiv.style = "display: block;";
      readDiv.style = "display: none";
    }
    if (window.location.hash === "#recentcontribute") {
      var contribTab = document.getElementById("contribTab");
      var readTab = document.getElementById("defaultOpen");
      var contribDiv = document.getElementById("Contribute");
      var readDiv = document.getElementById("Read");
      contribTab.className = "tablinks active";
      readTab.className = "tablinks";
      contribDiv.style = "display: block;";
      readDiv.style = "display: none";
      var snackbar = document.getElementById("snackbar");
      snackbar.innerHTML = "Here is the most recently created article for you to contribute to!"
      snackbar.className = "show";
      setTimeout(function(){ snackbar.className = snackbar.className.replace("show", ""); }, 10000);
    }
    if (window.location.hash === "#contribute") {
      var contribTab = document.getElementById("contribTab");
      var readTab = document.getElementById("defaultOpen");
      var contribDiv = document.getElementById("Contribute");
      var readDiv = document.getElementById("Read");
      contribTab.className = "tablinks active";
      readTab.className = "tablinks";
      contribDiv.style = "display: block;";
      readDiv.style = "display: none";
    }
}

window.onload = function() {
  pageLoad();
};

function checkMobile() {
    ourtakeSheet = document.styleSheets[0];
    if (!is_mobile) {
        console.log("desktop");
        ourtakeSheet.insertRule("#readcontainer { position: absolute; top: 35%; padding: 0% 10%; width: 76%;}", 0);
        ourtakeSheet.insertRule("#logo { position: absolute; top: 5%; left: 42.5%; display: block; margin-left: auto; margin-right: auto; width: 15%; }", 0);
        ourtakeSheet.insertRule("#topcontainer { width: 35%; position: absolute; top: 4%; right: 2%; padding: 6px 12px; display: flex; text-align:center;}", 0);
        ourtakeSheet.insertRule("#topright { flex-grow: 1; }", 0);
        ourtakeSheet.insertRule("#topLeftOut { position: absolute; top: 4%; width: 35%; padding: 6px 12px; display: flex;}", 0);
        ourtakeSheet.insertRule("#topLeftIn { position: absolute; top: 4%; width: 35%; padding: 6px 12px; display: flex;}", 0);       ourtakeSheet.insertRule('.conditional { float: left; padding: 3% 0%; width: 60%; margin: 10px 0px; font-size: 24px; line-height: 34px; font-family: "Lora", serif;}', 0);
        ourtakeSheet.insertRule('.topButtonRight { font-family: "Lato", sans-serif; font-size: 22px; display: inline-block; background: white; color: black; border-radius: 3px; box-shadow: 0px 0px 0px grey; white-space: nowrap; margin: 5px; width: 40%; height: 50px; vertical-align: middle; float: right; cursor: pointer;}', 0);
        ourtakeSheet.insertRule('.topButtonOut {font-family: "Lato", sans-serif; font-size: 22px; display: inline-block; background: white; color: black; border-radius: 3px; box-shadow: 0px 0px 0px grey; white-space: nowrap; margin: 5px; height: 50px; vertical-align: top; float: right; cursor: pointer; width: 40%}', 0);
        ourtakeSheet.insertRule('.topButtonIn {font-family: "Lato", sans-serif; font-size: 22px; display: inline-block; background: white; color: black; border-radius: 3px; box-shadow: 0px 0px 0px grey; white-space: nowrap; margin: 5px; height: 50px; vertical-align: top; float: right; cursor: pointer; width: 40%}', 0);
        ourtakeSheet.insertRule('#rightjustify { float: right; padding: 3% 0%; width: 25%; margin: 10px 0px; font-size: 24px; line-height: 34px; color: #484848; font-family: "Lato", sans-serif;}', 0);
        ourtakeSheet.insertRule('.voteButton { background-color: #fff4db; font-size: 18px; width: 40%; height: 50%; margin: 0% 3% 0% 0%;}', 0);
        ourtakeSheet.insertRule('.tab { font-size: 18px; font-family: "Lato", sans-serif; overflow: hidden; background-color: #fff9ea; width: 100%}', 0);
        ourtakeSheet.insertRule('.tab button { font-family: "Lato", sans-serif; font-size: 22px; background-color: inherit; float: left; border: none; outline: none; cursor: pointer; padding: 14px 16px; transition: 0.3s; }', 0);
        ourtakeSheet.insertRule('.tab button:hover { font-family: "Lato", sans-serif; font-size: 22px; background-color: #fff4db; }', 0);
        ourtakeSheet.insertRule('.tab button.active { font-family: "Lato", sans-serif; font-size: 22px; background-color: #ffeeb7; }', 0);
        ourtakeSheet.insertRule('.tabcontent { font-size: 22px; font-family: "Lato", sans-serif; display: none; padding: 6px 12px; border-top: none; }', 0);
        ourtakeSheet.insertRule('h2 { font-family: "Lora", serif; font-weight: bold; font-size: 30px; }', 0);
        ourtakeSheet.insertRule('p { font-family: "Lora", serif; font-size: 22px; line-height: 34px; }', 0);
        ourtakeSheet.insertRule('#buttonPizza { border-radius: 50%; width: 16%; height: 75%; display: inline-block; vertical-align: middle; border: 1px solid #484848; }', 0);
    }
    else if (is_mobile) {
        console.log("mobile");
        ourtakeSheet.insertRule("#readcontainer { position: absolute; top: 28%; padding: 0% 0%; }", 0)
        ourtakeSheet.insertRule("#logo { position: absolute; top: 12%; left: 35%; display: block; margin-left: auto; margin-right: auto; width: 30%; }", 0);
        ourtakeSheet.insertRule("#topcontainer { width: 100%; padding: 0px 0px; display: flex; }", 0);
        ourtakeSheet.insertRule("#topLeftOut { position: absolute; top: 4%; width: 50%; padding: 6px 12px; display: flex;}", 0);
        ourtakeSheet.insertRule("#topLeftIn { position: absolute; top: 4%; width: 100%; padding: 6px 12px; display: flex; }", 0);
        ourtakeSheet.insertRule("#topright { width: 100%; padding: 6px 12px; display: flex; }", 0);
        ourtakeSheet.insertRule(".arrow { display: block; width: 5%; height: 5%; margin: 3% 0%; }", 0);
        ourtakeSheet.insertRule('.topButtonRight { font-family: "Lato", sans-serif; font-size: 24px; display: inline-block; background: white; color: black; width: 22%; border-radius: 3px; box-shadow: 0px 0px 0px grey; white-space: nowrap; margin: 5px; height: 100px; vertical-align: top; float: right }', 0);
        ourtakeSheet.insertRule('.topButtonOut { font-family: "Lato", sans-serif; font-size: 24px; display: inline-block; background: white; color: black; width: 44%; border-radius: 3px; box-shadow: 0px 0px 0px grey; white-space: nowrap; margin: 5px; height: 100px; vertical-align: top; float: right }', 0);
        ourtakeSheet.insertRule('.topButtonIn { font-family: "Lato", sans-serif; font-size: 24px; display: inline-block; background: white; color: black; width: 22%; border-radius: 3px; box-shadow: 0px 0px 0px grey; white-space: nowrap; margin: 5px; height: 100px; vertical-align: top; float: right }', 0);
         ourtakeSheet.insertRule('.conditional { float: left; padding: 3%; width: 95%; margin: 10px 0px; font-size: 24px; line-height: 48px; font-family: "Lora", serif;}', 0);
        ourtakeSheet.insertRule('#rightjustify { float: right; width: 92%; padding: 3%; margin: 10px 0px; font-size: 34px; line-height: 48px; color: black; font-family: "Lato", sans-serif;}', 0);
        ourtakeSheet.insertRule('.voteButton { background-color: #fff4db; font-size: 30px; width: 40%; height: 50%; margin: 0% 3% 0% 0%;}', 0);
        ourtakeSheet.insertRule('.tab { font-size: 34px; font-family: "Lato", sans-serif; overflow: hidden; background-color: #fff9ea; width: 100%}', 0);
        ourtakeSheet.insertRule('.tab button { font-family: "Lato", sans-serif; font-size: 34px; background-color: inherit; float: left; border: none; outline: none; cursor: pointer; padding: 14px 16px; transition: 0.3s; }', 0);
        ourtakeSheet.insertRule('.tab button:hover { font-family: "Lato", sans-serif; font-size: 34px; background-color: #fff4db; }', 0);
        ourtakeSheet.insertRule('.tab button.active { font-family: "Lato", sans-serif; font-size: 34px; background-color: #ffeeb7; }', 0);
        ourtakeSheet.insertRule('.tabcontent { font-size: 34px; font-family: "Lato", sans-serif; display: none; padding: 6px 12px; border-top: none; }', 0);
        ourtakeSheet.insertRule('h2 { font-family: "Lora", serif; font-weight: bold; font-size: 40px; }', 0)
        ourtakeSheet.insertRule('p { font-family: "Lora", serif; font-size: 36px; line-height: 54px; }', 0);
        ourtakeSheet.insertRule('#buttonPizza { border-radius: 50%; width: 35%; height: 75%; display: inline-block; vertical-align: middle; border: 1px solid #484848; }', 0);

    }
}
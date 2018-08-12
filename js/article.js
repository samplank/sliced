var user = null;

function writeUserData(userId, name, email) {
  var userRef = firebase.database().ref('users/' + userId);

  userRef.once("value").then((snapshot) => {
    if (snapshot.exists()) { 
    } else {
      firebase.database().ref('users/' + userId).set({
      username: name,
      email: email,
      credits: 10,
      votes: 0,
      free_contributions: 1
    });
    }
  });
}

function updateUser(userUpdate) {
  user = userUpdate;

  if (user) {
    firebase.database().ref('users/' + user.uid + '/credits').once('value').then(function(snapshot) {
      credits = snapshot.val();

      var authDiv = document.getElementById("topright");
      while (authDiv.firstChild) {
        authDiv.removeChild(authDiv.firstChild);
      }

      var signOutButton = document.createElement("button");
      signOutButton.id = "signOut";
      signOutButton.className = "topButton";
      signOutButton.innerHTML = credits + ': ' + user.displayName;
      signOutButton.addEventListener('click', function(event) {
        firebase.auth().signOut();
      });
      authDiv.appendChild(signOutButton);

    });
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

    firebase.database().ref('posts/'  + String(articleID) + '/title').once('value').then(function(snapshot) {
      title = snapshot.val();
      var titleSlot = document.createElement("h2");
      titleSlot.innerHTML = title;
      var titleSpace = document.getElementById("titleSpace");
      titleSpace.appendChild(titleSlot);
    });

    var paragraph_count = -1;

    firebase.database().ref('posts/'  + String(articleID) + '/paragraph_count').once('value').then(function(snapshot) {
      paragraph_count = snapshot.val();
    });

    waitForParaCount();

    function waitForParaCount() {
      if (paragraph_count !== -1){

        if (paragraph_count > 3) {
            var dotSpace = document.createElement("p");
            dotSpace.innerHTML = "...";
            existingContributions.appendChild(dotSpace);
        }

        var i = 0;
        var rootRef = firebase.database().ref();
        var urlRef = rootRef.child("posts/" + String(articleID) + "/contributions").orderByChild("paragraph_number");
        urlRef.once("value", function(snapshot) {
          snapshot.forEach(function(child) {
            var contribution = child.val();
            var key = child.key;

            var dateTimestamp = new Date(contribution.timestamp);
            var countDownDate = dateTimestamp.addHours(3).getTime();
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
                reviewInfoName.innerHTML = "<i>Author</i>: " + contribution.author + " <i>Upvotes</i>: " + contribution.upvotes + " <i>Downvotes</i>: " + contribution.downvotes;;
                // var reviewInfoDateVotes = document.createElement("p");
                // reviewInfoDateVotes.innerHTML = " <i>Upvotes</i>: " + contribution.upvotes + " <i>Downvotes</i>: " + contribution.downvotes; 
                newReviewPara.appendChild(reviewInfoName);
                // newReviewPara.appendChild(reviewInfoDateVotes);
                review.appendChild(newReviewPara);

                //only show the last three paragraphs.
                if (user && contribution.paragraph_number > (paragraph_count - 3)){


                    console.log(contribution.paragraph_number);
                    console.log(paragraph_count - 3);
                    console.log(contribution.body);

                    var newContributePara = document.createElement("p");
                    newContributePara.innerHTML = contribution.body;
                    existingContributions.appendChild(newContributePara);

                    var replaceDiv = document.createElement("div");
                    replaceDiv.id = "div" + String(i);
                    existingContributions.appendChild(replaceDiv);

                    var newlineDiv = document.createElement("div");
                    newlineDiv.id = "newline";
                    existingContributions.appendChild(newlineDiv);

                  }

                i++;
            }
          });
          if (!user){
            var contributeAlert = document.createElement("p");
            contributeAlert.innerHTML = "Sign In to Contribute!"
            contribute.appendChild(contributeAlert);
          }
          else {
            var instructions = document.createElement("p");
            instructions.innerHTML = "Vote on existing contributions to the article. If something is missing, write your own!";
            instructions.id = "instructions";
            instructionsSpace.appendChild(instructions);
          }
        });

        var rootRef = firebase.database().ref();
        var urlRef = rootRef.child("posts/" + String(articleID) + "/contributions");
        urlRef.once("value", function(snapshot) {
          snapshot.forEach(function(child) {
            var contribution = child.val();
            var key = child.key;

            var dateTimestamp = new Date(contribution.timestamp);
            var countDownDate = dateTimestamp.addHours(3).getTime();
            var subtext = document.createElement("div");

            var now = new Date().getTime();

            // Find the distance between now an the count down date
            var distance = countDownDate - now;
            if (contribution.accepted == false && user && distance > 0) {
                var containerDiv = document.createElement("div");
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

                addCountdown(submitInfo, contribution.timestamp, contribution.author);
                addCounter(submitInfo, key, articleID);
                i++;
            }
          });
          if (user) {
            addButton(i,articleID);
          }
        });
      }
      else {
        setTimeout(waitForParaCount, 250);
      }
    }
}

function addTextBox(i,articleID) {

    var buttonSpace = document.getElementById("buttonSpace");
    console.log(buttonSpace);
    while (buttonSpace.firstChild) {
      buttonSpace.removeChild(buttonSpace.firstChild);
    }

    var txtBox = document.createElement("textarea");

    txtBox.cols = 100;
    txtBox.rows = 5;
    txtBox.maxLength = 500;
    txtBox.id = "txtbox" + String(i);

    var undoButton = document.createElement("button");
    undoButton.innerHTML = "Cancel";
    undoButton.setAttribute('onclick','addPrompt('+String(i)+','+'"'+String(articleID)+'"'+')');
    undoButton.className = "undoSubmit";

    var submitButton = document.createElement("button");
    submitButton.innerHTML = "Submit";
    submitButton.setAttribute('onclick','submitText('+String(i)+','+'"'+String(articleID)+'"'+')');
    submitButton.className = "undoSubmit";

    var txtDiv = document.createElement("div")
    txtDiv.id = "addContribution";
    txtDiv.appendChild(txtBox);
    txtDiv.appendChild(undoButton);
    txtDiv.appendChild(submitButton);
    buttonSpace.appendChild(txtDiv);
}

function addButton(i,articleID) {

    var contributeButton = document.createElement("button");
    contributeButton.innerHTML = "Write your own!";
    contributeButton.setAttribute('onclick','addTextBox('+String(i)+','+'"'+String(articleID)+'"'+')');
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

function submitText(i,articleID) {

    var votes = 0
    firebase.database().ref('users/' + user.uid).once('value').then(function(snapshot) {
      user_value = snapshot.val();
        if (user_value.votes >= 5 || user_value.free_contributions == 1) {
            var textInput = document.getElementById("txtbox" + String(i)).value;

            var now = new Date().getTime();

            var contributionID = writeNewContribution(textInput,0,0,false,user.displayName,user.uid,now,articleID);

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


function addCountdown(subinfo, timestamp, justname) {

    var dateTimestamp = new Date(timestamp);
    var countDownDate = dateTimestamp.addHours(3).getTime();
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

      var name = document.createTextNode("Submitted by: " + justname);
      var b = document.createElement("br");
      var timeleft = document.createTextNode("Time left: " + hours + "h " + minutes + "m ");

      while (subtext.firstChild) {
          subtext.removeChild(subtext.firstChild);
      }

      subtext.appendChild(name);
      subtext.appendChild(b);
      subtext.appendChild(timeleft);

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

    upcounter.innerHTML = "Upvote";
    downcounter.innerHTML = "Downvote";

    upcounter.setAttribute('onclick','onClick(' + '"upvotes",' + '"' + String(contributionID) + '"' + ',' + '"' + String(articleID) + '"' +')');
    downcounter.setAttribute('onclick','onClick(' + '"downvotes",' + '"' + String(contributionID) + '"' + ',' + '"' + String(articleID) + '"'+')');


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

function onClick(direction, contributionID, articleID) {

    firebase.database().ref('users/' + user.uid + '/credits').once('value').then(function(snapshot) {
        var currentCredits = snapshot.val();
        console.log(currentCredits);
        if (currentCredits){
          var newCredits = currentCredits - 1;

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
              updates['users/' + user.uid + '/credits'] = newCredits;

              firebase.database().ref().update(updates);

          });

        }
        else {
          console.log("Add credits to vote on contributions");
      }
    });

    var ref = firebase.database().ref('posts/' + String(articleID) + '/contributions/' + contributionID + '/' + direction);
    ref.transaction(function(currentClicks) {
    // If node/clicks has never been set, currentRank will be `null`.
      var newValue = (currentClicks || 0) + 1;

      if (newValue >= 10) {
        if (direction == 'upvotes') {
            integrateText(contributionID, articleID);
        }
        else if (direction == 'downvotes') {
            removeText(contributionID, articleID);
        }
      }
      return newValue;
    });

    if (direction == 'upvotes') {
      var userUid = '';
      firebase.database().ref('posts/' + String(articleID) + '/contributions/' + contributionID + '/' + 'uid').once('value').then(function(snapshot) {
        userUid = snapshot.val();
      });

      waitforUid();

      function waitforUid() {
        if (userUid !== ''){
          firebase.database().ref('users/' + String(userUid) + '/credits').transaction(function(currentCredits) {
            console.log(userUid);
            var newCredits = (currentCredits || 0) + 1;
            return newCredits;
          });
        }
        else {
          setTimeout(waitforUid, 250);
        }

      }
    }
  }

function integrateText(contributionID, articleID) {

    firebase.database().ref('posts/' + String(articleID) + '/paragraph_count').once('value').then(function(snapshot) {
      var currentParagraphs = snapshot.val();
      var newParagraphCount = currentParagraphs + 1;

      var updates = {};
      updates['posts/' + String(articleID) + '/contributions/' + contributionID + '/accepted'] = true;
      updates['posts/' + String(articleID) + '/contributions/' + contributionID + '/paragraph_number'] = newParagraphCount;
      updates['posts/' + String(articleID) + '/paragraph_count'] = newParagraphCount;
      firebase.database().ref().update(updates);

      loadText(articleID);


    });
}

function removeText(contributionID, articleID) {
    //this should be updated at some point so that the content is logged.
    var ref = firebase.database().ref('posts/' + String(articleID) + '/contributions/' + contributionID);
    ref.remove();
    loadText(articleID);
}


function writeNewContribution(body, upvotes, downvotes, accepted, author, uid, timestamp, articleID) {
  // A post entry.
  var contributionData = {
    body: body,
    upvotes: upvotes,
    downvotes: downvotes,
    accepted: accepted,
    author: author,
    uid: uid,
    timestamp: timestamp
  };

  // Get a key for a new Post.
  var newContributionKey = firebase.database().ref().child('posts/' + String(articleID) + '/contributions').push().key;

  // Write the new post's data simultaneously in the posts list and the user's post list.
  var updates = {};
  updates['posts/' + String(articleID) + '/contributions/' + newContributionKey] = contributionData;

  var datRef = firebase.database().ref();
  datRef.update(updates);

  return newContributionKey;

}


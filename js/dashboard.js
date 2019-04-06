// Initialize Firebase
var config = {
  apiKey: "AIzaSyDRJ05Ywn_xRDgl3BNQW6rIvOWTLQ5aPWw",
  authDomain: "trainitlogit-eb4c7.firebaseapp.com",
  databaseURL: "https://trainitlogit-eb4c7.firebaseio.com",
  projectId: "trainitlogit-eb4c7",
  storageBucket: "trainitlogit-eb4c7.appspot.com",
  messagingSenderId: "50843096148"
};
firebase.initializeApp(config);
///////////////////////////////
// DATABASE BRANCHES
///////////////////////////////
// SETUP DATABASE
let database = firebase.database();
// DATABASE BRANCHES
// Users branch
let usersRef = database.ref('users');
// Users workouts branch
let userWorkouts;
// User's friends branch
let userFriendsRef = database.ref('userFriends');


/////////////////////////////
// ELEMENTS AND VARIABLES
/////////////////////////////
// GET ELEMENTS FROM THE PAGE
const navigation = document.querySelector('.nav');
const userEmail = document.getElementById('user_email');
const userPass = document.getElementById('user_pass');
const logoutBtn = document.getElementById('logoutBtn');
const noWorkouts = document.querySelector('.no-workouts');
const noFriends = document.querySelector('.no-friends');
const noFriendsMatching = document.querySelector('.no-friends-matching');
const totalWorkouts = document.querySelector('.total-workouts');
const runningTotalSpan = document.querySelector('.running-total');
const walkingTotalSpan = document.querySelector('.walking-total');
const bikingTotalSpan = document.querySelector('.biking-total');
const liftingTotalSpan = document.querySelector('.lifting-total');
const searchWorkouts = document.querySelector('.search-workouts');
const searchFriends = document.querySelector('.search-friends');
const workoutsTableList = document.querySelector('.workouts-table__list');
const friendsTableList = document.querySelector('.friends-table__list');
const workout = document.getElementById('workout');
const duration = document.getElementById('duration');
const addWorkoutBtn = document.getElementById('addWorkoutBtn');
const addWorkoutMsg = document.getElementById('add-workout-message');
const removeWorkoutBtns = document.getElementsByClassName('remove-workout-btn');

// GLOBAL VARIABLES
let formattedUserName;
let usersName;
let usersFriends = [];
let runningTotal = 0;
let walkingTotal = 0;
let bikingTotal = 0;
let liftingTotal = 0;


///////////////////////////
// Add Logout Event
////////////////////////////
logoutBtn.addEventListener('click', e => {
  firebase.auth().signOut();
});


/////////////////////////////////////////////////////
// LISTENER FOR WHEN A USER IS LOGGED IN
/////////////////////////////////////////////////////
firebase.auth().onAuthStateChanged(firebaseUser => {

  // What happens if a user is logged in
  if(firebaseUser) {

    // Show Dashboard and Navigation on login
    navigation.style.display = 'flex';

    // FORMAT USER'S USERNAME
    // Creates user's username from the beginning of their email
    let userEmailName = firebaseUser.email.split('@')[0];
    let period = '.';
    // Checks to see if there is a period in a user's username
    // If there is, splits the string and then joins them without the period
    if (userEmailName.indexOf(period) > -1) {
      formattedUserName = userEmailName.split(".");
      formattedUserName = formattedUserName[0] + formattedUserName[1];
    // If there is not period in a user's username
    // Creates the user's username from the beginning of their email
    } else {
      formattedUserName = firebaseUser.email.split('@')[0];
    }
    // Stores username into object
    const userInfo = {
      userName: formattedUserName
    }
    usersName = userInfo.userName;

    // Creates a seperate branch for the user's workouts
    userWorkouts = database.ref(`usersWorkouts/${userInfo.userName}/workouts`);
    

    // Check to see if the user is in the database before adding
    usersRef.once('value', function(snapshot) {
      let usersObj = snapshot.val();
      // Checks to see if there are any users in the database
      // If the database is empty it adds the user
      if (usersObj == null) {
        usersRef.push(userInfo);
      } else {
        let foundUserName = 0;
        // If the database is not empty, retrieve the keys for each user
        let userKeys = Object.keys(usersObj);
        // Iterates through each user to determine if a user is in the database
        // If not, it pushes the user into the database
        for (let i = 0; i < userKeys.length; i++) {
          let user = userKeys[i];
          let userName = usersObj[user].userName;
          // Checks to see if the usernames match
          // If they do, add 1 into the foundUserName variables
          if (userName == userInfo.userName) {
            foundUserName++;
          }
        }
        // Checks to see if the name was found at all in the database
        // If not, pushes it into the usersRef branch
        if (foundUserName == 0) {
          usersRef.push(userInfo);
        }
      }
    });


    // RETRIEVE USER'S WORKOUT DATA
    userWorkouts.on('value', gotData, errData);
    // RETRIEVE USER'S FRIENDS
    userFriendsRef.on('value', fetchFriends, errData);
    // Add a new workout
    addWorkoutBtn.addEventListener('click', addWorkout);
    

    // WHEN A USER LOGS OUT 
  } else {
    window.location.href = "index.html";
  }

});



//////////////////////////////////////////////////////////
// FUNCTIONS
//////////////////////////////////////////////////////////

////////////////////////////////////////////
// RETRIEVE WORKOUT DATA FOR DASHBOARD
////////////////////////////////////////////
function gotData(data) {

  // Empties the list when the db is updated so there aren't duplicate entries
  let workoutListings = document.querySelectorAll('div.workout-list-item');
  for (let i = 0; i < workoutListings.length; i++) {
    workoutListings[i].remove();
  }

  // Checks to see if the users workouts db is empty
  // If not, updates information in the header
  if (data.val() != null) {
    let usersWorkoutsObj = data.val();
    let usersWorkoutsObjKeys = Object.keys(usersWorkoutsObj);

    // Updated the total # of workouts completed
    totalWorkouts.innerHTML = usersWorkoutsObjKeys.length;

    // Resets the individual workouts totals
    // Removes totals from workouts that were removed and readds the ones still in the db
    runningTotal = 0;
    walkingTotal = 0;
    bikingTotal = 0;
    liftingTotal = 0;
    runningTotalSpan.innerHTML = runningTotal;
    walkingTotalSpan.innerHTML = walkingTotal;
    bikingTotalSpan.innerHTML = bikingTotal;
    liftingTotalSpan.innerHTML = liftingTotal;

    // Loops through all of the users workouts and durations
    // Determines workouts completed and calculates totals
    for (let i = 0; i < usersWorkoutsObjKeys.length; i++) {
      let workoutKey = usersWorkoutsObjKeys[i];
      userWorkoutCompleted = usersWorkoutsObj[workoutKey].workout;
      let userWorkoutDuration = usersWorkoutsObj[workoutKey].duration;

      switch (userWorkoutCompleted) {
        case 'Running':
          runningTotal += parseInt(userWorkoutDuration);
          // Updates dashboard
          runningTotalSpan.innerHTML = runningTotal;
          // Create object with users running total
          let runningMetrics = {
            total: runningTotal
          };
          // Creates a branch in the database for the user's total running activity
          // Sets the info to override what is already in the databaase
          let userRunningTotals = database.ref(`userWorkoutTotals/${usersName}/running`);
          userRunningTotals.update(runningMetrics);
          break;
        case 'Walking':
          walkingTotal += parseInt(userWorkoutDuration);
          // Updates dashboard
          walkingTotalSpan.innerHTML = walkingTotal;
          // Create object with users walking total
          let walkingMetrics = {
            total: walkingTotal
          };
          // Creates a branch in the database for the user's total walking activity
          // Sets the info to override what is already in the databaase
          let userWalkingTotals = database.ref(`userWorkoutTotals/${usersName}/walking`);
          userWalkingTotals.update(walkingMetrics);
          break;
        case 'Biking':
          bikingTotal += parseInt(userWorkoutDuration);
          // Updates dashboard
          bikingTotalSpan.innerHTML = bikingTotal;
          // Create object with users biking total
          let bikingMetrics = {
            total: bikingTotal
          };
          // Creates a branch in the database for the user's total biking activity
          // Sets the info to override what is already in the databaase
          let userBikingingTotals = database.ref(`userWorkoutTotals/${usersName}/biking`);
          userBikingingTotals.update(bikingMetrics);
          break;
        case 'Lifting':
          liftingTotal += parseInt(userWorkoutDuration);
          // Updates dashboard
          liftingTotalSpan.innerHTML = liftingTotal;
          // Create object with users lifting total
          let liftingMetrics = {
            total: liftingTotal
          };
          // Creates a branch in the database for the user's total lifting activity
          // Sets the info to override what is already in the databaase
          let userLiftingTotals = database.ref(`userWorkoutTotals/${usersName}/lifting`);
          userLiftingTotals.update(liftingMetrics);
          break;
      }
    }
  } else {
    totalWorkouts.innerHTML = '0';
    runningTotalSpan.innerHTML = '0';
    walkingTotalSpan.innerHTML = '0';
    bikingTotalSpan.innerHTML = '0';
    liftingTotalSpan.innerHTML = '0';
  }

  // Checks to see if the user has any workouts
  // If not, displays message that there are no workouts
  if (data.val() == null) {
    noWorkouts.style.display = 'block';
  } else {
    // If there are workouts, removes the no workouts message
    noWorkouts.style.display = 'none';
    // Loops through workouts in the database and creates a div for each one
    let workouts = data.val();
    let keys = Object.keys(workouts);
    for (let i = 0; i < keys.length; i++) {
      let k = keys[i];
      let workoutCompleted = workouts[k].workout;
      let workoutDuration;

      // Checks to see what workout is completed to add either miles or minutes
      switch (workoutCompleted) {
        case 'Running':
        case 'Walking':
        case 'Biking':
          workoutDuration = workouts[k].duration + ' miles';
          break;
        case 'Lifting':
          workoutDuration = workouts[k].duration + ' minutes';
          break;
      }
      
      
      // Creates a div element for each workout completed
      let workoutListItem = document.createElement('div');
      workoutListItem.className = 'workout-list-item';

      let workoutListInfo = document.createElement('div');
      workoutListInfo.className = 'workout-list-info';

      let workoutCompletedP = document.createElement('p');
      workoutCompletedP.className = 'workout-completed';
      workoutCompletedP.innerHTML = workoutCompleted;

      let workoutDurationP = document.createElement('p');
      workoutDurationP.innerHTML = workoutDuration;

      let removeWorkoutX = document.createElement('p');
      removeWorkoutX.className = 'remove-workout-btn';
      // Sets remove button to the workouts key value for deleting
      removeWorkoutX.setAttribute('id', `${k}`);
      removeWorkoutX.innerHTML = '❌';
      removeWorkoutX.addEventListener('click', removeWorkout);

      workoutListInfo.appendChild(workoutCompletedP);
      workoutListInfo.appendChild(workoutDurationP);
      workoutListItem.appendChild(workoutListInfo);
      workoutListItem.appendChild(removeWorkoutX);
      workoutsTableList.appendChild(workoutListItem);
    }
  }
}


/////////////////////////////////
// RETRIEVE FRIEND DATA
/////////////////////////////////
function fetchFriends(data) {
  // Empties the list when the db is updated so there aren't duplicate entries
  let friendListings = document.querySelectorAll('div.friend-list-item');
  for (let i = 0; i < friendListings.length; i++) {
    friendListings[i].remove();
  }
  
  let usersFriendsObj = data.val();
  // Checks to see if there are any friends in the database
  // If it's empty, show that there are no friends added
  if (usersFriendsObj == null) {
    noFriends.style.display = 'block';
    // What happens if there are users in the friends database
  } else {
    let usersFriendsKeys = Object.keys(usersFriendsObj);
    for (let i = 0; i < usersFriendsKeys.length; i++) {
      // What happens if the user has friends
      if (usersFriendsKeys[i] == usersName) {
        // Hide the no friends added text
        noFriends.style.display = 'none';

        // Gets the object for the current users friends
        let currentUserFriendsObj = usersFriendsObj[usersFriendsKeys[i]];
        let currentUserFriendsObjKeys = Object.keys(currentUserFriendsObj);
        // Loops through object to get each friends username
        for (let i = 0; i < currentUserFriendsObjKeys.length; i++) {
          let usersFriend = currentUserFriendsObj[currentUserFriendsObjKeys[i]].user;

          // Checks to see if the friend is in the usersFriends array
          // If not, adds it
          if (usersFriends.indexOf(usersFriend) == -1) {
            usersFriends.push(usersFriend);
          }

          // Create each friend list item
          let friendListItem = document.createElement('div');
          friendListItem.className = 'friend-list-item';

          let friendListName = document.createElement('p');
          friendListName.className = 'friend-list-name';
          friendListName.innerHTML = usersFriend;

          let removeFriendX = document.createElement('p');
          removeFriendX.className = 'remove-friend-btn';
          removeFriendX.setAttribute('id', currentUserFriendsObjKeys[i]);
          removeFriendX.innerHTML = '❌';
          removeFriendX.addEventListener('click', removeFriend);

          friendListItem.appendChild(friendListName);
          friendListItem.appendChild(removeFriendX);
          friendsTableList.appendChild(friendListItem);
        }
        // What happens if the friends database exists, but the user doesn't have any friends
      }
    }
  }
}


////////////////////////////////////////////////////////////////////
// WHAT HAPPENS IF THE USER GETS AN ERROR WHILE LOADING THE DATA
////////////////////////////////////////////////////////////////////
function errData(err) {
  alert('Error fetching data', err);
}


////////////////////////
// REMOVE A WORKOUT
////////////////////////
function removeWorkout (e) {
  // Accesses the id value of the remove button to use as a ref for the key in the db
  let workoutRefDB = database.ref(`usersWorkouts/${usersName}/workouts/${e.target.id}`);

  // Gets the workout category the user deleted
  workoutRefDB.remove();
  // Checks to see if the workout totals have a value equal to 0
  // If they do, remove that branch
  if (runningTotal == 0) {
    database.ref(`userWorkoutTotals/${usersName}/running`).remove();
  }
  if (walkingTotal == 0) {
    database.ref(`userWorkoutTotals/${usersName}/walking`).remove();
  }
  if (bikingTotal == 0) {
    database.ref(`userWorkoutTotals/${usersName}/biking`).remove();
  }
  if (liftingTotal == 0) {
    database.ref(`userWorkoutTotals/${usersName}/lifting`).remove();
  }
}


////////////////////////
// REMOVE A FRIEND
////////////////////////
function removeFriend(e) {
  let friendRef = database.ref(`userFriends/${usersName}/${e.target.id}`);
  friendRef.remove();
  usersFriends.splice(usersFriends.indexOf(e.target.parentNode.children[0].innerHTML), 1);

  // If the usersFriends array becomes empty, show the no friends added message
  if (usersFriends.length == 0) {
    noFriends.style.display = 'block';
  }
}


/////////////////////
// ADD A WORKOUT
/////////////////////
function addWorkout() {
  let workoutData = {
    workout: workout.options[workout.selectedIndex].value,
    duration: duration.value
  }
  // Push workout data into database
  userWorkouts.push(workoutData);
  // Clear input fields
  workout.value = '';
  duration.style.display = 'none';
  duration.value = '';
  // Pop up message that workout was added successfully
  addWorkoutMsg.innerHTML = 'Workout Added Successfully!';
  setTimeout(() => {
    addWorkoutMsg.innerHTML = '';
  }, 2000);
}


/////////////////////
// SEARCH BAR
/////////////////////
searchWorkouts.addEventListener('keyup', filterWorkouts);
let workoutListItems = document.getElementsByClassName('workout-list-info');
let noResults = document.querySelector('.no-match');

function filterWorkouts() {
  let search = searchWorkouts.value.toLowerCase();
  // Checks to see how many workouts are found in the search
  let foundWorkouts = 0;
  // Check for the workout in the div
  for (let i = 0; i < workoutListItems.length; i++) {
    let workoutVal = workoutListItems[i].children[0].innerHTML.toLowerCase();
    if (workoutVal.indexOf(search) > -1) {
      foundWorkouts++;
      workoutListItems[i].parentNode.style.display = '';
      noResults.style.display = 'none';
    } else {
      workoutListItems[i].parentNode.style.display = 'none';
      // If there are no workouts in the array, shows message showing there are no results
      if (foundWorkouts == 0) {
        noResults.style.display = 'block';
        // If at least 1 wokrout in the array, hides the no results message
      } else {
        noResults.style.display = 'none';
      }
    }
  }
}

searchFriends.addEventListener('keyup', filterFriends);
let friendListItems = document.getElementsByClassName('friend-list-item');

function filterFriends() {
  let search = searchFriends.value.toLowerCase();
  // Checks to see how many friends are found in the search
  let foundFriends = 0;
  // Check for the name in the div
  for (let i = 0; i < friendListItems.length; i++) {
    let friendName = friendListItems[i].children[0].innerHTML;
    if (friendName.indexOf(search) > -1) {
      foundFriends = foundFriends + 1;
      friendListItems[i].style.display = '';
    } else {
      friendListItems[i].style.display = 'none'
    }
  }
  if (foundFriends == 0) {
    noFriendsMatching.style.display = 'block';
  } else {
    noFriendsMatching.style.display = 'none';
  }
}


// Check to see what workout is picked
// Based on pick either enter in time or distance completed
function selectWorkout(e) {
  const selectedWorkout = e.target.value;
  
  switch (selectedWorkout) {
    case 'Running':
    case 'Walking':
    case 'Biking':
      duration.style.display = 'block';
      duration.placeholder = 'Distance (in miles)';
      break;
    case 'Lifting':
      duration.style.display = 'block';
      duration.placeholder = 'Length (in minutes)';
      break;
  }
}
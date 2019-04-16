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
// SETUP DATABASE
let database = firebase.database();
// DATABASE BRANCHES
// Users branch
let usersRef = database.ref('users');
// Users Workouts totals branch
let userWorkoutTotalsRef = database.ref('userWorkoutTotals');
// Users friends branch
let userFriendsRef = database.ref('userFriends');

/////////////////////////////////
// SELECT ELEMENTS FROM PAGE
/////////////////////////////////
const navigation = document.querySelector('.nav');
const searchBox = document.querySelector('.search-users');

/////////////////////////////////
// GLOBAL VARIABLES
/////////////////////////////////
let currentUser;
let usersInDatabase = [];
let usersWithWorkouts = [];
let userTotals = [];
let currentUsersFriends = [];
const allUsersBtn = document.querySelector('.all-users-btn');
const friendsBtn = document.querySelector('.friends-btn');


////////////////////////
// Add Logout Event
////////////////////////
const logoutBtn = document.getElementById('logoutBtn');
logoutBtn.addEventListener('click', e => {
  firebase.auth().signOut();
});

////////////////////////////
// ON STATE CHANGE
///////////////////////////
firebase.auth().onAuthStateChanged((user) => {
  if (user) {

    // Show Navigation on login
    navigation.style.display = 'flex';

    // Creates user's username from the beginning of their email
    let userEmailName = user.email.split('@')[0];
    let period = '.';
    // Checks to see if there is a period in a user's username
    // If there is, splits the string and then joins them without the period
    if (userEmailName.indexOf(period) > -1) {
      currentUser = userEmailName.split(".");
      currentUser = formattedUserName[0] + formattedUserName[1];
    // If there is not period in a user's username
    // Creates the user's username from the beginning of their email
    } else {
      currentUser = user.email.split('@')[0];
    }

    // Get all the users in the database
    // Regardless of if they have logged a workout
    usersRef.on('value', fetchUsers);
    // Get users that have logged a workout
    userWorkoutTotalsRef.on('value', fetchUserTotals);

  } else {
    window.location.href = "index.html";
  }
});




////////////////////////////////////
// FUNCTIONS AND EVENT LISTENERS
////////////////////////////////////

// EVENT LISTENER FOR SEARCH BAR
searchBox.addEventListener('input', (e) => {
  // GETS THE SEARCH VALUE AND ALL OF THE DIVS WITH THE USER BOX CLASS
  let searchValue = e.target.value.toLowerCase();
  let usersArray = [].slice.call(document.querySelectorAll('.user-box'));
  for (let i = 0; i <usersArray.length; i++) {
    // Traverses the divs to select only the users name
    let usersName = usersArray[i].childNodes[1].innerHTML;
    // Checks to see if the users name matches the search input
    if (usersName.toLowerCase().indexOf(searchValue) > -1) {
      usersArray[i].style.display = '';
    } else {
      usersArray[i].style.display = 'none';
    }
  }
});

// EVENT LISTENER FOR ALL USERS BUTTON
allUsersBtn.addEventListener('click', (e) => {
  let usersArray = document.querySelectorAll('.user-box');
  if (!allUsersBtn.classList.contains('active-users')) {
    allUsersBtn.classList.add('active-users');
    friendsBtn.classList.remove('active-users');
    if (usersArray.length == 0) {
      generateUserHTML();
    } else {
      usersArray.forEach(el => {
        el.parentNode.removeChild(el);
        el.removeChild(el.childNodes[3]);
      });
      generateUserHTML();
      highlightCurrentUser();
    }
  }
});

// EVENT LISTENER FOR FRIENDS BUTTON
friendsBtn.addEventListener('click', () => {
  let usersArray = document.querySelectorAll('.user-box');
  if (!friendsBtn.classList.contains('active-users')) {
    friendsBtn.classList.add('active-users');
    allUsersBtn.classList.remove('active-users');
    if (friendsBtn.classList.contains('active-users')) {
      if (usersArray.length == 0) {
        generateFriendsHTML();
      } else {
        usersArray.forEach(el => {
          el.parentNode.removeChild(el);
        });
        generateFriendsHTML();
        highlightCurrentUser();
      }
    }
  }
});


// FUNCTION TO FETCH ALL THE USERS IN THE DATABASE
function fetchUsers(data) {
  let usersObj = data.val();
  let userKeys = Object.keys(usersObj);

  for (let i = 0; i < userKeys.length; i++) {
    let user = userKeys[i];
    let userName = usersObj[user].userName;
    // Pushes each username into the usersInDatabase Array
    usersInDatabase.push(userName);
  }
}

// FUNCTION TO FETCH EACH USERS TOTALS
function fetchUserTotals() {
  database.ref('userWorkoutTotals').on('value', snapshot => {
    snapshot.forEach(child => {
      usersWithWorkouts.push(child.key);
      let userTotalData = {
        user: child.key
      }
      // Checks to see if there is a value for each before adding
      if (child.val().running != undefined) {
        userTotalData.running = child.val().running.total;
      }
      if (child.val().walking != undefined) {
        userTotalData.walking = child.val().walking.total;
      }
      if (child.val().biking != undefined) {
        userTotalData.biking = child.val().biking.total;
      }
      if (child.val().lifting != undefined) {
        userTotalData.lifting = child.val().lifting.total;
      }
      userTotals.push(userTotalData);
    });
  });

  // Generates the initial users list with all of the users in the database
  generateUserHTML();
  highlightCurrentUser();
}

// FUNCTION TO GENERATE THE HTML FOR EACH USER BOX
function generateUserHTML() {
  for (let i = 0; i < usersInDatabase.length; i++) {
    let userBox = document.createElement('div');
    let userWorkoutsList = document.createElement('div');
    userBox.className = 'user-box';
    userWorkoutsList.className = 'user-workouts';
    userBox.id = `${i}`;

    // Check to see if the user has completed any workouts
    // Shows "no workouts logged" in place of totals
    if (usersWithWorkouts.indexOf(usersInDatabase[i]) == -1) {
      userBox.innerHTML += 
      `
        <p class="user-name">${usersInDatabase[i]}</p>
        <div class="add-friend"></div>
        <p class="no-workouts-logged">No workouts logged</p>
      `;
      document.querySelector('.inner-wrapper').appendChild(userBox);
    } else {
      userBox.innerHTML +=
      `
        <p class="user-name">${userTotals[i].user}</p>
        <div class="add-friend"></div>
        
      `;
      // Checks to see if the user has completed any running workouts
      // If not, sets the running total to 0
      if (userTotals[i].running != undefined) {
        userWorkoutsList.innerHTML += 
        `
          <div class="user-workout">
            <p class="workout-emoji">🏃</p>
            <p class="user-workout-total"> ${userTotals[i].running} miles</p>
          </div>
        `;
      } else {
        userWorkoutsList.innerHTML +=
        `
          <div class="user-workout">
            <p class="workout-emoji">🏃</p>
            <p class="user-workout-total">0 miles</p>
          </div>
        `
      }
      // Checks to see if the user has completed any walking workouts
      // If not, sets the walking total to 0
      if (userTotals[i].walking != undefined) {
        userWorkoutsList.innerHTML += 
        `
          <div class="user-workout">
            <p class="workout-emoji">🚶‍</p>
            <p class="user-workout-total">${userTotals[i].walking} miles</p>
          </div>
        `;
      } else {
        userWorkoutsList.innerHTML +=
        `
          <div class="user-workout">
            <p class="workout-emoji">🚶‍</p>
            <p class="user-workout-total">0 miles</p>
          </div>
        `
      }
      // Checks to see if the user has completed any biking workouts
      // If not, sets the biking total to 0
      if (userTotals[i].biking != undefined) {
        userWorkoutsList.innerHTML += 
        `
          <div class="user-workout">
            <p class="workout-emoji">🚴‍</p>
            <p class="user-workout-total">‍‍‍‍${userTotals[i].biking} miles</p>
          </div>
        `;
      } else {
        userWorkoutsList.innerHTML +=
        `
          <div class="user-workout">
            <p class="workout-emoji">🚴‍</p>
            <p class="user-workout-total">‍‍‍‍0 miles</p>
          </div>
        `
      }
      // Checks to see if the user has completed any lifting workouts
      // If not, sets the lifting total to 0
      if (userTotals[i].lifting != undefined) {
        userWorkoutsList.innerHTML += 
        `
          <div class="user-workout">
            <p class="workout-emoji">🏋️‍</p>
            <p class="user-workout-total">${userTotals[i].lifting} minutes</p>
          </div>
        `;
      } else {
        userWorkoutsList.innerHTML +=
        `
          <div class="user-workout">
            <p class="workout-emoji">🏋️‍</p>
            <p class="user-workout-total">0 minutes</p>
          </div>
        `;
      }

    }
    userBox.appendChild(userWorkoutsList);
    document.querySelector('.inner-wrapper').appendChild(userBox);
    generateFriendButtons();
    
  }
}

// FUNCTION TO GENERATE THE HTML FOR EACH FRIEND BOX
function generateFriendsHTML() {
  for (let i = 0; i < usersInDatabase.length; i++) {
    
    let userBox = document.createElement('div');
    let userWorkoutsList = document.createElement('div');
    userBox.className = 'user-box';
    userWorkoutsList.className = 'user-workouts';
    userBox.id = `${i}`;
    // What happens if the user's friend doesn't have any workouts logged
    if (userTotals[i] == undefined) {
      if (usersWithWorkouts.indexOf(usersInDatabase[i]) == -1 && currentUsersFriends.indexOf(usersInDatabase[i]) > -1) {
        userBox.innerHTML += 
        `
        <p class="user-name">${usersInDatabase[i]}</p>
        <p class="no-workouts-logged">No workouts logged</p>
        `;
      }
      
      // Checks to see if the users in the usersTotals array are in the current users friends array
    } else if (currentUsersFriends.indexOf(userTotals[i].user) > -1 || userTotals[i].user == currentUser) {
        userBox.innerHTML +=
        `
          <p class="user-name">${userTotals[i].user}</p>
          <div class="add-friend"></div>
          
        `;
        // Checks to see if the user has completed any running workouts
        // If not, sets the running total to 0
        if (userTotals[i].running != undefined) {
          userWorkoutsList.innerHTML += 
          `
            <div class="user-workout">
              <p class="workout-emoji">🏃</p>
              <p class="user-workout-total"> ${userTotals[i].running} miles</p>
            </div>
          `;
        } else {
          userWorkoutsList.innerHTML +=
          `
            <div class="user-workout">
              <p class="workout-emoji">🏃</p>
              <p class="user-workout-total">0 miles</p>
            </div>
          `
        }
        // Checks to see if the user has completed any walking workouts
        // If not, sets the walking total to 0
        if (userTotals[i].walking != undefined) {
          userWorkoutsList.innerHTML += 
          `
            <div class="user-workout">
              <p class="workout-emoji">🚶‍</p>
              <p class="user-workout-total">${userTotals[i].walking} miles</p>
            </div>
          `;
        } else {
          userWorkoutsList.innerHTML +=
          `
            <div class="user-workout">
              <p class="workout-emoji">🚶‍</p>
              <p class="user-workout-total">0 miles</p>
            </div>
          `
        }
        // Checks to see if the user has completed any biking workouts
        // If not, sets the biking total to 0
        if (userTotals[i].biking != undefined) {
          userWorkoutsList.innerHTML += 
          `
            <div class="user-workout">
              <p class="workout-emoji">🚴‍</p>
              <p class="user-workout-total">‍‍‍‍${userTotals[i].biking} miles</p>
            </div>
          `;
        } else {
          userWorkoutsList.innerHTML +=
          `
            <div class="user-workout">
              <p class="workout-emoji">🚴‍</p>
              <p class="user-workout-total">‍‍‍‍0 miles</p>
            </div>
          `
        }
        // Checks to see if the user has completed any lifting workouts
        // If not, sets the lifting total to 0
        if (userTotals[i].lifting != undefined) {
          userWorkoutsList.innerHTML += 
          `
            <div class="user-workout">
              <p class="workout-emoji">🏋️‍</p>
              <p class="user-workout-total">${userTotals[i].lifting} minutes</p>
            </div>
          `;
        } else {
          userWorkoutsList.innerHTML +=
          `
            <div class="user-workout">
              <p class="workout-emoji">🏋️‍</p>
              <p class="user-workout-total">0 minutes</p>
            </div>
          `;
        }
      }
    userBox.appendChild(userWorkoutsList);
    document.querySelector('.inner-wrapper').appendChild(userBox);
    // Selects all user boxes
    let userBoxes = document.querySelectorAll('.user-box');
    // If a user box is empty, remove that box
    userBoxes.forEach(el => {
      if (el.childNodes[0].innerHTML == '') {
        el.parentNode.removeChild(el);
      }
    }); 
  }
}

// Function to generate add friend buttons
// If the users are alreaady friends, don't show the button
function generateFriendButtons() {

  // Variable to hold whether or not the userFriends branch in the database is null
  userFriendsRef.on('value', (snapshot) => {

    // // Calls the function to add an event listener to add friend button
    // addFriendEventListener();

    if (snapshot.val() == null) {
     
      // If there is no friends branch in database, add an add friend button to each user box
      let usersArray = [].slice.call(document.querySelectorAll('.user-box'));
      // Generate add friend button
      let addFriendBtnEl = document.createElement('button');
      addFriendBtnEl.className = 'add-friend-btn';
      addFriendBtnEl.innerHTML = 'Add Friend';
      // Add the button to each user box
      for (let i = 0; i < usersArray.length; i++) {
        let usernamesInDB = usersArray[i].childNodes[1].innerHTML;
        // Adds the add friend button to all users, except the current user
        if (currentUser != usernamesInDB && usersArray[i].childNodes[3].innerHTML == '') {
          usersArray[i].childNodes[3].appendChild(addFriendBtnEl);
        }
      }
      // Calls the function to add an event listener to add friend button
      addFriendEventListener();
      // WHAT HAPPENS IF THERE IS A USERFRIENDS BRANCH IN THE DATABASE
    } else {

      // Get the current users in the database with friends
      let data = snapshot.val();
      let users = Object.keys(data);
      for (let i = 0; i < users.length; i++) {
        // Gets the user's username with friends
        let user = users[i];
        // Gets the object with the current user's friends
        let friendsObj = data[user];
        // Array of the keys for the friends object
        let friendsObjKeys = Object.keys(friendsObj);
        // Check to see if the current user is equal to the user with friends
        if (currentUser == user) {
          for (let i = 0; i < friendsObjKeys.length; i++) {
            let key = friendsObjKeys[i];
            // Stores the users friends name
            let usersFriendUserName = friendsObj[key].user;
            // Check to see if the friend's username is already in the array before pushing it
            if (currentUsersFriends.indexOf(usersFriendUserName) == -1) {
              currentUsersFriends.push(usersFriendUserName);
            }
          }
        }
        
      }
      // Create a friend button for all the user's that aren't the current user's friends
      // An array to hold all of the current users
      let usersArray = [].slice.call(document.querySelectorAll('.user-box'));
      // Generate add friend button
      let addFriendBtnEl = document.createElement('button');
      addFriendBtnEl.className = 'add-friend-btn';
      addFriendBtnEl.innerHTML = 'Add Friend';
      for (let i = 0; i < usersArray.length; i++) {
        let usernamesInDB = usersArray[i].childNodes[1].innerHTML;
        // Adds the add friend button to all users, except the current user and their friends
        if (currentUser != usernamesInDB && currentUsersFriends.indexOf(usersArray[i].childNodes[1].innerHTML) <= -1 && usersArray[i].childNodes[3].innerHTML == '') {
          usersArray[i].childNodes[3].appendChild(addFriendBtnEl);
          // Calls the function to add an event listener to add friend button
          addFriendEventListener();
        }
      }

      
    }
  });
  
}

// FUNCTION TO HIGHLIGHT THE CURRENT USER BOX
function highlightCurrentUser() {
  let usersArray = document.querySelectorAll('.user-box');
  usersArray.forEach(el => {
    if (el.childNodes[1].innerHTML == currentUser) {
      el.classList.add('current-user');
    };
  });
}

//////////////////////////////////////////////
// EVENT LISTENER FOR ADD FRIEND BUTTON
//////////////////////////////////////////////
function addFriendEventListener() {
  const addFriendBtns = Array.prototype.slice.call(document.querySelectorAll('.add-friend-btn'));
  // Event listener for when an add friend button is clicked
  addFriendBtns.forEach((el) => {
    el.addEventListener('click', (e) => {
      e.target.parentNode.style.display = 'none';
      // Gets the username the user wants to add to their friend list
      let userToAdd = {user: e.target.parentNode.parentNode.childNodes[1].innerHTML};
      let usersFriendsRef = database.ref(`userFriends/${currentUser}`);
      // Adds the friend to the database
      if (currentUsersFriends.indexOf(userToAdd.user) == -1) {
        usersFriendsRef.push(userToAdd);
      }
    });
  });
}







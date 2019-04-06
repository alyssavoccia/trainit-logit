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

/////////////////////////////////
// SELECT ELEMENTS FROM PAGE
/////////////////////////////////
const navigation = document.querySelector('.nav');
const globalLeaderboardBtn = document.querySelector('.global-leaderboard-btn');
const friendsLeaderboardBtn = document.querySelector('.friends-leaderboard-btn');

// No leader paragraphs
let noRunningLeader = document.querySelector('.no-running-leader');
let noWalkingLeader = document.querySelector('.no-walking-leader');
let noBikingLeader = document.querySelector('.no-biking-leader');
let noLiftingLeader = document.querySelector('.no-lifting-leader');
// Running list items
let running1ListItem = document.querySelector('.running-1');
let running2ListItem = document.querySelector('.running-2');
let running3ListItem = document.querySelector('.running-3');
let running4ListItem = document.querySelector('.running-4');
let running5ListItem = document.querySelector('.running-5');
// Walking list items
let walking1ListItem = document.querySelector('.walking-1');
let walking2ListItem = document.querySelector('.walking-2');
let walking3ListItem = document.querySelector('.walking-3');
let walking4ListItem = document.querySelector('.walking-4');
let walking5ListItem = document.querySelector('.walking-5');
// Biking list items
let biking1ListItem = document.querySelector('.biking-1');
let biking2ListItem = document.querySelector('.biking-2');
let biking3ListItem = document.querySelector('.biking-3');
let biking4ListItem = document.querySelector('.biking-4');
let biking5ListItem = document.querySelector('.biking-5');
// Lifting list items
let lifting1ListItem = document.querySelector('.lifting-1');
let lifting2ListItem = document.querySelector('.lifting-2');
let lifting3ListItem = document.querySelector('.lifting-3');
let lifting4ListItem = document.querySelector('.lifting-4');
let lifting5ListItem = document.querySelector('.lifting-5');

// Global Variables
let currentUser;
let currentUsersFriends = [];

////////////////////////
// Add Logout Event
////////////////////////
const logoutBtn = document.getElementById('logoutBtn');
logoutBtn.addEventListener('click', e => {
  firebase.auth().signOut();
});

///////////////////////
// DATABASE BRANCHES
///////////////////////
// Users Workouts totals branch
let userWorkoutTotalsRef = database.ref('userWorkoutTotals');
// Users friends branch
let userFriendsRef = database.ref('userFriends');

////////////////////////////
// ON STATE CHANGE
///////////////////////////
firebase.auth().onAuthStateChanged((user) => {
  // WHAT HAPPENS WHEN A USER IS LOGGED IN
  if (user) {

    // Show Navigation on login
    navigation.style.display = 'flex';

    // GET CURRENT USERS USERNAME
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

    // Get current user's friends
    userFriendsRef.on('value', fetchCurrentUsersFriends);

    // SHOW GLOBAL LEADERBOARD BY DEFAULT
    userWorkoutTotalsRef.on('value', fetchGlobalLeaders, errData);
    
  } else {
    window.location.href = "index.html";
  }
});

////////////////////////////////
// EVENT LISTENERS
////////////////////////////////
globalLeaderboardBtn.addEventListener('click', (e) => {
  let leaderboardListItems = document.querySelectorAll('.leaderboard-list-item');
  if (!globalLeaderboardBtn.classList.contains('active-leaderboard')) {
    globalLeaderboardBtn.classList.add('active-leaderboard');
    friendsLeaderboardBtn.classList.remove('active-leaderboard');
    if (leaderboardListItems.length == 0) {
      userWorkoutTotalsRef.on('value', fetchGlobalLeaders, errData);
    } else {
      leaderboardListItems.forEach(el => {
        el.childNodes[1].innerHTML = '';
      });
      userWorkoutTotalsRef.on('value', fetchGlobalLeaders, errData);
    }
  }
});

friendsLeaderboardBtn.addEventListener('click', (e) => {
  let leaderboardListItems = document.querySelectorAll('.leaderboard-list-item');
  if (!friendsLeaderboardBtn.classList.contains('active-leaderboard')) {
    friendsLeaderboardBtn.classList.add('active-leaderboard');
    globalLeaderboardBtn.classList.remove('active-leaderboard');
    if (leaderboardListItems.length == 0) {
      userWorkoutTotalsRef.on('value', fetchFriendsLeaders, errData);
    } else {
      leaderboardListItems.forEach(el => {
        el.childNodes[1].innerHTML = '';
      });
      userWorkoutTotalsRef.on('value', fetchFriendsLeaders, errData);
    }
  }
});



//////////////////////////////////
// Retrieve Data
//////////////////////////////////

// Function to gather the current user's friends
function fetchCurrentUsersFriends(data) {
  let userFriendsObj = data.val();
  let currentUsersFriendsObj = userFriendsObj[currentUser];
  if (currentUsersFriendsObj != null || currentUsersFriendsObj != undefined) {
    let currentUsersFriendsObjKeys = Object.keys(currentUsersFriendsObj);
    for (let i = 0; i <currentUsersFriendsObjKeys.length; i++) {
      currentUsersFriends.push(currentUsersFriendsObj[currentUsersFriendsObjKeys[i]].user);
    }
  }
} 

// Function to gather the global leaderboard
function fetchGlobalLeaders(data) {
  let userWorkoutsTotalsObj = data.val();

  if (userWorkoutsTotalsObj == null) {

  }

  // Check to see if there are any workouts logged
  if (userWorkoutsTotalsObj != null) {
    // Create arrays for the seperate workout groups totals
    let runningTotals = [];
    let walkingTotals = [];
    let bikingTotals = [];
    let liftingTotals = [];
    let runningUser = {};
    let walkingUser = {};
    let bikingUser = {};
    let liftingUser = {};
    database.ref('userWorkoutTotals').on('value', snapshot => {
      snapshot.forEach(child => {
        // Checks to see if there is a value is the different workouts
        // If not displays a message that there are no leaders
        // If there are, creates them into an object
        if (child.val().running != undefined) {
          runningUser = {
            user: child.key,
            total: child.val().running.total
          }
          runningTotals.push(runningUser);
        }
        if (child.val().walking != undefined) {
          walkingUser = {
            user: child.key,
            total: child.val().walking.total
          }
          walkingTotals.push(walkingUser);
        }
        if (child.val().biking != undefined) {
          console.log(child.val().biking)
          bikingUser = {
            user: child.key,
            total: child.val().biking.total
          }
          bikingTotals.push(bikingUser);
        }
        if (child.val().lifting != undefined) {
          liftingUser = {
            user: child.key,
            total: child.val().lifting.total
          }
          liftingTotals.push(liftingUser);
        }
      });
    });


    // Functions to fetch leaders for each cateogry
    // Checks to see if there are any users in the array before calling function
    if (runningTotals[0] != undefined) {
      fetchRunningLeaders(runningTotals);
      noRunningLeader.style.display = 'none';
    } else {
      noRunningLeader.style.display = 'block';
    }
    if (walkingTotals[0] != undefined) {
      fetchWalkingLeaders(walkingTotals);
      noWalkingLeader.style.display = 'none';
    } else {
      noWalkingLeader.style.display = 'block';
    }
    if (bikingTotals[0] != undefined) {
      fetchBikingLeaders(bikingTotals);
      noBikingLeader.style.display = 'none';
    } else {
      noBikingLeader.style.display = 'block';
    }
    if (liftingTotals[0] != undefined) {
      fetchLiftingLeaders(liftingTotals);
      noLiftingLeader.style.display = 'none';
    } else {
      noLiftingLeader.style.display = 'block';
    }
  }
}



// Function to gather the global leaderboard
function fetchFriendsLeaders(data) {
  let userWorkoutsTotalsObj = data.val();

  if (userWorkoutsTotalsObj == null) {

  }

  // Check to see if there are any workouts logged
  if (userWorkoutsTotalsObj != null) {
    // Create arrays for the seperate workout groups totals
    let runningTotals = [];
    let walkingTotals = [];
    let bikingTotals = [];
    let liftingTotals = [];
    let runningUser = {};
    let walkingUser = {};
    let bikingUser = {};
    let liftingUser = {};
    database.ref('userWorkoutTotals').on('value', snapshot => {
      snapshot.forEach(child => {
        if (currentUsersFriends.indexOf(child.key) > -1 || currentUser == child.key) {
          // Checks to see if there is a value is the different workouts
          // If not displays a message that there are no leaders
          // If there are, creates them into an object
          if (child.val().running != undefined) {
            runningUser = {
              user: child.key,
              total: child.val().running.total
            }
            runningTotals.push(runningUser);
          }
          if (child.val().walking != undefined) {
            walkingUser = {
              user: child.key,
              total: child.val().walking.total
            }
            walkingTotals.push(walkingUser);
          }
          if (child.val().biking != undefined) {
            console.log(child.val().biking)
            bikingUser = {
              user: child.key,
              total: child.val().biking.total
            }
            bikingTotals.push(bikingUser);
          }
          if (child.val().lifting != undefined) {
            liftingUser = {
              user: child.key,
              total: child.val().lifting.total
            }
            liftingTotals.push(liftingUser);
          }
        }
        
      });
    });


    // Functions to fetch leaders for each cateogry
    // Checks to see if there are any users in the array before calling function
    if (runningTotals[0] != undefined) {
      fetchRunningLeaders(runningTotals);
      noRunningLeader.style.display = 'none';
    } else {
      noRunningLeader.style.display = 'block';
    }
    if (walkingTotals[0] != undefined) {
      fetchWalkingLeaders(walkingTotals);
      noWalkingLeader.style.display = 'none';
    } else {
      noWalkingLeader.style.display = 'block';
    }
    if (bikingTotals[0] != undefined) {
      fetchBikingLeaders(bikingTotals);
      noBikingLeader.style.display = 'none';
    } else {
      noBikingLeader.style.display = 'block';
    }
    if (liftingTotals[0] != undefined) {
      fetchLiftingLeaders(liftingTotals);
      noLiftingLeader.style.display = 'none';
    } else {
      noLiftingLeader.style.display = 'block';
    }
  }
}



//////////////////////////////////////
// LEADERBOARD FUNCTIONS
//////////////////////////////////////

function fetchRunningLeaders(runningTotals) {
  // Sort running totals so the largest is first
  let sortedRunning = sortArryOfObjects(runningTotals, 'total');
  // Checks to see if a spot is undefined before changing the html
  if (sortedRunning[0] != undefined) {
    running1ListItem.innerHTML = `🥇 ${sortedRunning[0].user} - ${sortedRunning[0].total} mile(s)`;
  }
  if (sortedRunning[1] != undefined) {
    running2ListItem.innerHTML = `🥈 ${sortedRunning[1].user} - ${sortedRunning[1].total} mile(s)`;
  }
  if (sortedRunning[2] != undefined) {
    running3ListItem.innerHTML = `🥉 ${sortedRunning[2].user} - ${sortedRunning[2].total} mile(s)`;
  }
  if (sortedRunning[3] != undefined) {
    running4ListItem.innerHTML = `${sortedRunning[3].user} - ${sortedRunning[3].total} mile(s)`;
  }
  if (sortedRunning[4] != undefined) {
    running5ListItem.innerHTML = `${sortedRunning[4].user} - ${sortedRunning[4].total} mile(s)`;
  }
}

function fetchWalkingLeaders(walkingTotals) {
  // Sort walking totals so the largest is first
  let sortedWalking = sortArryOfObjects(walkingTotals, 'total');
  
  // Checks to see if a spot is undefined before changing the html
  if (sortedWalking[0] != undefined) {
    walking1ListItem.innerHTML = `🥇 ${sortedWalking[0].user} - ${sortedWalking[0].total} mile(s)`;
  }
  if (sortedWalking[1] != undefined) {
    walking2ListItem.innerHTML = `🥈 ${sortedWalking[1].user} - ${sortedWalking[1].total} mile(s)`;
  }
  if (sortedWalking[2] != undefined) {
    walking3ListItem.innerHTML = `🥉 ${sortedWalking[2].user} - ${sortedWalking[2].total} mile(s)`;
  }
  if (sortedWalking[3] != undefined) {
    walking4ListItem.innerHTML = `${sortedWalking[3].user} - ${sortedWalking[3].total} mile(s)`;
  }
  if (sortedWalking[4] != undefined) {
    walking5ListItem.innerHTML = `${sortedWalking[4].user} - ${sortedWalking[4].total} mile(s)`;
  }
}

function fetchBikingLeaders(bikingTotals) {
  // Sort walking totals so the largest is first
  let sortedBiking = sortArryOfObjects(bikingTotals, 'total');

  // Checks to see if a spot is undefined before changing the html
  if (sortedBiking[0] != undefined) {
    biking1ListItem.innerHTML = `🥇 ${sortedBiking[0].user} - ${sortedBiking[0].total} mile(s)`;
  }
  if (sortedBiking[1] != undefined) {
    biking2ListItem.innerHTML = `🥈 ${sortedBiking[1].user} - ${sortedBiking[1].total} mile(s)`;
  }
  if (sortedBiking[2] != undefined) {
    biking3ListItem.innerHTML = `🥉 ${sortedBiking[2].user} - ${sortedBiking[2].total} mile(s)`;
  }
  if (sortedBiking[3] != undefined) {
    biking4ListItem.innerHTML = `${sortedBiking[3].user} - ${sortedBiking[3].total} mile(s)`;
  }
  if (sortedBiking[4] != undefined) {
    biking5ListItem.innerHTML = `${sortedBiking[4].user} - ${sortedBiking[4].total} mile(s)`;
  }
}

function fetchLiftingLeaders(liftingTotals) {
  // Sort walking totals so the largest is first
  let sortedLifting = sortArryOfObjects(liftingTotals, 'total');
  
  // Checks to see if a spot is undefined before changing the html
  if (sortedLifting[0] != undefined) {
    lifting1ListItem.innerHTML = `🥇 ${sortedLifting[0].user} - ${sortedLifting[0].total} minute(s)`;
  }
  if (sortedLifting[1] != undefined) {
    lifting2ListItem.innerHTML = `🥈 ${sortedLifting[1].user} - ${sortedLifting[1].total} minute(s)`;
  }
  if (sortedLifting[2] != undefined) {
    lifting3ListItem.innerHTML = `🥉 ${sortedLifting[2].user} - ${sortedLifting[2].total} minute(s)`;
  }
  if (sortedLifting[3] != undefined) {
    lifting4ListItem.innerHTML = `${sortedLifting[3].user} - ${sortedLifting[3].total} minute(s)`;
  }
  if (sortedLifting[4] != undefined) {
    lifting5ListItem.innerHTML = `${sortedLifting[4].user} - ${sortedLifting[4].total} minute(s)`;
  }
}

// BASE FUNCTION FOR SORTING
// FUNCTION USED TO SORT EACH LEADERBOARD ARRAY
function sortArryOfObjects (arry, key) {
  return arry.sort((a, b) => {
    return b[key] - a[key];
  });
}

// What happens if there is an error getting the data
function errData(err) {
  alert('Error fetching data', err);
}
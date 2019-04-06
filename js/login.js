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
// Users workouts branch
let userWorkouts;

// Get Elements
let usersName;
const navigation = document.querySelector('.nav');
const dashboardScreen = document.querySelector('.dashboard-screen');
const userEmail = document.getElementById('user_email');
const userPass = document.getElementById('user_pass');
const loginBtn = document.getElementById('loginBtn');
const signUpBtn = document.getElementById('signUpBtn');
const logoutBtn = document.getElementById('logoutBtn');

// Add Login Event
loginBtn.addEventListener('click', () => {
  // Get Email and Password
  const email = userEmail.value;
  const password = userPass.value;
  const auth = firebase.auth();
  // Sign In
  const promise = auth.signInWithEmailAndPassword(email, password);
  // What happens if there is an error signing in
  // Pops up alert message and clears the fields
  promise.catch((e) => {
    alert(e.message);
    userEmail.value = '';
    userPass.value = '';
  });
  
});

// Add Sign Up Event
signUpBtn.addEventListener('click', e => {
  // Get Email and Password
  const email = userEmail.value;
  const password = userPass.value;
  const auth = firebase.auth();
  // Sign In
  const promise = auth.createUserWithEmailAndPassword(email, password);
  // What happens if there is an error signing up
  // Pops up alert message and clears the fields
  promise
    .catch((e) => {
      alert(e.message);
      userEmail.value = '';
      userPass.value = '';
    });
});

// Add Logout Event
logoutBtn.addEventListener('click', e => {
  firebase.auth().signOut();
});

firebase.auth().onAuthStateChanged(firebaseUser => {
  if (firebaseUser) {
    window.location.href = "dashboard.html";
  }
});
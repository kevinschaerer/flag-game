import { supa } from "/assets/js/supa.js";

// Initialize variables
let contentList = "";
let id = 0;
let currentIndex = 0;
let currentFlag;
let answeredFlags = [];
let userInput = document.querySelector("#user-input");
let getCurrentAnswer;
let currentAnswer;
let matchingArray = null;
let upper;
let points;
let container = document.getElementById("list-flag");
let animationFrameId;
let elapsedTime = 0;
let displayName;
let btnSubmit;

// Function to shuffle arrays
function shuffle(array) {
  let i = array.length,
    j,
    temp;
  while (--i > 0) {
    j = Math.floor(Math.random() * (i + 1));
    temp = array[j];
    array[j] = array[i];
    array[i] = temp;
  }
}

// Function to shuffle and display all flags
async function displayFlagList() {
  const { data, error } = await supa.from("quiz").select("*");

  // Call shuffle function
  shuffle(data);

  // Add click event listener to the container
  data.forEach((arrayFlag) => {
    let flagElement = document.createElement("div");
    flagElement.id = id++;
    flagElement.classList.add("container-flag");
    flagElement.innerHTML = `<div><img class="name-it-img-flag" src="${arrayFlag.flag_img}" alt=""></div> <p class="list-item-country">${arrayFlag.key[0]}</p>`;

    contentList += flagElement.outerHTML;

    container.addEventListener("click", handleFlagClick);
  });

  container.innerHTML = contentList;
}

// Click event handler function
function handleFlagClick(event) {
  let clickedElement = event.target.closest(".container-flag");

  if (clickedElement) {
    let number = parseFloat(clickedElement.id);

    // Check if the clicked flag has already been answered correctly
    if (!answeredFlags.includes(number)) {
      currentIndex = number;
      trackIndex();
      displayFlagToAnswer();
      checkAnswer();
      userInput.focus();
      userInput.value = "";
    }
  }
}

function trackIndex() {
  let test = document.getElementsByClassName("container-flag");
  let testArray = Array.from(test);

  testArray.forEach((element) => {
    let number = parseFloat(element.id);

    if (currentIndex === number) {
      // Remove 'focused-flag' class from all elements
      testArray.forEach((item) => {
        item.classList.remove("focused-flag");
      });

      // Add 'focused-flag' class to the element with the matching id
      element.classList.add("focused-flag");
      scrollToFocusedFlag();
    }
  });
}

// Function to display flag to answer
async function displayFlagToAnswer() {
  currentFlag = document.querySelector(".focused-flag img");
  let cloneFlag = currentFlag.cloneNode(true);
  let currentFlagContainer = document.querySelector("#focused-flag");

  while (currentFlagContainer.firstChild) {
    currentFlagContainer.removeChild(currentFlagContainer.firstChild);
  }

  // Append the cloned image
  cloneFlag.classList.remove("name-it-img-flag");
  currentFlagContainer.appendChild(cloneFlag);
}

async function checkAnswer() {
  const { data, error } = await supa.from("quiz").select("key");

  getCurrentAnswer = document.querySelector(".focused-flag p").innerHTML;

  data.forEach((arrayFlag) => {
    currentAnswer = arrayFlag.key[0];

    if (getCurrentAnswer === currentAnswer) {
      matchingArray = arrayFlag.key;

      upper = matchingArray.map((element) => {
        return element.toLowerCase();
      });
    }
  });
}

// Check if answer is correct
userInput.addEventListener("input", (e) => {
  let value = e.target.value.toLowerCase();

  if (upper.includes(value)) {
    answeredFlags.push(currentIndex);
    let addFlagClass = document.querySelectorAll(".container-flag");
    addFlagClass[currentIndex].classList.add("answered-flag");
    userInput.value = "";

    if (window.innerWidth > 425) {
      let listItem = document.querySelectorAll(".list-item-country");
      listItem[currentIndex].style.display = "block";
    }

    if (answeredFlags.length === 193) {
      checkAnswer();
      displayPoints();
      document.querySelector("#btn-finish").click();
      return;
    }

    if (answeredFlags.includes(currentIndex)) {
      currentIndex++;

      if (currentIndex > 192) {
        currentIndex = 0;
      }

      // Find the next available index before the current index
      while (answeredFlags.includes(currentIndex)) {
        currentIndex++;

        if (currentIndex > 192) {
          currentIndex = 0;
        }
      }

      trackIndex();
      displayFlagToAnswer();
      checkAnswer();
      displayPoints();
      showIcon();
    }
  }
});

// Function to display next flag
function displayNextFlag() {
  if (answeredFlags.length === 193) {
    return;
  } else {
    currentIndex++;

    if (currentIndex > 192) {
      currentIndex = 0;
    }

    // Find the next available index before the current index
    while (answeredFlags.includes(currentIndex)) {
      currentIndex++;

      if (currentIndex > 192) {
        currentIndex = 0;
      }
    }

    trackIndex();
    displayFlagToAnswer();
    checkAnswer();
    userInput.focus();
    userInput.value = "";
    scrollToFocusedFlag();
  }
}

document.getElementById("btn-next").addEventListener("click", displayNextFlag);

function displayPreviousFlag() {
  currentIndex--;

  if (currentIndex < 0) {
    currentIndex = 192;
  }

  // Find the next available index before the current index
  while (answeredFlags.includes(currentIndex)) {
    currentIndex--;

    if (currentIndex < 0) {
      currentIndex = 192;
    }
  }

  trackIndex();
  displayFlagToAnswer();
  checkAnswer();
  userInput.focus();
  userInput.value = "";
  scrollToFocusedFlag();
}

document
  .getElementById("btn-previous")
  .addEventListener("click", displayPreviousFlag);

// Function to display current Points
function displayPoints() {
  points = answeredFlags.length;
  document.querySelector("#points").innerHTML = points;
}

function startStopwatch(updateFunction, maxDuration) {
  let lastTime = new Date().getTime();
  let displayNode = document.getElementById("stopwatch");
  let numSeconds = 0;

  function formatTime(seconds) {
    let minutes = Math.floor(seconds / 60);
    let remainingSeconds = seconds % 60;
    return padNumber(minutes) + ":" + padNumber(remainingSeconds);
  }

  function padNumber(num) {
    return num < 10 ? "0" + num : num;
  }

  function timer() {
    animationFrameId = requestAnimationFrame(timer);
    let currentTime = new Date().getTime();

    if (currentTime - lastTime >= 1000) {
      lastTime = currentTime;
      numSeconds++;
      displayNode.innerText = formatTime(numSeconds);
      if (typeof updateFunction === "function") {
        updateFunction(formatTime(numSeconds));
      }

      // Check if the timer has reached the maximum duration
      if (numSeconds >= 3600 || points === 193) {
        stopStopwatch();
      }
    }
  }
  timer();

  function displayEndScreen() {
    container.removeEventListener("click", handleFlagClick);
    document.querySelector("#focused-flag").style.display = "none";
    document.querySelector("#user-input").style.display = "none";
    document.querySelector("#btns-game-control").style.display = "none";
    document.querySelector(".navigation-back").style.display = "none";
    document.querySelector("#display-name").style.display = "block";
    document.querySelector("#btn-submit-score").style.display = "block";

    let addFlagClass = document.querySelectorAll(
      ".container-flag:not(.answered-flag)"
    );

    addFlagClass.forEach((flagElement) => {
      let index = parseInt(flagElement.id);
      flagElement.classList.add("unanswered-flag");

      if (window.innerWidth > 425) {
        let listItem = document.querySelectorAll(".list-item-country");
        listItem[index].style.display = "block";
      }
    });
  }

  // Return a function to stop the stopwatch and get the elapsed time
  function stopStopwatch() {
    cancelAnimationFrame(animationFrameId);

    displayEndScreen();
  }

  document.getElementById("btn-finish").addEventListener("click", function () {
    elapsedTime = document.getElementById("stopwatch").innerHTML;
    stopStopwatch();
    document.documentElement.style.setProperty("--before-height", "90px");
    container.style.paddingTop = "2rem";
    let informationBar = document.querySelector("#information-bar");
    informationBar.style.paddingTop = "1.25rem";
    updateMaxHeightFinish();
  });
}

btnSubmit = document.getElementById("btn-submit-score");
btnSubmit.disabled = true;

btnSubmit.addEventListener("click", async function () {
  if (points > 0) {
    await saveScore();
  }

  location.href = "/scoreboard.html";
});

let inputDisplayName = document.getElementById("display-name");

inputDisplayName.addEventListener("input", (e) => {
  displayName = e.target.value;

  if (displayName.length >= 1) {
    btnSubmit.disabled = false;
  } else {
    btnSubmit.disabled = true;
  }
});

// Insert the score into the scoreboard table
async function saveScore() {
  const { data, error } = await supa
    .from("scoreboard")
    .insert([
      { score: points, elapsed_time: elapsedTime, username: displayName },
    ])
    .select();

  if (error) {
    console.error("Error inserting into leaderboard:", error);
    return;
  }
}

document.onkeydown = checkKey;

function checkKey(e) {
  e = e || window.event;

  if (e.keyCode == "37") {
    document.querySelector("#btn-previous").click();
  } else if (e.keyCode == "39") {
    document.querySelector("#btn-next").click();
  }
}

function showIcon() {
  if (window.innerWidth > 425) {
    let userInputContainer = document.getElementById("user-input-container");
    userInputContainer.classList.add("show-icon");

    let icon = document.querySelector(".icon-checkmark");
    icon.addEventListener(
      "animationend",
      function () {
        userInputContainer.classList.remove("show-icon");
      },
      { once: true }
    );
  }
}

function scrollToFocusedFlag() {
  const focusedFlag = document.querySelector(".focused-flag");
  const listFlagContainer = document.getElementById("list-flag");

  if (focusedFlag && listFlagContainer) {
    const containerOffsetTop = listFlagContainer.offsetTop;
    const flagOffsetTop = focusedFlag.offsetTop;

    listFlagContainer.scrollTop = flagOffsetTop - containerOffsetTop - 40;
  }
}

const userfInput = document.getElementById("user-input");
const body = document.body;
const listFlagContainer = document.getElementById("list-flag");

userfInput.addEventListener("focus", () => {
  body.addEventListener("touchmove", preventScroll, { passive: false });
});

userfInput.addEventListener("blur", () => {
  body.removeEventListener("touchmove", preventScroll, { passive: false });
});

function preventScroll(event) {
  const isListFlagScroll = listFlagContainer.contains(event.target);
  if (!isListFlagScroll) {
    event.preventDefault();
  }
}

let visualViewportHeight = window.innerHeight;
let topElementHeight = 415;
let scoreBarHeight = 160;
let listFlag = document.getElementById("list-flag");

function updateMaxHeight() {
  let remainingHeight = visualViewportHeight - topElementHeight;

  // console.log("Remaining height:", remainingHeight);
  // console.log("Visual viewport height:", visualViewportHeight);

  listFlag.style.setProperty("--list-flag-max-height", `${remainingHeight}px`);
}

function updateMaxHeightFinish() {
  let remainingHeight = visualViewportHeight - scoreBarHeight;

  // console.log("Remaining height:", remainingHeight);
  // console.log("Visual viewport height:", visualViewportHeight);

  listFlag.style.setProperty("--list-flag-max-height", `${remainingHeight}px`);
}

window.addEventListener("DOMContentLoaded", updateMaxHeight);
window.addEventListener("load", updateMaxHeight);
window.addEventListener("resize", updateMaxHeight);
window.addEventListener("orientationchange", updateMaxHeight);
updateMaxHeight();

// Call functions
await displayFlagList();
displayPoints();
trackIndex();
userInput.focus();
await displayFlagToAnswer();
checkAnswer();
startStopwatch();
checkKey(e);

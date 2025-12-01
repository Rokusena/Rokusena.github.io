const form = document.getElementById("contactForm");
const fields = ["fname", "lname", "email", "phone", "address", "q1", "q2", "q3"];
const submitBtn = document.getElementById("submitBtn");
const output = document.getElementById("formOutput");
const popup = document.getElementById("popupMessage");

function showError(id, msg) {
  const el = document.getElementById(id);
  el.classList.add("error");
  el.nextElementSibling.textContent = msg;
}

function clearError(id) {
  const el = document.getElementById(id);
  el.classList.remove("error");
  el.nextElementSibling.textContent = "";
}

function validateField(id) {
  let value = document.getElementById(id).value.trim();

  if (!value) {
    showError(id, "Laukas negali būti tuščias");
    return false;
  }

  if (id === "fname" || id === "lname") {
    if (!/^[A-Za-zĄČĘĖĮŠŲŪŽąčęėįšųūž]+$/.test(value)) {
      showError(id, "Leidžiamos tik raidės");
      return false;
    }
  }

  if (id === "email") {
    if (!/^\S+@\S+\.\S+$/.test(value)) {
      showError(id, "Neteisingas el. pašto formatas");
      return false;
    }
  }

  if (id === "q1" || id === "q2" || id === "q3") {
    let num = Number(value);
    if (num < 1 || num > 10) {
      showError(id, "Įveskite reikšmę 1–10");
      return false;
    }
  }

  clearError(id);
  return true;
}

fields.forEach(id => {
  document.getElementById(id).addEventListener("input", () => {
    validateField(id);
    validateAll();
  });
});

// TELEFONO FORMATAVIMAS +370 6XX XXXXX
document.getElementById("phone").addEventListener("input", (e) => {
  let v = e.target.value.replace(/\D/g, "");

  if (v.startsWith("370")) v = "+" + v;
  if (v.startsWith("0")) v = "+370" + v.slice(1);
  if (!v.startsWith("+370")) v = "+370" + v;

  if (v.length > 12) v = v.slice(0, 12);

  let formatted = "+370 " + v.slice(4, 5) + v.slice(5, 7) + " " + v.slice(7);
  e.target.value = formatted.trim();

  clearError("phone");
  validateAll();
});

function validateAll() {
  let ok = true;
  fields.forEach(id => {
    if (!validateField(id)) ok = false;
  });
  submitBtn.disabled = !ok;
  return ok;
}

form.addEventListener("submit", function(e) {
  e.preventDefault();

  if (!validateAll()) return;

  const data = {};
  fields.forEach(id => {
    data[id] = document.getElementById(id).value.trim();
  });

  console.log(data);

  const avg = ((Number(data.q1) + Number(data.q2) + Number(data.q3)) / 3).toFixed(1);

  output.innerHTML = `
      <p><strong>Vardas:</strong> ${data.fname}</p>
      <p><strong>Pavardė:</strong> ${data.lname}</p>
      <p><strong>El. paštas:</strong> ${data.email}</p>
      <p><strong>Telefono numeris:</strong> ${data.phone}</p>
      <p><strong>Adresas:</strong> ${data.address}</p>
      <p><strong>Įvertinimai:</strong> ${data.q1}, ${data.q2}, ${data.q3}</p>
      <h4>${data.fname} ${data.lname}: ${avg}</h4>
  `;

  popup.style.display = "block";
  setTimeout(() => popup.style.display = "none", 2500);
});

/* ============================
   ATMINTIES ŽAIDIMAS
============================ */

const gameBoard = document.getElementById("gameBoard");
const movesEl = document.getElementById("moves");
const matchesEl = document.getElementById("matches");
const winMessage = document.getElementById("winMessage");
const difficultySelect = document.getElementById("difficulty");
const timerEl = document.getElementById("timer");

let moves = 0;
let matches = 0;
let timer = 0;
let timerInterval;
let lockBoard = false;
let firstCard, secondCard;

const icons = ["🍎","🍌","🍒","🍇","🍓","🍉"];

function setupBoard() {
  let diff = difficultySelect.value;
  let rows = diff === "easy" ? 3 : 4;
  let cols = diff === "easy" ? 4 : 6;

  let totalCards = rows * cols;

  let selected = icons.slice(0, totalCards / 2);
  let cards = [...selected, ...selected];

  cards.sort(() => Math.random() - 0.5);

  gameBoard.style.gridTemplateColumns = `repeat(${cols}, 80px)`;
  gameBoard.innerHTML = "";

  cards.forEach(icon => {
    let card = document.createElement("div");
    card.classList.add("card");
    card.dataset.icon = icon;
    card.addEventListener("click", flipCard);
    gameBoard.appendChild(card);
  });

  moves = 0;
  matches = 0;
  timer = 0;
  clearInterval(timerInterval);
  timerEl.textContent = "0s";
  movesEl.textContent = "0";
  matchesEl.textContent = "0";
  winMessage.textContent = "";
}

function startTimer() {
  clearInterval(timerInterval);
  timerInterval = setInterval(() => {
    timer++;
    timerEl.textContent = timer + "s";
  }, 1000);
}

function flipCard() {
  if (lockBoard || this.classList.contains("flipped")) return;

  if (moves === 0) startTimer();

  this.classList.add("flipped");
  this.textContent = this.dataset.icon;

  if (!firstCard) {
    firstCard = this;
    return;
  }

  secondCard = this;
  lockBoard = true;
  moves++;
  movesEl.textContent = moves;

  checkMatch();
}

function checkMatch() {
  if (firstCard.dataset.icon === secondCard.dataset.icon) {
    firstCard.classList.add("matched");
    secondCard.classList.add("matched");

    matches++;
    matchesEl.textContent = matches;

    resetTurn();

    checkWin();
  } else {
    setTimeout(() => {
      firstCard.classList.remove("flipped");
      secondCard.classList.remove("flipped");
      firstCard.textContent = "";
      secondCard.textContent = "";
      resetTurn();
    }, 1000);
  }
}

function resetTurn() {
  firstCard = null;
  secondCard = null;
  lockBoard = false;
}

function checkWin() {
  let totalPairs = gameBoard.children.length / 2;

  if (matches === totalPairs) {
    winMessage.textContent = "🎉 Laimėjote!";
    clearInterval(timerInterval);
    saveBestResult();
  }
}

document.getElementById("startGame").addEventListener("click", setupBoard);
document.getElementById("resetGame").addEventListener("click", setupBoard);



function saveBestResult() {
  let diff = difficultySelect.value;
  let key = diff === "easy" ? "bestEasy" : "bestHard";
  let best = localStorage.getItem(key);

  if (!best || moves < best) {
    localStorage.setItem(key, moves);
    loadBestResults();
  }
}

function loadBestResults() {
  document.getElementById("bestEasy").textContent =
    localStorage.getItem("bestEasy") || "-";
  document.getElementById("bestHard").textContent =
    localStorage.getItem("bestHard") || "-";
}

loadBestResults();
setupBoard();

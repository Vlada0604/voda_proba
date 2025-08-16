// --- ініціалізація ---
let today = new Date().toISOString().split("T")[0];
let goal = parseInt(localStorage.getItem("goal")) || 2000;
let current = JSON.parse(localStorage.getItem("current")) || {};
let reminder = parseInt(localStorage.getItem("reminder")) || 0;

if (!current[today]) current[today] = 0;
let reminderInterval = null;

// --- оновлення головної сторінки ---
function updateUI() {
  if (!document.getElementById("goal")) return; // якщо ми не на index.html

  document.getElementById("goal").innerText = goal;
  document.getElementById("currentInfo").innerText =
    `Випито: ${current[today]} мл із ${goal} мл`;

  let percent = Math.min(100, Math.round((current[today] / goal) * 100));
  document.getElementById("progress").style.width = percent + "%";
  document.getElementById("percentBox").innerText = percent + "%";

  document.getElementById("date").innerText = today;

  // історія
  let historyList = document.getElementById("historyList");
  historyList.innerHTML = "";
  let keys = Object.keys(current).slice(-7); // останні 7 днів
  keys.forEach(d => {
    let li = document.createElement("li");
    li.innerText = `${d}: ${current[d]} мл`;
    historyList.appendChild(li);
  });

  // якщо ціль виконана → зупиняємо нагадування
  if (percent >= 100) {
    stopReminders();
  } else {
    startReminders();
  }
}

// --- додати воду ---
function addWater() {
  let amount = parseInt(document.getElementById("waterInput").value) || 0;
  if (amount > 0) {
    current[today] += amount;
    localStorage.setItem("current", JSON.stringify(current));
    updateUI();
  }
}

// --- налаштування ---
function saveSettings() {
  goal = parseInt(document.getElementById("goalInput").value) || goal;
  current[today] = parseInt(document.getElementById("currentInput").value) || current[today];
  reminder = parseInt(document.getElementById("reminderInput").value) || reminder;

  localStorage.setItem("goal", goal);
  localStorage.setItem("current", JSON.stringify(current));
  localStorage.setItem("reminder", reminder);

  alert("Збережено ✅");
  updateUI();
}

// --- оновлення налаштувань ---
function loadSettings() {
  if (!document.getElementById("goalInput")) return; // якщо не на settings.html

  document.getElementById("goalInput").value = goal;
  document.getElementById("currentInput").value = current[today];
  document.getElementById("reminderInput").value = reminder;
}

// --- Нагадування ---
function startReminders() {
  if (reminder > 0 && document.getElementById("goal")) { 
    if (reminderInterval) clearInterval(reminderInterval);

    reminderInterval = setInterval(() => {
      let percent = Math.min(100, Math.round((current[today] / goal) * 100));
      if (percent >= 100) {
        stopReminders();
        return;
      }

      if (Notification.permission === "granted") {
        new Notification("💧 Випий води!");
      } else {
        alert("💧 Випий води!");
      }
    }, reminder * 60 * 1000);
  }
}

function stopReminders() {
  if (reminderInterval) {
    clearInterval(reminderInterval);
    reminderInterval = null;
    console.log("⏹ Нагадування зупинені (ціль досягнута)");
  }
}

// --- Дозвіл на нотифікації ---
if ("Notification" in window) {
  if (Notification.permission === "default") {
    Notification.requestPermission();
  }
}

// --- автозапуск ---
updateUI();
loadSettings();
startReminders();

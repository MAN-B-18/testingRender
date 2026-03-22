/* ======================
   👥 Real-time Users + Gender Chart (with timestamp ordering)
====================== */
import { query, orderBy, limit } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-firestore.js";

// Pie Chart setup
const genderCtx = document.createElement("canvas");
document.querySelector(".main").appendChild(genderCtx);
genderCtx.id = "genderChart";
import { getAuth, onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-auth.js";

const auth = getAuth();

// Listen for the logged-in user
onAuthStateChanged(auth, (user) => {
  const adminName = document.getElementById("adminName");
  
  if (user) {
    // Display the logged-in admin's email
    adminName.textContent = `Welcome, ${user.email.split("@")[0]} ⬇️`;
  } else {
    // If not logged in, redirect to login page
    window.location.href = "admin-login.html";
  }
});

// Logout button
const logoutBtn = document.getElementById("logoutBtn");
if (logoutBtn) {
  logoutBtn.addEventListener("click", async () => {
    await signOut(auth);
    window.location.href = "admin-login.html";
  });
}

const genderChart = new Chart(genderCtx, {
  type: "pie",
  data: {
    labels: ["Male", "Female", "Other"],
    datasets: [{
      data: [0, 0, 0],
      backgroundColor: [
        "rgba(46, 134, 222, 0.7)",
        "rgba(255, 99, 132, 0.7)",
        "rgba(255, 206, 86, 0.7)"
      ],
      borderWidth: 1
    }]
  },
  options: {
    plugins: {
      title: { display: true, text: "User Gender Distribution" },
      legend: { position: "bottom" }
    }
  }
});

// Query for users
const usersRef = collection(db, "users");
const latestUsersQuery = query(usersRef, orderBy("timestamp", "desc"), limit(5));

// Live total user count (all users)
onSnapshot(usersRef, (snapshot) => {
  const users = snapshot.docs.map(doc => doc.data());
  visitorsCard.textContent = users.length.toLocaleString();

  // Gender chart update
  let male = 0, female = 0, other = 0;
  users.forEach(u => {
    if (u.gender?.toLowerCase() === "male") male++;
    else if (u.gender?.toLowerCase() === "female") female++;
    else other++;
  });

  genderChart.data.datasets[0].data = [male, female, other];
  genderChart.update();
});

// Live latest 5 registered users
onSnapshot(latestUsersQuery, (snapshot) => {
  const latestUsers = snapshot.docs.map(doc => doc.data());
  userList.innerHTML = latestUsers
    .map(u => `
      <li>
        <strong>${u.name || "Unknown"}</strong><br>
        <small>${u.email || "No email"}</small>
      </li>
    `)
    .join("");
});

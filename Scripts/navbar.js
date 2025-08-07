window.addEventListener("scroll", function () {
  const navbar = document.querySelector(".nav-style");
  if (window.scrollY > 10) {
    navbar.classList.add("navbar-blur");
  } else {
    navbar.classList.remove("navbar-blur");
  }
});

function toggleMenu() {
  document.getElementById("navigation").classList.toggle("active");
}

document.addEventListener("DOMContentLoaded", function () {
  updateNavbarForUser();
});

function updateNavbarForUser() {
  const userRole = AuthUtils.getUserRole();

  if (userRole) {
    addUserRoleIndicator(userRole);
  }
}

function addUserRoleIndicator(role) {
  const navigation = document.getElementById("navigation");
  if (!navigation) return;
  const existingIndicator = document.getElementById("role-indicator");
  if (existingIndicator) {
    existingIndicator.remove();
  }
  const roleIndicator = document.createElement("li");
  roleIndicator.id = "role-indicator";
  roleIndicator.innerHTML = `<span class="role-badge" style=" background: ${role === "editor" ? "#10B981" : "#3B82F6"};">${role.toUpperCase()}</span>`;

  const logoutElement = navigation.querySelector("#logout");

    navigation.insertBefore(roleIndicator, logoutElement);
  
}

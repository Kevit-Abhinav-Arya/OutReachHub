//--------------------------------------------------------------------------------
//add contact display
//--------------------------------------------------------------------------------
function addContact() {
  document.querySelector("#addContactModalOverlay").classList.add("active");
  document.querySelector("#addContactModal").classList.add("active");
}

function closeAddModal() {
  document.querySelector("#addContactModalOverlay").classList.remove("active");
  document.querySelector("#addContactModal").classList.remove("active");
}

document
  .querySelector(".add-contact-btn")
  .addEventListener("click", addContact);
document
  .querySelector("#addContactModalOverlay")
  .addEventListener("click", function (e) {
    if (e.target === this) closeAddModal();
  });
//--------------------------------------------------------------------------------
//Tags script
//--------------------------------------------------------------------------------
const tagInput = document.getElementById("tagInput");
const tagContainer = document.querySelector("#tagsContainer");
let tags = [];
tagInput.addEventListener("keypress", function (e) {
  if (e.key === "Enter") {
    e.preventDefault();
    const tag = this.value.trim().toUpperCase();
    if (!tags.includes(tag)) {
      addTag(tag,tagContainer);
      this.value = "";
    } else {
      window.alert("tag already included!");
      this.value = "";
    }
  }
});

//Suggestion Tags

const suggContainer = document.querySelector('.suggested-tags');
const suggTag = suggContainer.querySelectorAll("span");

suggTag.forEach(stag => {
  
  stag.addEventListener("click", function (e) {
  
    e.preventDefault();
    const tag = stag.textContent.toUpperCase();
    if (!tags.includes(tag)) {
      addTag(tag,tagContainer);
      this.value = "";
    } else {
      window.alert("tag already included!");
      this.value = "";
    }
  
});
})

// Tag Functions

function addTag(tag,container) {
  tags.push(tag);
  const tagElement = document.createElement("span");
  tagElement.className = "tag";
  tagElement.innerHTML = `${tag}  
        <button class="remove-tag" onclick="removeTag('${tag}','${container.id}')">&times;</button>`;
  container.appendChild(tagElement);
  console.log(tags);
}

function removeTag(tag,container) {
  tags = tags.filter((t) => t != tag);
  console.log(tags);
  renderTags(container);
}

function renderTags(container) {
  let tagContainer = document.getElementById(container);
  tagContainer.innerHTML = "";
  tags.forEach((t) => {
    const tagElement = document.createElement("span");
    tagElement.className = "tag";
    tagElement.innerHTML = `${t}
        <button class="remove-tag" onclick="removeTag('${t}','${tagContainer.id}')">&times;</button>`;

    tagContainer.appendChild(tagElement);
  });
}
//--------------------------------------------------------------------------------
//contact card script
//--------------------------------------------------------------------------------

document.querySelectorAll(".contact-details").forEach((con) => {
  con.addEventListener("click", function () {
    implementation("viewModalOverlay", "viewModal");
  });
});

//--------------------------------------------------------------------------------
//modal visibility toggles
//--------------------------------------------------------------------------------

//Close button Script

document.querySelectorAll(".close-btn").forEach((btn) => {
  btn.addEventListener("click", function () {
    console.log("Close Button clicked");
    const modal = this.closest('[id$="Modal"]');
    if (!modal) {
      console.error("No modal found");
      return;
    }
    const modalId = modal.id;
    const overlayId = modalId + "Overlay";

    closeModal(overlayId, modalId);
  });
});

//Cancel Button Script

document.querySelectorAll(".cancel-btn").forEach((cancel) => {
  cancel.addEventListener("click", function () {
    const modal = this.closest('[id$= "Modal"]');
    const overlay = modal.id + "Overlay";
    closeModal(overlay, modal.id);
    console.log("Cancel Button Clicked");
  });
});

//Action button Script

document.querySelectorAll(".action-btn").forEach((btn) => {
  btn.addEventListener("click", function () {
    console.log(btn.title.split(" ")[0].toLowerCase() + " clicked");
    const modal = btn.title.split(" ")[0].toLowerCase() + "Modal";
    const overlay = modal + "Overlay";
    implementation(overlay, modal);
  });
});

//To close the Modal when clicking outside of the modal

document.querySelectorAll(".modal-overlay").forEach((overlay) => {
  overlay.addEventListener("click", function (e) {
    console.log(overlay.id.replace("Overlay", ""), "outside MOdal");
    const modal = overlay.id.replace("Overlay", "").trim();
    if (e.target === this) closeModal(overlay.id, modal);
  });
});

//Tags option in Edit action Btn

const editTag = document.getElementById('editTagInput');
const editTagContainer = document.querySelector('#editTagsContainer');

editTag.addEventListener("keypress", function (e) {
  if (e.key === "Enter") {
    e.preventDefault();
    const tag = this.value.trim().toUpperCase();
    if (!tags.includes(tag)) {
      addTag(tag,editTagContainer);
      this.value = "";
    } else {
      window.alert("tag already included!");
      this.value = "";
    }
  }
});


//Functions

function implementation(overlay, modal) {
  document.getElementById(overlay).classList.toggle("active");
  document.getElementById(modal).classList.toggle("active");
}

function closeModal(overlay, modal) {
  document.getElementById(overlay).classList.remove("active");
  document.getElementById(modal).classList.remove("active");
}
//--------------------------------------------------------------------------------
// Filter Scripts
//--------------------------------------------------------------------------------

function toggleFilter() {
  document.querySelector(".filter-dropdown").classList.toggle("active");
  if (document.querySelector(".filter-dropdown").classList.contains("active")) {
    document.querySelector(".tags-dropdown").classList.remove("active");
  }
}
function toggleTagFilter() {
  document.querySelector(".tags-dropdown").classList.toggle("active");
  if (document.querySelector(".tags-dropdown").classList.contains("active")) {
    document.querySelector(".filter-dropdown").classList.remove("active");
  }
}

//Reset Button

document.querySelectorAll('.reset-btn').forEach(reset => {
  reset.addEventListener('click', function() {
    const container = document.querySelectorAll('.filter-dropdown');

    container.forEach(container => {
  
      const inputs = container.querySelectorAll('input');
      inputs.forEach(input => {
        if (input.type === 'checkbox' || input.type === 'radio') {
          input.checked = false;
        } 
      });         
    })

  });
});

const form = document.querySelector(".grocery-form");
const alert = document.querySelector(".alert");
const grocery = document.getElementById("grocery");
const submit = document.querySelector(".submit-btn");
const container = document.querySelector(".grocery-container");
const list = document.querySelector(".grocery-list");
const clearBtn = document.querySelector(".clear-btn");

let editElement;
let editFlag = false;
let editId = "";

//// event listeners
// add to list
form.addEventListener("submit", addItem);
// clear list
clearBtn.addEventListener("click", clearItem);
// load items
window.addEventListener("DOMContentLoaded", setupItems);

function addItem(e) {
  e.preventDefault();
  const value = grocery.value;

  const id = new Date().getTime().toString(); // results in miliseconds. It is only to get a unique ID. In serious projects, we will have APIs or we can use external libraries. This is basically a cheat method.

  if (value && !editFlag) {
    // if there's value and editflag is false
    createListItem(id, value);

    // display alert
    displayAlert("item added to the list", "success");

    // show container
    container.classList.add("show-container");

    // add to local storage
    addToLocalStorage(id, value);

    // set back to default
    setBackToDefault();
    //
  } else if (value && editFlag) {
    editElement.innerHTML = value;
    displayAlert("value changed", "success");

    // add to local storage
    editLocalStorage(editId, value);

    // // set back to default
    setBackToDefault();
    //
  } else {
    // if there's no value, we target alert
    displayAlert("please enter a value", "danger");
  }
}

// display alert function
function displayAlert(text, action) {
  //show error msg
  alert.textContent = text;
  alert.classList.add(`alert-${action}`);

  // remove error msg
  setTimeout(() => {
    alert.textContent = "";
    alert.classList.remove(`alert-${action}`);
  }, 1000);
}

// set back to default
function setBackToDefault() {
  grocery.value = "";
  editFlag = false;
  editId = "";
  submit.textContent = "add";
}

// clear items
function clearItem() {
  const items = document.querySelectorAll(".grocery-item");

  if (items.length > 0) {
    items.forEach((item) => {
      list.removeChild(item);
    });
  }

  container.classList.remove("show-container");
  displayAlert("empty list", "danger");
  setBackToDefault();
  localStorage.removeItem("list");
}

////---> Note: since the delete and edit btns exist inside a div that only exists when we add something to the list, we do not have access to these btns. ClearBtn exists outside without any condition so we could access it. But since we do not have access, we have two options: either put event listener on the parent and use bubbling to access the btns and see whether edit was clicked or delete. Or we could use another approach as used in the code above.

function deleteItem(e) {
  // access parent's parent because once item is deleted, the immediate parent that is btn container will be removed
  const element = e.currentTarget.parentElement.parentElement;
  const id = element.dataset.id;
  list.removeChild(element);

  // clear list if it's empty
  if (list.children.length === 0) {
    container.classList.remove("show-container");
  }

  displayAlert("item removed", "danger");
  setBackToDefault();
  removeFromLocalStorage(id);
}

function editItem(e) {
  const element = e.currentTarget.parentElement.parentElement;

  // set edit item
  editElement = e.currentTarget.parentElement.previousElementSibling;

  // set form value
  grocery.value = editElement.innerHTML;
  editFlag = true;
  editId = element.dataset.id;
  submit.textContent = "edit";
}

/////!SECTION COMMENT LOCAL STORAGE

// add to local storage
function addToLocalStorage(id, value) {
  const grocery = { id: id, value: value };
  let items = getLocalStorage();

  items.push(grocery);
  localStorage.setItem("list", JSON.stringify(items));
}

// remove from local storage
function removeFromLocalStorage(id) {
  let items = getLocalStorage();

  items = items.filter((item) => {
    if (item.id !== id) {
      return item;
    }
  });

  localStorage.setItem("list", JSON.stringify(items));
}

// edit local storage
function editLocalStorage(id, value) {
  let items = getLocalStorage();
  items = items.map((item) => {
    if (item.id === id) {
      item.value = value;
    }
    return item;
  });
  localStorage.setItem("list", JSON.stringify(items));
}

// fetch from local storage
function getLocalStorage() {
  return localStorage.getItem("list")
    ? JSON.parse(localStorage.getItem("list"))
    : [];
}

// setup items from localStorage
function setupItems() {
  let items = getLocalStorage();

  if (items.length > 0) {
    items.forEach((item) => {
      createListItem(item.id, item.value);
    });
    container.classList.add("show-container");
  }
}

function createListItem(id, value) {
  const element = document.createElement("article");
  element.classList.add("grocery-item");

  const attr = document.createAttribute("data-id");
  attr.value = id;
  element.setAttributeNode(attr);
  element.innerHTML = `
          <p class="title">${value}</p>
          <div class="btn-container">
            <button type="button" class="edit-btn">
              <i class="fas fa-edit"></i>
            </button>
            <button type="button" class="delete-btn">                <i class="fas fa-trash"></i>
            </button>
          </div>
    `;

  /* --> here we have access to edit and delete btns (see notes just before function deleteItem to understand context) */
  const deleteBtn = element.querySelector(".delete-btn");
  const editBtn = element.querySelector(".edit-btn");

  deleteBtn.addEventListener("click", deleteItem);
  editBtn.addEventListener("click", editItem);

  // add item to the list
  list.appendChild(element);
}

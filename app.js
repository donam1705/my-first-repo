const input = document.getElementById("todoInput");
const addBtn = document.getElementById("addBtn");
const list = document.getElementById("todoList");
const msg = document.getElementById("message");

let todos = JSON.parse(localStorage.getItem("todos") || "[]");

function render() {
  list.innerHTML = "";
  todos.forEach((todo, i) => {
    const li = document.createElement("li");
    const span = document.createElement("span");
    span.textContent = todo.text;
    if (todo.done) li.classList.add("done");

    // Toggle done khi click text
    span.addEventListener("click", () => {
      todos[i].done = !todos[i].done;
      save();
    });

    // Nút edit
    const editBtn = document.createElement("button");
    editBtn.innerHTML = '<i class="fa-solid fa-pen"></i>';
    editBtn.addEventListener("click", () => {
      const newText = prompt("Sửa công việc:", todo.text);
      if (newText) {
        todos[i].text = newText;
        save();
      }
    });

    // Nút delete
    const delBtn = document.createElement("button");
    delBtn.innerHTML = '<i class="fa-solid fa-trash"></i>';
    delBtn.addEventListener("click", () => {
      todos.splice(i, 1);
      save();
    });

    li.appendChild(span);
    const btns = document.createElement("div");
    btns.appendChild(editBtn);
    btns.appendChild(delBtn);
    li.appendChild(btns);

    list.appendChild(li);
  });
}

function save() {
  localStorage.setItem("todos", JSON.stringify(todos));
  render();
}

function addTodo() {
  const text = input.value.trim();
  if (!text) return;
  todos.push({ text, done: false });
  save();
  input.value = "";
  msg.textContent = "Todo item Created Successfully.";
  setTimeout(() => msg.textContent = "", 3000);
}

addBtn.addEventListener("click", addTodo);

input.addEventListener("keypress", (e) => {
  if (e.key === "Enter") addTodo();
});

// Load lại
render();

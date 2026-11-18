const STORAGE_KEY = "daymark.tasks.v1";

const taskForm = document.querySelector("#task-form");
const taskInput = document.querySelector("#task-input");
const taskList = document.querySelector("#task-list");
const emptyState = document.querySelector("#empty-state");
const progress = document.querySelector("#progress");
const notice = document.querySelector("#notice");
const clearCompletedButton = document.querySelector("#clear-completed");
const filterButtons = document.querySelectorAll(".filter-button");

let tasks = loadTasks();
let activeFilter = "all";

function loadTasks() {
  try {
    const savedTasks = localStorage.getItem(STORAGE_KEY);
    if (savedTasks === null) {
      return [];
    }

    const parsedTasks = JSON.parse(savedTasks);
    if (!Array.isArray(parsedTasks)) {
      throw new Error("Saved task data is not a list.");
    }

    return parsedTasks.filter(
      (task) =>
        task !== null &&
        typeof task.id === "string" &&
        typeof task.title === "string" &&
        typeof task.completed === "boolean",
    );
  } catch (error) {
    notice.textContent = "Saved tasks could not be read. Changes may not be saved in this browser.";
    return [];
  }
}

function saveTasks() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
    notice.textContent = "";
  } catch (error) {
    notice.textContent = "Your changes are shown, but this browser could not save them.";
  }
}

function getVisibleTasks() {
  if (activeFilter === "active") {
    return tasks.filter((task) => !task.completed);
  }

  if (activeFilter === "completed") {
    return tasks.filter((task) => task.completed);
  }

  return tasks;
}

function renderTasks() {
  const visibleTasks = getVisibleTasks();
  taskList.replaceChildren();

  for (const task of visibleTasks) {
    const item = document.createElement("li");
    item.className = task.completed ? "task-item is-completed" : "task-item";

    const checkbox = document.createElement("input");
    checkbox.className = "task-checkbox";
    checkbox.type = "checkbox";
    checkbox.checked = task.completed;
    checkbox.setAttribute("aria-label", `Mark "${task.title}" as complete`);
    checkbox.addEventListener("change", () => toggleTask(task.id));

    const title = document.createElement("span");
    title.className = "task-title";
    title.textContent = task.title;

    const deleteButton = document.createElement("button");
    deleteButton.className = "delete-button";
    deleteButton.type = "button";
    deleteButton.textContent = "×";
    deleteButton.setAttribute("aria-label", `Delete "${task.title}"`);
    deleteButton.addEventListener("click", () => deleteTask(task.id));

    item.append(checkbox, title, deleteButton);
    taskList.append(item);
  }

  const completedCount = tasks.filter((task) => task.completed).length;
  progress.textContent = `${completedCount} of ${tasks.length} done`;
  emptyState.hidden = visibleTasks.length > 0;
  taskList.hidden = visibleTasks.length === 0;
}

function addTask(title) {
  tasks.push({
    id: crypto.randomUUID(),
    title,
    completed: false,
  });
  saveTasks();
  renderTasks();
}

function toggleTask(id) {
  tasks = tasks.map((task) =>
    task.id === id ? { ...task, completed: !task.completed } : task,
  );
  saveTasks();
  renderTasks();
}

function deleteTask(id) {
  tasks = tasks.filter((task) => task.id !== id);
  saveTasks();
  renderTasks();
}

taskForm.addEventListener("submit", (event) => {
  event.preventDefault();
  const title = taskInput.value.trim();

  if (title.length === 0) {
    notice.textContent = "Please enter a task before adding it.";
    taskInput.focus();
    return;
  }

  addTask(title);
  taskInput.value = "";
  taskInput.focus();
});

filterButtons.forEach((button) => {
  button.addEventListener("click", () => {
    activeFilter = button.dataset.filter;

    filterButtons.forEach((filterButton) => {
      const isSelected = filterButton === button;
      filterButton.classList.toggle("is-selected", isSelected);
      filterButton.setAttribute("aria-pressed", String(isSelected));
    });

    renderTasks();
  });
});

clearCompletedButton.addEventListener("click", () => {
  tasks = tasks.filter((task) => !task.completed);
  saveTasks();
  renderTasks();
});

renderTasks();

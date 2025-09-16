const STORAGE_KEY = "tasks-app-v1"
let tasks = loadState()
let editingId = null

function saveState() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks))
}

function loadState() {
  const data = localStorage.getItem(STORAGE_KEY)
  return data ? JSON.parse(data) : []
}

const form = document.getElementById("taskForm")
const titleInput = document.getElementById("title")
const descInput = document.getElementById("description")
const dueInput = document.getElementById("dueDate")
const priorityInput = document.getElementById("priority")
const recurringInput = document.getElementById("recurring")
const addBtn = document.getElementById("addBtn")
const cancelEditBtn = document.getElementById("cancelEdit")

const searchInput = document.getElementById("search")
const filterStatus = document.getElementById("filterStatus")
const filterPriority = document.getElementById("filterPriority")
const sortBy = document.getElementById("sortBy")

const listEl = document.getElementById("taskList")
const statsEl = document.getElementById("stats")

function renderList() {
  listEl.innerHTML = ""
  let filtered = [...tasks]

  const q = searchInput.value.trim().toLowerCase()
  if (q) {
    filtered = filtered.filter(
      t =>
        t.title.toLowerCase().includes(q) ||
        (t.description && t.description.toLowerCase().includes(q))
    )
  }

  if (filterStatus.value === "completed") {
    filtered = filtered.filter(t => t.completed)
  } else if (filterStatus.value === "pending") {
    filtered = filtered.filter(t => !t.completed)
  }

  if (filterPriority.value !== "all") {
    filtered = filtered.filter(t => t.priority === filterPriority.value)
  }

  if (sortBy.value === "due") {
    filtered.sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate))
  } else if (sortBy.value === "priority") {
    const order = { high: 1, medium: 2, low: 3 }
    filtered.sort((a, b) => order[a.priority] - order[b.priority])
  }

  for (const task of filtered) {
    const li = document.createElement("li")
    li.className = "task-item"

    const left = document.createElement("div")
    left.className = "left"

    const checkbox = document.createElement("input")
    checkbox.type = "checkbox"
    checkbox.className = "toggle"
    checkbox.checked = task.completed
    checkbox.addEventListener("change", () => toggleTask(task.id))

    const content = document.createElement("div")
    content.className = "content"

    const titleRow = document.createElement("div")
    titleRow.className = "title-row"

    const title = document.createElement("span")
    title.textContent = task.title
    title.className = "title" + (task.completed ? " completed" : "")

    const priority = document.createElement("span")
    priority.textContent = task.priority
    priority.className = "priority " + task.priority

    titleRow.append(title, priority)

    const meta = document.createElement("div")
    meta.className = "meta"
    if (task.dueDate) {
      const d = document.createElement("span")
      d.textContent = "Due: " + task.dueDate
      meta.appendChild(d)
    }
    if (task.recurring && task.recurring !== "none") {
      const r = document.createElement("span")
      r.textContent = "Repeats: " + task.recurring
      meta.appendChild(r)
    }

    if (task.description) {
      const desc = document.createElement("div")
      desc.textContent = task.description
      desc.className = "desc"
      meta.appendChild(desc)
    }

    content.append(titleRow, meta)
    left.append(checkbox, content)

    const right = document.createElement("div")
    right.className = "right"

    const editBtn = document.createElement("button")
    editBtn.textContent = "Edit"
    editBtn.onclick = () => editTask(task.id)

    const delBtn = document.createElement("button")
    delBtn.textContent = "Delete"
    delBtn.onclick = () => deleteTask(task.id)

    right.append(editBtn, delBtn)

    li.append(left, right)
    listEl.appendChild(li)
  }

  updateStats()
}

function updateStats() {
  const total = tasks.length
  const completed = tasks.filter(t => t.completed).length
  const today = tasks.filter(
    t => t.dueDate === new Date().toISOString().split("T")[0]
  ).length
  statsEl.textContent = `Total: ${total} | Completed: ${completed} | Due Today: ${today}`
}

form.addEventListener("submit", e => {
  e.preventDefault()
  const data = {
    title: titleInput.value.trim(),
    description: descInput.value.trim(),
    dueDate: dueInput.value,
    priority: priorityInput.value,
    recurring: recurringInput.value,
    completed: false,
  }
  if (!data.title) return

  if (editingId) {
    const idx = tasks.findIndex(t => t.id === editingId)
    tasks[idx] = { ...tasks[idx], ...data }
    editingId = null
    addBtn.textContent = "Add Task"
    cancelEditBtn.classList.add("invisible")
  } else {
    tasks.push({ id: Date.now(), ...data })
  }

  saveState()
  form.reset()
  renderList()
})

cancelEditBtn.onclick = () => {
  editingId = null
  addBtn.textContent = "Add Task"
  cancelEditBtn.classList.add("invisible")
  form.reset()
}

function toggleTask(id) {
  const t = tasks.find(t => t.id === id)
  if (t) {
    t.completed = !t.completed
    saveState()
    renderList()
  }
}

function editTask(id) {
  const t = tasks.find(t => t.id === id)
  if (!t) return
  titleInput.value = t.title
  descInput.value = t.description
  dueInput.value = t.dueDate
  priorityInput.value = t.priority
  recurringInput.value = t.recurring
  editingId = id
  addBtn.textContent = "Save"
  cancelEditBtn.classList.remove("invisible")
}

function deleteTask(id) {
  tasks = tasks.filter(t => t.id !== id)
  saveState()
  renderList()
}

searchInput.oninput = renderList
filterStatus.onchange = renderList
filterPriority.onchange = renderList
sortBy.onchange = renderList

function initDemo() {
  if (tasks.length === 0) {
    tasks = [
      {
        id: Date.now(),
        title: "Welcome to TaskBoard",
        description: "Add, edit, and organize your tasks.",
        dueDate: new Date().toISOString().split("T")[0],
        priority: "high",
        recurring: "none",
        completed: false,
      },
    ]
    saveState()
  }
}

document.getElementById("themeToggle").onclick = () => {
  document.body.classList.toggle("dark")
  localStorage.setItem(
    "theme",
    document.body.classList.contains("dark") ? "dark" : "light"
  )
}

if (localStorage.getItem("theme") === "dark") {
  document.body.classList.add("dark")
}

initDemo()
renderList()

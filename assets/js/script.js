// Retrieve tasks and nextId from localStorage
let taskList = JSON.parse(localStorage.getItem("tasks")) || [];
let nextId = JSON.parse(localStorage.getItem("nextId")) || 1;

console.log("Initial task list:", taskList);
console.log("Initial nextId:", nextId);

// Generate a unique task id
function generateTaskId() {
  return nextId++;
}

// Save tasks to localStorage
function saveTasks() {
  localStorage.setItem("tasks", JSON.stringify(taskList));
  localStorage.setItem("nextId", JSON.stringify(nextId));
  console.log("Tasks saved to localStorage:", taskList);
}

// Create a task card
function createTaskCard(task) {
  console.log("Creating task card for:", task);
  const card = $(`
    <div class="card task-card mb-2" data-id="${task.id}">
      <div class="card-body">
        <h5 class="card-title">${task.title}</h5>
        <p class="card-text">Due: ${task.dueDate}</p>
        <button class="btn btn-danger btn-sm delete-task">Delete</button>
      </div>
    </div>
  `);
  updateTaskCardColor(card, task.dueDate);
  return card;
}

// Update task card color based on due date
function updateTaskCardColor(card, dueDate) {
  const currentDate = dayjs();
  const due = dayjs(dueDate);

  if (due.isBefore(currentDate, 'day')) {
    card.addClass('bg-danger text-white'); // Overdue
  } else if (due.diff(currentDate, 'day') <= 2) {
    card.addClass('bg-warning text-dark'); // Due soon
  } else {
    card.addClass('bg-success text-white'); // Due later
  }
}

// Render the task list and make cards draggable
function renderTaskList() {
  console.log("Rendering task list...");
  $('#todo-cards, #in-progress-cards, #done-cards').empty();

  taskList.forEach(task => {
    const card = createTaskCard(task);
    console.log("Appending card to", `#${task.status}-cards`, card);
    $(`#${task.status}-cards`).append(card);
  });

  $('.task-card').draggable({
    revert: 'invalid',
    stack: '.task-card',
    helper: 'clone',
    cursor: 'move'
  });

  $('.lane').droppable({
    accept: '.task-card',
    drop: handleDrop
  });

  console.log("Task list rendered:", taskList);
}

// Handle adding a new task
function handleAddTask(event) {
  event.preventDefault();
  console.log("Adding new task...");

  const title = $('#taskTitle').val();
  const dueDate = $('#dueDate').val();

  if (!title || !dueDate) {
    console.log("Invalid task details:", title, dueDate);
    return;
  }

  const task = {
    id: generateTaskId(),
    title,
    dueDate,
    status: 'to-do'
  };

  taskList.push(task);
  saveTasks();
  renderTaskList();

  $('#formModal').modal('hide');
  $('#taskForm')[0].reset();

  console.log("New task added:", task);
}

// Handle deleting a task
function handleDeleteTask(event) {
  console.log("Deleting task...");
  const card = $(event.target).closest('.task-card');
  const id = card.data('id');

  taskList = taskList.filter(task => task.id !== id);
  saveTasks();
  renderTaskList();

  console.log("Task deleted:", id);
}

// Handle dropping a task into a new status lane
function handleDrop(event, ui) {
  console.log("Dropping task...");
  const card = ui.helper;
  const id = card.data('id');
  const newStatus = $(event.target).closest('.lane').attr('id').replace('-cards', '');

  taskList = taskList.map(task => {
    if (task.id === id) {
      task.status = newStatus;
    }
    return task;
  });

  saveTasks();
  renderTaskList();

  console.log("Task moved to new status:", id, newStatus);
}

$(document).ready(function () {
  console.log("Document ready...");
  renderTaskList();

  $('#taskForm').on('submit', handleAddTask);
  $(document).on('click', '.delete-task', handleDeleteTask);

  $('#dueDate').datepicker({
    dateFormat: 'yy-mm-dd'
  });

  $('.lane').droppable({
    accept: '.task-card',
    drop: handleDrop
  });

  console.log("Event handlers set up.");
});

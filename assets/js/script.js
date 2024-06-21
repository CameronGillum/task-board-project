// Retrieve tasks and nextId from localStorage
let taskList = JSON.parse(localStorage.getItem("tasks")) || [];
let nextId = JSON.parse(localStorage.getItem("nextId")) || 1;

// Generate a unique task id
function generateTaskId() {
  return nextId++;
}

// Save tasks to localStorage
function saveTasks() {
  localStorage.setItem("tasks", JSON.stringify(taskList));
  localStorage.setItem("nextId", JSON.stringify(nextId));
}

// Create a task card
function createTaskCard(task) {
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
  $('#todo-cards, #in-progress-cards, #done-cards').empty();

  taskList.forEach(task => {
    const card = createTaskCard(task);
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
}

// Handle adding a new task
function handleAddTask(event) {
  event.preventDefault();

  const title = $('#taskTitle').val();
  const dueDate = $('#dueDate').val();

  if (!title || !dueDate) {
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
}

// Handle deleting a task
function handleDeleteTask(event) {
  const card = $(event.target).closest('.task-card');
  const id = card.data('id');

  taskList = taskList.filter(task => task.id !== id);
  saveTasks();
  renderTaskList();
}

// Handle dropping a task into a new status lane
function handleDrop(event, ui) {
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
}

$(document).ready(function () {
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
});
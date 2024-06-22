// Retrieve tasks and nextId from localStorage
let taskList = JSON.parse(localStorage.getItem("tasks"));
let nextId = JSON.parse(localStorage.getItem("nextId"));

// Todo: create a function to generate a unique task id
function generateTaskId() {
  // Increment nextId and update localStorage
  nextId = nextId + 1 || 1; // If nextId doesn't exist, start from 1
  localStorage.setItem("nextId", JSON.stringify(nextId));
  return nextId;
}

// Todo: create a function to create a task card
function createTaskCard(task) {
  return `
    <div class="card mb-3" id="task-${task.id}">
      <div class="card-body">
        <h5 class="card-title">${task.title}</h5>
        <p class="card-text">${task.description}</p>
        <p class="card-text"><small class="text-muted">Due Date: ${task.dueDate}</small></p>
        <button class="btn btn-danger btn-sm delete-task" data-task-id="${task.id}">Delete</button>
      </div>
    </div>
  `;
}

// Todo: create a function to render the task list and make cards draggable
function renderTaskList() {
  // Clear existing cards
  $('#todo-cards').empty();
  $('#in-progress-cards').empty();
  $('#done-cards').empty();

  // Render tasks
  if (taskList) {
    taskList.forEach(task => {
      let cardHtml = createTaskCard(task);
      switch (task.status) {
        case 'todo':
          $('#todo-cards').append(cardHtml);
          break;
        case 'in-progress':
          $('#in-progress-cards').append(cardHtml);
          break;
        case 'done':
          $('#done-cards').append(cardHtml);
          break;
        default:
          // Handle unexpected status
          break;
      }
    });
  }
}

// Todo: create a function to handle adding a new task
function handleAddTask(event){
  event.preventDefault(); // Prevent default form submission

  // Gather form data
  let task = {
    id: generateTaskId(),
    title: $('#taskTitle').val(),
    description: $('#taskDescription').val(),
    dueDate: $('#taskDueDate').val(),
    status: 'todo' // Initial status
  };

  // Add task to taskList
  taskList.push(task);
  localStorage.setItem("tasks", JSON.stringify(taskList));

  // Render updated task list
  renderTaskList();

  // Reset form fields
  $('#taskForm')[0].reset();

  // Close modal
  $('#formModal').modal('hide');
}

// Todo: create a function to handle deleting a task
function handleDeleteTask(event){
  let taskId = $(event.target).data('task-id');

  // Remove task from taskList
  taskList = taskList.filter(task => task.id !== taskId);
  localStorage.setItem("tasks", JSON.stringify(taskList));

  // Render updated task list
  renderTaskList();
}

// Todo: create a function to handle dropping a task into a new status lane
function handleDrop(event, ui) {
  // Get the id of the dragged element (assuming your task id is set as 'data-task-id' attribute)
  let taskId = ui.draggable.attr('id').replace('task-', '');

  // Get the status of the drop target (assuming 'data-status' attribute is set on the droppable lane)
  let newStatus = $(event.target).closest('.lane').attr('id'); // Adjust this based on your actual structure

  // Find the task in taskList
  let taskIndex = taskList.findIndex(task => task.id == taskId);
  if (taskIndex !== -1) {
    // Update task status in taskList
    taskList[taskIndex].status = newStatus;
    localStorage.setItem("tasks", JSON.stringify(taskList));

    // Move the card to the new lane
    ui.draggable.appendTo($(event.target).closest('.card-body'));

    // Update the id of the moved card to reflect the new status
    ui.draggable.attr('id', `task-${taskId}`);

    // Render updated task list
    renderTaskList();
  } else {
    console.error(`Task with id ${taskId} not found in taskList.`);
  }
}

// Todo: when the page loads, render the task list, add event listeners, make lanes droppable, and make the due date field a date picker
$(document).ready(function () {
  // Initialize taskList and nextId from localStorage
  taskList = JSON.parse(localStorage.getItem("tasks")) || [];
  nextId = JSON.parse(localStorage.getItem("nextId")) || 1;

  // Render initial task list
  renderTaskList();

  // Make task cards draggable
  $('.card').draggable({
    revert: 'invalid',
    cursor: 'move',
    zIndex: 1000,
    containment: 'document',
    helper: 'clone'
  });

  // Make lanes droppable
  $('.lane').droppable({
    accept: '.card',
    drop: handleDrop
  });

  // Initialize date picker
  $('#taskDueDate').datepicker({
    dateFormat: 'yy-mm-dd'
  });

  // Event listener for adding a new task
  $('#taskForm').submit(handleAddTask);

  // Event listener for deleting a task
  $(document).on('click', '.delete-task', handleDeleteTask);
});

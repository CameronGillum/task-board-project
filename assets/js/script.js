// Retrieve tasks and nextId from localStorage
let taskList = JSON.parse(localStorage.getItem("tasks"));
let nextId = JSON.parse(localStorage.getItem("nextId"));

// Todo: create a function to generate a unique task id
function generateTaskId() {
    return nextId++;
}

// Save tasks to localStorage
function saveTasks() {
    localStorage.setItem("tasks", JSON.stringify(taskList));
    localStorage.setItem("nextId", JSON.stringify(nextId));
  }

// Todo: create a function to create a task card
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

// Todo: create a function to render the task list and make cards draggable
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

// Todo: create a function to handle adding a new task
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
// Todo: create a function to handle deleting a task
function handleDeleteTask(event){

}

// Todo: create a function to handle dropping a task into a new status lane
function handleDrop(event, ui) {

}

// Todo: when the page loads, render the task list, add event listeners, make lanes droppable, and make the due date field a date picker
$(document).ready(function () {

});

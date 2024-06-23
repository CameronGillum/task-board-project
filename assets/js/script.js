$(document).ready(function () {
  // Retrieve tasks and nextId from localStorage or initialize if null
  let taskList = JSON.parse(localStorage.getItem("tasks")) || [];
  let nextId = JSON.parse(localStorage.getItem("nextId")) || 1;

  // Function to save tasks to localStorage
  function saveTasks() {
    localStorage.setItem("tasks", JSON.stringify(taskList));
    localStorage.setItem("nextId", JSON.stringify(nextId));
  }

  // Function to create a task card
  function createTaskCard(task) {
    let dueDate = dayjs(task.dueDate);
    let today = dayjs();

    let cardColorClass = '';
    let textColorClass = 'text-dark'; // Default text color

    if (dueDate.isBefore(today, 'day')) {
      // Task is overdue
      cardColorClass = 'bg-danger';
      textColorClass = 'text-white'; // White text color for overdue tasks
    } else if (dueDate.isSame(today, 'day')) {
      // Task is due today
      cardColorClass = 'bg-warning';
    }

    let taskCard = `
      <div class="card task-card mb-3 ${cardColorClass}" id="task-${task.id}" draggable="true">
        <div class="card-body">
          <h5 class="card-title ${textColorClass}">${task.title}</h5>
          <p class="card-text ${textColorClass}">${task.description}</p>
          <p class="card-text ${textColorClass}"><small class="text-muted">Due: ${dueDate.format('YYYY-MM-DD')}</small></p>
          <button type="button" class="btn-close float-end ${textColorClass}" aria-label="Close"></button>
        </div>
      </div>
    `;

    $(`#${task.status}-cards`).append(taskCard);
  }

  // Function to render the task list
  function renderTaskList() {
    $("#todo-cards").empty();
    $("#in-progress-cards").empty();
    $("#done-cards").empty();

    taskList.forEach(task => {
      let cardHtml = createTaskCard(task);
      if (task.status === "todo") {
        $("#todo-cards").append(cardHtml);
      } else if (task.status === "in-progress") {
        $("#in-progress-cards").append(cardHtml);
      } else if (task.status === "done") {
        $("#done-cards").append(cardHtml);
      }
    });

    // Add event listeners for delete buttons
    $(".delete-task-btn").click(handleDeleteTask);

    // Make cards draggable
    $(".task-card").draggable({
      revert: "invalid", // Snap back to original position if dropped in an invalid location
      containment: "document", // Restrict dragging to the document area
      scroll: false, // Disable auto-scrolling while dragging
      zIndex: 100, // Ensure cards appear above other elements while dragging
      start: function(event, ui) {
        $(this).addClass('dragging');
      },
      stop: function(event, ui) {
        $(this).removeClass('dragging');
      }
    });
  }

  // Function to handle adding a new task
  function handleAddTask(event) {
    event.preventDefault();

    let title = $("#taskTitle").val().trim();
    let dueDate = $("#dueDate").val();
    let description = $("#taskDescription").val().trim();

    if (title === "" || dueDate === "") {
      alert("Please enter task title and due date.");
      return;
    }

    let newTask = {
      id: generateTaskId(),
      title: title,
      dueDate: dueDate,
      description: description,
      status: "todo"
    };

    taskList.push(newTask);
    saveTasks();
    renderTaskList();
    $("#formModal").modal("hide");

    // Clear form fields
    $("#taskTitle").val("");
    $("#dueDate").val("");
    $("#taskDescription").val("");
  }

  // Function to handle deleting a task
  function handleDeleteTask(event) {
    let taskId = $(this).data("task-id");
    taskList = taskList.filter(task => task.id !== taskId);
    saveTasks();
    renderTaskList();
  }

  // Function to handle dropping a task into a new status lane
  function handleDrop(event, ui) {
    let taskId = ui.draggable.attr("id").replace("task-", "");
    let newStatus = $(this).attr("id");

    let taskIndex = taskList.findIndex(task => task.id == taskId);
    if (taskIndex !== -1) {
      let currentStatus = taskList[taskIndex].status;

      // Check if the dropped card is being dropped into a different category
      if (currentStatus !== newStatus) {
        taskList[taskIndex].status = newStatus;
        saveTasks();
        renderTaskList();
      } else {
        // Card is being dropped onto its current category, do nothing
        console.log(`Task ${taskId} is already in ${newStatus} category.`);
      }
    } else {
      console.error(`Task with id ${taskId} not found in taskList.`);
    }
  }

  // Initialize the task board
  renderTaskList();

  // Make lanes droppable
  $(".lane").droppable({
    accept: ".task-card", // Only accept draggable task cards
    drop: handleDrop
  });

  // Add event listener for Save Task button
  $("#saveTaskBtn").click(handleAddTask);
});
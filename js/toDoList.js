// Problem: user interaction doesn't provide desired results
//Solution: add interactivity so the user can manage daily tasks

var taskInput = document.getElementById("new-task"); //new-task
var addButton  = document.getElementsByTagName("button")[0]; //first button
var incompleteTasksHolder = document.getElementById("incomplete-tasks"); //incomplete-tasks 
var completedTasksHolder = document.getElementById("completed-tasks"); //completed-tasks holds all of the elements that have  an id of completed
var tasksCompleteNumber = 0;
var tasksIncompleteNumber = 0;
var todoHTML = document.getElementById("todoHTML");
var completedHTML = document.getElementById("completedHTML")
var tasks;
var JSONtasks = [];


//New Task List Item
var createNewTaskElement = function(taskString) {
  //Create List item
  var listItem = document.createElement("li");
  //input (checkbox)
  var checkBox = document.createElement("input");
  //label
  var label = document.createElement("label");
  //input (text)
  var editInput = document.createElement("input");
  //button.edit
  var editButton = document.createElement("button");
  //button.delete
  var deleteButton = document.createElement("button");
  
  //each element needs modifying
  checkBox.type = "checkbox";
  editInput.type = "text";
  
  editButton.innerText = "Edit"; //Might have to use innerHTML
  editButton.className = "edit";
  deleteButton.innerText = "Delete";
  deleteButton.className = "delete";
  
  label.innerText = taskString;
  
  //each element needs to be appended to list item
  listItem.appendChild(checkBox);
  listItem.appendChild(label);
  listItem.appendChild(editInput);
  listItem.appendChild(editButton);
  listItem.appendChild(deleteButton);
  
  return listItem;
}


//Add a new task using the function above
var addTask = function() {
  //Create  a new list item with the text from the #new-task
  var listItem = createNewTaskElement(taskInput.value);

  var temptasks = {
    'task_text': taskInput.value,
    'task_status': 'incomplete',
    'task_action': 'add_task'
  };
  //send the name of the task to the database, must be before taskInput.value change.
  ajax_post(temptasks);
  
  //Apend listItem to incompleteTasksHolder
  incompleteTasksHolder.appendChild(listItem);
  //the second argument in bindTaskEvents tells the checkbox to run taskCompleted if it is ticked
  bindTaskEvents(listItem, taskCompleted);

  taskInput.value = "";

  //Add 1 to # incomplete and display on screen
  tasksIncompleteNumber += 1;
  tellUser();
}


//Delete an existing task
var deleteTask = function() {
  console.log("running delete");
  var listItem = this.parentNode;

  var ul = listItem.parentNode;
  //get the element with the text of the task
  var label = listItem.querySelector("label");

  //loop through tasks, if text matches current text, delete item
  for (var i=0; i <= tasks.length; i++) {
    if (tasks[i]['task_text'] === label.innerText) {
    
      console.log("starting delete");
      //update the database
      tasks[i]['task_action'] = 'delete';
      console.log(tasks[i]);
      ajax_post(tasks[i]);
      tasks[i]['task_action'] = '';
      
        //delete the item from tasks
        tasks.splice(i, 1);
        break;
      };
    }

  //Remove the parent list item from the ul
  ul.removeChild(listItem);

  //if the id of the task is incomplete, one is subtracted from tasksIncompleteNumber
  if (ul.id == "incomplete-tasks") {
    tasksIncompleteNumber -= 1;
    tellUser();
      // else if the id is completed-tasks, one is subtracted from completeTasksNumber
    } else {
      tasksCompleteNumber -= 1;
      tellUser();
    }
  //Update/overwrite tasks in localStorage
  localStorage['tasks'] = JSON.stringify(tasks);
}

var editTask = function() {
  var onlyListItem = this.parentNode;
  var editedInput = onlyListItem.querySelector("input[type=text]");
  var editedLabel = onlyListItem.querySelector("label");
  var oldValue = editedLabel.innerText;

  onlyListItem.className = 'editMode';
  editedInput.value = editedLabel.innerText;
  editedInput.addEventListener('keypress', function (e) {
    var keys = e.which || e.keyCode;
    if (keys === 13) {
      console.log(editedLabel.innerText, editedInput.value)
      editedLabel.innerText = editedInput.value;
      finishEdit(onlyListItem, oldValue);
    }
  });
}
  
var finishEdit = function(lastThis, oldValue){
  var onlyListItem = lastThis;
  var editedInput = onlyListItem.querySelector("input[type=text]");
  var allListItems = document.getElementsByTagName("li");
  var editedLabel = onlyListItem.querySelector("label");

  for (var key in tasks) {
    if (tasks[key]['task_text'] == oldValue) {
      tasks[key]['task_text'] = editedLabel.innerText;
      tasks[key]['task_action']='update';
      
      //update the database
      ajax_post(tasks[key]);
      
      break;
    }
  }
  
  //update(overwrite) localStorage
  localStorage['tasks'] = JSON.stringify(tasks);
  onlyListItem.className = '';
}



//Mark a task as complete
var taskCompleted = function () {
  var listItem = this.parentNode;
  //appendChild moves the listItem donw to completed-tasks
  completedTasksHolder.appendChild(listItem);
  //bindTaskEvents tells the checkbox to run taskIncomplete if it is ticked, again.
  //It also tells the buttons to run their respective functions if they're clicked.
  bindTaskEvents(listItem, taskIncomplete);

  tasksIncompleteNumber -= 1;
  tasksCompleteNumber += 1;
  tellUser();

  var label = listItem.querySelector("label");
  //if a task is marked as complete,
  //tasks[status] will have to be updated
  for (var key in tasks) {
      //set the code to run when the right task is found
      if (tasks[key]['task_text'] === label.innerText) {
        //update the status of the task
        tasks[key]['task_status'] = 'complete';
        //update the action for the database
        tasks[key]['task_action'] = 'make_complete';
        //send info to php file to update db
        ajax_post(tasks[key]);
        //set action to nothing so php file does not do anything when it is checking it later on
        tasks[key]['action'] = '';
        break;
      }
    }
  localStorage['tasks'] = JSON.stringify(tasks);
}


//Mark a task as incomplete
var taskIncomplete = function() {
  console.log("Task incomplete...");
  //Append the task list item to the #incomplete-tasks
  var listItem = this.parentNode;
  incompleteTasksHolder.appendChild(listItem);
  //bindTaskEvents tells the checkbox to run taskCompleted if it is ticked, again.
  bindTaskEvents(listItem, taskCompleted);

  tasksIncompleteNumber += 1;
  tasksCompleteNumber -= 1;
  tellUser();

  var label = listItem.querySelector("label");
  //if a task is marked as complete,
  //tasks[status] will have to be updated
  for (var key in tasks) {
    if (tasks[key]['task_text'] === label.innerText) {
        //update the status of the task
        tasks[key]['task_status'] = "incomplete";
        //update the action for the database
        tasks[key]['task_action'] = 'make_incomplete';
        //info is sent to php file which will take info and update db
        ajax_post(tasks[key]);
        tasks[key]['action'] = '';
          break;
        }
      }
    localStorage['tasks'] = JSON.stringify(tasks);
};




//bindTaskEvents gets the buttons from the listitem with querySelector and adds functionality to the buttons with onclick.
//checkBoxEventHandler is either taskCompleted or taskIncomplete
//the second argument in bindTaskEvents tells the checkbox to run taskCompleted or taskIncomplete if it is ticked
var bindTaskEvents = function(taskListItem, checkBoxEventHandler) {
  //select taskListItem's children
  var checkBox = taskListItem.querySelector("input[type=checkbox]");
  var editButton = taskListItem.querySelector("button.edit");
  var deleteButton =  taskListItem.querySelector("button.delete");
  //causes the editButton to run the editTask when clicked
  editButton.onclick = editTask;
  //causes the deleteButton to run the deleteTask when clicked
  deleteButton.onclick = deleteTask;
  //bind checkBoxEventHandler to the checkbox
  checkBox.onchange = checkBoxEventHandler;
}


var tellUser = function() {
  todoHTML.innerText = tasksIncompleteNumber;
  completedHTML.innerText = tasksCompleteNumber;
}









var populateData = function(newdata) {
  for (var key in newdata) {
    var listItem = createNewTaskElement(newdata[key]['task_text'])
  //Apend listItem to either incompleteTasksHolder or completedTasksHolder
    if (newdata[key]['task_status'] == "incomplete") {
      incompleteTasksHolder.appendChild(listItem);
      bindTaskEvents(listItem, taskCompleted);
    } else {
      completedTasksHolder.appendChild(listItem);
      bindTaskEvents(listItem, taskIncomplete);
      var checkedBoxes = listItem.querySelector("input[type=checkbox]");
      checkedBoxes.checked = true;
    }
  }
  //set the correct amount for tasksCompleteNumber and tasksIncompleteNumber
  for (var key in newdata){
    //find out how many are incomplete
    if (newdata[key]['task_status'] == "incomplete") {
      tasksIncompleteNumber += 1;
      //else add to the tasksCompleteNumber
    } else {
      tasksCompleteNumber += 1;
    }
  }
  //cycle over incompleteTaskHolder ul list items
  for(var i = 0; i < incompleteTasksHolder.children.length; i++) {
    //this loop runs bindTaskEvents as many times as there are incomplete tasks
    //and tells the checkbox to run taskCompleted if it is ticked
    bindTaskEvents(incompleteTasksHolder.children[i], taskCompleted);
  }
  //cycle over completeTasksHolder ul list items
  for(var i = 0; i < completedTasksHolder.children.length; i++) {
    //bind events to list item's children (taskIncomplete)
    bindTaskEvents(completedTasksHolder.children[i], taskIncomplete);
  }
  // Set the click handler to the addTask function
  addButton.addEventListener("click", addTask);
  //user hits enter when adding a new task
  taskInput.addEventListener('keypress', function (e) {
  var key = e.which || e.keyCode;
  if (key === 13) {
    addTask();
  }
});
  tellUser();
};


function IsJsonString(str) {
    try {
        JSON.parse(str);
    } catch (e) {
        return false;
    }
    return true;
}


function ajax_post(inputText){
    // Create our XMLHttpRequest object
    var hr = new XMLHttpRequest();
    // Create some variables we need to send to our PHP file
    var url = "php/todolist.php";
    var taskData = 
      "task_text="+inputText['task_text']+
      "&task_status="+inputText['task_status']+
      "&task_action="+inputText['task_action']+
      "&task_id="+inputText['task_id'];
        console.log(taskData);
    hr.open("POST", url, true);
    // Set content type header information for sending url encoded variables in the request
    //allow php to find stuff in taskData by $_POST['item'];
    hr.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
    // Access the onreadystatechange event for the XMLHttpRequest object
    hr.onreadystatechange = function() {
      if(hr.readyState == 4 && hr.status == 200) {
        //get the data that php is sending back
        var return_data = hr.responseText;
        console.log(return_data);
        //check to see if it is valid JSON and run JSON.parse if it is
        var truetext = IsJsonString(return_data);
        if (truetext) {
          //convert the return_data into an array of objects with JSON.parse
          var newtask = JSON.parse(return_data);
        } else {
        	console.log("This is not valid JSON. Here is the return_data"+"\n"+return_data);
        };
        if (newtask != null) {
          //put the new object into a variable
          var newtaskobj = newtask[0];
          //attach the newtaskobj object (task) to tasks
          tasks.push(newtaskobj);
        };
        
        console.log(tasks);
      }
    }
    // Send the data to PHP now... and wait for response to update the status div
    hr.send(taskData); // Actually execute the request
  }

function ajax_get(){
  console.log("running ajax get");
  // Create our XMLHttpRequest object
  var hr = new XMLHttpRequest();
  // Create some variables we need to send to our PHP file
  var url = "php/todolist.php";
  var taskData = "task_firstopen=taskfirstopen";
  hr.open("POST", url, true);
  // Set content type header information for sending url encoded variables in the request
  hr.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
  // Access the onreadystatechange event for the XMLHttpRequest object
  hr.onreadystatechange = function() {
    if(hr.readyState == 4 && hr.status == 200) {
      console.log("I am running");
      var return_data = hr.responseText;
      JSONtasks = return_data;
      console.log(return_data);
      //check to see if it is valid JSON and run JSON.parse if it is
      var truetext = IsJsonString(return_data);
      if (truetext) {
      console.log(truetext);
      tasks = JSON.parse(JSONtasks);
      console.log(tasks);
      } else {
      	console.log("This is not valid JSON. Here is the return_data"+"\n"+return_data);
      };
      populateData(tasks);
    }
  }
  // Send the data to PHP now... and wait for response to update the status div
  hr.send(taskData); // Actually execute the request
}

//start everything
ajax_get();

//Next, I want to make my code more object oriented.
//To do that, I will need to rearrange all of my code.
//I will put everything into a single object literal.
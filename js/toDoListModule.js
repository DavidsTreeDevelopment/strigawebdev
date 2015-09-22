(function() {
  var tasks = [];
  var toDoList = {
    
    JSONtasks: [],
    tasksCompleteNumber: 0,
    tasksIncompleteNumber: 0,
    init: function(){
      this.cacheDom();
      this.render();
    },
    cacheDom: function(){
      this.taskInput = document.getElementById("new-task");
      this.addButton  = document.getElementsByTagName("button")[0];
      this.incompleteTasksHolder = document.getElementById("incomplete-tasks");
      this.completedTasksHolder = document.getElementById("completed-tasks");
      this.todoHTML = document.getElementById("todoHTML");
      this.completedHTML = document.getElementById("completedHTML");
    },
    render: function(){
      this.ajax_get();
    },
    IsJsonString: function(str){
      try {
        JSON.parse(str);
        } catch (e) {
            return false;
          }
        return true;
    },
    ajax_get: function(){
      //outerscope makes the IsJsonString method visible to the if statement
      var outerscope = this;
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
          var truetext = outerscope.IsJsonString(return_data);
          if (truetext) {
          console.log(truetext);
          tasks = JSON.parse(JSONtasks);
          console.log(tasks);
          } else {
            console.log("This is not valid JSON. Here is the return_data"+"\n"+return_data);
          };
          outerscope.populateData(tasks);
        }
      }
      // Send the data to PHP now... and wait for response to update the status div
      hr.send(taskData); // Actually execute the request
    },
    populateData: function(newdata){
      var outerscope = this; 
      for (var key in newdata) {
          var listItem = this.createNewTaskElement(newdata[key]['task_text'])
        //Apend listItem to either incompleteTasksHolder or completedTasksHolder
          if (newdata[key]['task_status'] == "incomplete") {
            this.incompleteTasksHolder.appendChild(listItem);
            this.bindTaskEvents(listItem, this.taskCompleted);
          } else {
            outerscope.completedTasksHolder.appendChild(listItem);
            outerscope.bindTaskEvents(listItem, outerscope.taskIncomplete);
            var checkedBoxes = listItem.querySelector("input[type=checkbox]");
            checkedBoxes.checked = true;
          }
        }
        //set the correct amount for tasksCompleteNumber and tasksIncompleteNumber
        for (var key in newdata){
          //find out how many are incomplete
          if (newdata[key]['task_status'] == "incomplete") {
            this.tasksIncompleteNumber += 1;
            //else add to the tasksCompleteNumber
          } else {
            outerscope.tasksCompleteNumber += 1;
          }
        }
        //cycle over incompleteTaskHolder ul list items
        for(var i = 0; i < this.incompleteTasksHolder.children.length; i++) {
          //this loop runs bindTaskEvents as many times as there are incomplete tasks
          //and tells the checkbox to run taskCompleted if it is ticked
          this.bindTaskEvents(this.incompleteTasksHolder.children[i], this.taskCompleted);
        }
        //cycle over completeTasksHolder ul list items
        for(var i = 0; i < this.completedTasksHolder.children.length; i++) {
          //bind events to list item's children (taskIncomplete)
          this.bindTaskEvents(this.completedTasksHolder.children[i], this.taskIncomplete);
        }
        // Set the click handler to the addTask function
        this.addButton.addEventListener("click", this.addTask);
        //user hits enter when adding a new task
        this.taskInput.addEventListener('keypress', function (e) {
        var key = e.which || e.keyCode;
        if (key === 13) {
          outerscope.addTask();
        }
      });
        this.tellUser();
    },
    createNewTaskElement: function(taskString){
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
  
    },
    bindTaskEvents: function(taskListItem, checkBoxEventHandler){
      var btescope = this;
      console.log(btescope);
      //select taskListItem's children
      var checkBox = taskListItem.querySelector("input[type=checkbox]");
      var editButton = taskListItem.querySelector("button.edit");
      var deleteButton =  taskListItem.querySelector("button.delete");
      //causes the editButton to run the editTask when clicked
      editButton.onclick = function(){
        btescope.editTask(btescope, editButton);
      }
      //causes the deleteButton to run the deleteTask when clicked
      //WARNING: the deleteButton needs to be inside of a function.http://stackoverflow.com/questions/14425397/onclick-function-runs-automatically
      deleteButton.onclick = function(){
        btescope.deleteTask(deleteButton);
      }
      //bind checkBoxEventHandler to the checkbox
      checkBox.onchange = function(){
        checkBoxEventHandler(btescope, checkBox);
      }
    },
    taskCompleted: function(scope, checkboxscope){
      var listItem = checkboxscope.parentNode;
      console.log(scope);
      console.log(this);
      //appendChild moves the listItem donw to completed-tasks
      scope.completedTasksHolder.appendChild(listItem);
      //bindTaskEvents tells the checkbox to run taskIncomplete if it is ticked, again.
      //It also tells the buttons to run their respective functions if they're clicked.
      scope.bindTaskEvents(listItem, scope.taskIncomplete);

      scope.tasksIncompleteNumber -= 1;
      scope.tasksCompleteNumber += 1;
      scope.tellUser();

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
          scope.ajax_post(tasks[key]);
          //set action to nothing so php file does not do anything when it is checking it later on
          tasks[key]['action'] = '';
          break;
        }
      }
    },
    taskIncomplete: function(scope, checkboxscope){
      console.log("Task incomplete...");
      //Append the task list item to the #incomplete-tasks
      var listItem = checkboxscope.parentNode;
      scope.incompleteTasksHolder.appendChild(listItem);
      //bindTaskEvents tells the checkbox to run taskCompleted if it is ticked, again.
      scope.bindTaskEvents(listItem, scope.taskCompleted);

      scope.tasksIncompleteNumber += 1;
      scope.tasksCompleteNumber -= 1;
      scope.tellUser();

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
          scope.ajax_post(tasks[key]);
          tasks[key]['action'] = '';
          break;
        }
      }
    },
    editTask: function(scope, editbuttonscope){
      var onlyListItem = editbuttonscope.parentNode;
      console.log(onlyListItem);
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
          scope.finishEdit(onlyListItem, oldValue, scope);
        }
      });
    },
    finishEdit: function(lastThis, oldValue, newscope){
      var onlyListItem = lastThis;
      console.log(lastThis);
      var editedInput = onlyListItem.querySelector("input[type=text]");
      var allListItems = document.getElementsByTagName("li");
      var editedLabel = onlyListItem.querySelector("label");

      for (var key in tasks) {
        if (tasks[key]['task_text'] == oldValue) {
          tasks[key]['task_text'] = editedLabel.innerText;
          tasks[key]['task_action']='update';
          
          //update the database
          newscope.ajax_post(tasks[key]);
          
          break;
        }
      }
      onlyListItem.className = '';
    },
    deleteTask: function(delbutscope){
      var listItem = delbutscope.parentNode;
      console.log(this);

      var ul = listItem.parentNode;
      //get the element with the text of the task
      var label = listItem.querySelector("label");

      //loop through tasks, if text matches current text, delete item
      for (var i=0; i <= tasks.length; i++) {
        console.log(tasks.length + " " +tasks);
        if (tasks[i]['task_text'] === label.innerText) {
        
          console.log("starting delete");
          //update the database
          tasks[i]['task_action'] = 'delete';
          console.log(tasks[i]);
          this.ajax_post(tasks[i]);
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
        this.tasksIncompleteNumber -= 1;
        this.tellUser();
        // else if the id is completed-tasks, one is subtracted from completeTasksNumber
      } else {
          tasksCompleteNumber -= 1;
          tellUser();
      }
    },
    addTask: function(){
      //Create  a new list item with the text from the #new-task
      var listItem = this.createNewTaskElement(this.taskInput.value);

      var temptasks = {
        'task_text': this.taskInput.value,
        'task_status': 'incomplete',
        'task_action': 'add_task'
      };
      //send the name of the task to the database, must be before taskInput.value change.
      this.ajax_post(temptasks);
      
      //Apend listItem to incompleteTasksHolder
      this.incompleteTasksHolder.appendChild(listItem);
      //the second argument in bindTaskEvents tells the checkbox to run taskCompleted if it is ticked
      this.bindTaskEvents(listItem, this.taskCompleted);

      this.taskInput.value = "";

      //Add 1 to # incomplete and display on screen
      this.tasksIncompleteNumber += 1;
      this.tellUser();
    },
    tellUser: function(){
      todoHTML.innerText = this.tasksIncompleteNumber;
      completedHTML.innerText = this.tasksCompleteNumber;
    },
    ajax_post: function(inputText){
      var outerscope = this;
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
          var truetext = outerscope.IsJsonString(return_data);
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
  }
  toDoList.init();  
})();









(function() {
  var tasks = [];
  var toDoList = {
    tasksCompleteNumber: 0,
    tasksIncompleteNumber: 0,
    init: function(){
      this.cacheDom();
      
      this.render();
    },
    cacheDom: function(){
      this.$el = $("#toDoListModule");
      this.$addButton = this.$el.find('button');
      this.$taskInput = this.$el.find('#new-task');
      this.$incompleteTasksHolder = this.$el.find('#incomplete-tasks');
      this.$completedTasksHolder = this.$el.find('#completed-tasks');
      this.$todoHTML = this.$el.find("#todoHTML");
      this.$completedHTML = this.$el.find("#completedHTML");
    },
    render: function(){
      this.ajax_get();
    },
    addTask: function(){
      //Create  a new list item with the text from the #new-task
      var listItem = this.createNewTaskElement(this.$taskInput.val());
      //create an object with the information to send to the database
      var temptasks = {
        'task_text': this.$taskInput.val(),
        'task_status': 'incomplete',
        'task_action': 'add_task'
      };
      this.ajax_post(temptasks);
      //Apend the listItem to the $incompleteTasksHolder div and bind the right event to run if its tick box is ticked
      this.$incompleteTasksHolder.append(listItem);
      this.bindTaskEvents(listItem, "incomplete");
      //remove the user's input from the $taskInput box
      this.$taskInput.val("");
      //Add 1 to # incomplete and display on screen
      this.tasksIncompleteNumber += 1;
      this.tellUser();
    },
    deleteTask: function(delbtnscope){
      //this.isRunning("deleteTask");
      //Get the appropriate elements
      var listItem = delbtnscope.parentNode;
      var ul = listItem.parentNode;
      var label = listItem.querySelector("label");
      //loop through tasks, and if text matches current text, update the database with ajax_post, and delete the item from tasks with task.splice
      for (var i=0; i <= tasks.length; i++) {
        if (tasks[i]['task_text'] === label.innerText) {
          tasks[i]['task_action'] = 'delete';
          this.ajax_post(tasks[i]);
          tasks[i]['task_action'] = '';
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
          this.tasksCompleteNumber -= 1;
          this.tellUser();
      }
    },
    editTask: function(taskListItem, editbuttonscope){
      console.log(editbuttonscope);
      console.log(taskListItem);
      //this.isRunning("editTask");
      //Get the appropriate elements (OldValue will be used later and is necessary)
      var onlyListItem = editbuttonscope.parentNode;
      var editedInput = onlyListItem.querySelector("input[type=text]");
      var editedLabel = onlyListItem.querySelector("label");
      var oldValue = editedLabel.innerText;
      //Change the class of the label of the listItem to editMode, turning it into an input instead of label via css, and use the user's input as its placeholder. When the user hits enter, update the value and run finishEdit.
      if(editedInput.value == ''){
        onlyListItem.className = 'editMode';
        editedInput.value = editedLabel.innerText;
        console.log("did it");
      } else {
        editedLabel.innerText = editedInput.value;
          for (var key in tasks) {
            if (tasks[key]['task_text'] == oldValue) {
              tasks[key]['task_text'] = editedLabel.innerText;
              tasks[key]['task_action']='update';
              scope.ajax_post(tasks[key]);
              break;
            }
          }
        onlyListItem.className = '';
        editedInput.value = '';
      }
    },
    changeTaskStatus: function(taskStatus, checkboxscope){
      var listItem = checkboxscope.parentNode;
      var label = listItem.querySelector("label");
      if (taskStatus == "complete") {
        this.$completedTasksHolder.append(listItem);
        this.bindTaskEvents(listItem, "incomplete");
        this.tasksIncompleteNumber -= 1;
        this.tasksCompleteNumber += 1;
        this.tellUser();
        for (var key in tasks) {
          if (tasks[key]['task_text'] === label.innerText) {
            tasks[key]['task_status'] = 'complete';
            tasks[key]['task_action'] = 'make_complete';
            this.ajax_post(tasks[key]);
            tasks[key]['action'] = '';
            break;
          }
        }
      } else {
          this.$incompleteTasksHolder.append(listItem);
          this.bindTaskEvents(listItem, "complete");
          this.tasksIncompleteNumber += 1;
          this.tasksCompleteNumber -= 1;
          this.tellUser();
          for (var key in tasks) {
            if (tasks[key]['task_text'] === label.innerText) {
              tasks[key]['task_status'] = 'incomplete';
              tasks[key]['task_action'] = 'make_incomplete';
              this.ajax_post(tasks[key]);
              tasks[key]['action'] = '';
              break;
            }
          }
        }
    },
    bindEvents: function(){
      var self = this;
      for(var i = 0; i < this.$incompleteTasksHolder.children.length; i++) {
        var taskListItem = this.$incompleteTasksHolder.find("li")[i];
        var editedInput = taskListItem.querySelector("input[type=text]");
        var checkBox = taskListItem.querySelector("[type=checkbox]");
        var editButton = taskListItem.querySelector("button.edit");
        var deleteButton =  taskListItem.querySelector("button.delete");
        //Onclick, make the editButton run editTask.
        editButton.onclick = function(){
          self.editTask(taskListItem, editButton);
        }
        //WARNING: the deleteButton needs to be inside of a function.http://stackoverflow.com/questions/14425397/onclick-function-runs-automatically
        deleteButton.onclick = function(){
          this.deleteTask(deleteButton);
        }
        //When tick box changes, run changeTaskStatus.
        checkBox.onchange = function(){
          self.changeTaskStatus("complete", checkBox);
          console.log("i changed")
        }
        editedInput.addEventListener('keypress', function (e) {
          var keys = e.which || e.keyCode;
          if (keys === 13) {
            btescope.editTask(self, editButton);
          }
        });
      }
      
    },
    bindTaskEvents: function(taskListItem, taskStatus){
      //this.isRunning("bindTaskEvents");

      // var btescope = this;
      // //select taskListItem's children
      // var editedInput = taskListItem.querySelector("input[type=text]");
      // var checkBox = taskListItem.querySelector("[type=checkbox]");
      // var editButton = taskListItem.querySelector("button.edit");
      // var deleteButton =  taskListItem.querySelector("button.delete");
      // //Onclick, make the editButton run editTask.
      // editButton.onclick = function(){
      //   btescope.editTask(btescope, editButton);
      // }
      // //WARNING: the deleteButton needs to be inside of a function.http://stackoverflow.com/questions/14425397/onclick-function-runs-automatically
      // deleteButton.onclick = function(){
      //   btescope.deleteTask(deleteButton);
      // }
      // //When tick box changes, run changeTaskStatus.
      // checkBox.onchange = function(){
      //   btescope.changeTaskStatus(taskStatus, checkBox);
      //   console.log("i changed")
      // }
      // editedInput.addEventListener('keypress', function (e) {
      //   var keys = e.which || e.keyCode;
      //   if (keys === 13) {
      //     btescope.editTask(btescope, editButton);
      //   }
      // });
    },
    createNewTaskElement: function(taskString){
     // this.isRunning("createNewTaskElement");
      //Create the new element containers for the tasks
      var listItem = document.createElement("li");
      var checkBox = document.createElement("input");
      var label = document.createElement("label");
      var editInput = document.createElement("input");
      var editButton = document.createElement("button");
      var deleteButton = document.createElement("button");
      //Modify each element accordingly
      checkBox.type = "checkbox";
      checkBox.className = "checkboxes";
      editInput.type = "text";
      editButton.innerText = "Edit"; //Might have to use innerHTML
      editButton.className = "edit";
      deleteButton.innerText = "Delete";
      deleteButton.className = "delete";
      //Use the text that the user entered as the label's innerText.
      label.innerText = taskString;
      //Append the various elements to the listItem.
      listItem.appendChild(checkBox);
      listItem.appendChild(label);
      listItem.appendChild(editInput);
      listItem.appendChild(editButton);
      listItem.appendChild(deleteButton);
      
      return listItem;
    },
    ajax_post: function(inputText){
      console.log("ajax_post")
      //this.isRunning("ajax_post");
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
      hr.open("POST", url, true);
      // Set content type header information for sending url encoded variables in the request allowing php to find stuff in taskData by $_POST['item'];
      hr.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
      // Access the onreadystatechange event for the XMLHttpRequest object
      hr.onreadystatechange = function() {
        //Once sends the information back, save it in return_data, test if it's real JSON with IsJsonString (parse it if is, log if it isn't), put the new object in newtaskobj(necessary), and add it to tasks
        if(hr.readyState == 4 && hr.status == 200) {
          var return_data = hr.responseText;
          var truetext = outerscope.IsJsonString(return_data);
          if (truetext) {
            var newtask = JSON.parse(return_data);
          } else {
            console.log("This is not valid JSON. Here is the return_data"+"\n"+return_data);
          };
          if (newtask != null) {
            var newtaskobj = newtask[0];
            tasks.push(newtaskobj);
          };
        }
      }
      // Send the data to PHP now... and wait for response to update the status div
      hr.send(taskData); // Actually execute the request
    },
    ajax_get: function(){
      //this.isRunning("ajax_get")
      //outerscope makes the IsJsonString method visible to if statements
      var self = this;
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
          var return_data = hr.responseText;
          //check to see if it is valid JSON and run JSON.parse if it is
          var truetext = self.IsJsonString(return_data);
          if (truetext) {
            tasks = JSON.parse(return_data); 
            } else {
              console.log("This is not valid JSON. Here is the return_data"+"\n"+return_data);
            };
            //Run populateData and udpate the page with the data retrieved from PHP.
            self.populateData(tasks);
            this.$checkBoxes = $(".checkboxes");
            self.bindEvents();
        }
      }
      // Send the taskData to PHP now... and wait for response
      hr.send(taskData); // Actually execute the request
    },
    populateData: function(newdata){
      //this.isRunning("populateData")
      var self = this; 
      //Create a listItem for each task (object) in newdata, check to see if it is complete or incomplete and bind it to the appropriate element.
      for (var key in newdata) {
        var listItem = this.createNewTaskElement(newdata[key]['task_text'])
        if (newdata[key]['task_status'] == "incomplete") {
          this.$incompleteTasksHolder.append(listItem);
          this.bindTaskEvents(listItem, "complete");
        } else {
          self.$completedTasksHolder.append(listItem);
          self.bindTaskEvents(listItem, "incomplete");
          var checkedBoxes = listItem.querySelector("input[type=checkbox]");
          checkedBoxes.checked = true;
        }
      }
      //for each task in newdata, check its task_status, and add the appropriate # to the task counters
      for (var key in newdata){
        if (newdata[key]['task_status'] == "incomplete") {
          this.tasksIncompleteNumber += 1;
        } else {
          self.tasksCompleteNumber += 1;
        }
      }
      // Set the click handler to the addTask function
      this.$addButton.click(function() {
        self.addTask();
      });
      //allow user to hit enter instead of clicking addTask.
      this.$taskInput[0].addEventListener('keypress', function (e) {
        var keys = e.which || e.keyCode;
        if (keys === 13) {
          self.addTask();
        }
      });
      console.log(this.$incompleteTasksHolder.find("li")[0].querySelector("input[type=text]"));
      this.tellUser();
    },
    tellUser: function(){
      //this.isRunning("tellUser");
      this.$todoHTML.html(this.tasksIncompleteNumber);
      this.$completedHTML.html(this.tasksCompleteNumber);
    },
    IsJsonString: function(str){
      try {
        JSON.parse(str);
        } catch (e) {
            return false;
          }
        return true;
    },
    isRunning: function(fnName){
      console.log("hello");
    }
  }

  toDoList.init();  
})();

//For bindTaskEvents, I want to run it once when
//everything has been loaded instead of running it
//each time a new list item is created. Doing so will
//get everything on the page faster.
(function() {
  var tasks = [];
  var toDoList = {
    tasksCompleteNumber: 0,
    tasksIncompleteNumber: 0,
    init: function(){
      this.cacheDom();
      this.bindEvents();
      this.render();
    },
    cacheDom: function(){
      this.$el = $("#toDoListModule");
      this.$addButton = this.$el.find('button');
      this.$taskInput = this.$el.find('#comment');
      this.$incompleteTasksHolder = this.$el.find('#incomplete-tasks');
      this.$completedTasksHolder = this.$el.find('#completed-tasks');
      this.$todoHTML = this.$el.find("#todoHTML");
      this.$completedHTML = this.$el.find("#completedHTML");

    },
    render: function(){
      this.ajax_get();
    },
    bindEvents: function(){
      
    },
    addTask: function(){
      console.log("addTask");
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
      this.bindTaskEvents(listItem, this.taskCompleted);
      //remove the user's input from the $taskInput box
      this.$taskInput.val("");
      //Add 1 to # incomplete and display on screen
      this.tasksIncompleteNumber += 1;
      this.tellUser();
    },
    deleteTask: function(delbutscope){
      console.log("deleteTask");
      //Get the appropriate elements
      var listItem = delbutscope.parentNode;
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
          tasksCompleteNumber -= 1;
          tellUser();
      }
    },
    editTask: function(scope, editbuttonscope){
      console.log("editTask");
      //Get the appropriate elements (OldValue will be used later and is necessary)
      var onlyListItem = editbuttonscope.parentNode;
      var editedInput = onlyListItem.querySelector("textarea");
      var editedLabel = onlyListItem.querySelector("label");
      var oldValue = editedLabel.innerText;
      //Change the class of the label of the listItem to editMode, allowing it to be edited, and use the user's input as its placeholder. When the user hits enter, update the value and run finishEdit.
      onlyListItem.className = 'editMode';
      editedInput.value = editedLabel.innerText;
      editedInput.addEventListener('keypress', function (e) {
        var keys = e.which || e.keyCode;
        if (keys === 13) {
          editedLabel.innerText = editedInput.value;
          scope.finishEdit(onlyListItem, oldValue, scope);
        }
      });
    },
    finishEdit: function(lastThis, oldValue, newscope){
      console.log("finishEdit");
      //Get the appropriate elements
      var onlyListItem = lastThis;
      var editedLabel = onlyListItem.querySelector("label");
      //Using the oldValue of the task, find the right task, update its value, and update the database with ajax_post
      for (var key in tasks) {
        if (tasks[key]['task_text'] == oldValue) {
          tasks[key]['task_text'] = editedLabel.innerText;
          tasks[key]['task_action']='update';
          newscope.ajax_post(tasks[key]);
          break;
        }
      }
      onlyListItem.className = '';
    },
    taskCompleted: function(scope, checkboxscope){
      console.log("taskCompleted");
      var listItem = checkboxscope.parentNode;
      //Append the listItem to the completedTasksHolder div.
      scope.$completedTasksHolder.append(listItem);
      //Bind the right event to do if the tick box is ticked, again.
      scope.bindTaskEvents(listItem, scope.taskIncomplete);
      //Update the tasks# and display it for the user
      scope.tasksIncompleteNumber -= 1;
      scope.tasksCompleteNumber += 1;
      scope.tellUser();
      //Get the label in the listItem. With the for statement, compare each task's task_text to the label's task_text. Once found, update the task_status, task_action, and send the item to PHP to update the database. 
      var label = listItem.querySelector("label");
      for (var key in tasks) {
        if (tasks[key]['task_text'] === label.innerText) {
          tasks[key]['task_status'] = 'complete';
          tasks[key]['task_action'] = 'make_complete';
          scope.ajax_post(tasks[key]);
          tasks[key]['action'] = '';
          break;
        }
      }
    },
    taskIncomplete: function(scope, checkboxscope){
      console.log("taskIncomplete");
      //Get the listItem, append it to the incompleteTaskHolder div, and change the event to be run the next time it is ticked.
      var listItem = checkboxscope.parentNode;
      scope.$incompleteTasksHolder.append(listItem);
      scope.bindTaskEvents(listItem, scope.taskCompleted);
      //Update the tasks# and display it for the user
      scope.tasksIncompleteNumber += 1;
      scope.tasksCompleteNumber -= 1;
      scope.tellUser();
      //Get the label in the listItem, and with the for statement, compare each task's task_text to the label's task_text. Once found, update the task_status, task_action, and send the item to PHP to update the database. 
      var label = listItem.querySelector("label");
      for (var key in tasks) {
        if (tasks[key]['task_text'] === label.innerText) {
          tasks[key]['task_status'] = "incomplete";
          tasks[key]['task_action'] = 'make_incomplete';
          scope.ajax_post(tasks[key]);
          tasks[key]['action'] = '';
          break;
        }
      }
    },
    bindTaskEvents: function(taskListItem, checkBoxEventHandler){
      console.log("bindTaskEvents");
      var btescope = this;
      //select taskListItem's children
      var checkBox = taskListItem.querySelector("[type=checkbox]");
      var editButton = taskListItem.querySelector("button.edit");
      var deleteButton =  taskListItem.querySelector("button.delete");
      //Onclick, make the editButton run editTask.
      editButton.onclick = function(){
        btescope.editTask(btescope, editButton);
      }
      //WARNING: the deleteButton needs to be inside of a function.http://stackoverflow.com/questions/14425397/onclick-function-runs-automatically
      deleteButton.onclick = function(){
        btescope.deleteTask(deleteButton);
      }
    },

    // <li>
    //     <div class="commentText">
    //         <p class="">Hello this is a test comment.</p> <span class="date sub-text">on March 5th, 2014</span>
    //     </div>
    // </li>
    createNewTaskElement: function(taskString){
      console.log("createNewTaskElement")
      //Create the new element containers for the tasks
      var listItem = document.createElement("li");
      var label = document.createElement("label");
      var editInput = document.createElement("textarea");
      var editButton = document.createElement("button");
      var deleteButton = document.createElement("button");
      //Modify each element accordingly
      editInput.type = "text";
      editButton.innerText = "Edit"; //Might have to use innerHTML
      editButton.className = "edit";
      deleteButton.innerText = "Delete";
      deleteButton.className = "delete";
      //Use the text that the user entered as the label's innerText.
      label.innerText = taskString;
      //Append the various elements to the listItem.
      listItem.appendChild(label);
      listItem.appendChild(editInput);
      listItem.appendChild(editButton);
      listItem.appendChild(deleteButton);
      
      return listItem;
    },
    ajax_post: function(inputText){
      console.log("ajax_post");
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
      console.log("ajax_get")
      //outerscope makes the IsJsonString method visible to if statements
      var outerscope = this;
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
          var truetext = outerscope.IsJsonString(return_data);
          if (truetext) {
            tasks = JSON.parse(return_data); 
            } else {
              console.log("This is not valid JSON. Here is the return_data"+"\n"+return_data);
            };
            //Run populateData and udpate the page with the data retrieved from PHP.
            outerscope.populateData(tasks);
        }
      }
      // Send the taskData to PHP now... and wait for response
      hr.send(taskData); // Actually execute the request
    },
    populateData: function(newdata){
      console.log("populateData")
      var outerscope = this; 
      //Create a listItem for each task (object) in newdata, check to see if it is complete or incomplete and bind it to the appropriate element.
      for (var key in newdata) {
        var listItem = this.createNewTaskElement(newdata[key]['task_text'])
        if (newdata[key]['task_status'] == "incomplete") {
          this.$incompleteTasksHolder.append(listItem);
          this.bindTaskEvents(listItem, this.taskCompleted);
        } else {
          outerscope.$completedTasksHolder.append(listItem);
          outerscope.bindTaskEvents(listItem, outerscope.taskIncomplete);
          //console.log(listItem)
          var checkedBoxes = listItem.querySelector("input[type=checkbox]");
          //console.log(checkedBoxes)
          //checkedBoxes.checked = true;
        }
      }
      //for each task in newdata, check its task_status, and add the appropriate # to the task counters
      for (var key in newdata){
        if (newdata[key]['task_status'] == "incomplete") {
          this.tasksIncompleteNumber += 1;
        } else {
          outerscope.tasksCompleteNumber += 1;
        }
      }
      //for each child of the incompleteTasksHolder element, run bindTaskEvents.
      for(var i = 0; i < this.$incompleteTasksHolder.children().length; i++) {
        this.bindTaskEvents(this.$incompleteTasksHolder.children(i)[0], this.taskCompleted);
      }
      //Do the same for completedTasksHolder
      for(var i = 0; i < this.$completedTasksHolder.children().length; i++) {
        this.bindTaskEvents(this.$completedTasksHolder.children(i)[0], this.taskIncomplete);
      }
      // Set the click handler to the addTask function
      this.$addButton.click(function(e){
        e.preventDefault();
        outerscope.addTask();
      });
      //allow user to hit enter instead of clicking addTask.
      this.$taskInput.bind("enterKey",function(e){
             outerscope.addTask();
          });
      this.$taskInput.keyup(function(e){
          if(e.keyCode == 13)
          {
              $(this).trigger("enterKey");
          }
      });
      this.tellUser();
      // this.textResizer();
    },
    tellUser: function(){
      console.log("tellUser");
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
    
    // autoSize: function(outscope){
    //   this.$textareaSize.innerHTML = outscope.$inputval.value + '\n';
    // },
    // textResizer: function(){
    //   var outerscope = this;
    //   this.autoSize(outerscope);
    //   this.$inputval.addEventListener('input', function(){
    //     outerscope.autoSize(outerscope);
    //   });
    // },
    
  }
  toDoList.init(); 
  var inputResizer = {
      cacheDom: function(){
        this.$textContainer = document.querySelector('.textarea-container'),
        this.$textareaSize = this.$textContainer.querySelector('.textarea-size'),
        this.$inputval = this.$textContainer.querySelector('textarea')
      },
      init: function(){
        this.cacheDom();
        this.textResizer();
      },
      autoSize: function(){
        this.$textareaSize.innerHTML = this.$inputval.value + '\n';
        console.log(this);
      },
      textResizer: function(){
        var outerscope = this;
        this.autoSize();
        this.$inputval.addEventListener('input', function(){
        outerscope.autoSize();
      })
    }
  }
  inputResizer.init();

})();



// var textContainer, textareaSize, input;
// var autoSize = function () {
//   console.log("running autoSize")
//   textareaSize.innerHTML = input.value + '\n';
// };

// (function() {
//   console.log("running")
//   textContainer = document.querySelector('.textarea-container');
//   textareaSize = textContainer.querySelector('.textarea-size');
//   input = textContainer.querySelector('textarea');
  
//   autoSize();
//   input.addEventListener('input', autoSize);

// })();
  





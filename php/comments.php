<?php 
    


 $tasktext = $_POST['task_text'];
 $taskstatus = $_POST['task_status'];
 $taskaction = $_POST['task_action'];
 $firstopen = $_POST['task_firstopen'];
 $taskid = $_POST['task_id'];


if ($firstopen == 'taskfirstopen') {
	$connection = mysqli_connect("strigawebdev.com","strigawebdev","5XbBnseV","strigadb") or die("Error " . mysqli_error($connection));

	$sql = "select * from todolist_table";
	$result = mysqli_query($connection, $sql) or die("Error in Selecting " . mysqli_error($connection));

	$emparray = array();
    	while($thing = mysqli_fetch_assoc($result))
    		{
        		$emparray[] = $thing;
    		};
	echo json_encode($emparray);


} else if($taskaction == 'add_task') {
	$connection = mysqli_connect("strigawebdev.com","strigawebdev","5XbBnseV","strigadb") or die("Error " . mysqli_error($connection));
	$sqlAction = "insert into todolist_table (task_text, task_status) values ('$tasktext', '$taskstatus')";
	$action = mysqli_query($connection, $sqlAction) or die("Error in Selecting " . mysqli_error($connection));

	$sqlResult = "SELECT * FROM todolist_table ORDER BY task_id DESC LIMIT 1";
	$result = mysqli_query($connection, $sqlResult) or die("Error in Selecting " . mysqli_error($connection));

	$emparray = array();
    	while($thing = mysqli_fetch_assoc($result))
    		{
        		$emparray[] = $thing;
    		};
	echo json_encode($emparray);


} else if($taskaction == 'delete') {
	$connection = mysqli_connect("strigawebdev.com","strigawebdev","5XbBnseV","strigadb") or die("Error " . mysqli_error($connection));
	$sqlAction = "delete from todolist_table where task_text = ('$tasktext')";
	$action = mysqli_query($connection, $sqlAction) or die("Error in Selecting " . mysqli_error($connection));
	echo json_encode($emparray);

} else if($taskaction == 'update') {
	$connection = mysqli_connect("strigawebdev.com","strigawebdev","5XbBnseV","strigadb") or die("Error " . mysqli_error($connection));
	$sqlAction = "UPDATE todolist_table SET task_text='$tasktext' WHERE task_id='$taskid'";
	$action = mysqli_query($connection, $sqlAction) or die("Error in Selecting " . mysqli_error($connection));

} else if($taskaction == 'make_complete') {
	$connection = mysqli_connect("strigawebdev.com","strigawebdev","5XbBnseV","strigadb") or die("Error " . mysqli_error($connection));
	$sqlAction = "UPDATE todolist_table SET task_status='$taskstatus' WHERE task_text='$tasktext'";
	$action = mysqli_query($connection, $sqlAction) or die("Error in Selecting " . mysqli_error($connection));
	
} else if($taskaction == 'make_incomplete') {
	$connection = mysqli_connect("strigawebdev.com","strigawebdev","5XbBnseV","strigadb") or die("Error " . mysqli_error($connection));
	$sqlAction = "UPDATE todolist_table SET task_status='$taskstatus' WHERE task_text='$tasktext'";
	$action = mysqli_query($connection, $sqlAction) or die("Error in Selecting " . mysqli_error($connection));
};



?>
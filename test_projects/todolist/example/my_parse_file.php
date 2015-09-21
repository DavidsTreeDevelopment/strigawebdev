<?php 
 //    $db = new PDO('mysql:host=127.0.0.1;dbname=strigadb','root','5XbBnseV');
    


 //    $taskname = $_POST['firstname'];

 //    $taskstatus = $_POST['lastname'];

 //    $actions = $db->query("insert into todolist_table (task_name, task_status) values ('$taskname', '$taskstatus')");

 //    $results = $db->query('select * from todolist_table');
    
 //    $tasks = ($results->fetchAll(PDO::FETCH_ASSOC));

 //    $emparray[] = array();
 //    while($row = mysql_fetch_assoc($results))
 //    {
 //        $emparray[] = $row;
 //    }

	// echo 'Task name: '. $taskname . '\n Task status: ' . $taskstatus . ', says the PHP file';

	// echo $emparray;

	// foreach($tasks as $task) {
	//  echo '<li>'.$task["task_name"].', '.$task["task_status"].'</li>';
 //      };


$connection = mysqli_connect("127.0.0.1","root","5XbBnseV","strigadb") or die("Error " . mysqli_error($connection));

$sql = "select * from todolist_table";
$result = mysqli_query($connection, $sql) or die("Error in Selecting " . mysqli_error($connection));
$emparray[] = array();
    while($thing = mysqli_fetch_assoc($result))
    {
        $emparray[] = $thing;
    }

echo json_encode($emparray);





?>
<?php

//remove before flight
ini_set('display_errors', 'On');

    $db = new PDO('mysql:host=structurednotesonline.com;dbname=structur_notes','structur','5XbBnseV');
    
    $results = $db->query('select * from todo');
    
    $tasks = ($results->fetchAll(PDO::FETCH_ASSOC));

    $actions = $db->query('INSERT INTO todo (tasks) VALUES ("go to doctor")');
	

?>
















<!DOCTYPE html>

<html lang="en">

<head>

  <meta charset="UTF-8">
  <title>PHP Data Objects</title>
  <link rel="stylesheet" href="style.css">

</head>

<body id="home">

  <h1>Complete and Incomplete Tasks</h1>

  <ol>
    <?php
       foreach($tasks as $task) {
	 echo '<li>'.$task["tasks"].'</li>';
      };
    ?>
  </ol>

</body>

</html>
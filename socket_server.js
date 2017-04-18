module.exports = function(io){
  var PlayerClass = require('./inc/Player.js');
  var QuestionClass = require('./inc/Question.js');

  var socket_ids = Array();

  var Player = new PlayerClass();
  var players = Player.getList();
  var players_history = Array();
  var Question = new QuestionClass();
  var questions = Question.getList();
  var activing = {"question_id": null,"expiryTime": null};
  var winner = [];
  var giftCounter = 10;

  // console.log(players);
  // console.log(questions);

  io.on('connection', function(socket){

  	var socket_id = socket.id;
  	console.log(socket.id + ': connected');


  	// Player login authentication
  	socket.on('login', function(player_id, kick_current_user){
  	  var playerLogin = Player.login(player_id, socket_id, kick_current_user);

  	  if(!playerLogin.success){
  	  	// Login fail and return the error message
        //changed to show kill previous session alert
  	  	socket.emit('login fail', playerLogin.error_msg);
  	  }else{
  	  	// Login Success
  	  	// if(typeof socket_ids[socket_id] === "undefined"){
  		  socket_ids[socket_id] = {"socket_id":socket_id, "player_id": player_id};
  		  // };
  		  var questions_status = Question.getStatus();
  		// pass Player info, history, question status after login success
  	  	socket.emit('login success', {"player_name": playerLogin.player_info.player_name, "player_history": playerLogin.player_history, "questions_status": questions_status});

  	  }

  	});

  	// Player disconnect and unbind socket id from the player
  	socket.on('disconnect', function(){
  	  var socket_id = socket.id;
  	  // console.log(socket_ids);
  	  if(typeof socket_ids[socket_id] !== "undefined"){
  		var player_id = socket_ids[socket_id]['player_id'];
  		Player.unbindSocket(player_id);
  	  }
  	  console.log(socket_id + ': disconnected');

  	});

  	// Player Submit the answer
  	socket.on('update answer', function(question_id, value){
  	  var socket_id = socket.id,
          result = false;
  	    if(typeof socket_ids[socket_id] !== "undefined"){
  	  	  var questions_status = Question.getStatus();
  			//Check question status is active
  	  		if(questions_status[question_id]["status"] == 1){
  				// console.log(socket_ids);
  				var player_id = socket_ids[socket_id]['player_id'];
          if ( value == Question.questions[question_id]["correct_answer"]) {
            result = true;
          };
  				Player.updateAnswer(player_id, question_id, result);
          io.emit("check bingo board", Player.getHistory(player_id))
  				// console.log(Player.getHistory(player_id));
  			}else{
  				console.log("Cannot submit answer, expiried");
  			}
  	    }
  	});

  	// Host get info
  	socket.on('host getlist', function(){
  	  socket.emit('host getlist', {"questions":questions,"qstatus":Question.getStatus()});
      socket.emit('giftCounter update', giftCounter);
  	});

    socket.on('giftCounter change', function(data){
      giftCounter = data;
    })


    socket.on('requesting validation for question', function(){
      var array = [];
      for (var x in Question.questions) {
        // console.log(Question.questions[""+x]["status"])
        array.push(Question.questions[""+x]["status"])
        // console.log(array);
      }
      //if array has 1 return false else return true
      socket.emit('status validator data', array);
    })
        // console.log(Question.questions["1"]["status"]);
  	// Host request to active a question
  	socket.on('question active request', function(question_id){

  		if(activing.question_id == null){

  		  activing = Question.activeQuestion(question_id);
  		  var expTime = activing.expiryTime.getTime();
        console.log(expTime);
  		  // var timer1 = setInterval(function() {
  		  // 	var nowTime = new Date().getTime();
  		  // 	var theExpTime = expTime;

  		  // 	// console.log(activing.expiryTime.getTime());
  		  // 	// console.log(nowTime);
  		  // 	console.log("Question "+question_id+" activing");

  		  // 	if(nowTime>=theExpTime){
  		  // 		clearInterval(timer1);

  		  // 		console.log("Finish Question " + question_id);
  		  // 		Question.finishQuestion(question_id);1
  		  // 		activing = {"question_id": null,"expiryTime": null};

  		  // 		io.emit('question status updated', Question.questions[question_id], question_id);
  		  // 	}
  		  // },1000);
        socket.on('end question', function(){
          console.log("Finish Question: " + question_id);
          Question.finishQuestion(question_id);1
          activing = {"question_id": null,"expiryTime": null};
          io.emit('question status updated', Question.questions[question_id], question_id);
        });

  		  socket.emit('active question', question_id);
  		  io.emit('question status updated', Question.questions[question_id], question_id);
  		}
  	});


    //Players alert host when win  Bingo
    socket.on("player wins bingo", function(){
      //Set the maximum limit for the game
      if (winner.length <= 1) {
        winner.push(socket_ids[socket.id]['player_id']);
        winner.length == 1 ? io.emit("end game") : null;
      } else {
        io.emit("end game");
      }
    })

  });
}

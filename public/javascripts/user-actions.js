$(function () {
  var socket = io();

  var player_id = getParameterByName('p');
  var token = getParameterByName('t');
  $('#p').val(player_id);

  if(player_id != ""){
    // Submit the login by GET Parameter
    $("header .start").click(function(){
      socket.emit('login', player_id);
    })
  }

  // Show error when login fail
  //changed to alert page
  socket.on('login fail', function(msg){
    // console.log("login fail: " + msg);
    // $('#notification').html('').append('<span>'+msg+'</span>');
    // $('#login').fadeIn();
    $(".start").fadeOut().addClass("hidden");
      $('#notification').fadeIn().removeClass("hidden");
      $("#notification .small-btn").click(function(){
        socket.emit('login', player_id, true);
      })
  });

  $('form').submit(function(){
    // Submit the login by FORM
    socket.emit('login', $('#p').val(), $('#t').val());
    return false;
  });

  // Login success, show the player history.
  socket.on('login success', function(data){
    var player_history = Object.values(data.player_history);
    // $('#login').hide();
    // $('#play').fadeIn();
    // $('#notification').html('');
    $("#player_name").html(data.player_name);
    console.log(data.player_history);
    console.log(data.questions_status);

    // TODO: gen board order by position
    $("header").fadeOut().addClass("hidden");
    $("#play").fadeIn().removeClass("hidden");
    //generate board order by position
    player_history.map( function(data, id){
      $(".question-box:nth-child(" + data["position"] + ")").attr("data-qid", id+1).children().text(id+1)
      if (data["answer"] == true){
        $(".question-box[data-qid='" + parseInt(id+1) + "']").attr("bingo", true);
      }
    })
  });

  // A question started or finished
  socket.on('question status updated', function(data, id){
    var options = data.answers,
        options_values,
        options_keys;
    $('.question-box[data-qid="'+ id +'"] > .status').attr("status", data.status);
    $(".answer").attr("data-qid", id)
    // console.log(data);
    //if a question is being activated
    if (data.status == "1"){
      //reset options
      $(".options").html("");
      $(".question").addClass("playing").find(".question-box[data-qid='" + id + "']").addClass("circle");
      $(".backgorund2").fadeIn().removeClass("hidden");
      options_values = Object.values(options);
      options_values.map(function(value, id){
        var str = "<div><input type='radio' name='answer' id='answer_" + value + "' value='" + value + "'/><label for='answer_" + value + "' class='flex-align-center'><img src='../img/2x" + value + ".png'</label></div>"
        $(".options").append(str);
      });
      $(".answer").fadeIn().removeClass("hidden");
    //if a question is finished
    } else if ( data.status == "2"){
      //hide the buttons
      $(".backgorund2").fadeOut().addClass("hidden")
      $(".question").removeClass("playing").find(".question-box[data-qid='" + id + "']").removeClass("circle");;
      var player_answer = $("input:checked").val();
      console.log($("input:checked"))
      $(".answer").fadeOut().addClass("hidden").find(".options").html("");
      $(".answer").attr("data-qid", "");
      //Circle the question no. if players answer it right
      if ( player_answer == data.correct_answer){
        $(".question-box[data-qid='" + id + "']").attr("bingo", true);
        $(".message img").attr("src","../img/user/correct.png");
        $(".message p").text("Your table hit a Bingo! tryto get a row of it!");
      }else{
        $(".message img").attr("src","../img/user/wrong.png");
        $(".message p").text("looks like your table didtn't get the Bingo");
      }
    }
  });

  //Check players' bingo board
  socket.on("check bingo board", function(data){
    var player_history = Object.values(data),
        board = new Array;
    //get player's board order and answers
    player_history.map(function(data, id){
      var item = {}
      item[data["position"]] = data["answer"];
      board.push(item);
    })
    //sort the order by position
    board.sort(function(a, b){
      return Object.keys(a)[0] - Object.keys(b)[0]
    })
    //convert object to series
    player_history = [];
    board.map(function(data, id){
      player_history.push(Object.values(data)[0])
    })
    //check tic tac toe
    console.log(player_history)
    calculateWinner(player_history) ? socket.emit("player wins bingo") : null
  })

  //When the game ends
  socket.on("end game", function(){
    $(".start").removeClass("border").text("Enjoy the prize and let's get crazy tonight!");
    $("#play").fadeOut().addClass("hidden");
    $("header").fadeIn().removeClass("hidden").css("display","flex");
  })

  // Submit a answer
  $('.submit').on("click", function(){
    if(!$(this).parents(".answer").hasClass("hidden")){
      if ($("input:checked").length > 0){
        var value = $("input:checked").val();
        var question_id = $(".answer").attr("data-qid");
        socket.emit('update answer', question_id, value);
      }
      $(".answer").fadeOut().addClass("hidden");
    }
  });
});

function getParameterByName(name, url) {
    if (!url) {
      url = window.location.href;
    }
    name = name.replace(/[\[\]]/g, "\\$&");
    var regex = new RegExp("[?&]" + name + "(=([^&#]*)|&|#|$)"),
        results = regex.exec(url);
    if (!results) return null;
    if (!results[2]) return '';
    return decodeURIComponent(results[2].replace(/\+/g, " "));
}

function calculateWinner(squares) {
  const lines = [
    [0, 1, 2],
    [3, 4, 5],
    [6, 7, 8],
    [0, 3, 6],
    [1, 4, 7],
    [2, 5, 8],
    [0, 4, 8],
    [2, 4, 6],
  ];
  for (let i = 0; i < lines.length; i++) {
    const [a, b, c] = lines[i];
    if (squares[a] == true && squares[a] === squares[b] && squares[a] === squares[c]) {
      return squares[a];
    }
  }
  return null;
}

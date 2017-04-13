$(function () {
  var questions;
  // $("#question_content").hide();
  $("#host-logo").hide();

  var socket = io();
  // Host Get Info.
  socket.emit('host getlist');
  socket.on('host getlist', function(data){
    console.log(data);
    questions = data.questions;
    qstatus = data.qstatus;

    for(q in qstatus){
      temp_qs = qstatus[q]["status"];
      $('.question-box[data-qid="'+q+'"] > .status').attr("status", temp_qs);
    }
  });


  // send a question active request
  $('.question-box').click(function(){
    // var display_box = $(this).find("span");
    // var value = display_box.html();
    var question_id = $(this).attr("data-qid");
    var question = $(this).find('.status')
    var question_status = question.attr("status");
    if(question_status == "0"){
      socket.emit('question active request', question_id);
    }
  });


  // A question actived
  socket.on('active question', function(question_id){

    $('#question_no').html(question_id);
    $("#question_txt").attr("src", questions[question_id]["question"]);
    $('#answer_txt').html(questions[question_id]["answer_txt"]);
    $('.question-box[data-qid="'+question_id+'"] > .status').attr("status", "1");
    $("#question_content").fadeIn();


  });

  // Question finished
  socket.on('question status updated', function(data){
    qstatus = data;
    for(q in qstatus){
      temp_qs = qstatus[q]["status"];
      $('.question-box[data-qid="'+q+'"] > .status').attr("status", temp_qs);
    }

  });

  //When the game ends
  socket.on("end game", function(){
    $("#host").html("").text("End Game")
  })

  //hide the title
  $("header").click(function(){
    $(this).addClass("hidden");
    $("#host").fadeIn().removeClass("hidden");
    $("#host-logo").show();
  })
});

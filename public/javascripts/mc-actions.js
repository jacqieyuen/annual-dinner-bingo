var questions;
// FUNCTIONS

McActions = {
  getQuestions : function (socket){
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
    },
  hideLandingPage : function (){
      $("header").click(function(){
        $(this).hide();
        $("#host").fadeIn().show();
      });
    },
  questionActiveReq : function (socket){
    $('.question-box').click(function(){
        var question_id = $(this).attr("data-qid");
        var question = $(this).find('.status')
        var question_status = question.attr("status");
        if(question_status == "0"){
          socket.emit('question active request', question_id);
        }
      });
    },
  questionActivated : function (socket){
      socket.on('active question', function(question_id){
        $("#question_txt").attr("src", questions[question_id]["question"]);
        $('.question-box[data-qid="'+question_id+'"] > .status').attr("status", "1");
        $("#question_content").fadeIn();
      });
    },
  questionFinished : function (socket){
      socket.on('question status updated', function(data){
        if (data[0]){
          var qstatus = data[0].status;
          var qid = data[1];
          $('.question-box[data-qid="'+qid+'"] > .status').attr("status", qstatus);
        };
      });
    },
  gameEnd : function (socket){
    socket.on("end game", function(){
      $("#host").html("").text("End Game")
    })
  }
}

// initiate functions
$(function () {
  $("#host").hide();
  var socket = io();
  McActions.getQuestions(socket)
  McActions.hideLandingPage();
  McActions.questionActiveReq(socket);
  McActions.questionActivated(socket);
  McActions.questionFinished(socket);
  McActions.gameEnd(socket);
});

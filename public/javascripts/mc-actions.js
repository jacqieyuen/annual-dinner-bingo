// Global
  var questions;
  var keyboardValues  = {
    32                : 'space',
    48                : 0,
    49                : 1,
    50                : 2,
    51                : 3,
    52                : 4,
    53                : 5,
    54                : 6,
    55                : 7,
    56                : 8,
    57                : 9,
    66                : 'b',
    78                : 'n',
    190               : 'period'
  }
// Functions
  var MC_Actions      = {

    getQuestions      : function (socket){
      socket.emit('host getlist');
      socket.on('host getlist', function(data){
        console.log(data);
        questions = data.questions;
        qstatus = data.qstatus;

        for(q in qstatus){
          temp_qs = qstatus[q]["status"];
          $('.question_mc_box[data-qid="'+q+'"] > .status').attr("status", temp_qs);
        }
      })
    },

    hideLandingPage   : function (){
      $("header").click(function(){
        $(this).hide();
        $("#host").fadeIn().show();
      });
    },

    questionActiveReq : function (socket){
      $(document).on("keypress", function(e) {
        var val = e.which;
        if (val === 49 || val === 50 || val === 51 || val === 52 || val === 53 || val === 54 || val === 55 || val === 56 || val === 57){
          var question_id = keyboardValues[val];
          // console.log(question_id);
          var question = $(".question_mc_box[data-qid='" +question_id+"']").find(".status");
          var question_status = question.attr("status");
          console.log(question_status);
          if(question_status == "0"){
            socket.emit('question active request', question_id);
            $(".question_mc_box[data-qid='" +question_id+"']").find(".circle").show();
          };
        }
      });
      // $('.question-box').click(function(){
      //   var question_id = $(this).attr("data-qid");
      //   var question = $(this).find('.status')
      //   console.log(question);
      //   var question_status = question.attr("status");
      //   console.log(question_status);
      //   if(question_status == "0"){
      //     socket.emit('question active request', question_id);
      //   }
      // });
    },

    questionActivated : function (socket){
      socket.on('active question', function(question_id){
        $("#show_mc_question").attr("src", questions[question_id]["question"]);
        $('.question_mc_box[data-qid="'+question_id+'"] > .status').attr("status", "1");
        $("#question_content").fadeIn();
      });
    },

    questionFinished  : function (socket){
      socket.on('question status updated', function(data){
        if (data[0]){
          var qstatus = data[0].status;
          var qid = data[1];
          $('.question_mc_box[data-qid="'+qid+'"] > .status').attr("status", qstatus);
          $('.question_mc_box[data-qid="'+qid+'"]').find(".circle").hide();
        };
      });
    },

    gameEnd           : function (socket){
      socket.on("end game", function(){
        $("#host").html("").text("End Game")
      });
    },

    initGame          : function (){
      $(function () {
        $("#host").hide();
        $(".circle").hide();
        var socket        = io();
        MC_Actions.getQuestions(socket)
        MC_Actions.hideLandingPage();
        MC_Actions.questionActiveReq(socket);
        MC_Actions.questionActivated(socket);
        MC_Actions.questionFinished(socket);
        MC_Actions.gameEnd(socket);
      });
    }
  }

// START
  MC_Actions.initGame();


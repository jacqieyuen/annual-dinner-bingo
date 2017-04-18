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
    98                : 'b',
    110               : 'n',
    113               : 'q',
    97                : 'a',
    46               : 'period'
  }
  var giftCounter;
// Functions
  var MC_Actions      = {

    hideLandingPage   : function (){
      $(document).on("keypress", function(e){
        var val = e.which;
        // console.log(val);
        if (val === 32){
          $(".mc_board_header").hide();
          $("#host").fadeIn().show();
        }
      });
    },

    giftCounter       : function (socket) {
      socket.on("giftCounter update", function(data){
        giftCounter = data;
        $("#counter").html(giftCounter);
        $(document).on("keypress", function(e){
          var val = e.which;
          if (val === 113 & giftCounter < 10){
            giftCounter++
            socket.emit('giftCounter change', giftCounter);
            // console.log(giftCounter);
            $("#counter").html(giftCounter);
          };
          if (val === 97 & giftCounter > 0){
            giftCounter--
            // console.log(giftCounter);
            $("#counter").html(giftCounter);
            socket.emit('giftCounter change', giftCounter);
          };
        });
      });

    },

    getQuestions      : function (socket){
      socket.emit('host getlist');
      socket.on('host getlist', function(data){
        // console.log(data);
        questions = data.questions;
        // console.log(questions);
        qstatus = data.qstatus;

        for(q in qstatus){
          temp_qs = qstatus[q]["status"];
          $('.question_mc_box[data-qid="'+q+'"] > .status').attr("status", temp_qs);
        }
      })
    },

    questionActiveReq : function (socket){
      $(document).on("keypress", function(e) {
        socket.emit('requesting validation for question');
        socket.on('status validator data', function(data){
          console.log(data)
          // if (data === true) {
            var val = e.which;
            var question_id = '';
            if (val === 49 || val === 50 || val === 51 || val === 52 || val === 53 || val === 54 || val === 55 || val === 56 || val === 57){
              question_id = keyboardValues[val];
              // console.log(question_id);
              var question = $(".question_mc_box[data-qid='" +question_id+"']").find(".status");
              var question_status = question.attr("status");
              console.log(question_status);
              if(question_status == "0"){
                socket.emit('question active request', question_id);
                $(".question_mc_box[data-qid='" +question_id+"']").find(".circle").show();
              };
            };
          // };
        });
      });
    },

    questionActivated : function (socket){
      socket.on('active question', function(question_id){
        $("#show_mc_question").attr("src", questions[question_id]["question"]);
        $('.question_mc_box[data-qid="'+question_id+'"] > .status').attr("status", "1");
        $("#question_content").fadeIn();
      });
    },

    pauseBingo : function (){
      $(document).on("keypress", function(e) {
        var val = e.which;
        // console.log(val);
        if (val === 98) {
          $("#show_mc_question").attr("src", "img/Potato.png");
        };
      });
    },

    pauseSelectQ : function (){
      $(document).on("keypress", function(e) {
        var val = e.which;
        // console.log(val);
        if (val === 110) {
          $("#show_mc_question").attr("src", "img/Potato.png");
        };
      });
    },

    endQuestion : function (socket){
      $(document).on("keypress", function(e) {
        var val = e.which;
        // console.log(val);
        if (val === 46) {
          socket.emit('end question');
          // console.log(val);
        };
      });
    },

    questionFinished  : function (socket){
      socket.on('question status updated', function(data, id){
        // console.log(id);
        // console.log(data)
        if (data.status == 2){
          var qstatus = data.status;
          var qid = id;
          // console.log(qid);
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
        MC_Actions.giftCounter(socket);
        MC_Actions.questionActiveReq(socket);
        MC_Actions.questionActivated(socket);
        MC_Actions.endQuestion(socket);
        MC_Actions.pauseBingo();
        MC_Actions.pauseSelectQ();
        MC_Actions.questionFinished(socket);
        MC_Actions.gameEnd(socket);
      });
    }
  }

// START
  MC_Actions.initGame();


// Global
  var questions;
  var keyboardValues = {
    32  : 'space',
    48  : 0,
    49  : 1,
    50  : 2,
    51  : 3,
    52  : 4,
    53  : 5,
    54  : 6,
    55  : 7,
    56  : 8,
    57  : 9,
    98  : 'b',
    110 : 'n',
    113 : 'q',
    97  : 'a',
    46  : 'period'
  }
  var giftCounter;
// Functions
  var MC_Actions = {

    hideLandingPage: function (val){
      // $(document).on("keypress", function(val){
        if (val === 32){
          $(".mc_board_header").hide();
          $("#host").fadeIn().show();
        }

      // });
    },

    giftCounter: function (socket) {
      socket.on("giftCounter update", function(data){
        giftCounter = data;
        $("#counter").html(giftCounter);
        $(document).on("keypress", function(e){
          var val = e.which;
          if (val === 113 & giftCounter < 10){
            giftCounter++
            socket.emit('giftCounter change', giftCounter);
            $("#counter").html(giftCounter);
          };
          if (val === 97 & giftCounter > 0){
            giftCounter--
            $("#counter").html(giftCounter);
            socket.emit('giftCounter change', giftCounter);
          };
        });
      });

    },

    getQuestions: function (socket){
      socket.emit('host getlist');
      socket.on('host getlist', function(data){
        questions = data.questions;
        qstatus = data.qstatus;
        for(q in qstatus){
          temp_qs = qstatus[q]["status"];
          $('.question_mc_box[data-qid="'+q+'"] > .status').attr("status", temp_qs);
        }
      })
    },

    questionActiveReq: function (socket, val, e){
        socket.emit('requesting validation for question');
        socket.on('status validator data', function(data){
          var permission = data;
          if (permission=== true) {
            // console.log(val)
            var question_id = '';
            if (val === 49 || val === 50 || val === 51 || val === 52 || val === 53 || val === 54 || val === 55 || val === 56 || val === 57){
              question_id = keyboardValues[val];
              var question = $(".question_mc_box[data-qid='" +question_id+"']").find(".status");
              var question_status = question.attr("status");
              if(question_status == "0"){
                socket.emit('question active request', question_id);
                console.log(question_id);
                $(".question_mc_box[data-qid='" +question_id+"']").find(".circle").show();
              };
            };
          };
          // delete e.which;
          // console.log(val)
        });
    },

    questionActivated: function (socket){
      socket.on('active question', function(question_id){
        $("#show_mc_question").attr("src", questions[question_id]["question"]);
        $('.question_mc_box[data-qid="'+question_id+'"] > .status').attr("status", "1");
        $("#question_content").fadeIn();
      });
    },

    pauseBingo: function (val){
        if (val === 98) {
          $("#show_mc_question").attr("src", "img/bingo_time.png");
        };
      // });
    },

    pauseSelectQ: function (val){
        if (val === 110) {
          $("#show_mc_question").attr("src", "img/whats_next.png");

        };
    },

    endQuestion: function (socket, val){
        if (val === 46) {
          socket.emit('question active request');
          socket.emit('end question');
          console.log("ending question with:  "+val);
        };
    },

    questionFinished: function (socket){
      socket.on('question status updated', function(data, id){
        if (data.status == 2){
          var qstatus = data.status;
          var qid = id;
          $('.question_mc_box[data-qid="'+qid+'"] > .status').attr("status", qstatus);
          $('.question_mc_box[data-qid="'+qid+'"]').find(".circle").hide();
        };
      });
    },

    gameEnd: function (socket){
      socket.on("end game", function(){
        $("#host").html("").text("End Game")
      });
    },

    initGame          : function (){
      $(function () {
        $("#host").hide();
        $(".circle").hide();
        var socket        = io();
        $(document).off().on("keypress", function(e) {
          var val = e.which;
          MC_Actions.getQuestions(socket)
          MC_Actions.hideLandingPage(val);
          MC_Actions.giftCounter(socket, val);
          MC_Actions.questionActiveReq(socket, val);
          delete e.which;
          MC_Actions.questionActivated(socket, val);
          MC_Actions.endQuestion(socket, val);
          MC_Actions.pauseBingo(val);
          MC_Actions.pauseSelectQ(val);
          MC_Actions.questionFinished(socket);
          MC_Actions.gameEnd(socket);
        });
      });
    }
  }

// START
  MC_Actions.initGame();


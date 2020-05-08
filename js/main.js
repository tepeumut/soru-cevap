`use strict`;
$(document).ready(() => {
    // system variables...
    let isStart = sessionStorage.getItem('isStart') ? sessionStorage.getItem('isStart') === '1' : false;
    let gameType = sessionStorage.getItem('gameType') ? sessionStorage.getItem('gameType') : false;
    let currentQues = 0;
    let questionTimer = 0;
    let questionPoint = 0;
    let questionCorrect = 0;
    let questionWrong = 0;
    let elapsedTime = 0;
    let questions = [];
    let question = false;
    let timer;
    // system functions...

    let goOfflineQues = () => {
        $("#overlay-text").text("Loading Game...");
        $("#overlay").show(500);
        // load offline
        $.ajax({
            url: "offline-question.html",
            success: (data) => {
                isStart = true;
                gameType = 'offline';
                sessionStorage.setItem('isStart', '1');
                sessionStorage.setItem('gameType', 'offline');
                setTimeout(()=>{
                    $("#app").html(data)
                    $("#overlay").hide(500);
                    $("#start-game-overlay").show();
                }, 1000);
            },
            error: () => {
                alert("System Error!");
            }
        })
    }
    let goIndex = () => {
        $("#start-game-overlay").hide(500);
        $("#overlay-text").text("Loading Game...");
        $("#overlay").show(500);
        // load offline
        $.ajax({
            url: "welcome.html",
            success: (data) => {
                isStart = false;
                gameType = false;
                sessionStorage.setItem('isStart', '0');
                sessionStorage.setItem('gameType', '0');
                setTimeout(()=>{
                    $("#app").html(data)
                    $("#overlay").hide(500);
                }, 1000);
            },
            error: () => {
                alert("System Error!");
            }
        })
    }
    let goScoreBoard = () => {
        $("#overlay-text").text("Loading Score...");
        $("#overlay").show(500);
        // load offline
        $.ajax({
            url: "scoreboard.html",
            success: (data) => {
                isStart = false;
                gameType = false;
                sessionStorage.setItem('isStart', '0');
                sessionStorage.setItem('gameType', '0');
                setTimeout(()=>{
                    $("#app").html(data)
                    $("#overlay").hide(500);
                    $("#scSC").text(questionPoint);
                    $("#scTQ").text(questions.length);
                    $("#scCQ").text(questionCorrect);
                    $("#scWQ").text(questionWrong);
                    $("#scET").text(elapsedTime+ "s");
                }, 1000);
            },
            error: () => {
                alert("System Error!");
            }
        })
    }
    let setQuestionTime = (tm) => {
        questionTimer = tm;
        $("#timer").text(tm);
    }
    let setQuestionPoint = (tm) => {
        questionPoint += tm;
        $("#point").text(questionPoint);
    }
    let startTimer = () => {
         timer = setInterval(() => {
            questionTimer--;
            elapsedTime++;
            setQuestionTime(questionTimer);
            if (questionTimer === 0) {
                $("div[data-id="+question.correct+"]").css({"background-color" : "rgb(38, 137, 12)"}).addClass("blink_me");
                $("div[data-id]").addClass("disabled");
                clearInterval(timer);
                setTimeout(() => {
                    nextQuestion();
                }, 2000);
            }
        }, 1000);
    }
    let nextQuestion = () => {
        currentQues++;
        if (currentQues <= questions.length-1) {
            // next
            $("#currentQuestion").text(currentQues+1);
            getQuestion(currentQues);
        } else {
            goScoreBoard();
        }
    }
    let checkQuestion = (que) => {
        if (que) {
            if (question.correct === que) {
                $("div[data-id="+que+"]").css({"background-color" : "rgb(38, 137, 12)"});
                setQuestionPoint(question.point);
                questionCorrect++;
            } else {
                questionWrong++;
                $("div[data-id="+que+"]").css({"background-color" : "rgb(226, 27, 60)"});
                $("div[data-id="+question.correct+"]").css({"background-color" : "rgb(38, 137, 12)"}).addClass("blink_me");
            }
            clearInterval(timer);
            $("div[data-id]").addClass("disabled");
            setTimeout(() => {
                nextQuestion();
            }, 1000);
        }
    }
    let getQuestion = (id) => {
        if (!questions[id]) {
            $("#overlay-text").text("Game is Over");
            $("#overlay-loader").removeClass("loader").addClass("close");
            $("#overlay").show();
        } else {
            question = questions[id];
            setQuestionTime(question.time);
            $(".question-image").hide();
            $("#question-content").hide();
            $(".question-name").text(question.name);
            if (question.type === 'image') {
                $("#question-image").attr("src", question.image);
                $(".question-image").show(100);
            }
            if (question.type === 'music') {
                $("#question-content").html('<audio controls autoplay>' +
                    '  <source src="'+question.music+'" type="audio/mpeg">' +
                    'Your browser does not support the audio element.' +
                    '</audio>');
                $("#question-content").show();
            }
            if (question.type === 'video') {
                $("#question-content").html('<iframe width="560" height="315" src="'+question.video+'" frameborder="0" allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>');
                $("#question-content").show();
            }
            $("#answers").hide(500).html(' ').show(400);
            // load answers
            $.each(question.answers, (k, v) => {
                $("#answers").append('<div class="answer" data-id="'+v.id+'">' + v.answer +
                    '</div>');
            });
            startTimer();
        }
    };

    let startOfflineGame = () => {
        currentQues = 0;
        questionTimer = 0;
        questionPoint = 0;
        questionCorrect = 0;
        questionWrong = 0;
        $("#start-game-overlay").hide();
        // get questions
        $.getJSON("questions.json", (data) => {
            $.each(data, (k, v) => {
                questions.push(v);
            });
            if (questions.length === 0) {
                $("#overlay-text").text("No Questions Found");
                $("#overlay-loader").removeClass("loader").addClass("close");
                $("#overlay").show();
            } else {
                $("#totalQuestion").text(questions.length);
                $("#currentQuestion").text(currentQues+1);
                // get Question
                getQuestion(currentQues);
            }
        });
    }

    if (isStart === true && gameType === 'offline') {
        goOfflineQues();
    }
    $("#app")
        .on("click", "#start-game", (e) => {
            startOfflineGame();
        })
        .on("click", "#exit-game", (e) => {
            isStart = false;
            gameType = false;
            sessionStorage.removeItem('isStart');
            sessionStorage.removeItem('gameType');
            goIndex();
        })
        .on("click", "#offline-mode",(e) => {
            goOfflineQues();
        })
        .on("click", ".answer",(e) => {
            let id = $($(e)[0].target).data("id");
            checkQuestion(id);
        });
});
$(document).ready(function() {      
  // Initialize Firebase
  var config = {
    apiKey: "AIzaSyCzOkp9drPRIzOgtW3X3TDIcpXzQbJquS4",
    authDomain: "rps-multiplayer-5e4c5.firebaseapp.com",
    databaseURL: "https://rps-multiplayer-5e4c5.firebaseio.com",
    projectId: "rps-multiplayer-5e4c5",
    storageBucket: "rps-multiplayer-5e4c5.appspot.com",
    messagingSenderId: "1007546788385"
  };
  firebase.initializeApp(config);

  var db = firebase.database();

  var MAX_PLAYERS = 2;

  player = {
    name: '',
    win: 0,
    loss: 0,
    choice: '',
    play: true,
    num: 0,
  }
  

//  // temp to remove data:
//   db.ref().child('players').remove();
//   db.ref().child('spectators').remove();
//   db.ref().child('turn').remove();

  // Controls number of players and handles db additions
  $('#name-select').on('click', function(event) {
    event.preventDefault();
    var nam = $('#name-input').val().trim();
    player.name = nam;

    //check to add correct number of players, additional become spectators
    var playref = db.ref().child('players');
    var specref = db.ref().child('spectators')
    playref.once("value")
    .then(function(snapshot) {
        var numplayers = snapshot.numChildren() + 1;
        player.num = numplayers;
        // add player to spectators if over MAX_PLAYERS
        if (numplayers > MAX_PLAYERS) {
            specref.once("value")
            .then(function(snaps) {
                var numspecs = snaps.numChildren() + 1;
                player.play = false;
                player.num = numspecs;
                db.ref().child('spectators').child(numspecs).set(player);
                $('#results-title').text('Hello ' + nam + " you are Spectator" + numspecs);
            });
            //removes spectator on disconnect
            db.ref().child('spectators').child(player.num).onDisconnect().set(null)
            
        } else {
            db.ref().child('players').child(numplayers).set(player);
            //removes player and adds to chat 
            //TODO: figure out how to add chat value
            db.ref().child('players').child(player.num).onDisconnect().set(null);
            $('#results-title').text('Hello ' + nam + " you are Player" + numplayers);
            // if only one player wait for newplayer
            if (numplayers == 1) {
                $('#results-content').text('Please wait for an opponent');
                // hides player 2 select and rotates carousel
                $('#player1').text('Player 1: ' + nam);
                $('#p2select').hide();
                $('#player2Choice').attr('data-interval', '500');
            
            } else {
                // 2 players
                $('#p1select').hide();
                //supposed to rotate value
                $('#player1Choice').attr('data-interval', '500');
                $('#results-content').text('');
                $('#player2').text('Player 2: ' + nam);
                //give some time to display before starting game
                setTimeout(function() {
                    db.ref().child('turn').set(0);
                }, 2000);
            }
        }
        $('#top').hide();
    });

  })

    // ########################################
    // GAME LOGIC
    // ########################################
    var turnref = db.ref().child('turn');
    turnref.on('value', function() {
        //Get value from player 1
        var turn = db.ref().child('turn');
        //ask player1 for
        if (turn == 0){
            $('#results-title').text("Player 1's turn");
            $('#results-content').text("");
            turn.set(1);
        } else if(turn == 2){
            $('#results-title').text("Player 2's turn");
            $('#results-content').text("");
        }
    })

    var play1ref = db.ref().child('players').child('1').child('choice');
    play1ref.on('value', function(snap) {
        var turn = db.ref().child('turn');
        var one = snap.val();
        if(turn == 1 && one != ''){
            turn.set(2);
        }

    })

    var play2ref = db.ref().child('players').child('2').child('choice');
    play2ref.on('value', function(snap) {
        
        var turn = db.ref().child('turn');
        console.log(turn);
        var two = snap.val();
        var one = snap.val();
        var p1 = db.ref().child('players').child('1');
        var p2 = db.ref().child('players').child('2');
        if(turn == 2 && two != '' && one != ''){
            //compare values
            console.log(one == two);
            if(two === one) {
                $('#results-title').text('Tie! you both picked' + one);
            } else if (one == 'rock'){
                if (two == 'scissors') {
                    $('#results-title').text('Player1 Wins!');
                    p1.child('wins').set(p1.child('wins') + 1);
                    p2.child('loss').set(p2.child('loss') + 1);  
                } else {
                    $('#results-title').text('Player2 Wins!');
                    p2.child('wins').set(p2.child('wins') + 1);
                    p1.child('loss').set(p1.child('loss') + 1); 
                }
            } else if (one == 'paper'){
                if (two == 'rock') {
                    $('#results-title').text('Player1 Wins!');
                    p1.child('wins').set(p1.child('wins') + 1);
                    p2.child('loss').set(p2.child('loss') + 1);
                } else {
                    $('#results-title').text('Player2 Wins!');
                    p2.child('wins').set(p2.child('wins') + 1);
                    p1.child('loss').set(p1.child('loss') + 1); 
                }
            } else if (one == 'scissors'){
                if (two == 'paper') {
                    $('#results-title').text('Player1 Wins!');
                    p1.child('wins').set(p1.child('wins') + 1);
                    p2.child('loss').set(p2.child('loss') + 1);
                } else {
                    $('#results-title').text('Player2 Wins!');
                    p2.child('wins').set(p2.child('wins') + 1);
                    p1.child('loss').set(p1.child('loss') + 1); 
                }
            }

            //Update wins/losses
            $('#p1wins').text('Wins: ' + p1.child('wins') + ' Losses: ' +  p1.child('loss'));
            $('#p2wins').text('Wins: ' + p2.child('wins') + ' Losses: ' +  p2.child('loss'));

            //reset buttons, turns, choices
            one.set('');
            two.set('');
            $("#p1select").removeClass('disabled');
            $("#p2select").removeClass('disabled');
            setTimeout(function() {
                db.ref().child('turn').set(0);
            }, 3000);
        }
        
    })
    

    // ########################################
    // BUTTONS & CHAT
    // ########################################
    //Select buttons
    $('#p1select').on('click', function(){
        var ele = $('#player1Choice .carousel-indicators li.active');
        var choice = ele.data('value');
        $("#p1select").addClass('disabled');
        db.ref().child('players').child(player.num).child('choice').set(choice);
    })

    $('#p2select').on('click', function(){
        var ele = $('#player2Choice .carousel-indicators li.active');
        var choice = ele.data('value');
        $("#p2select").addClass('disabled');
        db.ref().child('players').child(player.num).child('choice').set(choice);
    })

    //Chat button
    $('#send').on('click', function(event) {
        event.preventDefault();
        if($('#msg').val() != ''){
            var msg = {text: player.name + ': '+ $('#msg').val(),
                    dateAdded: firebase.database.ServerValue.TIMESTAMP}
            // console.log(msg);
            db.ref().child('chat').push(msg);
            $('textarea').val('');
        }
    })

    //chat listener/re-draw
    db.ref().child('chat').orderByChild("dateAdded").limitToLast(1).on('child_added', function(snap) {
        var newP = $('<p class="chat-text">').text(snap.val().text);
        //weird disconnect on page load error work around
        if(newP.text() != ' disconnected') {
            $('#chat').append(newP);
        }
    })

    //add disconnect to chat
    db.ref().child('chat').onDisconnect().set({last : {text: player.name + ' disconnected',
            dateAdded: firebase.database.ServerValue.TIMESTAMP}});
    
    
})
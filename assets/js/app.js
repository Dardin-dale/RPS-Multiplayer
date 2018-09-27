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
    play: true,
    num: 0
  }

//  // temp to remove data:
//   db.ref().child('players').remove();
//   db.ref().child('spectators').remove();
//   db.ref().child('turn').remove();

  // Controls number of players and 
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
                $('#reults-content').text('Please wait for an opponent');
                // hides player 2 select and rotates carousel
                $('#p2select').hide();
                $('#player2Choice').attr('data-interval', '500');
            
            } else {
                // 2 players
                $('#p1select').hide();
                //supposed to rotate value
                $('#player1Choice').attr('data-interval', '500');
                //give some time to display before starting game
                setTimeout(function() {
                    db.ref().child('turn').set(1);
                }, 2000);
            }
        }
        
    });

  })

    var turnref = db.ref().child('turn');
    //Run Game Logic 
    turnref.on('value', function() {
        //Get value from player 1


        //Get value from player 2


        //compare values and Update page/ wins and losses

    })

    //Chat button
    $('#send').on('click', function(event) {
        event.preventDefault();
        var msg = player.name + ': '+ $('#msg').val();
        db.ref().child('chat').push(msg);
    })

    //chat listener/re-draw
    db.ref().child('chat').orderByChild("dateAdded").limitToLast(1).on('child_added', function(snap) {
        var newP = $('<p>').text(snap.val());

        //add newP to chat card
    })
    
    
})
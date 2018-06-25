function fetchDeck(url, callback) {
  let request = new XMLHttpRequest();
  let hostname = 'https://deckofcardsapi.com/api/deck/';
  request.addEventListener('load', function() {
    callback(request.response);
  })

  request.open('GET', hostname + url);
  request.responseType = 'json';
  request.send();
}

function renderBoard() {
  Handlebars.registerPartial('card_template', $('#card_template').html());
  let cardsTemplate = Handlebars.compile($('#cards_template').html());
  modifyDeck();
  $('#game_board').html(cardsTemplate({cards : deck}));
}

function modifyDeck() {
  if (deckSize === '26') {
    deck = deck.filter (function (card) {
      if (card['suit'] === 'HEARTS' || card['suit'] === 'SPADES') {
        return card
      }
    })
  }
  console.log(deck)
  return deck;
}
function titleAnimation() {
  let position = 1125;
  let multiple = 1;
  while (titleCardAmt > 0) {
    $(`[data-order=card${titleCardAmt}`).animate({
      left: `+=${position}`
    }, 2000 * multiple, function() {
      $(this).animate({
        opacity: '1'
      }, 2000);
    });
    multiple += .2;
    position -= 100;
    titleCardAmt--
  }

  setTimeout(function() {
    $('.title_text').animate({
      opacity: '1'
    }, 2000)
    $('button').css('display', 'inline-block');
  }, 5000)
}

function ruleToggle() {
  $('.tab').on('click', function(e) {
    e.preventDefault();
    let self = this;
    setTimeout(function() {
      $('.tab').toggleClass('hide');
    }, 80)
    $('ul').slideToggle(600);
    if ($('.tab a').text() === 'Show') {
      $('.tab a').text('Hide')
    } else {
      $('.tab a').text('Show')
    }
  })
}

function clearScreen() {
  $("#game_board").empty();
  $('h2').hide();
  $('#guesses').css('opacity', '0');
  $('#pairs').css('opacity', '0');
}

function resetScore() {
  wrongGuesses = 0;
  pairs = 0;
  $('#guesses').text(`Guesses: ${wrongGuesses}`)
  $('#pairs').text(`Pairs: ${pairs}`)
};

function newGame() {
  clearScreen();
  resetScore();
  let url = `${deckId}/draw/?count=52`;

  fetchDeck(deckId +'/shuffle/', function(response1) {
    console.log(response1['shuffled']);
    fetchDeck(url, function (response2) {
      deck = response2['cards'];
    });
  });

  setTimeout(function() {
    renderBoard();
    cardHighlight();
    cardSelection();
    $('#guesses').css('opacity', '1');
    $('#pairs').css('opacity', '1');
  }, 3000)

  $('#game_board').animate({
    opacity : "1"
  }, 6000)
}

function startButton() {
  $('button').on('click', function(e) {
    deckSize = $('option:selected')[0].value;

    if (confirm('Do you want to start a new game?')) {
      newGame();
    }
  })
}

function cardHighlight() {
  $('#game_board').on('mouseover', function(e) {
    $(e.target).closest($('.shade')).css('border', '2px solid #0000ff')
  })

  $('#game_board').on('mouseout', function(e) {
    $(e.target).closest($('.shade')).css('border', '2px solid #619a61')
  })
}

function toggleCard(e) {
  $(e.target).closest($('.shade img')).toggleClass('uncovered');
}

function cardRemoval(card) {
  card.closest('.shade').css('background', '#619a61');
  card.remove();
}

function gameover(deckSize, pairs) {
  if ((deckSize === '52' && pairs === 26) || (deckSize === '26' && pairs === 13)) {
    if(confirm("Would you like to play again?")){
      newGame();
    } else {
      $('#game_board').css('opacity', '0');
      $('#guesses').css('opacity', '0');
      $('#pairs').css('opacity', '0');
      $('h2').text('Thank you for playing!')
      $('h2').show()
    }
  }
}

function checkPair() {
  let first = $($('.uncovered')[0]);
  let second = $($('.uncovered')[1]);
  if (first.attr('data-card') && (first.attr('data-card') === second.attr('data-card'))) {
    cardRemoval(first)
    cardRemoval(second)
    pairs++
    console.log(pairs)
    console.log(first.attr('data-card'));
    console.log(second.attr('data-card'));
    $('#pairs').text(`Pairs: ${pairs}`)
    gameover(deckSize, pairs);
  } else {
    first.toggleClass('uncovered');
    second.toggleClass('uncovered');
    wrongGuesses++;
    $('#guesses').text(`Guesses: ${wrongGuesses}`)
  }
}

function cardSelection() {
  $('#game_board').off('click').on('click', function(e) {
    let exposed = $('.uncovered').length;
    if (exposed === 0) {
      toggleCard(e);
    } else if ( exposed === 1) {
      if ($(e.target)[0] === $('.uncovered')[0]) {
        return false;
      }
      toggleCard(e);
      setTimeout(function () {
        checkPair();
      }, 2000)
    } else {
      return false;
    }
  })
}

let titleCardAmt = 6;
let deckId = 'puf5bf25cc3a';
let deck;
let deckSize;
let wrongGuesses = 0;
let pairs = 0;

$(function() {
  titleAnimation();
  ruleToggle();
  startButton();
});

/*

Shuffle Deck:

https://deckofcardsapi.com/api/deck/puf5bf25cc3a/shuffle/

Draw Cards:

https://deckofcardsapi.com/api/deck/puf5bf25cc3a/draw/?count=2

{
    "success": true,
    "cards": [
        {
            "image": "https://deckofcardsapi.com/static/img/KH.png",
            "value": "KING",
            "suit": "HEARTS",
            "code": "KH"
        },
        {
            "image": "https://deckofcardsapi.com/static/img/8C.png",
            "value": "8",
            "suit": "CLUBS",
            "code": "8C"
        }
    ],
    "deck_id":"3p40paa87x90",
    "remaining": 50
}


Fresh Deck Info:

{"success": true, 
"deck_id": "puf5bf25cc3a", 
"shuffled": true, 
"remaining": 52}

*/
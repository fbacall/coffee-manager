var baseURL = 'http://localhost:3000';

var coffeeColours = ['#522900', '#372819', '#4B3D30', '#522900', '#755433'];
var colourIndex = 0;

var tally = {};
var recentCoffees = [];
var coffeePrice = 0;
var reader;

$(document).ready(function () {

    // Set up reader that listens for card swipes
    reader = new Reader();
    reader.callback = addCoffee;

    // Get coffee price and user list from server
    console.log("Fetching user list");
    $('#chart').html('Loading users...');

    $.ajax({
        url: baseURL + '/price',
        success: function(price){
            coffeePrice = price;
            $.ajax({
                url: baseURL + '/users',
                success: function(users){
                    tally = {};

                    for(var i = 0; i < users.length; i++)
                        tally[users[i]['card_id']] = {name: users[i]['name'], qty: users[i]['total_coffees']};

                    render();
                },
                error: function(XMLHttpRequest, textStatus, errorThrown) {
                    new Popup('Error loading user list').open();
                }
            });
        },
        error: function(XMLHttpRequest, textStatus, errorThrown) {
            new Popup('Error getting coffee price').open();
        }
    });

    // Button behaviour
    $('#check-button').click(function () {
        displayBalance();
    });
});

function render() {
    // Render "highscore" chart
    chart = '<table><tr><th>Name</th><th>Qty</th></tr>';
    for(var key in tally) {
        chart += '<tr id="' + key + '">' +
            '<td>' + tally[key]['name'] + '</td>' +
            '<td>' + tally[key]['qty'] + '</td>' +
            '</tr>'
    }
    chart += '</table>';

    $('#chart').html(chart);

    // Render recent coffee list
    var recent = $('#recent');
    recent.html('');
    for(var i = 0; i < recentCoffees.length; i++) {
        recent.prepend(recentCoffee(recentCoffees[i].name, recentCoffees[i].number));
    }
}

function cost(qty) {
    return (qty * coffeePrice).toFixed(2)
}

function recentCoffee(name, number) {
    var date = new Date();
    var colour = coffeeColours[colourIndex++ % coffeeColours.length];
    return '<div class="recent-coffee" style="border-color: ' + colour + '">' +
        name + ' #' + number + '<br/><em>' + date.toUTCString().slice(0,-3) + '</em></div>';
}

function addCoffee(id) {
    $.ajax({
        type: "POST",
        url: baseURL + '/users/' + id + '/coffees',
        success: function(coffee){
            tally[id].qty += 1;
            colourIndex++;

            recentCoffees.push({name: tally[id].name, number: tally[id].qty});
            if(recentCoffees.length > 5)
                recentCoffees.shift();

            var popup = new Popup(tally[id].name + ' +1 <br/>(' + tally[id].qty + ' total)', 2000);

            popup.onOpen = function () {
                reader.disable();
            };

            popup.onClose = function () {
                reader.enable();
            };

            popup.open();
            render();
        },
        error: function(XMLHttpRequest, textStatus, errorThrown) {
            new Popup(errorThrown, 1000).open();
        }
    });
}

function displayBalance() {
    var popup = new Popup('Swipe your card');
    var cb;

    popup.onOpen = function () {
        cb = reader.callback;
        reader.callback = function (card_id) {
            $.ajax({
                url: baseURL + '/users/' + card_id + '/balance',
                success: function(balance){
                    var msg = '<strong>' + tally[card_id].name + '</strong><br/>Coffees: ' + tally[card_id].qty + '<br/>Balance: ';
                    if(balance < 0)
                        msg += '<span style="color: red">£' + balance + '</span>';
                    else
                        msg += '£' + balance;

                    popup.setMessage(msg);
                },
                error: function(XMLHttpRequest, textStatus, errorThrown) {
                    popup.setMessage('Invalid ID');
                }
            });
        };
    };

    popup.onClose = function () {
        reader.callback = cb;
    };

    popup.open();
}

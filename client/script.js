var coffeeColours = ['#522900', '#372819', '#4B3D30', '#522900', '#755433'];
var colourIndex = 0;

var tally = {};
var recentCoffees = [];
var reader;

$(document).ready(function () {
    reader = new Reader();
    reader.callback = addCoffee;
    render();

    $('#check-button').click( function () {
        displayBalancePrompt();
    } );
});

function render() {
    // Render "highscore" chart
    chart = '<table><tr><th>Name</th><th>Qty</th><th>Cost</th></tr>';
    for(var key in tally) {
        chart += '<tr id="' + key + '">' +
            '<td>' + tally[key]['name'] + '</td>' +
            '<td>' + tally[key]['qty'] + '</td>' +
            '<td>£' + cost(parseInt(tally[key]['qty'])) + '</td>' +
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
    var bulk = Math.floor(qty / 20);
    var rem = qty % 20;
    return (bulk * 5 + rem * 0.3).toFixed(2);
}

function recentCoffee(name, number) {
    var date = new Date();
    var colour = coffeeColours[colourIndex++ % coffeeColours.length];
    return '<div class="recent-coffee" style="border-color: ' + colour + '">' +
        name + ' #' + number + '<br/><em>' + date.toUTCString().slice(0,-3) + '</em></div>';
}

function addCoffee(id) {
    if(tally[id] != null) {
        tally[id].qty += 1;
        colourIndex++;

        recentCoffees.push({name: tally[id].name, number: tally[id].qty});
        if(recentCoffees.length > 5)
            recentCoffees.shift();

        new Popup(name + ' +1 <br/>(' + number + ' total)', 2000).open();
        render();
    } else {
        new Popup('Unrecognized ID: ' + id, 1000).open();
    }
}

function displayBalancePrompt() {
    var popup = new Popup('Swipe your card');
    var cb;

    popup.onOpen = function () {
        cb = reader.callback;
        var p = this;
        reader.callback = function (id) {
            if(tally[id] != null)
                p.setMessage('<strong>' + tally[id].name + '</strong><br/>Coffees: ' + tally[id].qty + '<br/>Balance: £' + cost(tally[id].qty));
            else
                p.setMessage('Invalid ID');
        };
    };

    popup.onClose = function () {
        reader.callback = cb;
    };

    popup.open();
}

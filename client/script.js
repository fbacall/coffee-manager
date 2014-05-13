var coffeeColours = ['#522900', '#372819', '#4B3D30', '#522900', '#755433'];
var colourIndex = 0;

var tally = {'0002748742': {name: 'Finn', qty: 21}};

$(document).ready(function () {

    $('#reader').val('');
    render();

    $('#reader').focus();

    $('#reader').keypress(function (e) {
        if (e.which == 13) { // When "Enter" is pressed
            addCoffee($(this).val());
            render();
            $(this).val('');
        }
    });
});

function render() {
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
}

function cost(qty) {
    var bulk = Math.floor(qty / 20);
    var rem = qty % 20;

    return (bulk * 5 + rem * 0.3).toFixed(2);
}

function recentCoffee(name, number) {
    var date = new Date();
    var colour = coffeeColours[colourIndex];
    if(colourIndex++ == coffeeColours.length-1)
        colourIndex = 0;
    return '<div class="recent-coffee" style="border-color: ' + colour + '">' + name + ' #' + number + '<br/><em>' + date.toUTCString().slice(0,-3) + '</em></div>'
}

function addCoffee(id) {
    tally[id].qty += 1;
    var recent = $('#recent');
    recent.find('.recent-coffee:gt(3)').remove();
    recent.prepend(recentCoffee(tally[id].name, tally[id].qty));
}

function scan() {
    $('#reader').val('0002748742');
    addCoffee($('#reader').val());
    render();
    $('#reader').val('');
}

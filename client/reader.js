// A class to read keypresses into a buffer and call a given callback when the enter key is pressed.

function Reader() {
    this.buffer = '';
    var reader = this;
    $(window).keypress( function (e) { reader.keyIn(e) } ); // Add listener to window
    this.callback = function () {};
    this.active = true;
}

Reader.prototype.keyIn = function (e) {
    if(this.active) {
        if (e.which == 13) { // When "Enter" is pressed
            this.read();
        } else if (e.which <= 122 && e.which >= 48) {
            this.buffer += e.key;
        } else {
            console.log('Ignoring key: ' + e.key + ' (' + e.which + ')');
        }
    }
};

Reader.prototype.enable = function () {
    this.active = true;
};

Reader.prototype.disable = function () {
    this.active = false;
};

Reader.prototype.read = function () {
    if(this.active) {
        var b = this.buffer;
        this.buffer = '';
        this.callback(b);
        return b;
    }
};

var Popup = function (message, duration) {
    this.onClose = function () {};
    this.onOpen = function () {};

    this.element = $("<div class='popup'><span class='message'>" + message + "</span></div>");
    this.element.append($("<div class='popup-footer'>Tap to close</div>"));

    var popup = this;

    if(duration > 0)
        this.timeout = window.setTimeout(function () { popup.close() }, duration);

    this.element.click(function () { popup.close() });
};

Popup.prototype.open = function () {
    if(Popup.openPopups.length == 0)
        $('#overlay').fadeIn(300);

    Popup.openPopups.push(this);
    $('body').append(this.element);
    this.onOpen();
};

Popup.prototype.close = function () {
    window.clearTimeout(this.timeout);

    // Removing an element from an array sucks in javascript
    for(var i = Popup.openPopups.length - 1; i >= 0; i--) {
        if(Popup.openPopups[i] === this) {
            Popup.openPopups.splice(i, 1);
        }
    }

    // Clear the "blackout" overlay if all popups are gone
    if(Popup.openPopups.length == 0)
        $('#overlay').fadeOut(300);

    this.element.remove();
    this.onClose();
};

Popup.prototype.setMessage = function (message) {
    this.element.find('.message').html(message);
};

// List of open popups
Popup.openPopups = [];

/**
 *
 *	== TBPlayer.js ==
 *
 *	@description:   Simple Player for Tumblr, made using HTML5's Audio Object
 *	@author:        Matteo Bernardini
 *	@license:       MIT (2015)
 *	@version:       2.0
 *
 */



// # Constructor Definition # //


/**
 * @constructor: Creates a new player
 *
 * @param  {Element}  element                      The Element instance where the player should be rendered (preferred <div>)
 * @param  {Object}   options                      Options for the player
 *                    │
 *         {Object}   ├ playlist[]                 List of tracks to be played
 *         {string}   │ ├ <MimeType>[]             List of resources for the given MIME type
 *         {string}   │ └ ...[]                    Alternative MIME types
 *                    │
 *         {string}   ├ appearance     ("icons")   Possible values:
 *                    │                             - "icons"  shows controls as icons
 *                    │                             - "text"   shows controls as text, using values from .text property
 *                    │                             - "none"   won't show controls
 *         {Object}   ├ text                       Text values for controls (useful for localization):
 *         {string}   │ ├ play         ("play")    play button text
 *         {string}   │ └ pause        ("pause")   pause button text
 *                    │
 *         {boolean}  ├ showTime       (true)      Wheter to show <elapsed_time>/<total_time> text next to controls or not
 *         {string}   ├ color          ("black")   <CSSColor> for text and/or buttons
 *         {boolean}  ├ loop           (false)     Wheter the playlist should be looped or not
 *         {boolean}  ├ autoplay       (true)      Wheter the player should play the first song on page load or not
 *         {float}    └ volume         (1)         Value in range [0,1] indicating the volume percentage
 *
 */
function TBPlayer(element, options) {

	// assure that the functions is always called as constructor
	if (!this instanceof TBPlayer)
		return new TBPlayer(arguments);

	// private vars
	var apnc = ["icons", "text", "none"],
	    player = new Audio();

	// set default options
	options             = options           || new Object();
	options.playlist    = options.playlist  || new Array();
	options.text        = options.text      || new Array();
	                                                                              // DEFAULT VALUES
	options.loop        =                                     options.loop        || false;
	options.color       =                                     options.color       || "black";
	options.text[0]     =                                     options.text[0]     || "play";
	options.text[1]     =                                     options.text[1]     || "pause";
	options.appearance  = ~apnc.indexOf(options.appearance) ? options.appearance   : "icons";
	options.showTime    = options.showTime!=undefined       ? options.showTime     : true;
	options.autoplay    = options.autoplay!=undefined       ? options.autoplay     : true;
	options.volume      = options.volume!=undefined         ? options.volume       : 1;

	/* CONSTRUCT */

	TBP_INIT = true;


	/* PRIVATE */

	function buildAudioObject(n) {
		var sources = options.playlist[n];

		if (!sources)
			throw new RangeError("tbplayer: index " + n + " not in playlist.");

		// remove old sources
		while (player.lastChild)
			player.removeChild(player.lastChild);

		// add new sources
		for (var mimetype in sources) {
			for (var i=0; src = sources[mimetype][i]; i++) {
				var s = document.createElement("source");
				s.setAttribute("type", mimetype);
				s.setAttribute("src", src);
				player.appendChild(s);
			}
		}

		player.load();
	}


	/* PUBLIC */

	Object.defineProperty(this, "volume", {
		get: function() {
			return player.volume;
		},
		set: function(n) {
			return player.volume = n;
		}
	});

	this.play = function(n) {
		if (typeof(n) == "number") {
			buildAudioObject(n);
		}
		player.play();
	}

	this.pause = function() {
		player.pause();
	}

	// a reference to the player object
	this.playerObject = player;

}

// # PUBLIC STUFF # //

TBP_INIT = false;


// # DOCUMENT BINDINGS # //


// Use pushState to prevent page reload (and thus player reload)
function tbp_loadPage() {
	var xhr = new XMLHttpRequest(),
		url = location.href;
	xhr.open("GET", url, true);
	xhr.onload = function() {
		var dom = (new DOMParser()).parseFromString(xhr.responseText, "text/html");
		document.replaceChild(dom.documentElement, document.documentElement);
	}
	xhr.onerror = function() {
		location.href = url;
	}
	xhr.send();
}

function tbp_triggerPage(e) {
	e = e || window.event;
	if (e.button == 0) { //Execute only if the main button of the mouse has been clicked
		var target = e.target ? e.target : e.srcElement;

		// go upwards through the DOM until a <a> or <area> is found
		while (!target.tagName.match(/^(a|area)$/i) && target!=document.body)
			target = target.parentNode;

		// load DOM only for certain links
		if ( target.tagName.match(/^(a|area)$/i) && !target.href.match(/\.(jpg|png)$/i)
			 && !target.href.match(/^javascript:/) && target.target != "_blank"
			 && (target.target.match(/^_.+$/i) || target.target=="")
		) {

			var link = target.href;

			// ignore external links
			if (!~link.indexOf("://") || link.match(new RegExp("^https?://"+location.host))) {
				if (e.preventDefault)
					e.preventDefault();
				if (history.pushState) {
					history.pushState(null, null, link);
					tbp_loadPage();
				}
				else location.href = link;
			}
		}

	}
}

if (document.addEventListener) {
	document.body.addEventListener("click", tbp_triggerPage, false);
	window.addEventListener("popstate", tbp_loadPage, false);
}

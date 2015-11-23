/*

	Semplice Player realizzato in HTML5 tramite tag <audio>, by (c) Matteo Bernardini 2012-2013
	Versione corrente: 1.3 [beta]
	Ultima revisione: 2014-05-12 18:45

	Mini guida:
	- player.audios è un array di oggetti, dove ogni oggetto è una canzone da eseguire. L'oggetto della canzone ha come chiavi i mime type delle canzoni e come valore accetta una stringa per un unico file, oppure un'array per link alternativi. Le varie canzoni vengono eseguite nell'ordine con cui vengono indicate nell'array.
	- player.loop è un valore booleano che implica la riproduzione ciclica di tutti i brani o meno. [default: false]
	- player.autoplay è un valore booleano che implica la riproduzione automatica o meno. [default: true]
	- player.volume è un numero float n dove 0 <= n <= 1. Indica il volume del player in percentuale. [default: 1]
	- player.color indica il colore dei bottoni e del testo. "white" imposta bottone e testo bianchi, ogni altro valore imposta i bottoni neri e il testo nel colore scelto (è valida la sintassi per l'inserimento dei colori in CSS). [default: null]
	- player.showTime è un valore booleano che indica se mostrare o meno il tempo trascorso/totale delle singole canzoni.
	- player.useButtons assume 3 valori: "icon", "text" e null:
			"icon" mostra i pulsanti play e pausa come icona [default];
			"text" usa le scritte "play" e "pause" come pulsanti;
			null non fa apparire i pulsanti.
	- player.textOfButtons è un array di due stringhe, che sono rispettivamente il testo che dovrà apparire per riprodurre o mettere in pausa l'audio, in caso si abbia impostato player.useButtons a "text". [default: ["play", "pause"]]

*/


//DEFINE AND DEFAULTS
var cicleStarted = false;
var player = player || new Object();
player.audios = player.audios || new Array();
player.loop = player.loop || false;
player.color = player.color || null;
player.showTime = typeof(player.showTime)!="undefined" ? player.shownTime : true;
player.useButtons = typeof(player.useButtons)!="undefined" ? player.useButtons : "icon";
player.textOfButtons = player.textOfButtons || new Array();
player.textOfButtons[0] = player.textOfButtons[0] || "play";
player.textOfButtons[1] = player.textOfButtons[1] || "pause";
player.autoplay = typeof(player.autoplay)!="undefined" ? player.autoplay : true;
player.volume = typeof(player.volume)!="undefined" ? player.volume : 1;

if (player.color == "white") {
player.play="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAB4AAAAeCAYAAAA7MK6iAAAACXBIWXMAAAsTAAALEwEAmpwYAAAAIGNIUk0AAG2pAABztAAA+rUAAICVAABjLgAA5W8AADeFAAAVsCdzXPAAAACWSURBVHja5JY7DgAhCAXxhftfme02xk38AY9iqSwkMyoqzcykIrQb9waNCRamBDbm2CBCA6cI4CInRACOXJcAAnbtSgCB9XIkgISbsiWgiW/E9C2AcMKqwJ8jYILLVlwKboyqlllVKxuYDV7+4coGRoOPuxRlA71gdx+mbOApOLzTVDZwBaY29OmwX/5ObzwAAAD//wMAVUYXU8IObhUAAAAASUVORK5CYII=";
player.pause="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAB4AAAAeCAYAAAA7MK6iAAAACXBIWXMAAAsTAAALEwEAmpwYAAAAIGNIUk0AAG2pAABztAAA+rUAAICVAABjLgAA5W8AADeFAAAVsCdzXPAAAABOSURBVHja7NexCgAgCIRhL3r/V76GpiDcQqrfUZQPb1O2o6JaFFXf9NIIJGkZnollOzp1sa+KGhgYGBgYGBgY+GFY330S/8EDAAD//wMATeIMNobN+UIAAAAASUVORK5CYII=";
}
else {
player.play="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAB4AAAAeCAYAAAA7MK6iAAAACXBIWXMAAAABAAAAAQE4IvRAAAAAJHpUWHRDcmVhdG9yAAB4nHNMyU9KVXBMK0ktUnBNS0tNLikGAEF6Bs7nzXNmAAABXElEQVRIie3WP0hVYRgH4CcyJRBpSIQSsbmtraFBwhCEnFtb29tdnERoCtqDpiJSKFHbFf9GUJBI1uKgWILYtXtvw3c/OMLh4rn33M+lH/zgbM85H+95z+GCcjlz3Yv7OMHvlPANvEQ/ruIUv1Dv9E0MN5A6fuIFHuE2rqSCYw/wCo9xRziJJHDsMd7hCe6iLxUcW8FHPMUIrqeCY2tYwSRGMZAKzvYTpjCGmynh2C+YxjiGUsKx23iGh7iFS6ng2O94jgkMpoRjdzEjzMC1PHiwQ3B2CO9FrCsDnzQ7jjZSxzesoZoH/+0AuotVYeu9wWEeXDa4iQW8Fj46Z1I2nAXfCpOdm7Lgc4NlwYXBduEd4fVYLAq2AteEdbjVAGfxoyhYBK7iq/CE85jDXqvgeeBKA9zAe3zAfrtgM/gPPmM9Ax6VBebBNSwLq20OS8K/VsfTgwfoToH9T7L8Az2N3eELS1onAAAAAElFTkSuQmCC";
player.pause="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAB4AAAAeCAYAAAA7MK6iAAAACXBIWXMAAAABAAAAAQE4IvRAAAAAJHpUWHRDcmVhdG9yAAB4nHNMyU9KVXBMK0ktUnBNS0tNLikGAEF6Bs7nzXNmAAAAp0lEQVRIie3WMYoCQRBG4c/ZScRUzL3A3sBrmG/iebyCiZmpRxAM9gKCYGosyIosY+AGS1MDgiYy9aCTv6r6VWdN1+i1ZH18FPkVFzTBTP03U3LGbySug2yAGcZF/o0VTkVe4RNfwV1z7CNxxBAb95f9P0uMgv4a06C/waRNUj26zatJcYpTnOIUpzjFKe6QOPplXrDGrsi3+An6GxywCGrHZ5ZL3psbywEdBtu70wQAAAAASUVORK5CYII=";
}

//BEGIN

//EDIT DOM
if (window == parent) {
	window.stop();
	document.body.style.overflow="hidden";
	document.body.innerHTML = '<audio id="playerObject"></audio>';
	var doc = document.createElement("iframe");
	doc.src = location.href;
	doc.id = "content";
	doc.setAttribute("frameBorder", "0");
	doc.setAttribute("style", "position:fixed;top:0;left:0;width:100%;height:100%;border:none;");
	document.body.appendChild(doc);
}
else {
	if (player.color == null)
		document.writeln('<div id="player">');
	else
		document.writeln('<div id="player" style="color:'+player.color+'">');

	if (player.useButtons == "icon")
		document.writeln('<img alt="Play" src="'+player.play+'" onclick="parent.player.playPause(this, false)" style="float:left;margin-right:5px;height:1em;position:relative;top:2.5px;" id="playBtn" />');
	else if (player.useButtons == "text")
		document.writeln('<div id="playBtn" onclick="parent.player.playPause(this, false)" style="display:inline;margin-right:5px;">'+player.textOfButtons[0]+'</div>');

	if (player.showTime)
		document.writeln('<div id="shownTime">loading</div>');

	document.writeln("</div>");
	
	if (!parent.cicleStarted) {
		parent.player.cicle(0);
		parent.cicleStarted = true;
	}
	if (parent.playerObject.readyState != 0 && player.showTime) {
		document.getElementById("shownTime").innerHTML = "<span>00:00</span> | <span>loading</span>";
		parent.player.durationTime();
		parent.player.updateTime();
	}
	parent.player.playPause(document.getElementById("playBtn"), true);
	//Mask URL
	function maskUrl(e) {
		e = e || window.event;
		if (e.button==0) { //Execute only if the main button of the mouse has been clicked
			var target = e.target ? e.target : e.srcElement;
			while(!target.tagName.match(/^(a|area)$/i) && target!=document.body) target = target.parentNode;
			if(target.tagName.match(/^(a|area)$/i) && !target.href.match(/.(jpg|png)$/i) && !target.href.match(/^javascript:/) &&
			target.target != "_blank" && (target.target.match(/^_.?$/i) || target.target=="")) {                
				var link = target.href;
				//hash case
				if (target.href.indexOf("#")==0) parent.location.hash = target.href;
				else if (target.href.indexOf("://")!=-1 && target.href.indexOf(location.host)==-1) {
					if (e.preventDefault) e.preventDefault();
					parent.location.href = target.href;
				}
				else {
					if (history.pushState) {
						if (e.preventDefault) e.preventDefault();
						parent.history.pushState(null, null, target.href);
						location.replace(target.href);
					}
					else parent.location.href = target.href;
				}
			}
		}
	}
	if (document.addEventListener) document.body.addEventListener("click", maskUrl, false);
	else document.body.attachEvent("onclick", maskUrl);
	if (history.pushState) parent.onpopstate = function() { self.location.replace(parent.location.href); };
	self.onload=function() { parent.document.title = self.document.title; };
}

//WORKING FUNCTIONS
if (window == parent) {

var playerObject = document.getElementById("playerObject");
player.cicle = function (times) {
	playerObject.innerHTML = "";
	//Prevent multiple event listeners by replacing the <audio> element
	var t = playerObject.cloneNode(true);
	playerObject.parentNode.replaceChild(t, playerObject);
	playerObject = t;
	delete t;
	//do the rest
	for (var type in player.audios[times]) {
		if (typeof(player.audios[times][type])=="string") {
			var a = document.createElement("source");
			a.setAttribute("type", type);
			a.setAttribute("src", player.audios[times][type]);
			playerObject.appendChild(a);
		}
		else {
			for (var source in player.audios[times][type]) {
				var b = document.createElement("source");
				b.setAttribute("type", type);
				b.setAttribute("src", player.audios[times][type][source]);
				playerObject.appendChild(b);
			}
		}
	}
	playerObject.load();
	playerObject.volume = player.volume;
	if (((typeof(window.localStorage)=="undefined" || (window.localStorage && !localStorage["notDisturb"])) && player.autoplay) || player.autoplay==null)
		playerObject.play();
	player.playPause(document.getElementById("content").contentDocument.getElementById("playBtn"), true);
	playerObject.addEventListener("ended", function() { if (times+1<player.audios.length) player.cicle(times+1); else if (player.loop) player.cicle(0); }, true);
}

player.playPause = function (btn, checkOnly) {
	if (player.autoplay!=null) player.autoplay=null;
	if (player.useButtons!=null) {
		var isIco = player.useButtons == "icon" ? true : false;
		if (!playerObject.paused) {
			if (!checkOnly) {
				playerObject.pause();
				if (isIco) {
					btn.src=player.play;
					btn.alt="play";
				}
				else btn.innerText = player.textOfButtons[0];
			}
			else {
				if (isIco) {
					btn.src=player.pause;
					btn.alt="pause";
				}
				else btn.innerText = player.textOfButtons[1];
			}
		}
		else {
			if (!checkOnly) {
				playerObject.play();
				if (isIco) {
					btn.src=player.pause;
					btn.alt="pause";
				}
				else btn.innerText = player.textOfButtons[1];
			}
			else {
				if (isIco) {
					btn.src=player.play;
					btn.alt="play";
				}
				else btn.innerText = player.textOfButtons[0];
			}
		}
	}
}	

if (player.showTime) {
	player.updateTime = function() {
		var tim = playerObject.currentTime;
		var min = (tim/60)<10 ? "0"+parseInt(tim/60) : parseInt(tim/60);
		var sec = (tim%60)<10 ? "0"+parseInt(tim%60) : parseInt(tim%60);
		try { document.getElementById("content").contentDocument.getElementById("shownTime").children[0].innerHTML = min+":"+sec; }
		catch(e) {}
	}
	player.durationTime = function() {
		var tim = playerObject.duration;
		var min = (tim/60)<10 ? "0"+parseInt(tim/60) : parseInt(tim/60);
		var sec = (tim%60)<10 ? "0"+parseInt(tim%60) : parseInt(tim%60);
		try { document.getElementById("content").contentDocument.getElementById("shownTime").children[1].innerHTML = min+":"+sec; }
		catch(e) {}
	}
	playerObject.addEventListener("loadeddata", function() {
		try { document.getElementById("content").contentDocument.getElementById("shownTime").innerHTML = "<span>00:00</span> | <span>loading</span>"; }
		catch(e) {}
		player.durationTime();
		playerObject.addEventListener("timeupdate", player.updateTime, true);
	}, true);
}
	
}
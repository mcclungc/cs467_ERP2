var hostName = document.location.host;
var style = document.getElementsByTagName("link");
var i;

for(i = 0; i < style.length; i++){
	style[i].href = hostname + style[i].href;
}
 


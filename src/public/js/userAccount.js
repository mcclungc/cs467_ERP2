var updateSig = document.getElementById("updateSig");
var sigChange = document.getElementById("sigChange");
var sigPad = document.getElementById("signaturePad")
var clearButton = document.getElementById("clearFunc")
var submitSigButton = document.getElementById("submitSig")
var uploadSigButton = document.getElementById("uploadSig")
var submitUploadedSigButton = document.getElementById("submitUploadedSig")

//Event Listeners
submitSigButton.addEventListener("click",sendHandDrawnSigToDatabase)
updateSig.addEventListener("click", showSigSection);
submitUploadedSigButton.addEventListener("click",sendUploadedSigToDatabase)
clearButton.addEventListener("click", clearSig)
sigPad.addEventListener("mousemove", draw)
sigPad.addEventListener("mousedown", setMouseDownTrue)
sigPad.addEventListener("mouseup", setMouseDownFalse)
sigPad.addEventListener("mouseout", setMouseDownFalse)

var pointArray = []
var mousedown = false

//Display signature section
function showSigSection() {
	sigChange.style.display = "block";
}

//Update button
var update = document.getElementById("updateInfo");
update.addEventListener("click", updateAccount);
var current = document.getElementsByClassName("currentInfo");
var updateBtn = document.getElementById("update");
updateBtn.addEventListener("click", function(event) {
	event.preventDefault();
	var req = new XMLHttpRequest();
	req.open("POST", "/", true);
	req.setRequestHeader('Content-Type', 'application/json');
	req.addEventListener('load', function() {
		if (req.status >= 200 && req.status < 400) {
			var response = JSON.parse(req.responseText);
			console.log(response);
			updateBtn.parentNode.style.display = "none";
			var j;
			var text;
			for(j = 0; j < current.length; j++){
				text = current[j].childNodes[0].value;
				current[j].innerText = text;
			}			
		} else {
			console.log("Error in network request: " + req.statusText);
		}
	});
	req.send(JSON.stringify(entry));
});

function updateAccount() {
	addInputFields();
	updateBtn.parentNode.style.display = "block";
}

function addInputFields() {
	var i = 0;
	var value;
	for (i = 0; i < current.length; i++) {
		value = current[i].innerText;
		current[i].innerHTML = '<input type="text" value="' + value + '"></p>';
	}
}

//Js for signature
function draw(e){
    if (mousedown){
        context = sigPad.getContext("2d");
        pointArray.push(e.offsetX)
        pointArray.push(e.offsetY)
        if (pointArray.length%4==2 && pointArray.length > 2){
            context.beginPath();
            context.lineWidth = 5
            context.moveTo(pointArray[0], pointArray[1]);
            context.lineTo(pointArray[2], pointArray[3]);
            context.stroke();
            pointArray.shift()
            pointArray.shift()
        }
    }
}

function clearSig (){
    context = sigPad.getContext("2d")
    context.clearRect(0, 0, sigPad.width, sigPad.height)
    pointArray = []
}

function sendHandDrawnSigToDatabase(){
    var freeHandSigImage = sigPad.toDataURL()
    
    //Creates link
    var download = document.createElement('a')
    download.download = 'mysignature.png'
    download.href = freeHandSigImage
    
    //Allows user to download signature image, eventually
    //This will instead just send the signature data to
    //our SQL database.
    document.body.appendChild( download )
    download.click()
    document.body.removeChild( download);
}

function sendUploadedSigToDatabase(){
    //Creates link
    var download = document.createElement('a')
    download.download = 'mysignature.png'
    download.href = sigPic.src
    
    //Allows user to download signature image, eventually
    //This will instead just send the signature data to
    //our SQL database.
    document.body.appendChild( download )
    download.click()
    document.body.removeChild( download);
}

function setMouseDownFalse(){
    mousedown = false
    pointArray = []
}

function setMouseDownTrue(){
    mousedown = true
}

var loadFile = function(event) {
    var output = document.getElementById('sigPic');
    sigPic.src = URL.createObjectURL(event.target.files[0]);
}

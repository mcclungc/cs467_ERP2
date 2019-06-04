var updateSig = document.getElementById("updateSig");
var sigChange = document.getElementById("sigChange");
var sigPad = document.getElementById("signaturePad")
var clearButton = document.getElementById("clearFunc")
var submitSigButton = document.getElementById("submitSig")
var submitUploadedSigButton = document.getElementById("submitUploadedSig")
var submitUploadedSigConfirmation = document.getElementById("submitUploadedSigConfirmation")
var submitSigConfirmation = document.getElementById("submitSigConfirmation")

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
    if(sigChange.style.display === "block") {
        sigChange.style.display = "none";
    } else {
        sigChange.style.display = "block";
    }
}

//Update button
var update = document.getElementById("updateInfo");
update.addEventListener("click", updateAccount);
var updateBtn = document.getElementById("update");


updateBtn.addEventListener("click", function(event) {
	event.preventDefault();
	var req = new XMLHttpRequest();
    var id = updateBtn.name;
    var name = document.getElementById("name");
    var entry = {
        "name": name.firstElementChild.value
    };
	req.open("PATCH", "/api/users/" + id, true);
	req.setRequestHeader('Content-Type', 'application/json');
	req.addEventListener('load', function() {
		if (req.status >= 200 && req.status < 400) {
			updateBtn.parentNode.style.display = "none";
            var text = name.firstElementChild.value;
            name.innerText = text;
		} else {
			console.log("Error in network request: " + req.statusText);
		}
	});
	req.send(JSON.stringify(entry));
	updateBtn.parentNode.style.display = "none";
});

function updateAccount() {
    var name = document.getElementById("name");
    if(updateBtn.parentNode.style.display === "block") {
        var text = name.firstElementChild.value;
        name.innerText = text;
        updateBtn.parentNode.style.display = "none";
    } else {
        addInputFields();
        updateBtn.parentNode.style.display = "block";
    }
}

function addInputFields() {
    var name = document.getElementById("name");
    var value = name.innerText;
    name.innerHTML = '<input type="text" value="' + value + '"></p>';
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
    // Referenced this StackOverflow post on how to send forms with files 
    // https://stackoverflow.com/questions/6974684/how-to-send-formdata-objects-with-ajax-requests-in-jquery
    event.preventDefault();
    var req = new XMLHttpRequest();
    var fd = new FormData();
    fd.append('signature', dataURItoBlob(sigPad.toDataURL ('image/png')));
    var id = submitSig.name;
	req.open("POST", "/api/users/" + id, true);
    req.setRequestHeader('enctype', 'multipart/form-data');
	req.addEventListener('load', function() {
		if (req.status >= 200 && req.status < 400) {
			submitSigButton.innerText = 'Success!';
			setTimeout(restoreSubmitSigButton, 1500);
			clearSig();
		} else {
			submitSigButton.innerText = 'Failure!';
			setTimeout(restoreSubmitSigButton, 1500);
			console.log("Error in network request: " + req.statusText);
		}
	});
	req.send(fd);
}

function sendUploadedSigToDatabase(){
    // Referenced this StackOverflow post on how to send forms with files 
    // https://stackoverflow.com/questions/6974684/how-to-send-formdata-objects-with-ajax-requests-in-jquery
    event.preventDefault();
    var req = new XMLHttpRequest();
    var fd = new FormData();
    fd.append('signature', document.getElementById('sigFile').files[0])
    var id = submitUploadedSigButton.name;
	req.open("POST", "/api/users/" + id, true);
    req.setRequestHeader('enctype', 'multipart/form-data');
	req.addEventListener('load', function() {
		if (req.status >= 200 && req.status < 400) {
			submitUploadedSigButton.innerText = 'Success!';
			setTimeout(restoreSubmitUploadedSigButton, 1500);
		}
		else {
			submitUploadedSigButton.innerText = 'Failure!';
			setTimeout(restoreSubmitUploadedSigButton, 1500);
			console.log("Error in network request: " + req.statusText);
		}
	});
	req.send(fd);
}

function dataURItoBlob(dataURI) {
// Referenced this StackOverflow post on how to convert the base64 representatio//n of a canvas to a blob
// https://stackoverflow.com/questions/4998908/convert-data-uri-to-file-then-append-to-formdata
    var bS = atob(dataURI.split(',')[1]);
    var arrayBuff = new ArrayBuffer(bS.length);
    var intArray = new Uint8Array(arrayBuff);
    for (var i = 0; i < bS.length; i++) {
        intArray[i] = bS.charCodeAt(i);
    }
    return new Blob([arrayBuff], { type: 'image/png' });
}

function setMouseDownFalse(){
    mousedown = false
    pointArray = []
}

function setMouseDownTrue(){
    mousedown = true
}

function restoreSubmitSigButton(){
	submitSigButton.innerText = 'Submit';
}

function restoreSubmitUploadedSigButton(){
	submitUploadedSigButton.innerText = 'Submit';
}

var loadFile = function(event) {
    var output = document.getElementById('sigPic');
    sigPic.src = URL.createObjectURL(event.target.files[0]);
}

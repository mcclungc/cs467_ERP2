var update = document.getElementById("updateInfo");
update.addEventListener("click", updateAccount);
var current = document.getElementsByClassName("currentInfo");
var updateBtn = document.getElementById("update");
updateBtn.addEventListener("click", function(event) {
	event.preventDefault();
	var req = new XMLHttpRequest();
	var id = updateBtn.name; 
	req.open("PATCH", "/api/users/" + id, true);
	req.setRequestHeader('Content-Type', 'application/json');
	req.addEventListener('load', function() {
		if (req.status >= 200 && req.status < 400) {
			var response = JSON.parse(req.responseText);
			console.log(response);
			updateBtn.parentNode.style.display = "none";
			var j;
			var text;
			//Update account fields
			for(j = 0; j < current.length; j++){
				text = current[j].childNodes[0].value;
				current[j].innerText = text;
			}			
		} else {
			console.log("Error in network request: " + req.statusText);
		}
	});
	req.send(JSON.stringify(entry));
	updateBtn.parentNode.style.display = "none";
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


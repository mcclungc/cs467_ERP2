var update = document.getElementById("updateInfo");
update.addEventListener("click", updateAccount);
var current = document.getElementsByClassName("currentInfo");
var updateBtn = document.getElementById("update");
updateBtn.addEventListener("click", function(event) {
	event.preventDefault();
	var req = new XMLHttpRequest();
	var id = updateBtn.name; 
	var name = document.getElementById("name");
	var email = document.getElementById("email");
	var entry = {
		"name": name.value,
		"email": email.value
	};
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
	update.style.display = "inline-block";
});

function updateAccount() {
	addInputFields();
	updateBtn.parentNode.style.display = "block";
	update.style.display = "none";
}

function addInputFields() {
	var i = 0;
	var value;
	var identifier;
	for (i = 0; i < current.length; i++) {
		value = current[i].innerText;
		if(i == 0){
			identifier = "name";
		}
		else if(i == 1){
			identifier = "email";
		}	
		current[i].innerHTML = '<input id=' + identifier  + ' type="text" value="' + value + '"></p>';
	}
}


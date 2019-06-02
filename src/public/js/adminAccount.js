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
		"name": name.value
	};
	req.open("PATCH", "/api/users/" + id, true);
	req.setRequestHeader('Content-Type', 'application/json');
	req.addEventListener('load', function() {
		if (req.status >= 200 && req.status < 400) {
			var response = JSON.parse(req.responseText);
			updateBtn.parentNode.style.display = "none";
			var text = current[0].childNodes[0].value;
			current[0].innerText = text;
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
    var value = current[0].innerText;
    current[0].innerHTML = '<input id="name" type="text" value="' + value + '"></p>';
}


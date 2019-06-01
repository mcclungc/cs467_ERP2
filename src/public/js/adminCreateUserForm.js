var submitButton = document.getElementById("createUser");
submitButton.addEventListener("click", function(event) {
	event.preventDefault();
	var req = new XMLHttpRequest();
	var form = document.getElementById("cUser");
	var user = document.getElementById("email");
	var password = document.getElementById("password");
	var name = document.getElementById("name");
	var department = document.getElementById("department");
	var region = document.getElementById("region");
	var uType = document.getElementById("userType");

	var formInput = {};
	formInput.email = user.value;
	formInput.password = password.value;
	formInput.name = name.value;
	formInput.is_admin = uType.value;

	if(department.value !== "") {
		formInput.department_id = department.value;
	} 
	if(department.value !== "") {
		formInput.region_id = region.value;
	} 
	
	req.open("POST", "/api/users", true);
	req.setRequestHeader('Content-Type','application/json');
	req.addEventListener('load', function() {
		if (req.status >= 200 && req.status < 400) {
			var response = JSON.parse(req.responseText);
			console.log(response);
			if(response.id){
				form.insertAdjacentHTML('afterend', '<p class="userCreated">User Successfully Created!</p>');
			}
		} else {
			console.log("Error in network request: " + req.statusText);
		}
	});
	req.send(JSON.stringify(formInput));
});

function getRegions() {
	return new Promise((resolve, reject) => {
		var req = new XMLHttpRequest();
		req.open("GET", "/api/org/regions", true);
		req.setRequestHeader('Content-Type','application/json');
		req.addEventListener('load', function() {
			if (req.status >= 200 && req.status < 400) {
				var response = JSON.parse(req.responseText);
				resolve(response);
			} else {
				reject("Error in network request: " + req.statusText);
			}
		});
		req.send(null);
	})
}

function getDepartments() {
	return new Promise((resolve, reject) => {
		var req = new XMLHttpRequest();
		req.open("GET", "/api/org/departments", true);
		req.setRequestHeader('Content-Type','application/json');
		req.addEventListener('load', function() {
			if (req.status >= 200 && req.status < 400) {
				var response = JSON.parse(req.responseText);
				resolve(response);
			} else {
				reject("Error in network request: " + req.statusText);
			}
		});
		req.send(null);
	})
}

function fillOptions(data, elementID, textName) {
	data.forEach(item => {
		let select = document.getElementById(elementID);
		let option = document.createElement("option");
		option.setAttribute('value', item.id);
		option.appendChild(document.createTextNode(item[textName]));
    	select.appendChild(option);
	});
}

document.addEventListener("DOMContentLoaded", function() {
	Promise.all([
		getRegions(),
		getDepartments(),
	]).then(responses => {
		let regions = responses[0];
		let departments = responses[1];
		fillOptions(regions, "region", "region_name");
		fillOptions(departments, "department", "depart_name");
	}).catch(error => {
		console.log(error);
	});
});
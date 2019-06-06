var submitButton = document.getElementById("createUser");

// Event handler to create the user based on the form data
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
	var message = document.getElementById("result");

	if(message) {
		message.remove();
	}

	var formInput = {};
	formInput.email = user.value;
	formInput.password = password.value;
	formInput.name = name.value;
	formInput.is_admin = uType.value;

	if(uType.value === '1') {
		if(department.value !== '' || region.value !== '') {
			form.insertAdjacentHTML('afterend', '<p class="userFailed" id="result">Admin Users Must Not Have Region Nor Department</p>');
			return;
		}
	} else {
		if(department.value === '' || region.value === '') {
			form.insertAdjacentHTML('afterend', '<p class="userFailed" id="result">Region and Department Required for User Accounts</p>');
			return;
		}
	}

	if(department.value !== "") {
		formInput.department_id = department.value;
	} 
	if(region.value !== "") {
		formInput.region_id = region.value;
	} 
	
	req.open("POST", "/api/users", true);
	req.setRequestHeader('Content-Type','application/json');
	req.addEventListener('load', function() {
		if (req.status >= 200 && req.status < 400) {
			var response = JSON.parse(req.responseText);
			if(response.id){
				form.insertAdjacentHTML('afterend', '<p class="userCreated" id="result">User Successfully Created!</p>');
				user.value = '';
				password.value = '';
				name.value = '';
				department.value = '';
				region.value = '';
				uType.value = '';
			}
		} else {
			console.log("Error in network request: " + req.statusText);
			form.insertAdjacentHTML('afterend', '<p class="userFailed" id="result">Failed To Create User</p>');
		}
	});
	req.send(JSON.stringify(formInput));
});

// Get all the possible regions
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

// Get all the possible departments
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

// Fill in the options for the select drop down specified
function fillOptions(data, elementID, textName) {
	data.forEach(item => {
		let select = document.getElementById(elementID);
		let option = document.createElement("option");
		option.setAttribute('value', item.id);
		option.appendChild(document.createTextNode(item[textName]));
    	select.appendChild(option);
	});
}

// On page load, fill in the region and department dropdowns with values pulled from API calls
document.addEventListener("DOMContentLoaded", function() {
	Promise.all([
		getRegions(),
		getDepartments(),
	]).then(responses => {
		let regions = responses[0];
		let departments = responses[1];
		fillOptions(regions, "region", "region_name");
		fillOptions(departments, "department", "department_name");
	}).catch(error => {
		console.log(error);
	});
});
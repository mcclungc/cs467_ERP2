var submitButton = document.getElementById("createAward");
submitButton.addEventListener("click", function(event) {
	event.preventDefault();
	var req = new XMLHttpRequest();
	var form = document.getElementById("addAward");
	var user = document.getElementById("email");
	var name = document.getElementById("name");
	var department = document.getElementById("department");
	var region = document.getElementById("region");
    var awardType = document.getElementById("award-type");
	var awardDate = document.getElementById("award-date");
	var message = document.getElementById("result");

	if(message) {
		message.remove();
	}

	var formInput = {};
	formInput.recipient_email = user.value;
	formInput.recipient_name = name.value;
	formInput.sent_on = awardDate.value;

	if(department.value !== "") {
		formInput.recipient_department_id = department.value;
	} 
	if(region.value !== "") {
		formInput.recipient_region_id = region.value;
    } 
    if(awardType.value !== "") {
		formInput.certificate_id = awardType.value;
	} 
	
	req.open("POST", "/api/awards", true);
	req.setRequestHeader('Content-Type','application/json');
	req.addEventListener('load', function() {
		if (req.status >= 200 && req.status < 400) {
            var response = JSON.parse(req.responseText);
			if(response[0].awardID){
				form.insertAdjacentHTML('afterend', '<p class="userCreated" id="result">Award Successfully Created!</p>');
				user.value = '';
				name.value = '';
				department.value = '';
				region.value = '';
				awardType.value = '';
				awardDate.value = '';
			}
		} else {
			console.log("Error in network request: " + req.statusText);
			form.insertAdjacentHTML('afterend', '<p class="userFailed" id="result">Failed To Create Award</p>');
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

function getAwardTypes() {
	return new Promise((resolve, reject) => {
		var req = new XMLHttpRequest();
		req.open("GET", "/api/org/certificates", true);
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
        getAwardTypes()
	]).then(responses => {
		let regions = responses[0];
        let departments = responses[1];
        let awardTypes = responses[2];
		fillOptions(regions, "region", "region_name");
        fillOptions(departments, "department", "department_name");
        fillOptions(awardTypes, "award-type", "certificate_type");
	}).catch(error => {
		console.log(error);
	});
});
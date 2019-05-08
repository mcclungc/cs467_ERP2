/*
 * Description: Javascript for user history page
*/

//Search function to display all results from database
//Source: https://www.w3schools.com/howto/tryit.asp?filename=tryhow_js_filter_table
function search(){
	var searchInput, filter, table, tr, td, itr;
	searchInput = document.getElementById("myInput");
	filter = searchInput.value.toUpperCase(); //make the search case insensitive
	table = document.getElementById("awardTable");
	tr = table.getElementsByTagName("tr");
	for( itr = 0; itr < tr.length; itr++){
		td = tr[itr].getElementsByTagName("td")[1];
		if(td){
			if(td.innerHTML.toUpperCase().indexOf(filter) > -1){
				tr[itr].style.display = "";
			}
			else{
				tr[itr].style.display = "none";
			}
		}
	}
}

/*Function for sorting the able rows from ascending to descending order*/
function sortToggle(){
	var col = this.parentNode.cellIndex;
	if(ascending == true){
		sortDescending(col);
	}
	else{
		sortAscending(col);
	}
}

//Sort in ascending order
function sortAscending(col) {
	ascending = true;
	var sorted = false;
	var table, body, rows, td, itr;
	table = document.getElementById("awardTable");
	body = document.getElementById("tableBody");
	rows = table.getElementsByClassName("row");
	while(!sorted){
		for(itr = 0; itr < rows.length - 1; itr++){
			if(rows[itr].cells[col].innerText.toUpperCase() > rows[itr + 1].cells[col].innerText.toUpperCase()){
				body.insertBefore(rows[itr + 1], rows[itr]);
			}
		}
		if(checkAscending(rows, col)){
			sorted = true;
		}
		else{
			sorted = false;
		}
	}
}

//Check to see if all rows are in ascending order
function checkAscending(array, col){
	var itr;
	for(itr = 0; itr < array.length - 1; itr++){
		if(array[itr].cells[col].innerText.toUpperCase() > array[itr + 1].cells[col].innerText.toUpperCase()){
			return false;
		}
	}
	return true;
}

//Sort in descending order
function sortDescending(col) {
	ascending = false;
	var sorted = false;
	var table, body, rows, td, itr;
	table = document.getElementById("awardTable");
	body = document.getElementById("tableBody");
	rows = table.getElementsByClassName("row");
	while(!sorted){
		for(itr = 0; itr < rows.length - 1; itr++){
			if(rows[itr].cells[col].innerText.toUpperCase() < rows[itr + 1].cells[col].innerText.toUpperCase()){
				body.insertBefore(rows[itr + 1], rows[itr]);
			}
		}
		if(checkDescending(rows, col)){
			sorted = true;
		}
		else{
			sorted = false;
		}
	}
}

//Check to see if we need to continue sorting
function checkDescending(array, col){
	var itr;
	for(itr = 0; itr < array.length - 1; itr++){
		if(array[itr].cells[col].innerText.toUpperCase() < array[itr + 1].cells[col].innerText.toUpperCase()){
			return false;
		}
	}
	return true;
}

//Toggle on checkmark for custom checkboxes
function checkToggle() {
	if(this.parentNode.parentNode.id == "tableHead"){
		if(this.childNodes[0].classList.contains("checkoff")){
			var table = document.getElementById("awardTable");
			var checks = table.getElementsByClassName("fa-check");
			var i;
			for(i = 0; i < checks.length; i++){
				checks[i].classList.remove("checkoff");
				checks[i].classList.add("checkon");
			}
		}
		else if(this.childNodes[0].classList.contains("checkon")){
			var tab = document.getElementById("awardTable");
			var check = tab.getElementsByClassName("fa-check");
			var j;
			for(j = 0; j < check.length; j++){
				check[j].classList.remove("checkon");
				check[j].classList.add("checkoff");
			}
		}
	}
	else{
		if(this.childNodes[0].classList.contains("checkoff")){
			this.childNodes[0].classList.remove("checkoff");
			this.childNodes[0].classList.add("checkon");
		}
		else{
			var tHead = document.getElementById("tableHead");
			var cellCheck = tHead.cells[0];
			var parentCheck = cellCheck.getElementsByClassName("fa-check");
			if(parentCheck[0].classList.contains("checkon")){
				parentCheck[0].classList.remove("checkon");
				parentCheck[0].classList.add("checkoff");
			}
			this.childNodes[0].classList.remove("checkon");
			this.childNodes[0].classList.add("checkoff");
		}
	}
	anyActive();
}

//Alters buttons to me active or inactive due to the checkmarks
function anyActive(){
	var x, y;
	var buttons = document.getElementsByClassName("actionButton");
	var area = document.getElementById("awardTable");
	var activeChecks = area.getElementsByClassName("checkon");
	if(activeChecks.length > 0){
		for(x = 0; x < buttons.length; x++){
			buttons[x].classList.remove("inactive");
			buttons[x].removeEventListener("click", function(event){
				event.preventDefault();
			});
		}
	}
	else{
		for(y = 0; y < buttons.length - 1; y++){
			buttons[y].classList.add("inactive");
			buttons[y].addEventListener("click", function(event){
				event.preventDefault();
			});
		}
	}
}

//JS for the lightbox, remove, and edit buttons
function remove() {
	var rButton = document.getElementById("removeButton");
	var table = document.getElementById("awardTable");
	if(!rButton.classList.contains("inactive")){
		var rBox = document.getElementById("lightBox");
		var rContent = document.getElementById("lightBox-Inner");
		var checks = table.getElementsByClassName("checkon");
		var i;
		var names = "";
		var awards = "";
		for(i = 0; i < checks.length; i++){
			var entry = checks[i].parentNode.parentNode.parentNode;
			if(entry.id != "tableHead" && entry.style.display != "none"){
				var cellName = entry.getElementsByClassName("name");
				names = names + " " + cellName[0].innerText;
				var awardName = entry.getElementsByClassName("awardType");
				awards = awards + " " + awardName[0].innerText;
			}
		}
		rContent.innerHTML = '<p>Are you sure you want to delete the awards of:' + names + '?</p><p><button class="lightBox-button" onclick="deleteAward()">Yes</button><button class="lightBox-button" onclick="closeLightBox()">No</button></p>';
		rBox.classList.remove("hidden");
	}
}

function closeLightBox() {
	var lightB = document.getElementById("lightBox");
	lightB.classList.add("hidden");
}

//Function to delete award from the table and database
function deleteAward() {

}

//Global Variables
var ascending = true;
var searchBar = document.getElementById("myInput");
var removeButton = document.getElementById("removeButton");
var close = document.getElementById("close");
var toggle = document.getElementsByClassName("sort");
var toggleCheck = document.getElementsByClassName("checkMark");
var i, j, k;
var inactiveButtons = document.getElementsByClassName("inactive");

//Event Listeners
removeButton.addEventListener("click", remove);
close.addEventListener("click", closeLightBox);
searchBar.addEventListener("keyup", search);

//Loop to activate sorting
for(i = 0; i < toggle.length; i++){
	toggle[i].addEventListener("click", sortToggle);
}

//Loop to activate checkmarks
for (j = 0; j < toggleCheck.length; j++) {
	toggleCheck[j].addEventListener("click", checkToggle);
}

//Deactivate inactive buttons
for(k = 0; k < inactiveButtons.length; k++){
	inactiveButtons[k].addEventListener("click", function(event){
		event.preventDefault();
	});
}
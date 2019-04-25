/*
 * Description: Javascript for user management page
*/

//Search function to display all results from database
//Source: https://www.w3schools.com/howto/tryit.asp?filename=tryhow_js_filter_table
function search(){
	var searchInput, filter, table, tr, td, itr;
	searchInput = document.getElementById("myInput");
	filter = searchInput.value.toUpperCase(); //make the search case insensitive
	table = document.getElementById("userTable");
	tr = table.getElementsByTagName("tr");
	for( itr = 0; itr < tr.length; itr++){
		td = tr[itr].getElementsByTagName("td")[0];
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

function sortAscending(col) {
	ascending = true;
	var sorted = false;
	var table, body, rows, td, itr;
	table = document.getElementById("userTable");
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

function checkAscending(array, col){
	var itr;
	for(itr = 0; itr < array.length - 1; itr++){
		if(array[itr].cells[col].innerText.toUpperCase() > array[itr + 1].cells[col].innerText.toUpperCase()){
			return false;
		}
	}
	return true;
}

//Sory in descending order
function sortDescending(col) {
	ascending = false;
	var sorted = false;
	var table, body, rows, td, itr;
	table = document.getElementById("userTable");
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

var ascending = true;
var toggle = document.getElementsByClassName("sort");
var i;
for(i = 0; i < toggle.length; i++){
	toggle[i].addEventListener("click", sortToggle);
}
sortAscending(0);


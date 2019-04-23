/*
 * Description: Javascript for user management page
*/

//Search function to display all results from database
function search(){
	var searchInput;
	var filter;
	var table;
	var tr;
	var td;
	var itr;
	searchInput = document.getElementById("myInput");
	filter = searchInput.value.toUpperCase(); //make the search case insensitive
	table = document.getElementByID("userTable");
	tr = table.getElementsByTagName("tr");
	for( i = 0; i < tr.length; i++){
		td = tr[i].getElementsByTagName("td")[0];
		if(td){
			if(td.innerHTML.toUpperCase().indexOf(filter) > -1){
				tr[i].style.display = "";
			}
			else{
				tr[i].style.display = "none";
			}
		}
	}
}

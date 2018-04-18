$(document).ready(function() {
	$('.courseDelete').on('click', courseDelete);
});

function courseDelete() {
	//alert($(this).data('id'));

	var confirmation = confirm('Are you sure to want to delete?');

	if(confirmation){
		$.ajax({
			type:'DELETE',
			url: '/syllabi_tracker/mgmt/course/delete/'+$(this).data('id')
		}).done((response) => {
			window.location.replace('/syllabi_tracker/mgmt');
		});
		window.location.replace('/syllabi_tracker/mgmt');
	} else {
		console.log("error");
		return false;
	}
}

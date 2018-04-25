$(document).ready(() => {
	$('.classDelete').on('click', classDelete);
});


function classDelete() {
	var confirmation = confirm('Are you sure to want to delete?');

	if(confirmation){
		$.ajax({
			type:'DELETE',
			url: '/classes/mgmt/deleteOne/'+$(this).data('id')
		}).done((response) => {
			window.location.replace('/classes/mgmt');
		});
		location.reload();
	} else {
		return false;
	}
}
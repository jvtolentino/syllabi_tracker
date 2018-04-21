$(document).ready(() => {
	$('.courseDelete').on('click', courseDelete);
});


$(document).ready(() => {
	$('.topicDelete').on('click', topicDelete);
});


function courseDelete() {
	var confirmation = confirm('Are you sure to want to delete?');

	if(confirmation){
		$.ajax({
			type:'DELETE',
			url: '/syllabi_tracker/mgmt/course/delete/'+$(this).data('id')
		}).done((response) => {
			window.location.replace('/syllabi_tracker/mgmt');
		});
		//window.location.replace('/syllabi_tracker/mgmt');
		location.reload();
	} else {
		console.log("error");
		return false;
	}
}


function topicDelete() {
	var confirmation = confirm('Are you sure to want to delete?');

	if(confirmation){
		$.ajax({
			type:'DELETE',
			url: '/syllabi_tracker/mgmt/course/syllabus/topic/delete/'+$(this).data('topic_id')
		}).done((response) => {
			window.location.replace('/syllabi_tracker/mgmt/course/syllabus/'+$(this).data('course_id'));
		});
		//window.location.replace('/syllabi_tracker/mgmt/course/syllabus/'+$(this).data('course_id'));
		location.reload();
	} else {
		console.log("error");
		return false;
	}	
}
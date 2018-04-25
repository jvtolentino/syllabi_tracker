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
			url: '/courses/mgmt/delete/'+$(this).data('id')
		}).done((response) => {
			window.location.replace('/courses/mgmt');
		});
		location.reload();
	} else {
		return false;
	}
}


function topicDelete() {
	var confirmation = confirm('Are you sure to want to delete?');

	if(confirmation){
		$.ajax({
			type:'DELETE',
			url: '/courses/mgmt/syllabus/topics/deleteOne/'+$(this).data('topic_id')
		}).done((response) => {
			window.location.replace('/courses/mgmt/syllabus/'+$(this).data('course_id'));
		});
		location.reload();
	} else {
		return false;
	}
}
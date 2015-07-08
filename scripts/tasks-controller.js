tasksController = function() {
    function errorLogger(errorCode, errorMessage) {
	    console.log(errorCode +':'+ errorMessage);
    }
	var taskPage;
	var initialised = false;   
	return {
		init : function(page) {
			if (!initialised) {
				taskPage = page;
				$(taskPage).find( '[required="required"]' ).prev('label').append( '<span>*</span>').children( 'span').addClass('required');
				$(taskPage).find('tbody tr:even').addClass( 'even');
				
				$(taskPage).find( '#btnAddTask' ).click( function(evt) {
					evt.preventDefault();
					$(taskPage ).find('#taskCreation' ).removeClass( 'not');
				});
				$(taskPage).find('#tblTasks tbody' ).on('click', 'tr',function(evt) {
					$(evt.target ).closest('td').siblings( ).andSelf( ).toggleClass( 'rowHighlight');
				});
				$(taskPage).find('#tblTasks tbody').on('click', '.deleteRow', 
                	function(evt) { 					
                		console.log('teste');
                		storageEngine.delete('task', $(evt.target).data().taskId, 
                			function() {
                				$(taskPage).find('#tblTasks tbody').empty();
	                			tasksController.loadTasks();
                			}, errorLogger);
                	}
                );
                $(taskPage).find('#tblTasks tbody').on('click', '.completeRow', 
                	function(evt) { 					
                		storageEngine.findById('task', $(evt.target).data().taskId, function(task) {
                			task.completed = 'true';
							storageEngine.save('task', task, function() {
	                			$(taskPage).find('#tblTasks tbody').empty();
	                			tasksController.loadTasks();
	                		}, errorLogger);
                		}, errorLogger);
                	}
                );
                $(taskPage).find('#tblTasks tbody').on('click', '.editRow', 
                	function(evt) { 
                		$(taskPage).find('#taskCreation').removeClass('not');
                		storageEngine.findById('task', $(evt.target).data().taskId, function(task) {
                			$(taskPage).find('form').fromObject(task);
                		}, errorLogger);
                	}
                );
                $(taskPage).find('#saveTask').click(function(evt) {
                	evt.preventDefault();
                	if ($(taskPage).find('form').valid()) {
                		var task = $(taskPage).find('form').toObject();		
                		storageEngine.save('task', task, function() {
                			$(taskPage).find('#tblTasks tbody').empty();
                			tasksController.loadTasks();
                			$(':input').val('');
                			$(taskPage).find('#taskCreation').addClass('not');
                		}, errorLogger);
                	}
                });
                $(taskPage).find('#clearTask').click(function(evt) {
                	evt.preventDefault();
                	$(taskPage).find('#taskForm')[0].reset();
                });
				storageEngine.init(function() {
                	storageEngine.initObjectStore('task', function() {}, 
                	errorLogger) 
                }, errorLogger);
				initialised = true;
			}
    	},
    	loadTasks : function() {
        	storageEngine.findAll('task', 
        		function(tasks) {
        			var qtdTarefasIncompletas = 0;
        			$.each(tasks, function(index, task) {
        				$('#taskRow').tmpl(task ).appendTo( $(taskPage ).find( '#tblTasks tbody'));
        				if(task.completed == 'true'){
        					$('a[data-task-id='+task.id+']').parents('tr').addClass('taskCompleted');
        					$('a[data-task-id='+task.id+'][class=completeRow]').remove();
        					$('a[data-task-id='+task.id+'][class=editRow]').remove();
        				}
        				else{
        					qtdTarefasIncompletas++;
        					if( Date.today().compareTo(Date.parse(task.requiredBy)) === 1){
        						$('time[datetime='+task.requiredBy+']').closest('td').siblings( ).andSelf( ).addClass('overdue');
        					}
        					else if( Date.next().week().compareTo(Date.parse(task.requiredBy)) === 1){
        						$('time[datetime='+task.requiredBy+']').closest('td').siblings( ).andSelf( ).addClass('warning');
        					}
        				}
        			});
        			$('#taskCount').html(qtdTarefasIncompletas);
        		}, 
        		errorLogger);
        }
	}
}();
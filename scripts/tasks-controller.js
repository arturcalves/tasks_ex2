tasksController = function() {
    function errorLogger(errorCode, errorMessage) {
	    console.log(errorCode +':'+ errorMessage);
    }
	var taskPage;
	var initialised = false;
	return {
		init : function(page, callback) { 
			if (initialised) {
				callback()
			} else {
				if (!initialised) {
					taskPage = page;
					storageEngine.init(function() {
						storageEngine.initObjectStore('task', function() {
							callback();
						}, errorLogger) 
					}, errorLogger);
	                
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
		                			tasksController.loadTasks();
	                			}, errorLogger);
	                	}
	                );
	                //*********************************************************
					// TAREFA 4 - Marcar tarefas como completadas
					// adicionando uma funcao associada ao listenner do click dos
        			// botoes com a classe completeRow. a funcao faz uma busca
        			// pela task com o id associado ao botao clicado, ao encontrar
        			// altera o atributo completed para true, salva a tarefa novamente
        			// e após salvar chama a funcao loadtask novamente para recarregar 
        			// a tabela de tasks
					// ********************************************************
	                $(taskPage).find('#tblTasks tbody').on('click', '.completeRow', 
	                	function(evt) { 					
	                		storageEngine.findById('task', $(evt.target).data().taskId, function(task) {
	                			task.completed = 'true';
								storageEngine.save('task', task, function() {
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
	                			tasksController.loadTasks();
	                			$(':input').val('');
	                			$(taskPage).find('#taskCreation').addClass('not');
	                		}, errorLogger);
	                	}
	                });
	                //*********************************************************
        			// TAREFA 2 - Limpar tarefa
        			// adicionando uma funcao associada ao listenner do click do
        			// botão com id clearTask. a funcao pega o formulario de tarefas (taskForm)
        			// e executa seu método reset, que limpa os dados do formulário
        			// Achei uma abordagem interessante pois no caso de edição o fomulário
        			// ********************************************************
	                $(taskPage).find('#clearTask').click(function(evt) {
	                	evt.preventDefault();
	                	$(taskPage).find('#taskForm')[0].reset();
	                });
					initialised = true;
				}
			}
    	},
    	loadTasks : function() {
        	storageEngine.findAll('task', 
        		function(tasks) {
        			$(taskPage).find('#tblTasks tbody').empty();
        			//*********************************************************
        			// TAREFA 1 - Contagem no Rodapé (tarefa 4 - contando apenas as nao completadas)
        			// Criada variavel qtdTarefasIncompletas que será incrementada
        			// a cada tarefa não completada que existir na lista de tarefas armazenadas
        			// ********************************************************
        			var qtdTarefasIncompletas = 0;
        			
        			
        			//*********************************************************
        			// TAREFA 5 - Ordenar tarefas
        			// Antes de adicionar as linhas das tarefas na tabela tabela
        			// ordena-se a lista de tarefas passando como funcao de ordenacao
        			// para a funcao sort uma funcao que compara as as datas das tarefas
        			// aqui maus uma vez foi utilizada a biblioteca datejs.com para 
        			// fazer a comparacao entre datas.
        			// ********************************************************
        			tasks.sort(function compare(a,b) {
  									return Date.parse(a.requiredBy).compareTo(Date.parse(b.requiredBy))
        			});
        			
        			$.each(tasks, function(index, task) {
        				$('#taskRow').tmpl(task ).appendTo( $(taskPage ).find( '#tblTasks tbody'));
        				//*********************************************************
						// TAREFA 4 - Marcar tarefas como completadas
						// ao carregar as tarefas para a tabela, caso a tarefa já tenha sido completada
						// adiciona-se a classe taskCompleted ao TR da tarefa e
						// remove-se o bota de completar e o de editar
						// ********************************************************
        				if(task.completed == 'true'){
        					$('a[data-task-id='+task.id+']').parents('tr').addClass('taskCompleted');
        					$('a[data-task-id='+task.id+'][class=completeRow]').remove();
        					$('a[data-task-id='+task.id+'][class=editRow]').remove();
        				}
        				else{
        					//*********************************************************
        					// TAREFA 1 - Contagem no Rodapé (tarefa 4 - contando apenas as nao completadas)
        					// Incrementa a variavel qtdTarefasIncompletas 
        					// a cada tarefa não completada armazenada
        					// ********************************************************
        					qtdTarefasIncompletas++;
        					
        					
        					//*********************************************************
        					// TAREFA 3 - Destacar Tarefas atrasadas ou proximas
        					// Usando a biblioteca datejs.com
        					// comparo a data de hoje com a data da tarefa:
        					// se retornar 1, ou seja se a de hoje for maior que a data da tarefa (tarefa atrasada)
        					//     entao pego o elemento td, e seus irmaos, que possui um elemento 
        					//     time com a data da tarefa e adiciono a classe Css overdue
        					// se retornar algo diferente de 1, ou seja se a de hoje for menor igual que a data da tarefa (tarefa ainda não atrasada)
        					//     entao, caso a data de hoje a uma semana for maior que a data da tarefa (tarefa faltando menos uma semana para ser concluida)
        					//     	   entao pego o elemento td, e seus irmaos, que possui um elemento 
        					//         time com a data da tarefa e adiciono a classe Css warning
        					// ********************************************************
        					if( Date.today().compareTo(Date.parse(task.requiredBy)) === 1){
        						$('time[datetime='+task.requiredBy+']').closest('td').siblings( ).andSelf( ).addClass('overdue');
        					}
        					else if( Date.next().week().compareTo(Date.parse(task.requiredBy)) === 1){
        						$('time[datetime='+task.requiredBy+']').closest('td').siblings( ).andSelf( ).addClass('warning');
        					}
        				}
        			});
        			//*********************************************************
        			// TAREFA 1 - Contagem no Rodapé (tarefa 4 - contando apenas as nao completadas)
        			// Setando o o conteudo do componente de ID taskCount para
        			// o valor da variavel qtdTarefasIncompletas
        			// ********************************************************
        			$('#taskCount').html(qtdTarefasIncompletas);
        		}, 
        		errorLogger);
        }
	}
}();
import './App.css';
import { useState, useEffect } from 'react';
import axios from 'axios';
import ReactModal from 'react-modal';

// Inicializar o modal
ReactModal.setAppElement('#root'); // Certifique-se de que corresponde ao ID do elemento raiz no seu index.html

// Funções utilitárias para o calendário
const getDaysInMonth = (month: any, year: any) => {
	return new Date(year, month + 1, 0).getDate();
};

const getFirstDayOfMonth = (month: any, year: any) => {
	return new Date(year, month, 1).getDay();
};

function App() {
	// Estados para o calendário
	const [currentMonth, setCurrentMonth] = useState(new Date().getMonth());
	const [currentYear, setCurrentYear] = useState(new Date().getFullYear());

	const daysOfWeek = ['D', 'S', 'T', 'Q', 'Q', 'S', 'S'];

	const today = new Date();
	const isCurrentMonthAndYear =
		currentMonth === today.getMonth() && currentYear === today.getFullYear();

	// Estados para as listas e tarefas
	const [lists, setLists] = useState([]);
	const [selectedListId, setSelectedListId] = useState(null);
	const [newListName, setNewListName] = useState('');

	interface Task {
		id: number;
		description: string;
		completed: boolean;
		date: string;
	}

	const [todoItems, setTodoItems] = useState<Task[]>([]);
	const [allTasks, setAllTasks] = useState<Task[]>([]);
	const [selectedDate, setSelectedDate] = useState(new Date());
	const [newTask, setNewTask] = useState('');

	// Estados para modais
	const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
	const [isListModalOpen, setIsListModalOpen] = useState(false);

	// Carregar listas existentes
	useEffect(() => {
		const fetchLists = async () => {
			try {
				const response = await axios.get('http://localhost:3000/lists');
				setLists(response.data);
				if (response.data.length > 0) {
					setSelectedListId(response.data[0].id);
				}
			} catch (error) {
				console.error('Erro ao carregar listas:', error);
			}
		};

		fetchLists();
	}, []);

	// Função para gerar os dias do calendário com indicação de tarefas
	const generateCalendarDays = () => {
		const daysInMonth = getDaysInMonth(currentMonth, currentYear);
		const firstDayOfMonth = getFirstDayOfMonth(currentMonth, currentYear);

		const daysArray = [];

		// Dias em branco para alinhamento
		for (let i = 0; i < firstDayOfMonth; i++) {
			daysArray.push({ day: null, hasTasks: false });
		}

		// Dias do mês
		for (let day = 1; day <= daysInMonth; day++) {
			const date = new Date(currentYear, currentMonth, day);
			const formattedDate = date.toISOString().split('T')[0];
			const hasTasks = allTasks.some((item) => item.date === formattedDate);

			daysArray.push({ day, hasTasks });
		}

		return daysArray;
	};

	// Navegação no calendário
	const handlePreviousMonth = () => {
		if (currentMonth === 0) {
			setCurrentMonth(11);
			setCurrentYear(currentYear - 1);
		} else {
			setCurrentMonth(currentMonth - 1);
		}
	};

	const handleNextMonth = () => {
		if (currentMonth === 11) {
			setCurrentMonth(0);
			setCurrentYear(currentYear + 1);
		} else {
			setCurrentMonth(currentMonth + 1);
		}
	};

	// Carregar tarefas do dia selecionado
	useEffect(() => {
		const fetchTasks = async () => {
			try {
				if (selectedListId) {
					const formattedDate = selectedDate.toISOString().split('T')[0];
					const response = await axios.get(
						`http://localhost:3000/lists/${selectedListId}/items/by_date/${formattedDate}`
					);
					setTodoItems(response.data);
				} else {
					setTodoItems([]);
				}
			} catch (error) {
				console.error('Erro ao carregar tarefas:', error);
			}
		};

		fetchTasks();
	}, [selectedDate, selectedListId]);

	// Carregar tarefas do mês
	useEffect(() => {
		const fetchMonthlyTasks = async () => {
			try {
				if (selectedListId) {
					const startDate = new Date(currentYear, currentMonth, 1)
						.toISOString()
						.split('T')[0];
					const endDate = new Date(currentYear, currentMonth + 1, 0)
						.toISOString()
						.split('T')[0];

					const response = await axios.get(
						`http://localhost:3000/lists/${selectedListId}/items?start_date=${startDate}&end_date=${endDate}`
					);
					setAllTasks(response.data);
				} else {
					setAllTasks([]);
				}
			} catch (error) {
				console.error('Erro ao carregar tarefas mensais:', error);
			}
		};

		fetchMonthlyTasks();
	}, [currentMonth, currentYear, selectedListId]);

	// Adicionar nova tarefa
	const handleAddTask = async (e: any) => {
		e.preventDefault();
		if (newTask.trim() !== '' && selectedListId) {
			try {
				const formattedDate = selectedDate.toISOString().split('T')[0];
				const response = await axios.post(
					`http://localhost:3000/lists/${selectedListId}/items`,
					{
						item: {
							description: newTask.trim(),
							completed: false,
							date: formattedDate,
						},
					}
				);
				setTodoItems([...todoItems, response.data]);
				setAllTasks([...allTasks, response.data]);
				setNewTask('');
				setIsTaskModalOpen(false);
			} catch (error) {
				console.error('Erro ao adicionar tarefa:', error);
			}
		}
	};

	// Marcar tarefa como concluída
	const toggleComplete = async (item: any, index: any) => {
		try {
			const response = await axios.put(
				`http://localhost:3000/lists/${selectedListId}/items/${item.id}`,
				{
					item: {
						completed: !item.completed,
					},
				}
			);
			const updatedItems = [...todoItems];
			updatedItems[index] = response.data;
			setTodoItems(updatedItems);
		} catch (error) {
			console.error('Erro ao atualizar tarefa:', error);
		}
	};

	// Clique em um dia do calendário
	const handleDateClick = (date: any) => {
		setSelectedDate(date);
	};

	// Criar nova lista
	const handleCreateList = async (e: any) => {
		e.preventDefault();
		if (newListName.trim() !== '') {
			try {
				const response = await axios.post('http://localhost:3000/lists', {
					list: { name: newListName.trim() },
				});
				setLists([...lists, response.data]);
				setSelectedListId(response.data.id);
				setNewListName('');
				setIsListModalOpen(false);
			} catch (error) {
				console.error('Erro ao criar lista:', error);
			}
		}
	};

	return (
		<div className='box'>
			<div className='card'>
				<div className='calendar-section calendar-container'>
					<h1 className='calendar-title'>CALENDÁRIO</h1>
					<div className='calendar-header'>
						<button onClick={handlePreviousMonth}>{'<'}</button>
						<span>
							{new Date(currentYear, currentMonth).toLocaleString('default', {
								month: 'long',
							})}{' '}
							{currentYear}
						</span>
						<button onClick={handleNextMonth}>{'>'}</button>
					</div>
					<div className='calendar-grid'>
						{daysOfWeek.map((day, index) => (
							<div key={index} className='calendar-day-header'>
								{day}
							</div>
						))}
						{generateCalendarDays().map((dayObj, index) => (
							<div
								key={index}
								className={`calendar-day ${
									isCurrentMonthAndYear && dayObj.day === today.getDate()
										? 'highlighted-day'
										: ''
								} ${dayObj.hasTasks ? 'day-with-tasks' : ''} ${
									selectedDate.getDate() === dayObj.day &&
									selectedDate.getMonth() === currentMonth &&
									selectedDate.getFullYear() === currentYear
										? 'selected-day'
										: ''
								}`}
								onClick={() =>
									dayObj.day &&
									handleDateClick(
										new Date(currentYear, currentMonth, dayObj.day)
									)
								}>
								{dayObj.day}
							</div>
						))}
					</div>
				</div>
				<div className='todo-section'>
					<h2>
						Tarefas de{' '}
						{selectedDate.toLocaleDateString('pt-BR', {
							day: 'numeric',
							month: 'long',
							year: 'numeric',
						})}
					</h2>
					<div className='adiciona_criar'>

					<button className='adicionar_tarefa' onClick={() => setIsTaskModalOpen(true)}>
						Adicionar Tarefa
					</button>
					<button onClick={() => setIsListModalOpen(true)}>Criar Lista</button>
					</div>
					<select
						value={selectedListId || ''}
						onChange={(e) => setSelectedListId(parseInt(e.target.value))}>
						{lists.map((list) => (
							<option key={list.id} value={list.id}>
								{list.name}
							</option>
						))}
					</select>
					<ul className='todo-list'>
						{todoItems.map((item, index) => (
							<li
								key={index}
								onClick={() => toggleComplete(item, index)}
								style={{
									textDecoration: item.completed ? 'line-through' : 'none',
									cursor: 'pointer',
								}}>
								{item.description}
							</li>
						))}
					</ul>
				</div>
			</div>
			<ReactModal
				isOpen={isTaskModalOpen}
				onRequestClose={() => setIsTaskModalOpen(false)}
				contentLabel='Adicionar Tarefa'
				className='modal'
				overlayClassName='overlay'>
				<h2>Adicionar Tarefa</h2>
				<form onSubmit={handleAddTask}>
					<input
					type='text'
					value={newTask}
					onChange={(e) => setNewTask(e.target.value)}
					placeholder='Digite a nova tarefa'
					/>
					<select
					value={selectedListId || ''}
					onChange={(e) => setSelectedListId(parseInt(e.target.value))}>
					<option value='' disabled>
						Selecione uma Lista
					</option>
					{lists.map((list) => (
						<option key={list.id} value={list.id}>
						{list.name}
						</option>
					))}
					</select>
					<div className='modal-buttons'>
					<button type='submit'>Salvar</button>
					<button type='button' onClick={() => setIsTaskModalOpen(false)}>
						Cancelar
					</button>
					<button
						type='button'
						onClick={() => {
						setIsListModalOpen(true);
						setIsTaskModalOpen(false);
						}}>
						Criar Lista
					</button>
					</div>
				</form>
				</ReactModal>


			{/* Modal para criar lista */}
			<ReactModal
				isOpen={isListModalOpen}
				onRequestClose={() => setIsListModalOpen(false)}
				contentLabel='Criar Lista'
				className='modal'
				overlayClassName='overlay'>
				<h2>Criar Nova Lista</h2>
				<form onSubmit={handleCreateList}>
					<input
						type='text'
						value={newListName}
						onChange={(e) => setNewListName(e.target.value)}
						placeholder='Nome da nova lista'
					/>
					<div className='modal-buttons'>
						<button type='submit'>Salvar</button>
						<button type='button' onClick={() => setIsListModalOpen(false)}>
							Cancelar
						</button>
					</div>
				</form>
			</ReactModal>
		</div>
	);
}

export default App;

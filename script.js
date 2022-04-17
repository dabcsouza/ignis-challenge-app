/* eslint-disable no-lonely-if */
/* eslint-disable no-console */
const submitButton = document.querySelector('.submit-btn');
const textarea = document.getElementById('insert-time');
const tableContainer = document.querySelector('.table-container');
const tableResults = document.querySelector('.table-results');
const showChampionSection = document.querySelector('.champion');

const teamsCombination = [];
const rounds = [];
let pointsArray = [];
let inputArray;
let teamsName;
let cityTeams;
let numberOfTeams;
let numberOfGames;

const renderTableResults = () => {
  // ordenando a tabela de resultados
  pointsArray.sort((a, b) => b.totalPoints - a.totalPoints);
  pointsArray = pointsArray.filter((element) => element.name !== 'aux');

  const table = document.createElement('table');
  table.classList.add('table', 'table-hover');
  const theadHtml = `
      <thead>
        <tr>
          <th scope="col">Classificação</th>
          <th scope="col">Time</th>
          <th scope="col">Pontos</th>
        </tr>
      </thead>
      <tbody>
    `;

  const tbodyHtml = pointsArray.map((teamRanking, index) => (
    `<tr ${index === 0 ? 'class="table-success"' : ''}>
        <th scope="row">${index + 1}</th>
        <td>${teamRanking.name}</td>
        <td>${index === 0
      ? `&#127881;${teamRanking.totalPoints}&#127881`
      : teamRanking.totalPoints}</td>
    </tr>`
  ));

  tbodyHtml.push('</tbody>');
  table.innerHTML = theadHtml + tbodyHtml.join('');
  tableResults.innerHTML += '<h3>Resultados</h3>';
  tableResults.appendChild(table);
  showChampionSection
    .innerHTML = `<p class="champion-title">${pointsArray[0].name}</p>
    <h3> é o campeão com ${pointsArray[0]
    .totalPoints} Pontos</h3>`;
};

const generateRoundsReturn = () => {
  const roundsReturn = rounds.map((round) => ({
    round: `${round.round} - Returno`,
    results: round.results.map(() => [Math.floor(Math.random() * 8),
      Math.floor(Math.random() * 8)]),
    games: round.games.map(([team1, team2]) => [team2, team1]),
    cities: round.games
      .map(([, team2]) => inputArray.find((el) => el.includes(team2)))
      .map((city) => city.split(';')[1]),
  }));
  return roundsReturn;
};

const checkDoubleRound = () => {
  const auxRounds = [...rounds];
  auxRounds.forEach((round, index) => {
    const diffCities = {};
    round.cities.forEach((city) => {
      diffCities[city] = (diffCities[city] || 0) + 1;
    });
    auxRounds[index] = round;
    auxRounds[index].qttDiffCities = diffCities;
  });
  auxRounds.forEach((round, index) => {
    auxRounds[index].cities = round.cities.map((city) => (round.qttDiffCities[city] > 1
      ? `${city} (RODADA DUPLA)`
      : city));
  });

  rounds.splice(0, rounds.length);
  rounds.push(...auxRounds);
};

const renderTableGames = () => {
  checkDoubleRound();
  rounds.forEach((round) => {
    const table = document.createElement('table');
    table.classList.add('table', 'table-striped', 'table-dark');
    const theadHtml = `
      <thead>
        <tr>
          <th scope="col">N.º</th>
          <th scope="col">Jogo</th>
          <th scope="col">Estado</th>
          <th scope="col">Placar</th>
        </tr>
      </thead>
      <tbody>
    `;
    const tbodyHtml = round.games.map((game, index) => (
      `<tr>
        <th scope="row">${index + 1}</th>
        <td>${game[0]} X ${game[1]}</td>
        <td>${round.cities[index]}</td>
        <td>${round.results[index][0]} X ${round.results[index][1]}</td>
      </tr>`
    ));

    tbodyHtml.push('</tbody>');
    table.innerHTML = theadHtml + tbodyHtml.join('');
    tableContainer.innerHTML += `<h3>Rodada ${round.round}</h3>`;
    tableContainer.appendChild(table);
  });
  renderTableResults();
};

const calcTotalPoints = () => {
  pointsArray.forEach((team) => {
    const teamVar = team;
    teamVar.totalPoints = (team.wins * 3) + team.draws;
  });
  renderTableGames();
};

const generateArrayPoints = () => {
  pointsArray = teamsName.map((team) => ({
    name: team,
    wins: 0,
    draws: 0,
    loss: 0,
  }));
  // Gera o Array de jogos de retorno e agrega ele ao array rounds
  const roundReturn = generateRoundsReturn();
  rounds.push(...roundReturn);
  // percorre o array com o objeto de resultado de cada time
  pointsArray.forEach((team) => {
    const teamToAssign = team;
    // para cada time percorrer o array de rodadas
    rounds.forEach((round) => {
      round.games.forEach(([player1, player2], index) => {
        // Este condicional mais externo verifica se o time jogou a partida
        if (player1 === team.name || player2 === team.name) {
          // Este condicional verifica se o time é o mandante do jogo
          if (player1 === team.name) {
            // Verifica o resultado do jogo (tricotomia: ganha, perde ou empata)
            if (round.results[index][0] > round.results[index][1]) {
              teamToAssign.wins += 1;
            } else if (round.results[index][0] === round.results[index][1]) {
              teamToAssign.draws += 1;
            } else { teamToAssign.loss += 1; }
          } else {
            // Se não é o mandante do jogo, é o visitante pois aqui ja sabemos que o time jogou
            // Este else verifica o resultado do jogo no qual o time é visitante.
            if (round.results[index][1] > round.results[index][0]) {
              teamToAssign.wins += 1;
            } else if (round.results[index][1] === round.results[index][0]) {
              teamToAssign.draws += 1;
            } else { teamToAssign.loss += 1; }
          }
        }
      });
    });
  });
  calcTotalPoints();
};

const adjustRounds = () => {
  const roundsAux = rounds.map((round) => ({
    ...round,
    games: round.games.filter((game) => !game.includes('aux')),
  }));
  rounds.splice(0, rounds.length);
  rounds.push(...roundsAux);
};

const addCitiesAndResultToRounds = () => {
  adjustRounds();
  rounds.forEach((round) => {
    const roundToEdit = round;
    const arrCities = [];
    const arrResults = [];
    round.games.forEach((team) => {
      arrCities.push(
        inputArray.find((el) => el
          .includes(team[0])).split(';')[1],
      );
      arrResults.push([Math.floor(Math.random() * 8),
        Math.floor(Math.random() * 8)]);
    });
    roundToEdit.cities = [...arrCities];
    roundToEdit.results = [...arrResults];
  });
  generateArrayPoints();
};

const orderRoundsTeams = () => {
  rounds.forEach((round) => {
    if (round.round % 2 === 0) round.games[0].reverse();
    round.games.forEach((game, index) => { if (index % 2 === 1) game.reverse(); });
  });
  addCitiesAndResultToRounds();
};

const createRounds = () => {
  rounds.splice(0, rounds.length);
  const gamesPerRound = numberOfGames / (numberOfTeams - 1);
  for (let i = 0; i < numberOfTeams - 1; i += 1) {
    rounds.push({
      round: i + 1,
      games: [...teamsCombination].slice(gamesPerRound * (i), gamesPerRound * (i + 1)),
    });
  }
  orderRoundsTeams();
};

const reorderTeam = () => {
  const varAux = teamsName[1];
  teamsName.splice(1, 1);
  teamsName.push(varAux);
};

const generateGame = () => {
  for (let i = 0; i < numberOfTeams - 1; i += 1) {
    for (let j = 0; j < numberOfTeams / 2; j += 1) {
      teamsCombination.push([teamsName[j], teamsName[(numberOfTeams - 1) - j]]);
    }
    reorderTeam();
  }
  createRounds();
};

const clearData = () => {
  teamsCombination.splice(0, teamsCombination.length);
  rounds.splice(0, rounds.length);
  pointsArray = [];
  teamsName = [];
  cityTeams = [];
  numberOfTeams = 0;
  numberOfGames = 0;
  tableContainer.innerHTML = '';
  tableResults.innerHTML = '';
  textarea.value = '';
};

const handleButtonSubmit = () => {
  try {
    const inputValue = textarea.value;
    inputArray = inputValue.split('\n');
    // Verifica se o número de times fornecido é par,
    // caso contrário a cada rodada um time estará descansando.
    if (inputArray.length % 2 === 1) inputArray.push('aux;descanso');
    clearData();
    numberOfTeams = inputArray.length;
    // Estatisticamente, cada um dos n times enfrenta n - 1 adversários (não enfrenta ele
    // próprio), por enquanto não considerando a inversão do mandante temos que a ordem não
    // importa nos dando o numero de jogos = n * (n-1) / 2
    numberOfGames = (numberOfTeams * (numberOfTeams - 1)) / 2;
    teamsName = Array(numberOfTeams).fill('');
    cityTeams = Array(numberOfTeams).fill('');
    inputArray.forEach((team, index) => {
      [teamsName[index], cityTeams[index]] = team.split(';');
    });
    if (cityTeams.some((el) => !el || el === '')) throw new Error('invalid Data');
    generateGame();
  } catch (e) {
    console.error('Algo deu ruim');
    console.error(e.message);
  }
};

const handleTextarea = ({ target: { value } }) => {
  const inputValue = value || '';
  localStorage.setItem('inputValue', inputValue);
};

window.onload = () => {
  submitButton.addEventListener('click', handleButtonSubmit);
  textarea.addEventListener('keyup', handleTextarea);
};

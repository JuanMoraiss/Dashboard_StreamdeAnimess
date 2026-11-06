Chart.defaults.color = '#a9a5c2';
Chart.defaults.borderColor = 'rgba(255, 255, 255, 0.08)';
Chart.defaults.font.family = getComputedStyle(document.body).fontFamily;

const PALETA = ['#ff7aa8', '#7c9cff', '#5eead4', '#fbbf24', '#c4b5fd', '#fb923c'];
const charts = {};

function tituloEixo(texto) {
  return { display: true, text: texto };
}

function criarGraficos() {
  charts.anos = new Chart(document.getElementById('grafico-anos'), {
    type: 'line',
    data: {
      labels: [],
      datasets: [{
        label: 'Títulos lançados',
        data: [],
        borderColor: PALETA[0],
        backgroundColor: 'rgba(255, 122, 168, 0.18)',
        fill: true,
        tension: 0.3
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        title: { display: true, text: 'Lançamentos por ano' },
        legend: { display: false }
      },
      scales: {
        x: { title: tituloEixo('Ano de estreia') },
        y: { beginAtZero: true, title: tituloEixo('Quantidade de títulos') }
      }
    }
  });

  charts.tipos = new Chart(document.getElementById('grafico-tipos'), {
    type: 'doughnut',
    data: {
      labels: [],
      datasets: [{ label: 'Títulos', data: [], backgroundColor: PALETA, borderWidth: 0 }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        title: { display: true, text: 'Títulos por formato (quantidade)' },
        legend: { position: 'bottom' }
      }
    }
  });

  charts.generos = new Chart(document.getElementById('grafico-generos'), {
    type: 'bar',
    data: {
      labels: [],
      datasets: [{ label: 'Títulos', data: [], backgroundColor: PALETA[1], borderRadius: 4 }]
    },
    options: {
      indexAxis: 'y',
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        title: { display: true, text: 'Gêneros com mais títulos' },
        legend: { display: false }
      },
      scales: {
        x: { beginAtZero: true, title: tituloEixo('Quantidade de títulos') },
        y: { title: tituloEixo('Gênero') }
      }
    }
  });

  charts.meus = new Chart(document.getElementById('grafico-meus'), {
    type: 'bar',
    data: {
      labels: [],
      datasets: [
        { label: 'Catálogo', data: [], backgroundColor: PALETA[1], borderRadius: 4 },
        { label: 'Minha lista', data: [], backgroundColor: PALETA[0], borderRadius: 4 }
      ]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        title: { display: true, text: 'Meus gêneros × catálogo' },
        legend: { position: 'bottom' }
      },
      scales: {
        x: { title: tituloEixo('Gênero') },
        y: { beginAtZero: true, title: tituloEixo('% dos títulos com o gênero') }
      }
    }
  });
}

function atualizarGraficos(dados, metrica) {
  const porNota = metrica === 'nota';

  charts.anos.data.labels = dados.porAno.map(d => d.rotulo);
  charts.anos.data.datasets[0].data = dados.porAno.map(d => d.titulos);
  charts.anos.update();

  charts.tipos.data.labels = dados.porTipo.map(d => d.rotulo);
  charts.tipos.data.datasets[0].data = dados.porTipo.map(d => d.titulos);
  charts.tipos.update();

  const g = charts.generos;
  g.data.labels = dados.porGenero.map(d => d.rotulo);
  g.data.datasets[0].data = dados.porGenero.map(d => (porNota ? d.nota : d.titulos));
  g.data.datasets[0].label = porNota ? 'Nota média' : 'Títulos';
  g.options.plugins.title.text = porNota ? 'Gêneros com maior nota média' : 'Gêneros com mais títulos';
  g.options.scales.x.title.text = porNota ? 'Nota média (0 a 10)' : 'Quantidade de títulos';
  g.options.scales.x.max = porNota ? 10 : undefined;
  g.update();
}

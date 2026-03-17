let chart;

// SALVA DATI NEL LOCALSTORAGE
function salvaLocalStorage(dati) {
  localStorage.setItem('userFerie', JSON.stringify(dati));
}

// CARICA DATI DAL LOCALSTORAGE
function caricaLocalStorage() {
  const dati = localStorage.getItem('userFerie');
  return dati ? JSON.parse(dati) : null;
}

// CALCOLA FERIE CUMULATIVE PER IL GRAFICO
function calcolaFerieCumulative(dati) {
  const mesi = ["gen","feb","mar","apr","mag","giu","lug","ago","set","ott","nov","dic"];
  let cumulative = [];
  let totale = dati.ferieIniziali;

  mesi.forEach((mese) => {
    totale += dati.oreMensili;            // aggiunge ore mensili
    totale -= dati.ferieMensili[mese];    // sottrae ferie prese
    cumulative.push(totale);
  });

  return cumulative;
}

// CREA IL GRAFICO INTERATTIVO
function creaGrafico(dati) {
  const labels = ["Gen", "Feb", "Mar", "Apr", "Mag", "Giu", "Lug", "Ago", "Set", "Ott", "Nov", "Dic"];
  const cumulative = calcolaFerieCumulative(dati);

  if(chart) chart.destroy();

  const ctx = document.getElementById('ferieChart').getContext('2d');
  chart = new Chart(ctx, {
    type: 'bar',
    data: {
      labels: labels,
      datasets: [{
        label: 'Ferie residue (ore)',
        data: cumulative,
        backgroundColor: 'rgba(0,123,255,0.6)'
      }]
    },
    options: {
      onClick: (evt, elements) => {
        if(elements.length > 0) {
          const index = elements[0].index;
          const mese = Object.keys(dati.ferieMensili)[index];
          const ferieInput = parseFloat(prompt(`Inserisci ore di ferie prese in ${labels[index]}:`, dati.ferieMensili[mese]));
          if(!isNaN(ferieInput)) {
            dati.ferieMensili[mese] = ferieInput;
            salvaLocalStorage(dati);
            aggiornaDashboard(dati);
          }
        }
      },
      scales: {
        y: { beginAtZero: true }
      }
    }
  });
}

// AGGIORNA DASHBOARD
function aggiornaDashboard(dati) {
  document.getElementById('userName').innerText = dati.nomeCognome;
  const monthName = new Date().toLocaleString('it-IT', { month: 'long' });
  document.getElementById('currentMonth').innerText = monthName;
  document.getElementById('totPermessi').innerText = dati.permessiJolly;

  const cumulative = calcolaFerieCumulative(dati);
  const ultimeFerie = cumulative[cumulative.length-1];
  document.getElementById('totFerieResidue').innerText = ultimeFerie.toFixed(2) + " ore";
  document.getElementById('totGiorniResidui').innerText = (ultimeFerie/8).toFixed(2) + " giorni";

  document.getElementById('modal').classList.add('hidden');
  document.getElementById('dashboard').classList.remove('hidden');

  creaGrafico(dati);
}

// BOTTONE SALVA DATI MODALE
document.getElementById('salvaDati').addEventListener('click', () => {
  const dati = {
    nomeCognome: document.getElementById('nomeCognome').value,
    tipoContratto: document.getElementById('tipoContratto').value,
    oreMensili: parseFloat(document.getElementById('oreMensili').value),
    permessiJolly: parseInt(document.getElementById('permessiJolly').value),
    ferieIniziali: parseFloat(document.getElementById('oreFerie').value),
    ferieMensili: { gen:0,feb:0,mar:0,apr:0,mag:0,giu:0,lug:0,ago:0,set:0,ott:0,nov:0,dic:0 }
  };
  salvaLocalStorage(dati);
  aggiornaDashboard(dati);
});

// ALL'APERTURA DELLA PAGINA
window.addEventListener('load', () => {
  const datiSalvati = caricaLocalStorage();
  if (datiSalvati) {
    aggiornaDashboard(datiSalvati);
  } else {
    document.getElementById('modal').classList.remove('hidden');
  }
});
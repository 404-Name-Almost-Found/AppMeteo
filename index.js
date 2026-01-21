// Initialize the map
const map = L.map('map').setView([41., 12.0], 5);

// Add OpenStreetMap tiles
L.tileLayer(
    'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
    {
        maxZoom: 19,
        attribution: '&copy; OpenStreetMap contributors'
    }
).addTo(map);

// Ricarica la pagina se viene caricata dalla cache o tramite back/forward
window.addEventListener("pageshow", function (event) {
    const navEntries = performance.getEntriesByType("navigation");
    const navType = navEntries.length > 0 ? navEntries[0].type : null;

    // Se la pagina è stata ripristinata dalla cache
    // oppure è stata raggiunta con back/forward
    if (event.persisted || navType === "back_forward") {
        window.location.reload();
    }
});


const selectValue=document.getElementById("selettore");//select del comune
const selectRegione=document.getElementById("selectRegione") //select della regione
const selectProvincia=document.getElementById("selectProvincia")//select della provincia
const footer=document.getElementsByClassName("footerIndex")[0]//riferimento al footer
const elem=document.createElement("option")
let ElencoComuni=[];
let ElencoRegioni=[];
let ElencoProvince=[];
let regioneCont=0;
const lat=document.getElementById("lat")
const lon=document.getElementById("lon")
const form=document.getElementById("formSelezione")
let invio=false;

//popolare gli elenchi
fetch("https://raw.githubusercontent.com/matteocontrini/comuni-json/master/comuni.json")
    .then(response => response.json())
    .then(comuni => {
        //popola i diversi elenchi
        for(let i=0;i<comuni.length;i++){
            ElencoComuni[i]=[comuni[i].nome,comuni[i].sigla] //comune=[nomeComune, siglaProvincia]
            ElencoRegioni[i]=comuni[i].regione["nome"] 
            ElencoProvince[i]=[comuni[i].provincia["nome"],comuni[i].sigla,comuni[i].regione["nome"]] //provincia=[nomeProvincia, siglaProvincia, nomeRegione]
        }
        ElencoRegioni=rimuoviDuplicati(ElencoRegioni)
        ElencoRegioni.sort()
        //aggiunge le opzioni alla select della regione
        for(let i=0;i<ElencoRegioni.length;i++)
        {
            const elem=document.createElement("option")
            elem.name=ElencoRegioni[i]
            elem.innerHTML=ElencoRegioni[i]
            elem.setAttribute('name', ElencoRegioni[i])
            selectRegione.append(elem)
        }
    })
    .catch(err => {
        //in caso di errore all'accesso del link la finestra mostra un errore
        window.alert("Collegamento non disponibile, controlla pi\u00f9 tardi")
        console.log(err)
    });


//popola la select delle province quando si seleziona una regione
selectRegione.addEventListener("change",function(){
    const arrayProvincia=[]
    let j=0
    while(selectProvincia.children.length>1) {  
        //rimuove tutte le opzioni precedenti tranne quello di default
        selectProvincia.removeChild(selectProvincia.lastChild);
    }
    for(let i=0;i<ElencoProvince.length;i++)
    {
        //confronta se il nome della regione contenuta in elencoProvince è uguale alla regione selezionata
        if(ElencoProvince[i][2] === selectRegione.value){
            //serve per evitare duplicati, poiché il metodo elimina duplicati non funziona per liste di liste
            //si usa includes per vedere se un elemento è contenuto in un array
            if(!arrayProvincia.includes(ElencoProvince[i][1])){
                const elem=document.createElement("option")
                elem.name=ElencoProvince[i][1]
                elem.innerHTML=ElencoProvince[i][0]
                elem.setAttribute('name', ElencoProvince[i][1])
                selectProvincia.append(elem);
                arrayProvincia[j++]=ElencoProvince[i][1]
            }
        }
    }
})

//popola select del comune scegliendo la provincia
selectProvincia.addEventListener("change",function(){
    // prende l'attributo name della select della provincia che è la sigla della provincia
    const nameOption = this.options[this.selectedIndex].getAttribute("name")
    //rimuove le opzioni precedenti
    while(selectValue.children.length>1) {  
        //rimuove tutte le opzioni precedenti tranne quello di default
        selectValue.removeChild(selectValue.lastChild);
    }
    for(let i=0;i<ElencoComuni.length;i++)
    {
        //controlla se all'indice 1 dell'elenco(che contiene la sigla della provincia) se corrisponde a quella seleionata
        if(ElencoComuni[i][1] === nameOption){
            //aggiunge opzione alla select dei Comuni
            const elem=document.createElement("option")
            elem.name=ElencoComuni[i][0]
            elem.innerHTML=ElencoComuni[i][0]
            elem.setAttribute('name', ElencoComuni[i][0])
            selectValue.append(elem);
        }
    }
}) 

// select del comune: vengono memorizzate la latitudine e longitudine
selectValue.addEventListener("change",function(){
    if(selectValue.value === "Seleziona Comune")
        invio=false
    else{
        comune=selectValue.value
        const URL="https://geocoding-api.open-meteo.com/v1/search?name="+comune.replaceAll(" ","%20")+"&count=1&language=it&format=json"
            fetch(URL)
                .then(response1 => response1.json())
                .then(ordinate =>{
                    lat.value=ordinate.results[0].latitude
                    lon.value=ordinate.results[0].longitude
                    invio=true;
                })   
    }
})

//controllo prima dell'invio
form.addEventListener("submit",function(e){
    if(!invio)
    {
        window.alert("Seleziona un comune valido prima di inviare il modulo")
        e.preventDefault();
    }
})

//per mostrare i comuni sulla cartina
const comuniLayer = L.layerGroup().addTo(map);
let mostraComuni=document.getElementById("mostra_comuni")
const chiudiMappaBtn=document.getElementById("chiudiMappa")

mostraComuni.addEventListener("click", async function () {
    
    const provinciaSelezionata = selectProvincia.options[selectProvincia.selectedIndex].getAttribute("name");
    if(provinciaSelezionata!=="null")
    {
        document.getElementById("map").style.display="block"
        map.invalidateSize();
        // Rimuove tutti i marker precedenti
        comuniLayer.clearLayers();
        footer.style.position="static";
        // Filtra solo i comuni della provincia selezionata
        const comuniProvincia = ElencoComuni.filter(c => c[1] === provinciaSelezionata)

        const richieste = comuniProvincia.map(comune => {
            //costruisce l'url per l'API
            const url =
                "https://geocoding-api.open-meteo.com/v1/search?name=" +
                comune[0].replaceAll(" ", "%20") +
                "&count=1&language=it&country=IT&admin1=" +comune[1]+"format=json";
            console.log(url)
            return fetch(url)
                .then(res => res.json())
                .then(data => {
                    if (data.results && data.results.length > 0) {
                        const { latitude, longitude } = data.results[0]
                        return [latitude, longitude, comune[0]]
                    }
                })
        })
        //Esegue più fetch in parallelo e aspetta che finiscano tutte
        const coordinate = await Promise.all(richieste)

        //aggiunge tutti i marker alla mappa
        coordinate.forEach(c => {
            if (c) {
                const URLMeteo="https://api.open-meteo.com/v1/forecast?latitude="+c[0]+"&longitude="+c[1]+"&daily=wind_speed_10m_max,precipitation_sum,weather_code,sunrise,sunset,temperature_2m_max,temperature_2m_min&hourly=relative_humidity_2m,weather_code,temperature_2m,cloud_cover,cloud_cover_low,cloud_cover_mid,cloud_cover_high,wind_speed_10m,precipitation&current=relative_humidity_2m,weather_code,temperature_2m,wind_speed_10m,relative_humidity_2m,is_day,rain,cloud_cover,is_day&utm_source=chatgpt.com"
                
                fetch(URLMeteo)
                    .then(response => response.json())
                        .then(meteo =>{
                            let temperatura;
                            let temperaturaMax=meteo.daily.temperature_2m_max[0]
                            let temperaturaMin=meteo.daily.temperature_2m_min[0]
                            const indiceOra=meteo.hourly.time.indexOf(getFormattedDate());
                            if (meteo.current.time === getFormattedDate()){
                                temperatura=meteo.current.temperature_2m;
                            }
                            else{
                                temperatura=meteo.hourly.temperature_2m[indiceOra];
                            }
                            const popupHTML = `<b>${c[2]}</b><br>Temperatura Attuale:${temperatura}°C<br>MAX:${temperaturaMax}°C - MIN:${temperaturaMin}°C<br>
                            <a href="dettagli.html?comune=${encodeURIComponent(c[2])}&lat=${c[0]}&lon=${c[1]}">
                            GUARDA DETTAGLI
                            </a>`;
                            L.marker([c[0], c[1]])
                            .addTo(comuniLayer)
                            .bindPopup(popupHTML)
                            .on("click", () => {
                                selezionaComuneDaMappa(c[0], c[1], c[2]);
                            })
                            //senza funziona 1 sola volta
                            setInterval(500, selezionaComuneDaMappa)
                })
            }
        })
        chiudiMappaBtn.style.display="block";
    }
    else{
        window.alert("Seleziona prima una provincia")
    }
    
})
chiudiMappaBtn.addEventListener("click",function(){
    document.getElementById("map").style.display="none"
    chiudiMappaBtn.style.display="none"
    comuniLayer.clearLayers()
    footer.style.position="fixed"
})


let markerSelezionato = null;
function selezionaComuneDaMappa(latitudine, longitudine, nomeComune) {

    //aggiorna i valori quando si clicca su un marker
    lat.value = latitudine;
    lon.value = longitudine;
    invio = true;

    for (let i = 0; i < selectValue.options.length; i++) {
        if (selectValue.options[i].value === nomeComune) {
            selectValue.selectedIndex = i;
            break;
        }
    }

    markerSelezionato = this;
}
function rimuoviDuplicati(arr) { 
    return [...new Set(arr)]
}

function getFormattedDate() {
  const now = new Date();

  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");

  const hours = String(now.getHours()).padStart(2, "0");
  return `${year}-${month}-${day}T${hours}:00`;
}

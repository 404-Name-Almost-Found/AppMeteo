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
window.addEventListener("pageshow", function (event) {
    const navEntries = performance.getEntriesByType("navigation");
    const navType = navEntries.length > 0 ? navEntries[0].type : null;

    // Se la pagina è stata ripristinata dalla cache
    // oppure è stata raggiunta con back/forward
    if (event.persisted || navType === "back_forward") {
        window.location.reload();
    }
});


const selectValue=document.getElementById("selettore");
const selectRegione=document.getElementById("selectRegione")
const selectProvincia=document.getElementById("selectProvincia")
const elem=document.createElement("option")
let ElencoComuni=[];
let ElencoRegioni=[];
let ElencoProvince=[];
let regioneCont=0;
const lat=document.getElementById("lat")
const lon=document.getElementById("lon")

//popolare gli elenchi
fetch("https://raw.githubusercontent.com/matteocontrini/comuni-json/master/comuni.json")
    .then(response => response.json())
    .then(comuni => {
        for(let i=0;i<comuni.length;i++){
            ElencoComuni[i]=[comuni[i].nome,comuni[i].sigla] //comune=[nomeComune, siglaProvincia]
            ElencoRegioni[i]=comuni[i].regione["nome"] 
            ElencoProvince[i]=[comuni[i].provincia["nome"],comuni[i].sigla,comuni[i].regione["nome"]] //provincia=[nomeProvincia, siglaProvincia, nomeRegione]
        }
        ElencoRegioni=rimuoviDuplicati(ElencoRegioni)
        ElencoRegioni.sort()

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
        window.alert("Collegamento non disponibile, controlla pi\u00f9 tardi")
        console.log(err)
    });
const form=document.getElementById("formSelezione")
let invio=false;


selectRegione.addEventListener("change",function(){
    const arrayProvincia=[]
    let j=0
    while(selectProvincia.firstChild) {  
        selectProvincia.firstChild.remove(); 
    }
    const elem=document.createElement("option")
    elem.innerHTML="Seleziona Provincia"
    elem.setAttribute('name', null)
    selectProvincia.append(elem);
    for(let i=0;i<ElencoProvince.length;i++)
    {
        if(ElencoProvince[i][2] === selectRegione.value){
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


selectProvincia.addEventListener("change",function(){
   const nameOption = this.options[this.selectedIndex].getAttribute("name")
   while(selectValue.firstChild) {  
        selectValue.firstChild.remove(); 
    }
    const elem=document.createElement("option")
    elem.innerHTML="Seleziona Comune"
    elem.setAttribute('name', null)
    selectValue.append(elem);
    for(let i=0;i<ElencoComuni.length;i++)
    {
        
        if(ElencoComuni[i][1] === nameOption){
            console.log(nameOption, ElencoComuni[i][1])
            const elem=document.createElement("option")
            elem.name=ElencoComuni[i][0]
            elem.innerHTML=ElencoComuni[i][0]
            elem.setAttribute('name', ElencoComuni[i][0])
            selectValue.append(elem);
        }
    }
}) 


selectValue.addEventListener("change",function(){
    if(selectValue.value === "Seleziona Comune")
    {
        invio=false
    }
    else{
        comune=selectValue.value
        const URL="https://geocoding-api.open-meteo.com/v1/search?name="+comune.replaceAll(" ","%20")+"&count=1&language=it&format=json"
            fetch(URL)
                .then(response1 => response1.json())
                .then(ordinate =>{
                    console.log(ordinate.results[0].latitude)
                    console.log(ordinate.results[0].longitude)
                    lat.value=ordinate.results[0].latitude
                    lon.value=ordinate.results[0].longitude
                    invio=true;
                    console.log(invio)
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
    if(!provinciaSelezionata!=="null")
    {
        document.getElementById("map").style.display="block"
        map.invalidateSize();
        // Rimuove tutti i marker precedenti
        comuniLayer.clearLayers();

        // Filtra solo i comuni della provincia selezionata
        const comuniProvincia = ElencoComuni.filter(c => c[1] === provinciaSelezionata)

        const richieste = comuniProvincia.map(comune => {
            //coustruisce l'url per l'API
            const url =
                "https://geocoding-api.open-meteo.com/v1/search?name=" +
                comune[0].replaceAll(" ", "%20") +
                "&count=1&language=it&format=json";

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
                L.marker([c[0], c[1]])
                .addTo(comuniLayer)
                .bindPopup(`<b>${c[2]}</b><br>Clicca per selezionare`)
                .on("click", () => {
                    selezionaComuneDaMappa(c[0], c[1], c[2]);
                })
                //senza funziona 1 sola volta
                setInterval(500, selezionaComuneDaMappa)
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
    chiudiMappaBtn.style.display="none";
    comuniLayer.clearLayers();
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



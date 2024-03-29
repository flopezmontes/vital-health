var lugarGlobal="";
var permisoCalendario;
var cal;
var fecha=new Date();
var aPoner=[];
var eventosTodos=new Array();
var usuario;
var citaSeleccionada;
var citasMedicas=new Array();
var nombreUsuario;
var checkedCorreo;

firebase.auth().onAuthStateChanged(function(user) {
var db = firebase.firestore();
 usuario = user.email;
 db.collection("usuarios").doc(usuario).get().then(function (doc){
  if(doc &&doc.exists){
    var myData = doc.data();
    nombreUsuario = myData.nombreUsuario;
     citasMedicas = myData.citasMedicas;
     checkedCorreo = myData.correoCitas;
  }
}).then(function(){
  meterCitas(citasMedicas);
})
})

function meterCitas(citasMedicas){
  citasMedicas.forEach(function(cita){
    var object = new Object();
    var contenido = cita.split("##")
    var especialidad = contenido[0]
    var fecha = contenido[1]
    var hora = contenido[2]
    var periodica = contenido[3]
    var fechaOriginal= fecha.split("/")
    var fechaParseada = fechaOriginal[2]+"-"+fechaOriginal[1]+"-"+fechaOriginal[0]

    object.id= especialidad + " " + fecha
    object.title=especialidad +" " + fecha
    object.start=fechaParseada;
    object.end= fechaParseada;
    object.backgroundColor="blue";
    object.description="Tienes una consulta de " + especialidad + " el día " + fecha + " a las " + hora;
    object.borrarBD=cita;
    eventosTodos.push(object);

    if(periodica=="true"){
      var valorPeriodicidad = parseInt(contenido[4]);
      var i=valorPeriodicidad;
      while(i<1095){
        var object = new Object()
        var dateParseada = new Date(Date.parse(fechaParseada));
        dateParseada.setDate(dateParseada.getDate()+i);
        object.description="Consulta periódica de " +especialidad
        object.id= especialidad 
        object.title=especialidad 
        object.start=dateParseada;
        object.end= dateParseada;
        object.backgroundColor="blue";
        object.borrarBD=cita;
        eventosTodos.push(object);
        i=i+valorPeriodicidad;
      }
      
    }



  
  })
 
      var calendarEl = document.getElementById('calendar');
      cal = new FullCalendar.Calendar(calendarEl, {
      eventClick: function(info) {
        console.log("Object",info.event)
        fecha=info.event.start
        citaSeleccionada=info.event.extendedProps.borrarBD;
        document.getElementById("tituloCita").innerText=info.event.title;
        document.getElementById("descriCita").innerText=info.event.extendedProps.description;            
        modalOpen("#modal")
  },
  events: eventosTodos,
  locale: 'es'
  })
  cal.render();
}
function modalClose(m){
$(m).modal('close'); 
}
function modalOpen(m){
$(m).modal('open');
}	
function comprobarPeriodicidad(){
var periodicidad = document.getElementById("periodicidad").value;
if(periodicidad=="true"){
  document.getElementById("divPeriodicidad").style.display="block";
}
else{
  document.getElementById("divPeriodicidad").style.display="none";
}
}
function añadirCita(){
  var r = confirm("Estás seguro de añadir la cita?");
  if (r == true) {
    var especialidad = document.getElementById("especialidad").value;
    var fecha = document.getElementById("fechaPicker").value;
    var hora = document.getElementById("timePicker").value;
    if(fecha.length==0){
      alert("Debes introducir la fecha de la cita");
      return;
    }
    if(hora.length==0){
      alert("Debes introducir la hora de la cita");
      return;
    }
    var periodicidad = document.getElementById("periodicidad").value;
    var valorPeriodicidad = document.getElementById("valorPeriodicidad").value;
    var cita=especialidad+"##"+fecha+"##"+hora+"##"+periodicidad+"##"+valorPeriodicidad;
    var db = firebase.firestore();
    db.collection("usuarios").doc(usuario).update({
      citasMedicas: firebase.firestore.FieldValue.arrayUnion(cita)
    }).then(function(){
      if(checkedCorreo=true){
        emailjs.init("3PR_-eTJj3PI9wL0d");
        var tempParams= {
          usuario:  nombreUsuario,
          especialidad: especialidad,
          dia: fecha,
          hora:hora,
          email: usuario
        }
        emailjs.send('service_p9gzh5v','template_4kablqy',tempParams).then(function(){
          $('#modal').modal('close');
          alert("Cita añadida correctamente");
          location.reload();
        })
      }


    })
  } 
}
$(document).ready(function(){
  $('.fixed-action-btn').floatingActionButton();
  $('.modal').modal();
  var selects = document.querySelectorAll('.select');
  M.FormSelect.init(selects)
  var minDate = new Date()
  $('.timepicker').timepicker({
    twelveHour: false
  })
  $('.datepicker').datepicker({
    format: 'dd/mm/yyyy',
    minDate: minDate,
    i18n: {
      months: ["Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio", "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"],
      monthsShort: ["Ene", "Feb", "Mar", "Abr", "May", "Jun", "Jul", "Ago", "Set", "Oct", "Nov", "Dic"],
      weekdays: ["Domingo","Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado"],
      weekdaysShort: ["Dom","Lun", "Mar", "Mie", "Jue", "Vie", "Sab"],
      weekdaysAbbrev: ["D","L", "M", "M", "J", "V", "S"]
  }
  })


});

function modificarCita(){
var citaModificar  = citaSeleccionada;
var especialidad= document.getElementById("especialidadMod").value
var fecha = document.getElementById("fechaPickerMod").value
var hora = document.getElementById("timePickerMod").value
if(fecha.length==0){
  alert("Debes introducir la fecha de la cita");
  return;
}
if(hora.length==0){
  alert("Debes introducir la hora de la cita");
  return;
}
var trozoDerecha = citaModificar.split("##")[3] + "##" + citaModificar.split("##")[4]

var citaModificada = especialidad + "##" + fecha + "##" + hora + "##" + trozoDerecha;
var r = confirm("Estas seguro de que quieres modificar la cita?");

if(r==true){
var db = firebase.firestore();
db.collection("usuarios").doc(usuario).update({
  citasMedicas: firebase.firestore.FieldValue.arrayRemove(citaModificar)
}).then(function(){
  db.collection("usuarios").doc(usuario).update({
    citasMedicas:firebase.firestore.FieldValue.arrayUnion(citaModificada)
  }).then(function(){
    alert("Cita modificada correctamente.")
    location.reload();
  })

})
}
else{
  $('#modal2').modal('close');
}
}

function abrirCita(){
modalClose('#modal')
var citaModificar  = citaSeleccionada;
var citaPartes = citaModificar.split("##");
var select = document.getElementById("especialidadMod");
select.value=citaPartes[0];
M.FormSelect.init(select);  
var minDate = new Date()

var fecha = document.getElementById('fechaPickerMod');
M.Datepicker.init(fecha,{
  format: 'dd/mm/yyyy',
  minDate: minDate,
  i18n: {
    months: ["Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio", "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"],
    monthsShort: ["Ene", "Feb", "Mar", "Abr", "May", "Jun", "Jul", "Ago", "Set", "Oct", "Nov", "Dic"],
    weekdays: ["Domingo","Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado"],
    weekdaysShort: ["Dom","Lun", "Mar", "Mie", "Jue", "Vie", "Sab"],
    weekdaysAbbrev: ["D","L", "M", "M", "J", "V", "S"]
}
})
$(fecha).val(citaPartes[1])

var hora = document.getElementById('timePickerMod')
M.Timepicker.init(hora, {
  defaultTime: citaPartes[2],
  twelveHour: false

});
$(hora).val(citaPartes[2])
$(hora).attr('selected','selected')
modalOpen('#modal3')
}
function eliminarCita(){
var r = confirm("Estás seguro de borrar la cita?");
  if (r == true) {
    var db = firebase.firestore();
    db.collection("usuarios").doc(usuario).update({
      citasMedicas: firebase.firestore.FieldValue.arrayRemove(citaSeleccionada)
    }).then(function(){
      $('#modal2').modal('close');
      alert("Cita borrada correctamente");
      location.reload();
    })
  } 

}


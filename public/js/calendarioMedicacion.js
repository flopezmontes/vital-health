var lugarGlobal="";
var permisoCalendario;
var cal;
var fecha=new Date();
var aPoner=[];
var eventosTodos=new Array();
var usuario;
var medicacionSeleccionada;
var medicaciones=new Array();


firebase.auth().onAuthStateChanged(function(user) {
 var db = firebase.firestore();
 usuario = user.email;
 db.collection("usuarios").doc(usuario).get().then(function (doc){
  if(doc &&doc.exists){
     var myData = doc.data();
     medicaciones = myData.medicaciones;
  }
}).then(function(){
  meterMedicaciones(medicaciones);
})
})

function meterMedicaciones(medicaciones){
  medicaciones.forEach(function(medicacion){
    var object = new Object();
    var contenido = medicacion.split("##")
    var nombre = contenido[0]
    var frecuencia = contenido[1]
    var fechaInicio = contenido[2]
    var fechaFin = contenido[3]
    var horaInicio = contenido[4]
    var fechaInicioOriginal= fechaInicio.split("/")
    var fechaParseada = fechaInicioOriginal[2]+"-"+fechaInicioOriginal[1]+"-"+fechaInicioOriginal[0]
    var fechaFinOriginal = fechaFin.split("/");
    var fechaFinParseada = fechaFinOriginal[2]+"-"+fechaFinOriginal[1]+"-"+fechaFinOriginal[0]
    object.id= nombre + " " + fechaInicio
    object.title=nombre +" " + fechaInicio
    object.start=fechaParseada;
    object.end= fechaFinParseada;
    object.backgroundColor="blue";
    object.description=  nombre + " a las "+ horaInicio+ " del día " + fechaInicio +" al dia " + fechaFin +" cada " + frecuencia +" horas";
    object.borrarBD=medicacion;
    eventosTodos.push(object);

    
      
    



  
  })
 
      var calendarEl = document.getElementById('calendar');
      cal = new FullCalendar.Calendar(calendarEl, {
      eventClick: function(info) {
        console.log("Object",info.event)
        fecha=info.event.start
        medicacionSeleccionada=info.event.extendedProps.borrarBD;
        document.getElementById("tituloMedicacion").innerText=info.event.title;
        document.getElementById("descriMedicacion").innerText=info.event.extendedProps.description;            
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

function añadirMedicacion(){
  var r = confirm("Estás seguro de añadir la medicación?");
  if (r == true) {
    var nombre = document.getElementById("nombreMedicacion").value;
    var frecuencia = document.getElementById("frecuencia").value;
    var fechaInicio = document.getElementById("fechaIPicker").value;
    var fechaFin = document.getElementById("fechaFPicker").value;
    var horaInicio = document.getElementById("timePicker").value;
    var medicacion=nombre+"##"+frecuencia+"##"+fechaInicio+"##"+fechaFin+"##"+horaInicio;
    var db = firebase.firestore();
    db.collection("usuarios").doc(usuario).update({
      medicaciones: firebase.firestore.FieldValue.arrayUnion(medicacion)
    }).then(function(){
      $('#modal').modal('close');
      alert("Medicación añadida correctamente");
      location.reload();
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

function modificarMedicacion(){
var medicacionModificar  = medicacionSeleccionada;
var nombreMedicacion= document.getElementById("nombreMedicacionMod").value
var frecuencia = document.getElementById("frecuenciaMod").value
var fechaInicio = document.getElementById("fechaIPickerMod").value
var fechaFin = document.getElementById("fechaFPickerMod").value
var horaInicio = document.getElementById("timePickerMod").value

var medicacionModificada = nombreMedicacion + "##" + frecuencia + "##" + fechaInicio + "##" + fechaFin + "##" + horaInicio;
var r = confirm("Estas seguro de que quieres modificar la medicación?");

if(r==true){
var db = firebase.firestore();
db.collection("usuarios").doc(usuario).update({
  medicaciones: firebase.firestore.FieldValue.arrayRemove(medicacionModificar)
}).then(function(){
  db.collection("usuarios").doc(usuario).update({
    medicaciones:firebase.firestore.FieldValue.arrayUnion(medicacionModificada)
  }).then(function(){
    alert("Medicación modificada correctamente.")
    location.reload();
  })

})
}
else{
  $('#modal2').modal('close');
}
}

function abrirMedicacion(){
modalClose('#modal')
var medicacionModificar  = medicacionSeleccionada;
var medicacionPartes = medicacionModificar.split("##");
var nombre = document.getElementById("nombreMedicacionMod");
nombre.value=medicacionPartes[0];  

var select = document.getElementById("frecuenciaMod");
select.value=medicacionPartes[1];
M.FormSelect.init(select); 

var minDate = new Date()
var fecha = document.getElementById('fechaIPickerMod');
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
$(fecha).val(medicacionPartes[2])
$(fecha).attr('selected','selected')

var fechaFin = document.getElementById('fechaFPickerMod')
M.Datepicker.init(fechaFin,{
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
$(fechaFin).val(medicacionPartes[3])
$(fechaFin).attr('selected','selected')

var horaInicio = document.getElementById('timePickerMod')
M.Timepicker.init(horaInicio, {
  defaultTime: medicacionPartes[4],
  twelveHour: false

});
$(horaInicio).val(medicacionPartes[4])
$(horaInicio).attr('selected','selected')
modalOpen('#modal3')
}
function eliminarMedicacion(){
var r = confirm("Estás seguro de borrar la medicación?");
  if (r == true) {
    var db = firebase.firestore();
    db.collection("usuarios").doc(usuario).update({
      medicaciones: firebase.firestore.FieldValue.arrayRemove(medicacionSeleccionada)
    }).then(function(){
      $('#modal2').modal('close');
      alert("Medicación borrada correctamente");
      location.reload();
    })
  } 

}


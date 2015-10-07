var editDoc, deleteDoc, newDoc, toggleNewDoc;
$(function() {
  var divMain = document.getElementById("main");
  var setMain = function(c) {
    divMain.innerHTML = c;
  }
  var tmplHome = document.getElementById("template-home").innerHTML;
  var tmplFiles = doT.template(document.getElementById("template-files").innerHTML);
  var tmplProfile = doT.template(document.getElementById("template-profile").innerHTML);

  function toggle_visibility(id) {
    var e = document.getElementById(id);
    if (e.style.display == 'block')
      e.style.display = 'none';
    else
      e.style.display = 'block';
  }

  toggleNewDoc = function() {
    toggle_visibility("menu-document-bar");
    toggle_visibility("new-document-bar");
  }

  function notify(message) {
    alert(message);
  }

  function notifyConfirm(message) {
    return confirm(message);
  }

  function loadFileList() {
    $.ajax({
      type: 'GET',
      url: '/api/v1/documents/my',
      success: function(data) {
        setMain(tmplFiles(data));
      },
      error: function(xhr, type) {
        notify('Ajax error!');
      }
    });
  }

  var newDocWorking = false;

  newDoc = function() {
    if (newDocWorking) return;
    else {
      document.getElementById("newdoctitle").disabled = true;
      newDocWorking = true;
      $.ajax({
        type: 'POST',
        url: '/api/v1/documents/new',
        data: {
          title: document.getElementById("newdoctitle").value
        },
        success: function(data) {
          notify("New document added.");
          document.getElementById("newdoctitle").disabled = false;
          newDocWorking = false;
          loadFileList();
        },
        error: function(xhr, type) {
          notify('An error occured!');
          document.getElementById("newdoctitle").disabled = false;
          newDocWorking = false;
        }
      });
    }
  }
  var deleteDocWorking = false;
  deleteDoc = function(id) {
    if (deleteDocWorking) return;
    else {
      if (notifyConfirm("Do you wish to delete this document?")) {
        deleteDocWorking = true;
        $.ajax({
          type: 'POST',
          url: '/api/v1/documents/delete',
          data: {
            id: id
          },
          success: function(data) {
            notify("Document deleted.");
            deleteDocWorking = false;
            loadFileList();
          },
          error: function(xhr, type) {
            notify('An error occured!');
            deleteDocWorking = false;
          }
        });
      } else {
        return;
      }
    }
  }
  if (!window.location.hash || window.location.hash.length < 2) {
    console.log("No hash on launch, sending to #/home");
    window.location.hash = "#/home"
  }
  routie('/home', function() {
    setMain(tmplHome);
  });
  routie('/my', function() {
    loadFileList();
  });
  routie('/me', function() {
    //this gets called when hash == #users
  });
});
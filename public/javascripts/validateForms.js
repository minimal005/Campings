(function () {
  "use strict";

  //Невеликий плагін, який робить динамічне введення файлів (имена файлів) Bootstrap 4 без залежностей. Script  прописаний в boilerplate.ejs
  bsCustomFileInput.init();

  // Fetch all the forms we want to apply custom Bootstrap validation styles to
  const forms = document.querySelectorAll(".validated-form");

  // Loop over them and prevent submission
  Array.from(forms).forEach(function (form) {
    form.addEventListener(
      "submit",
      function (event) {
        if (!form.checkValidity()) {
          event.preventDefault();
          event.stopPropagation();
        }

        form.classList.add("was-validated");
      },
      false
    );
  });
})();

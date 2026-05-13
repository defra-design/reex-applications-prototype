//
// For guidance on how to add JavaScript see:
// https://prototype-kit.service.gov.uk/docs/adding-css-javascript-and-images
//

window.GOVUKPrototypeKit.documentReady(() => {


  // Upgrade any select with `.js-autocomplete` class
  let autocompletes = document.querySelectorAll('.js-autocomplete')

  autocompletes.forEach(autocomplete => {
    accessibleAutocomplete.enhanceSelectElement({
      defaultValue: autocomplete.getAttribute('data-default-value'),
      selectElement: autocomplete
    })
  })


  // Hide dismissible element on dismiss link click
  let dismiss = document.getElementById('js-dismiss')
  let dismissible = document.getElementById('js-dismissible')
  try {
    dismiss.onclick = () => {
      dismissible.style.display = 'none';
    }
  } catch (error) {
    console.error(error);
  }



  const conditionals = document.querySelectorAll('.js-input-conditional');
  conditionals.forEach(conditional => {
    const input = conditional.querySelector('.govuk-input');
    const hidden = conditional.nextElementSibling;

    if (input.value == "") {
      hidden.classList.add('app-input-conditional__item--hidden');
    } else {
      hidden.classList.remove('app-input-conditional__item--hidden');
    }

    input.addEventListener('input', function () {
      if (input.value == "") {
        hidden.classList.add('app-input-conditional__item--hidden');
      } else {
        hidden.classList.remove('app-input-conditional__item--hidden');
      }
    });
  });

  // div.classList.remove("foo");


  // message.addEventListener('input', function () {
  //   const message = document.querySelector('#message');
  //   result.textContent = this.value;
  // });
  // nextElementSibling


})

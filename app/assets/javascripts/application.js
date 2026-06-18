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


  // Hide and show the conditional inputs for the business plan based on if there is an answer for the percentage input
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




  // Add select all option (used on overseas sites)
  const selectAll = document.querySelectorAll('.js-select-all')
  const selectAllElement = '<div class="govuk-checkboxes__item"><input class="govuk-checkboxes__input" id="selectAll" type="checkbox"><label class="govuk-label govuk-checkboxes__label" for="selectAll" id="selectAllLabel">Select all sites</label></div><div class="govuk-checkboxes__divider"> </div>'

  selectAll.forEach(item => {
    // Define the other checkboxes so we can toggle them
    const checkboxes = item.querySelectorAll('.govuk-checkboxes__input');

    // Insert the select all option and define it for later manipulation
    item.insertAdjacentHTML('afterbegin', selectAllElement)
    const selectAllItem = document.getElementById('selectAll')

    for (var i = 0; i < checkboxes.length; i++) {
      //Convert to array
      let inputList = Array.prototype.slice.call(checkboxes);
      // Check if select all should be ticked on page load
      selectAllItem.checked = inputList.every(function(c) {
        return c.checked
      });
      // Check if select all should be ticked on each checkbox change
      checkboxes[i].addEventListener('change', function() {
        //Set checked property of selectAllItem input
        selectAllItem.checked = inputList.every(function(c) {
          return c.checked
        });
      });
    }

    selectAllItem.addEventListener('change', function() {
      for (var i = 0; i < checkboxes.length; i++) {
        checkboxes[i].checked = selectAllItem.checked
      }
    })
  })



})

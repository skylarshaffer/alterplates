'use strict';
//  DOM
//    D.1   variable definition
//      D.1.plate
const $plate = document.querySelector('#plate');
const $input = document.querySelector('input');
const $suggestions = document.querySelectorAll('.suggestions .plate');
//    D.2   domQueries object
const domQueries = {
  $plate,
  $input,
};
//    D.3   error checking
for (const key in domQueries) {
  if (!domQueries[key]) throw new Error(`The ${key} dom query failed`);
}
//  LISTENERS
//    L.1   keydown
//      L.1.document keydown
//  document handleKeydown
document.addEventListener('keydown', (event) => {
  const eventTarget = event.target;
  if (eventTarget !== $input) {
    if (event.key === 'Backspace' && $input.value.length > 0) {
      $input.value = $input.value.substring(0, $input.value.length - 1);
    } else if (testKeyStrict(event.key) && $input.value.length < 7) {
      event.preventDefault();
      $input.value += event.key;
    }
  }
});
//      L.1.input keydown
//  $input handleKeydown
$input.addEventListener('keydown', (event) => {
  if (!testKey(event.key)) {
    event.preventDefault();
  }
  $input.selectionStart = $input.selectionEnd = $input.value.length;
});
function testKey(key) {
  return /[A-Za-z0-9 ]/.test(key);
}
function testKeyStrict(key) {
  return /^[A-Za-z0-9 ]$/.test(key);
}
function getSuggestions(plateNumber) {
  console.log(plateNumber);
  $suggestions[0].firstElementChild.textContent = '';
  $suggestions[1].firstElementChild.textContent = '';
  $suggestions[2].firstElementChild.textContent = '';
  $suggestions[3].firstElementChild.textContent = '';
  $suggestions[4].firstElementChild.textContent = '';
  $suggestions[5].firstElementChild.textContent = '';
  $suggestions[6].firstElementChild.textContent = '';
  $suggestions[7].firstElementChild.textContent = '';
  $suggestions[8].firstElementChild.textContent = '';
  $suggestions[9].firstElementChild.textContent = '';
}
getSuggestions('ASSAFD');

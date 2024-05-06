/* global data */

//  DOM
//    D.1   variable definition
//      D.1.plate
const $plate = document.querySelector('#plate') as HTMLAnchorElement;
const $input = document.querySelector('input') as HTMLInputElement;

//    D.2   domQueries object
const domQueries: Record<string, any> = {
  $plate,
  $input,
};

//    D.3   error checking
for (const key in domQueries) {
  if (!domQueries[key]) throw new Error(`The ${key} dom query failed`);
}

//  LISTENERS
//    L.1   clicks
//      L.1.list clicks
//  $ul handleClick
document.addEventListener('keydown', (event: KeyboardEvent) => {
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

$input.addEventListener('keydown', (event: KeyboardEvent) => {
  if (!testKey(event.key)) {
    event.preventDefault();
  }
  $input.selectionStart = $input.selectionEnd = $input.value.length;
});

function testKey(key: string): boolean {
  return /[A-Za-z0-9 ]/.test(key);
}

function testKeyStrict(key: string): boolean {
  return /^[A-Za-z0-9 ]$/.test(key);
}

console.log(data);

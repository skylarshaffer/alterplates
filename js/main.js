'use strict';
const data = {
  plate: {
    value: '',
    noNumbers: '',
  },
  suggestions: {},
};
Object.defineProperty(data.plate, 'noNumbers', {
  get: function () {
    return removeNumbers(this.value);
  },
});
function resetNumbers(suggestion) {
  let newSuggestion = suggestion;
  if (data.plate.value !== data.plate.noNumbers) {
    let i = 0;
    for (i; i < data.plate.value.length; i++) {
      if (!isNaN(parseInt(data.plate.value[i]))) {
        newSuggestion = data.plate.value[i] + newSuggestion;
      } else {
        break;
      }
    }
    for (i; i < data.plate.value.length; i++) {
      if (!isNaN(parseInt(data.plate.value[i]))) {
        newSuggestion += data.plate.value[i];
      }
    }
  }
  return newSuggestion;
}
function removeNumbers(string) {
  return string.replace(/[0-9]/g, '');
}
//  DOM
//    D.1   variable definition
//      D.1.plate
const $plate = document.querySelector('#plate');
const $input = document.querySelector('input');
const $suggestionsList = document.querySelectorAll('.suggestions .plate');
const $suggestions = document.querySelector('.suggestions');
const $backdropSuggestions = document.querySelector(
  '.backdrop:has(+ main.container',
);
const $favorites = document.querySelector('.favorites');
//    D.2   domQueries object
const domQueries = {
  $plate,
  $input,
  $suggestionsList,
  $suggestions,
  $backdropSuggestions,
  $favorites,
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
  const plateValueInit = $input.value;
  if (eventTarget !== $input) {
    if (event.key === 'Backspace' && plateValueInit.length > 0) {
      data.plate.value = plateValueInit.substring(0, plateValueInit.length - 1);
      $input.value = data.plate.value;
    } else if (testKeyStrict(event.key) && plateValueInit.length < 7) {
      event.preventDefault();
      data.plate.value += event.key;
      $input.value = data.plate.value;
    }
  }
});
document.addEventListener('keydown', async (event) => {
  const eventTarget = event.target;
  if (eventTarget !== $input) {
    await getSuggestions();
  }
});
//      L.1.input keydown
//  $input handleKeydown
$input.addEventListener('keydown', (event) => {
  if (!testKey(event.key)) {
    event.preventDefault();
  }
});
$input.addEventListener('input', () => {
  $input.selectionStart = $input.selectionEnd = $input.value.length;
  if ($input.checkValidity()) {
    data.plate.value = $input.value;
  } else {
    $input.value = data.plate.value;
  }
});
$input.addEventListener('input', async () => {
  await getSuggestions();
});
$backdropSuggestions.addEventListener('click', () => {
  document.querySelector('dialog[open]').close();
});
$suggestions.addEventListener('click', (event) => {
  const eventTarget = event.target;
  if (eventTarget.classList.contains('plate')) {
    const uniqueDialog = eventTarget.children[1];
    uniqueDialog.show();
  } else if (
    eventTarget.nodeName === 'BUTTON' ||
    eventTarget.nodeName === 'DIALOG'
  ) {
    const $currentDialog = eventTarget.closest('dialog');
    if (eventTarget.classList.contains('confirm')) {
      $currentDialog.close();
    } else if (eventTarget.classList.contains('delete')) {
      $currentDialog.close();
    } else {
      $currentDialog.close();
    }
  }
});
$favorites.addEventListener('click', (event) => {
  const eventTarget = event.target;
  console.log(eventTarget);
  if (eventTarget.classList.contains('plate')) {
    const uniqueDialog = eventTarget.children[2];
    uniqueDialog.show();
  } else if (
    eventTarget.nodeName === 'BUTTON' ||
    eventTarget.nodeName === 'DIALOG' ||
    eventTarget.classList.contains('backdrop')
  ) {
    const $currentDialog = eventTarget.closest('dialog');
    const $currentPlate = eventTarget.closest('div.plate');
    if (eventTarget.classList.contains('confirm')) {
      $currentDialog.close();
    } else if (eventTarget.classList.contains('delete')) {
      $currentPlate.remove();
      $currentDialog.close();
    } else {
      document.querySelector('dialog[open]').close();
    }
  }
});
function testKey(key) {
  return /[A-Za-z0-9 ]/.test(key);
}
function testKeyStrict(key) {
  return /^[A-Za-z0-9 ]$/.test(key);
}
function getRequestUrl(
  option,
  keyword,
  url = 'https://api.datamuse.com/words?',
) {
  //  Autocomplete suggestions only
  if (option.includes('autocomplete')) {
    url = `https://api.datamuse.com/sug?s=${keyword}`;
  } else {
    if (url !== 'https://api.datamuse.com/words?') {
      if (url.includes('?')) {
        if (!url.endsWith('&')) {
          url += '&';
        }
      }
    }
    //  Root options
    if (option.includes('meansLike')) {
      url += `ml=${keyword}&`;
    }
    if (option.includes('soundsLike')) {
      url += `sl=${keyword}&`;
    }
    if (option.includes('spelledLike')) {
      url += `sp=${keyword}&`;
    }
    if (option.includes('followsWords')) {
      url += `lc=${keyword}&`;
    }
    if (option.includes('followedWith')) {
      url += `rc=${keyword}&`;
    }
    if (option.includes('startsWith')) {
      url += `sp=${keyword}*&`;
    }
    if (option.includes('endsWith')) {
      url += `sp=*${keyword}&`;
    }
    //  Related word options
    if (option.includes('describesWords')) {
      url += `rel_jja=${keyword}&`;
    }
    if (option.includes('describedWith')) {
      url += `rel_jjb=${keyword}&`;
    }
    if (option.includes('associatedWith')) {
      url += `rel_trg=${keyword}&`;
    }
  }
  //  Trim last &amp;
  if (url.endsWith('&')) {
    if (url.includes('max')) {
      url = url.substring(0, url.length - 1);
    } else {
      url += 'max=10';
    }
  }
  return url;
}
async function makeRequest(url) {
  let responseArr = [];
  try {
    const response = await fetch(url);
    try {
      if (!response) throw new Error();
      try {
        if (response.ok !== true) throw new Error();
        responseArr = await response.json();
      } catch (e) {
        try {
          console.log(
            `Endpoint exists but cannot return page contents, error code (page status): ${response.status}. Full page response is ${response.json()}.`,
            e,
          );
        } catch (e) {
          console.log(
            `Endpoint exists but cannot return page, nor can log see response.`,
          );
        }
      }
    } catch (e) {
      console.log('Fetch succeeded but got no response.', e);
    }
  } catch (e) {
    console.log('Endpoint does not exist or fetch failed.', e);
  }
  return responseArr;
}
async function getSuggestion(
  option,
  keyword,
  length = 7 - (data.plate.value.length - data.plate.noNumbers.length),
  url = 'https://api.datamuse.com/words?',
) {
  const requestUrl = getRequestUrl(option, keyword, url);
  const responseArr = await makeRequest(requestUrl);
  const newArr = [];
  if (responseArr.length === 0) {
    newArr.push({ word: 'none' });
  }
  responseArr.forEach((responseWord, index, array) => {
    if (
      responseWord.word.length <= length &&
      !data.suggestions[data.plate.noNumbers].includes(responseWord.word) &&
      responseWord.word !== data.plate.noNumbers
    ) {
      newArr.push(array[index]);
    }
    if (newArr.length === 0) {
      newArr.push({ word: 'none' });
    }
  });
  return newArr[0].word;
}
const methods = [
  'meansLike',
  'soundsLike',
  'spelledLike',
  'followsWords',
  'followedWith',
  'startsWith',
  'endsWith',
  'describesWords',
  'describedWith',
  'associatedWith',
];
async function writeSuggestions() {
  if (data.plate.value) {
    if (!data.suggestions[data.plate.noNumbers]) {
      data.suggestions[data.plate.noNumbers] = [];
      let i2 = 0;
      for (let i = 0; i < methods.length; i++) {
        const suggestedWord = resetNumbers(
          await getSuggestion(methods[i], data.plate.noNumbers),
        );
        if (!suggestedWord.includes('none')) {
          data.suggestions[data.plate.noNumbers].push(suggestedWord);
          $suggestionsList[i2].firstElementChild.textContent = suggestedWord;
          i2++;
        }
      }
    } else {
      for (let i = 0; i < data.suggestions[data.plate.noNumbers].length; i++) {
        $suggestionsList[i].firstElementChild.textContent =
          data.suggestions[data.plate.noNumbers][i];
      }
    }
  }
}
async function getSuggestions() {
  if ($input.value) {
    await writeSuggestions();
  } else {
    for (let i = 0; i < 10; i++) {
      $suggestionsList[i].firstElementChild.textContent = '';
    }
  }
}
// <div class="plate">
//           <span></span>
//           <dialog>
//             <button class="confirm">
//               <i class="fa-solid fa-star"></i>
//             </button>
//           </dialog>
//         </div>

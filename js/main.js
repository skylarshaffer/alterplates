'use strict';
const data = {
  plate: {
    value: '',
    noNumbers: '',
  },
};
Object.defineProperty(data.plate, 'noNumbers', {
  get: function () {
    return this.value.replace(/[0-9]/g, '');
  },
});
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
    await writeSuggestions();
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
  await writeSuggestions();
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
    if (option.includes('startWith')) {
      url += `sp=${keyword}*&`;
    }
    if (option.includes('endWith')) {
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
  length = 7,
  url = 'https://api.datamuse.com/words?',
) {
  const requestUrl = getRequestUrl(option, keyword, url);
  const responseArr = await makeRequest(requestUrl);
  const newArr = [];
  responseArr.forEach((responseWord, index, array) => {
    if (responseWord.word.length <= length) {
      newArr.push(array[index]);
    }
  });
  console.log(newArr);
  return newArr[0].word;
}
async function writeSuggestions() {
  if ($input.value) {
    $suggestions[0].firstElementChild.textContent = await getSuggestion(
      'soundsLike',
      data.plate.noNumbers,
      data.plate.noNumbers.length,
    );
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
}
const exResult = getSuggestion('soundsLike', 'apple');
console.log(exResult);
console.log(data.plate.noNumbers);

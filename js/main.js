'use strict';
const data = { plateValue: '' };
console.log(data);
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
document.addEventListener('keydown', async () => {
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
    if (option.includes('startWith')) {
      url += `sp=${keyword}*&`;
    }
    if (option.includes('endWith')) {
      url += `sp=*${keyword}&`;
    }
  }
  //  Trim last &amp;
  if (url.endsWith('&')) {
    url = url.substring(0, url.length - 1);
  }
  return url;
}
async function makeRequest(url) {
  let newArr = [];
  try {
    const response = await fetch(url);
    try {
      if (!response) throw new Error();
      try {
        if (response.ok !== true) throw new Error();
        newArr = await response.json();
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
  return newArr[0].word;
}
async function getSuggestion(
  option,
  keyword,
  url = 'https://api.datamuse.com/words?',
) {
  const requestUrl = getRequestUrl(option, keyword, url);
  return await makeRequest(requestUrl);
}
async function writeSuggestions() {
  if ($input.value) {
    $suggestions[0].firstElementChild.textContent = await getSuggestion(
      'soundsLike',
      $input.value,
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
writeSuggestions();
const exResult = getSuggestion('soundsLike', 'apple');
console.log(exResult);

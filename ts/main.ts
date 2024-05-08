interface Plate extends HTMLDivElement {
  firstElementChild: HTMLSpanElement;
}

interface ResponseWord {
  word: string;
  score: number;
}

interface Data {
  plateValue: string;
}

const data = { plateValue: '' } as Data;
console.log(data);

//  DOM
//    D.1   variable definition
//      D.1.plate
const $plate = document.querySelector('#plate') as HTMLAnchorElement;
const $input = document.querySelector('input') as HTMLInputElement;
const $suggestions = document.querySelectorAll(
  '.suggestions .plate',
) as NodeListOf<Plate>;

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
//    L.1   keydown
//      L.1.document keydown
//  document handleKeydown
document.addEventListener('keydown', async (event: KeyboardEvent) => {
  const eventTarget = event.target;
  const plateValueInit = $input.value;
  if (eventTarget !== $input) {
    if (event.key === 'Backspace' && plateValueInit.length > 0) {
      data.plateValue = plateValueInit.substring(0, plateValueInit.length - 1);
      $input.value = data.plateValue;
    } else if (testKeyStrict(event.key) && plateValueInit.length < 7) {
      event.preventDefault();
      data.plateValue += event.key;
      $input.value = data.plateValue;
    }
    await writeSuggestions(data.plateValue);
  }
});
//      L.1.input keydown
//  $input handleKeydown
$input.addEventListener('keydown', (event: KeyboardEvent) => {
  if (!testKey(event.key)) {
    event.preventDefault();
  }
});

$input.addEventListener('input', () => {
  $input.selectionStart = $input.selectionEnd = $input.value.length;
  if ($input.checkValidity()) {
    data.plateValue = $input.value;
  } else {
    $input.value = data.plateValue;
  }
});

$input.addEventListener('input', async () => {
  await writeSuggestions(data.plateValue);
});

function testKey(key: string): boolean {
  return /[A-Za-z0-9 ]/.test(key);
}

function testKeyStrict(key: string): boolean {
  return /^[A-Za-z0-9 ]$/.test(key);
}

function getRequestUrl(
  option: string,
  keyword: string,
  url: string = 'https://api.datamuse.com/words?',
): string {
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

async function makeRequest(url: string): Promise<string> {
  let newArr = [] as ResponseWord[];
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
            `Endpoint exists but cannot return page contents, error code (page status): ${
              response.status
            }. Full page response is ${response.json()}.`,
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
  option: string,
  keyword: string,
  url: string = 'https://api.datamuse.com/words?',
): Promise<string> {
  const requestUrl = getRequestUrl(option, keyword, url);
  return await makeRequest(requestUrl);
}

async function writeSuggestions(plateValue: string): Promise<void> {
  if ($input.value) {
    $suggestions[0].firstElementChild.textContent = await getSuggestion(
      'soundsLike',
      plateValue,
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

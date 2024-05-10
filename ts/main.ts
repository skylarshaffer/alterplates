interface PlateDiv extends HTMLDivElement {
  firstElementChild: HTMLSpanElement;
}

interface ResponseWord {
  word: string;
  score?: number;
  numSyllables?: number;
}

interface Plate {
  value: string;
  noNumbers: string;
}

interface Data {
  plate: Plate;
  suggestions: Record<string, string[]>;
}

const data = {
  plate: {
    value: '',
    noNumbers: '',
  },
  suggestions: {},
} as Data;

Object.defineProperty(data.plate, 'noNumbers', {
  get: function () {
    return removeNumbers(this.value);
  },
});

function resetNumbers(suggestion: string): string {
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

function removeNumbers(string: string): string {
  return string.replace(/[0-9]/g, '');
}

//  DOM
//    D.1   variable definition
//      D.1.plate
const $plate = document.querySelector('#plate') as HTMLAnchorElement;
const $input = document.querySelector('input') as HTMLInputElement;
const $suggestionsList = document.querySelectorAll(
  '.suggestions .plate',
) as NodeListOf<PlateDiv>;
const $suggestions = document.querySelector('.suggestions') as HTMLDivElement;
const $backdrop = document.querySelector('.backdrop') as HTMLDivElement;

//    D.2   domQueries object
const domQueries: Record<string, any> = {
  $plate,
  $input,
  $suggestionsList,
  $suggestions,
  $backdrop,
};

//    D.3   error checking
for (const key in domQueries) {
  if (!domQueries[key]) throw new Error(`The ${key} dom query failed`);
}

//  LISTENERS
//    L.1   keydown
//      L.1.document keydown
//  document handleKeydown
document.addEventListener('keydown', (event: KeyboardEvent) => {
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

document.addEventListener('keydown', async (event: KeyboardEvent) => {
  const eventTarget = event.target;
  if (eventTarget !== $input) {
    await getSuggestions();
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
    data.plate.value = $input.value;
  } else {
    $input.value = data.plate.value;
  }
});

$input.addEventListener('input', async () => {
  await getSuggestions();
});

$backdrop.addEventListener('click', () => {
  (document.querySelector('dialog[open]') as HTMLDialogElement).close();
  hideBackdrop();
});

$suggestions.addEventListener('click', (event: Event) => {
  const eventTarget = event.target as HTMLDivElement | HTMLButtonElement;
  console.log(eventTarget);
  if (eventTarget.classList.contains('plate')) {
    const uniqueDialog = eventTarget.children[1] as HTMLDialogElement;
    uniqueDialog.show();
    showBackdrop();
  } else if (
    eventTarget.nodeName === 'BUTTON' ||
    eventTarget.nodeName === 'DIALOG'
  ) {
    const $currentDialog = eventTarget.closest('dialog') as HTMLDialogElement;
    if (eventTarget.classList.contains('confirm')) {
      $currentDialog.close();
      hideBackdrop();
    } else if (eventTarget.classList.contains('delete')) {
      $currentDialog.close();
      hideBackdrop();
    } else {
      $currentDialog.close();
      hideBackdrop();
    }
  }
});

function showBackdrop(): void {
  $backdrop.classList.remove('hidden');
}

function hideBackdrop(): void {
  $backdrop.classList.add('hidden');
}

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

async function makeRequest(url: string): Promise<ResponseWord[]> {
  let responseArr = [] as ResponseWord[];
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
  return responseArr;
}

async function getSuggestion(
  option: string,
  keyword: string,
  length: number = 7 - (data.plate.value.length - data.plate.noNumbers.length),
  url: string = 'https://api.datamuse.com/words?',
): Promise<string> {
  const requestUrl = getRequestUrl(option, keyword, url);
  const responseArr = await makeRequest(requestUrl);
  const newArr = [] as ResponseWord[];
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

async function writeSuggestions(): Promise<void> {
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

async function getSuggestions(): Promise<void> {
  if ($input.value) {
    await writeSuggestions();
  } else {
    for (let i = 0; i < 10; i++) {
      $suggestionsList[i].firstElementChild.textContent = '';
    }
  }
}

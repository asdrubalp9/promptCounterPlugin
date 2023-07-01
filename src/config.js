import { geti18nMessage } from "./helpers";

const config = [
  {
    type: 'separator',
    label: geti18nMessage('configLabel'),
  },
  {
    name: 'sound',
    label: geti18nMessage('soundConfigLabel'),
    placeholder: geti18nMessage('soundConfigPlaceholder'),
    htmlId: 'sound',
    htmlclass: '',
    value: '',
    defaultValue: 'always',
    type: 'radio',
    Hint: '',
    options: [
      {
        label: geti18nMessage('alwaysSoundLabel'),
        value: 'always', 
      },
      {
        label: geti18nMessage('soundWhenNotFocusedLabel'),
        value: 'notFocused',
      },
      {
        label: geti18nMessage('neverSoundLabel'),
        value: 'never',
      },
    ],
  },
  {
    name: 'promptCount',
    label: geti18nMessage('promptCountLabel'),
    htmlId: 'promptCount',
    value: 0,
    defaultValue: 0,
    type: 'hidden',
  },
  {
    name: 'fechaUltimoPrompt',
    label: geti18nMessage('fechaUltimoPromptLabel'),
    htmlId: 'fechaUltimoPrompt',
    value: 0,
    defaultValue: 0,
    type: 'hidden',
  },
  
  
  // {
  //   name: 'continuousMode',
  //   label: 'Set continuous mode',
  //   placeholder: 'Set continuous mode',
  //   htmlId: 'continuousMode',
  //   htmlclass: '',
  //   value: '',
  //   defaultValue: 'false',
  //   type: 'checkbox',
  //   Hint: 'Whether continuous results are returned for each recognition, or only a single result',
  // },
  
  // {
  //   name: 'interimResults',
  //   label: 'Set interim results',
  //   placeholder: 'Set interim results',
  //   htmlId: 'interimResults',
  //   htmlclass: '',
  //   value: '',
  //   defaultValue: 'false',
  //   type: 'checkbox',
  //   Hint: 'Whether interim results should be returned (true) or not (false)',
  // },
  // {
  //   type: 'separator',
  //   label: 'Element Redaction',
  // },
  // {
  //   type: 'p',
  //   label: 'Use css selectors to select the content of the HTML you want to redact and select the option to redact or not redact the content of the selected HTML element. <br> To paste the content, just press ctrl+shift+Z and it will paste it in the prompt or press the button bellow the download chat button.',
  // },
  // {
  //   type: 'button',
  //   class:"btn btn-warning",
  //   label: 'Reset to default',
  //   action: (e) => {
  //     console.log('click');
  //   },
  // }
];


export { config };

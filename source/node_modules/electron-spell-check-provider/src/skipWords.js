// Words that the spellchecker should not show as errors.
var SKIP_WORDS = {
  'en-US': [
    // Prevent the spellchecker from showing contractions as errors.
    'ain',
    'couldn',
    'didn',
    'doesn',
    'hadn',
    'hasn',
    'mightn',
    'mustn',
    'needn',
    'oughtn',
    'shan',
    'shouldn',
    'wasn',
    'weren',
    'wouldn'
  ]
};

module.exports = SKIP_WORDS;
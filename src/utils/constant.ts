export const NAME_TEMPLATES = [
  { id: 1, option: '1', name: '네임스티커_01스마일' },
  { id: 2, option: '2', name: '네임스티커_02파스텔' },
  { id: 3, option: '3', name: '네임스티커_03레인보우' },
  { id: 4, option: '4', name: '네임스티커_04플라워' },
  { id: 5, option: '5', name: '네임스티커_05하트' },
  { id: 6, option: '6', name: '네임스티커_06스타' },
  { id: 7, option: '7', name: '네임스티커_07심플한글네임' },
  { id: 8, option: '8', name: '네임스티커_08심플영문네임' },
  { id: 9, option: '9', name: '네임스티커_09심플학교' },
];

export const DOG_TEMPLATES = [
  { id: 1, option: '01', name: '01포메라니안(화이트)' },
  { id: 2, option: '02', name: '02포메라니안(크림)' },
  { id: 3, option: '03', name: '03포메라니안(블랙)' },
  { id: 4, option: '04', name: '04포메라니안(블랙탄)' },
  { id: 5, option: '05', name: '05푸들(화이트)' },
  { id: 6, option: '06', name: '06푸들(브라운)' },
  { id: 7, option: '07', name: '07푸들(실버)' },
  { id: 8, option: '08', name: '08푸들(블랙)' },
  { id: 9, option: '09', name: '09푸들(크림)' },
  { id: 10, option: '10', name: '10비숑(화이트)' },
  { id: 11, option: '11', name: '11말티즈 단모(화이트)' },
  { id: 12, option: '12', name: '12말티즈 장모(화이트)' },
  { id: 13, option: '13', name: '13말티푸(화이트)' },
  { id: 14, option: '14', name: '14말티푸(크림)' },
  { id: 15, option: '15', name: '15말티푸(브라운)' },
  { id: 16, option: '16', name: '16말티푸(블랙)' },
  { id: 17, option: '17', name: '17말티푸(실버)' },
  { id: 18, option: '18', name: '18시바견(화이트)' },
  { id: 19, option: '19', name: '19시바견(브라운)' },
  { id: 20, option: '20', name: '20시바견(블랙)' },
  { id: 21, option: '21', name: '21치와와(블랙탄)' },
  { id: 22, option: '22', name: '22치와와(초코탄)' },
  { id: 23, option: '23', name: '23치와와(크림)' },
  { id: 24, option: '24', name: '24치와와(화이트)' },
  { id: 25, option: '25', name: '25시츄(단모)' },
  { id: 26, option: '26', name: '26시츄(장모)' },
  { id: 27, option: '27', name: '27진돗개(백구)' },
  { id: 28, option: '28', name: '28진돗개(황구)' },
  { id: 29, option: '29', name: '29프렌치불독(화이트&블랙)' },
  { id: 30, option: '30', name: '30프렌치불독(크림)' },
  { id: 31, option: '31', name: '31프렌치불독(블랙)' },
  { id: 32, option: '32', name: '32프렌치불독(화이트)' },
  { id: 33, option: '33', name: '33요크셔테리어' },
  { id: 34, option: '34', name: '34슈나우저' },
  { id: 35, option: '35', name: '35닥스훈트(초코탄)' },
  { id: 36, option: '36', name: '36닥스훈트(블랙탄)' },
  { id: 37, option: '37', name: '37비글' },
  { id: 38, option: '38', name: '38페키니즈' },
  { id: 39, option: '39', name: '39웰시코기' },
  { id: 40, option: '40', name: '40골든리트리버' },
  { id: 41, option: '41', name: '41베들링턴 테리어' },
  { id: 42, option: '42', name: '42꼬똥 드 툴레아' },
  { id: 43, option: '43', name: '43심플' },
];

export const LOGO_TEMPLATES = [
  { id: 1, option: 'S_40X20', name: 'S_40X20' },
  { id: 2, option: 'S_60X30', name: 'S_60X30' },
];

export const getVariantType = (variantValue: string) => {
  let MAX_TEMPLATES = 0,
    INIT_VARIANT_TYPE = '',
    VARIANT_TYPE_TEXT = '';

  if (variantValue === '베이직' || variantValue === 'basic') {
    MAX_TEMPLATES = 5;
    INIT_VARIANT_TYPE = '1';
    VARIANT_TYPE_TEXT = '베이직';
  } else if (variantValue === '대용량' || variantValue === 'extra') {
    MAX_TEMPLATES = 2;
    INIT_VARIANT_TYPE = '2';
    VARIANT_TYPE_TEXT = '대용량';
  } else if (variantValue === '강아지' || variantValue === 'dog') {
    MAX_TEMPLATES = 10;
    INIT_VARIANT_TYPE = 'D';
    VARIANT_TYPE_TEXT = '강아지';
  } else if (variantValue === '긴급') {
    MAX_TEMPLATES = 2;
    INIT_VARIANT_TYPE = 'E';
    VARIANT_TYPE_TEXT = '긴급';
  }

  return { MAX_TEMPLATES, INIT_VARIANT_TYPE, VARIANT_TYPE_TEXT };
};

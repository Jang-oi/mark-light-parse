// px를 mm로 변환하는 함수
function pxToMm(px: number) {
  return px / 3.78; // 1mm = 3.78px 가정
}

// mm를 px로 변환하는 함수
function mmToPx(mm: number) {
  return mm * 3.78; // 1mm = 3.78px 가정
}

const extractNumbers = (str: string): { horizontal: number; vertical: number } => {
  const parts = str.split('_')[1].split('X'); // '_' 기준으로 나누고 'X' 기준으로 나눔
  const horizontal = parseInt(parts[0], 10); // 앞의 숫자
  const vertical = parseInt(parts[1], 10); // 뒤의 숫자
  return { horizontal, vertical };
};

// 이미지 크기를 비율에 맞춰 조정한 후 mm로 리턴하는 함수
export const isHorizontalType = (originalWidthPx: number, originalHeightPx: number, targetOption: string) => {
  const { horizontal, vertical } = extractNumbers(targetOption);
  const targetWidthPx = mmToPx(horizontal); // targetWidthMm 를 픽셀로 변환

  const aspectRatio = originalHeightPx / originalWidthPx; // 원본 이미지의 비율 계산
  const targetHeightPx = targetWidthPx * aspectRatio; // 비율에 맞춘 세로 크기 계산

  const targetHeightMm = pxToMm(targetHeightPx); // 계산된 세로 크기를 mm로 변환

  const heightMm = parseFloat(targetHeightMm.toFixed(3));

  return vertical > heightMm;
};

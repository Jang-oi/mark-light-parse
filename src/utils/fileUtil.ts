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
export const getNewWidthAndHeight = (originalWidthPx: number, originalHeightPx: number, targetOption: string) => {
  const { horizontal: targetWidthMm, vertical: targetHeightMm } = extractNumbers(targetOption);

  const targetWidthPx = mmToPx(targetWidthMm); // 타겟 가로 크기를 mm에서 px로 변환
  const targetHeightPx = mmToPx(targetHeightMm); // 타겟 세로 크기를 mm에서 px로 변환

  const aspectRatio = originalWidthPx / originalHeightPx; // 원본 이미지 비율 계산
  const calculatedHeightPx = targetWidthPx / aspectRatio; // 비율에 맞춰 가로 기준으로 세로 크기 계산

  // 높이가 기준을 초과하지 않으면 가로 기준, 초과하면 세로 기준으로 크기 조정
  if (calculatedHeightPx <= targetHeightPx) {
    const newHeightMm = pxToMm(calculatedHeightPx);
    return { newWidth: targetWidthMm, newHeight: parseFloat(newHeightMm.toFixed(3)) };
  } else {
    const calculatedWidthPx = targetHeightPx * aspectRatio;
    const newWidthMm = pxToMm(calculatedWidthPx);
    return { newWidth: parseFloat(newWidthMm.toFixed(3)), newHeight: targetHeightMm };
  }
};

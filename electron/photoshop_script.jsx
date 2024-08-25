app.preferences.rulerUnits = Units.CM;

function parseJSON(jsonStr) {
  // 간단한 JSON 파서
  var obj;
  try {
    obj = eval('(' + jsonStr + ')');
  } catch (e) {
    obj = [];
  }
  return obj;
}

function getFilePath(filePath, fileName) {
  return filePath.replace(/photoshop_script\.jsx$/, fileName);
}

// PDF 파일을 열기 위한 함수
function openPDF(pdfPath) {
  var fileRef = new File(pdfPath);
  // PDF 열기 옵션 설정
  var openOptions = new PDFOpenOptions();
  openOptions.antiAlias = true;
  openOptions.resolution = 300; // 해상도 설정 (DPI)
  openOptions.mode = OpenDocumentMode.CMYK; // 색상 모드 설정 (CMYK)

  /*  openOptions.bitsPerChannel = BitsPerChannelType.EIGHT;
  openOptions.cropPage = CropToType.MEDIABOX;
  openOptions.suppressWarnings = true;
  openOptions.usePageNumber = true;*/
  // PDF 파일 열기
  app.open(fileRef, openOptions);

  try {
    app.doAction('Action', 'Action 1');
  } catch (e) {
    alert('액션 실행 중 오류 발생: ' + e.message);
  }
}

// TIFF 형식으로 저장하기 위한 함수
function saveAsTIFF(savePath) {
  var doc = app.activeDocument;

  // TIFF 저장 옵션 설정
  var tiffOptions = new TiffSaveOptions();
  tiffOptions.alphaChannels = true; // 알파 채널 포함 여부
  tiffOptions.layers = true; // 레이어 포함 여부

  // 저장 경로 및 파일명 설정
  var saveFile = new File(savePath);
  doc.saveAs(saveFile, tiffOptions, true);

  // 현재 문서 닫기
  doc.close(SaveOptions.DONOTSAVECHANGES);
}

var filePath = $.fileName;
var illustratorParamPath = getFilePath(filePath, 'photoshopParams.json');
var configFilePath = getFilePath(filePath, 'userConfig.json');
var paramFile = new File(illustratorParamPath);

paramFile.open('r');
var paramData = paramFile.read();
paramFile.close();

// JSON 문자열을 JavaScript 객체로 변환 (JSON.parse를 사용할 수 없으므로 직접 처리)
var params = parseJSON(paramData);

for (var i = 0; i < params.length; i++) {
  openPDF(params[i].path);

  // alert(params[i].path);
  // var processParam = {
  //   currentLayer: findLayerByName(params[i].layerName),
  //   yOffset: i * variantTypeNumber,
  //   _orderName: params[i]._orderName,
  //   orderName: params[i].orderName,
  //   _mainName: params[i]._mainName,
  //   mainName: params[i].mainName,
  //   fundingNumber: params[i].fundingNumber,
  //   resultLayer: resultLayer,
  // };
  //
  // processLayer(processParam);
}

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
  openOptions.resolution = 762; // 1인치 2.54 센티 -> 300DPI = 2.54 * 300
  openOptions.mode = OpenDocumentMode.CMYK; // 색상 모드 설정 (CMYK)

  // PDF 파일 열기
  app.open(fileRef, openOptions);
  app.doAction('Action 1', 'Action');

  // 파일 참조 해제
  fileRef = null;
}

function saveAsTIFF(savePath) {
  var doc = app.activeDocument;

  // TIFF 저장 옵션 설정
  var tiffOptions = new TiffSaveOptions();
  tiffOptions.layers = true; // 레이어 포함 여부

  // 저장 경로 및 파일명 설정
  var saveFile = new File(savePath);
  doc.saveAs(saveFile, tiffOptions, true);

  doc = null;
}

var filePath = $.fileName;
var illustratorParamPath = getFilePath(filePath, 'photoshopParams.json');
var configFilePath = getFilePath(filePath, 'userConfig.json');
// 파라미터 파일 읽기
var paramFile = new File(illustratorParamPath);
paramFile.open('r');
var paramData = paramFile.read();
paramFile.close();
paramFile = null; // 파일 참조 해제

// 설정 파일 읽기
var configFile = new File(configFilePath);
configFile.open('r');
var configData = configFile.read();
configFile.close();
configFile = null; // 파일 참조 해제

var config = parseJSON(configData);
var params = parseJSON(paramData);

for (var i = 0; i < params.length; i++) {
  openPDF(params[i].path);
  saveAsTIFF(config.tiffSavePath + params[i].name);
  app.activeDocument.close(SaveOptions.DONOTSAVECHANGES);
}
executeAction(app.charIDToTypeID('quit'));

app.preferences.setBooleanPreference('ShowExternalJSXWarning', false);
var doc = app.activeDocument;

// 원본 문서의 경로 저장 (나중에 원본을 다시 열기 위함)
var originalFile = doc.fullName;
function savePDFCallBack(defaultPath) {
  var pdfSavePath = new File(defaultPath);

  if (pdfSavePath) {
    // PDF 저장 옵션 설정
    var pdfOptions = new PDFSaveOptions();
    pdfOptions.compatibility = PDFCompatibility.ACROBAT7;
    pdfOptions.viewAfterSaving = false;
    pdfOptions.preserveEditability = true;

    // 현재 문서를 PDF로 저장
    doc.saveAs(pdfSavePath, pdfOptions);
    // 문서 저장 후 닫기 (저장 후 열리는 문제를 방지)
    doc.close(SaveOptions.DONOTSAVECHANGES);
    app.open(originalFile);
  }
}

function findLayerByName(layerName) {
  var layers = doc.layers;
  for (var i = 0; i < layers.length; i++) {
    if (layers[i].name === layerName) {
      return layers[i];
    }
  }
  return null;
}

function processLayer(processParam) {
  var currentLayer = processParam['currentLayer'];
  var resultLayer = processParam['resultLayer'];
  var uploadedImagePath = processParam['imagePath'];
  var yOffset = processParam['yOffset'];

  var uploadedImageFile = new File(uploadedImagePath);

  var rasterItems = currentLayer.rasterItems;
  var rasterItemsLength = rasterItems.length;

  var yOffsetPoints = yOffset * 2.83465; // 1mm = 2.83465pt

  for (var i = 0; i < rasterItemsLength; i++) {
    var currentImage = rasterItems[i];

    // 현재 이미지의 크기와 위치 저장
    var originalWidth = currentImage.width;
    var originalHeight = currentImage.height;
    var originalTop = currentImage.top;
    var originalLeft = currentImage.left;
    // var xOffsetPoints = xOffset * 2.83465; // 1mm = 2.83465pt
    // 새 이미지를 결과 레이어에 추가
    var myPlacedItem = resultLayer.placedItems.add();
    myPlacedItem.file = uploadedImageFile;

    // 이미지의 비율을 유지하면서 새 이미지의 세로 크기를 originalHeight에 맞춤
    var imageAspectRatio = myPlacedItem.width / myPlacedItem.height;
    myPlacedItem.height = originalHeight;
    myPlacedItem.width = originalHeight * imageAspectRatio; // 비율에 맞춰 가로 크기 조정
    // 새 이미지의 위치를 기존 이미지의 위치와 동일하게 설정

    myPlacedItem.position = [originalLeft, originalTop - yOffsetPoints];

    // 새 이미지 임베드
    myPlacedItem.embed();
  }
}

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
  return filePath.replace(/logoSave_script\.jsx$/, fileName);
}

if (doc) {
  var filePath = $.fileName;
  var logoSaveParamPath = getFilePath(filePath, 'logoSaveParams.json');
  var configFilePath = getFilePath(filePath, 'userConfig.json');
  var paramFile = new File(logoSaveParamPath);

  paramFile.open('r');
  var paramData = paramFile.read();
  paramFile.close();

  // JSON 문자열을 JavaScript 객체로 변환 (JSON.parse를 사용할 수 없으므로 직접 처리)
  var params = parseJSON(paramData);

  var pdfName = params[0].pdfName;
  var resultLayer = findLayerByName('결과물');

  for (var i = 0; i < params.length; i++) {
    var processParam = {
      currentLayer: findLayerByName('변환 전'),
      yOffset: i * 210,
      imagePath: params[i].path,
      resultLayer: resultLayer,
    };
    processLayer(processParam);
  }
  var configFile = new File(configFilePath);

  configFile.open('r');
  var configData = configFile.read();
  configFile.close();

  var config = parseJSON(configData);

  savePDFCallBack(config.pdfSavePath + pdfName);
}

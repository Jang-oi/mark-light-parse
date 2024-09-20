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

function findGroupByName(currentLayer, groupName) {
  var groups = currentLayer.groupItems;
  for (var i = 0; i < groups.length; i++) {
    if (groups[i].name === groupName) {
      return groups[i];
    }
  }
  return null;
}

function processLayer(processParam) {
  var currentLayer = processParam['currentLayer'];
  var resultLayer = processParam['resultLayer'];
  var uploadedImagePath = processParam['imagePath'];

  var imageBox = findGroupByName(currentLayer, 'imageBox');
  var uploadedImageFile = new File(uploadedImagePath);

  // imageBox 그룹 내의 모든 rasterItem(이미지) 찾기
  var rasterItems = imageBox.rasterItems;
  var rasterItemsLength = rasterItems.length;

  for (var i = 0; i < rasterItemsLength; i++) {
    var currentImage = rasterItems[i];

    // 현재 이미지의 크기와 위치 저장
    var originalWidth = currentImage.width;
    var originalHeight = currentImage.height;
    var originalTop = currentImage.top;
    var originalLeft = currentImage.left;

    // 기존 이미지 삭제
    // currentImage.remove();

    // 새로운 이미지 삽입
    // var newImage = resultLayer.placedItems.add(uploadedImageFile);
    resultLayer.placedItems.add();
    resultLayer.placedItems[i].file = uploadedImageFile;
    // myPlacedItem.file = uploadedImageFile;
    // myPlacedItem.position = Array(0, 0);
    // myPlacedItem.embed();
    // 새 이미지 크기와 위치를 기존 이미지에 맞추기
    /*    newImage.width = originalWidth;
    newImage.height = originalHeight;
    newImage.top = originalTop;
    newImage.left = originalLeft;*/
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

  var pdfName = params.pdfName;
  var resultLayer = findLayerByName('결과물');

  var processParam = {
    currentLayer: findLayerByName('변환 전'),
    yOffset: 0,
    imagePath: params.path,
    resultLayer: resultLayer,
  };

  processLayer(processParam);

  var configFile = new File(configFilePath);

  configFile.open('r');
  var configData = configFile.read();
  configFile.close();

  var config = parseJSON(configData);

  savePDFCallBack(config.pdfSavePath + pdfName);
}

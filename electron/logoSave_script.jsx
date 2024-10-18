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
  var orderName = processParam['orderName'];
  var fundingNumber = processParam['fundingNumber'];
  var isHorizontalType = processParam['isHorizontalType'];
  var yOffset = processParam['yOffset'];

  var yOffsetPoints = yOffset * 2.83465; // 1mm = 2.83465pt

  var orderNames = findGroupByName(currentLayer, 'OrderNames');
  if (orderNames) {
    var orderNamesTextFrames = orderNames.textFrames;
    var orderNamesTextFramesLength = orderNamesTextFrames.length;

    for (var j = 0; j < orderNamesTextFramesLength; j++) {
      orderNamesTextFrames[j].contents = orderName;
    }
  }

  // fundingNumber 그룹 찾기
  var fundingNumberGroup = findGroupByName(currentLayer, 'fundingNumber');
  if (fundingNumberGroup) {
    var fundingNumberTextFrames = fundingNumberGroup.textFrames;
    var fundingNumberTextFramesLength = fundingNumberTextFrames.length;

    for (var k = 0; k < fundingNumberTextFramesLength; k++) {
      fundingNumberTextFrames[k].contents = fundingNumber;
    }
  }

  var rasterItems = currentLayer.rasterItems;
  var rasterItemsLength = rasterItems.length;

  for (var i = 0; i < rasterItemsLength; i++) {
    var currentImage = rasterItems[i];

    currentLayer.locked = false; // 레이어가 잠겨있지 않은지 확인
    resultLayer.locked = false; // 레이어가 잠겨있지 않은지 확인
    currentLayer.visible = true; // 레이어가 보이는지 확인
    resultLayer.visible = true; // 레이어가 보이는지 확인

    // 현재 이미지의 크기와 위치 저장
    var originalWidth = currentImage.width;
    var originalHeight = currentImage.height;
    var originalTop = currentImage.top;
    var originalLeft = currentImage.left;

    var uploadedImageFile = new File(uploadedImagePath);
    var myPlacedItem = currentLayer.placedItems.add();
    myPlacedItem.file = uploadedImageFile;

    // 이미지의 비율을 유지하면서 크기 조정
    var imageAspectRatio;
    if (isHorizontalType) {
      imageAspectRatio = myPlacedItem.height / myPlacedItem.width;
      myPlacedItem.width = originalWidth;
      myPlacedItem.height = originalWidth * imageAspectRatio;
    } else {
      imageAspectRatio = myPlacedItem.width / myPlacedItem.height;
      myPlacedItem.height = originalHeight;
      myPlacedItem.width = originalHeight * imageAspectRatio;
    }
    // 위치 조정
    myPlacedItem.position = [originalLeft, originalTop];
    // 기존 이미지 삭제
    myPlacedItem.embed();
    currentImage.remove();
  }

  // 레이어의 모든 객체를 타겟 레이어로 복사 및 Y축 좌표 조정
  var objects = currentLayer.pageItems;
  var length = objects.length;

  for (var l = length - 1; l >= 0; l--) {
    var sourceObject = objects[l];
    var duplicatedObject = sourceObject.duplicate(resultLayer);
    duplicatedObject.top -= yOffsetPoints;
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
      currentLayer: findLayerByName(params[i].option),
      yOffset: i * 210,
      imagePath: params[i].path,
      orderName: params[i].orderName,
      fundingNumber: params[i].fundingNumber,
      isHorizontalType: params[i].isHorizontalType,
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

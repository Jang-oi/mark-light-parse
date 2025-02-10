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

function updateTextFrames(groupName, content, currentLayer) {
  var group = findGroupByName(currentLayer, groupName);
  if (group) {
    var textFrames = group.textFrames;
    for (var i = 0; i < textFrames.length; i++) {
      textFrames[i].contents = content;
    }
  }
}

function processLayer(processParam) {
  var yOffset = processParam['yOffset'];
  var xOffset = processParam['xOffset'];
  var currentLayer = processParam['currentLayer'];
  var orderName = processParam['orderName'];
  var mainName = processParam['mainName'];
  var subName = processParam['subName'];
  var resultLayer = processParam['resultLayer'];
  var fundingNumber = processParam['fundingNumber'];
  var phoneNumber = processParam['phoneNumber'];
  var SNumber = processParam['SNumber'];
  var OrderTag = processParam['OrderTag'];

  var yOffsetPoints = yOffset * 2.83465; // 1mm = 2.83465pt
  var xOffsetPoints = xOffset * 2.83465; // 1mm = 2.83465pt

  updateTextFrames('MainNames', mainName, currentLayer);
  updateTextFrames('OrderNames', orderName, currentLayer);
  updateTextFrames('fundingNumber', fundingNumber, currentLayer);
  updateTextFrames('SubNames', subName, currentLayer);
  updateTextFrames('phoneNumber', phoneNumber, currentLayer);
  updateTextFrames('SNumber', SNumber, currentLayer);
  // updateTextFrames('OrderTag', OrderTag, currentLayer);

  // 레이어의 모든 객체를 타겟 레이어로 복사 및 Y축 좌표 조정
  var objects = currentLayer.pageItems;
  var length = objects.length;

  for (var l = length - 1; l >= 0; l--) {
    var sourceObject = objects[l];
    var duplicatedObject = sourceObject.duplicate(resultLayer);
    duplicatedObject.top -= yOffsetPoints;
    if (xOffsetPoints) {
      duplicatedObject.left += xOffsetPoints;
    }
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
  return filePath.replace(/illustrator_script\.jsx$/, fileName);
}

if (doc) {
  var filePath = $.fileName;
  var illustratorParamPath = getFilePath(filePath, 'illustratorParams.json');
  var configFilePath = getFilePath(filePath, 'userConfig.json');
  var paramFile = new File(illustratorParamPath);

  paramFile.open('r');
  var paramData = paramFile.read();
  paramFile.close();

  // JSON 문자열을 JavaScript 객체로 변환 (JSON.parse를 사용할 수 없으므로 직접 처리)
  var params = parseJSON(paramData);

  // 베이직, 대용량에 따라 길이 계산에 필요한 수
  var variantTypeNumber = 210;
  var variantType = params[0].variantType;
  if (variantType === '2' || variantType === 'E') variantTypeNumber = 420;

  var pdfName = params[0].pdfName;
  var resultLayer = findLayerByName('결과물');
  // 각 항목 처리
  if (variantType === 'D') {
    for (var i = 0; i < params.length; i++) {
      var dogXOffset = i % 2 === 1 ? 290 : 0;
      var dogYOffset = Math.floor(i / 2) * 210;
      var dogProcessParam = {
        currentLayer: findLayerByName(params[i].layerName),
        yOffset: dogYOffset,
        xOffset: dogXOffset,
        orderName: params[i].orderName,
        mainName: params[i].mainName,
        phoneNumber: params[i].phoneNumber,
        fundingNumber: params[i].fundingNumber,
        SNumber: params[i].SNumber,
        OrderTag: params[i].OrderTag,
        resultLayer: resultLayer,
      };

      processLayer(dogProcessParam);
    }
  } else if (variantType === 'E') {
    for (var j = 0; j < params.length; j++) {
      var emergencyProcessParam = {
        currentLayer: findLayerByName(params[j].layerName),
        yOffset: j * variantTypeNumber,
        orderName: params[j].orderName,
        mainName: params[j].mainName,
        subName: params[j].subName,
        fundingNumber: params[j].fundingNumber,
        SNumber: params[j].SNumber,
        OrderTag: params[j].OrderTag,
        resultLayer: resultLayer,
      };

      processLayer(emergencyProcessParam);
    }
  } else {
    for (var k = 0; k < params.length; k++) {
      var nameProcessParam = {
        currentLayer: findLayerByName(params[k].layerName),
        yOffset: k * variantTypeNumber,
        orderName: params[k].orderName,
        mainName: params[k].mainName,
        subName: params[k].subName,
        fundingNumber: params[k].fundingNumber,
        SNumber: params[k].SNumber,
        OrderTag: params[k].OrderTag,
        resultLayer: resultLayer,
      };

      processLayer(nameProcessParam);
    }
  }

  var configFile = new File(configFilePath);

  configFile.open('r');
  var configData = configFile.read();
  configFile.close();

  var config = parseJSON(configData);

  savePDFCallBack(config.pdfSavePath + pdfName);
}

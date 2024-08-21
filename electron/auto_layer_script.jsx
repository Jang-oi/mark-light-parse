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

function processLayer(currentLayer, yOffset, _orderName, orderName, _mainName, mainName, resultLayer) {
  var yOffsetPoints = yOffset * 2.83465; // 1mm = 2.83465pt

  var mainNames = findGroupByName(currentLayer, 'MainNames');
  var mainNamesTextFrames = mainNames.textFrames;
  var mainNamesTextFramesLength = mainNamesTextFrames.length;

  for (var i = 0; i < mainNamesTextFramesLength; i++) {
    mainNamesTextFrames[i].contents = mainName;
  }

  var orderNames = findGroupByName(currentLayer, 'OrderNames');
  var orderNamesTextFrames = orderNames.textFrames;
  var orderNamesTextFramesLength = orderNamesTextFrames.length;

  for (var j = 0; j < orderNamesTextFramesLength; j++) {
    orderNamesTextFrames[j].contents = orderName;
  }

  // 레이어의 모든 객체를 타겟 레이어로 복사 및 Y축 좌표 조정
  var objects = currentLayer.pageItems;
  var length = objects.length;

  for (var k = length - 1; k >= 0; k--) {
    var sourceObject = objects[k];
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
  return filePath.replace(/auto_layer_script\.jsx$/, fileName);
}

if (doc) {
  var filePath = $.fileName;
  var paramFilePath = getFilePath(filePath, 'params.json');
  var configFilePath = getFilePath(filePath, 'userConfig.json');
  var paramFile = new File(paramFilePath);

  paramFile.open('r');
  var paramData = paramFile.read();
  paramFile.close();

  // JSON 문자열을 JavaScript 객체로 변환 (JSON.parse를 사용할 수 없으므로 직접 처리)
  var params = parseJSON(paramData);

  // 베이직, 대용량에 따라 길이 계산에 필요한 수
  var variantTypeNumber = 210;
  if (params[0].variantType === '2') variantTypeNumber = 420;

  var pdfName = '';
  if (!params[0].no) {
    var now = new Date();
    var year = now.getFullYear();
    var month = ('0' + (now.getMonth() + 1)).slice(-2);
    var day = ('0' + now.getDate()).slice(-2);
    var hours = ('0' + now.getHours()).slice(-2);
    var minutes = ('0' + now.getMinutes()).slice(-2);
    var seconds = ('0' + now.getSeconds()).slice(-2);

    pdfName = year + '' + month + '' + day + ' ' + hours + '' + minutes + '' + seconds;
  }

  // 각 항목 처리
  for (var i = 0; i < params.length; i++) {
    // 주문자 입력 정보
    var layerName = params[i].layerName;
    var orderName = params[i].orderName;
    var mainName = params[i].mainName;

    var _orderName = params[i]._orderName;
    var _mainName = params[i]._mainName;
    var no = params[i].no;

    if (no) pdfName += i + 1 === params.length ? no : no + '_';
    var resultLayer = findLayerByName('결과물');
    var currentLayer = findLayerByName(layerName);
    processLayer(currentLayer, i * variantTypeNumber, _orderName, orderName, _mainName, mainName, resultLayer);
  }

  var configFile = new File(configFilePath);

  configFile.open('r');
  var configData = configFile.read();
  configFile.close();

  var config = parseJSON(configData);
  savePDFCallBack(config.pdfSavePath + pdfName);
}

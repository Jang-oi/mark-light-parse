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

function generateUniqueFileName(baseName) {
  var timestamp = new Date().getTime(); // 현재 시간의 유닉스 타임스탬프를 가져옵니다.
  var extension = '.pdf'; // PDF 확장자
  return baseName + '_' + timestamp + extension; // 파일 이름에 타임스탬프를 추가합니다.
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

function processLayer(layerName, yOffset, _orderName, orderName, _mainName, mainName, targetLayer) {
  var layers = doc.layers;
  var yOffsetPoints = yOffset * 2.83465; // 1mm = 2.83465pt

  for (var i = 0; i < layers.length; i++) {
    if (layers[i].name === layerName) {
      var sourceLayer = layers[i];

      // 텍스트 내용 변경
      var textFrames = sourceLayer.textFrames;
      var textFramesLength = textFrames.length;

      for (var k = 0; k < textFramesLength; k++) {
        var contents = textFrames[k].contents;
        if (contents === _orderName) {
          textFrames[k].contents = orderName;
        } else if (contents === _mainName) {
          textFrames[k].contents = mainName;
        }
      }

      // 레이어의 모든 객체를 타겟 레이어로 복사 및 Y축 좌표 조정
      var objects = sourceLayer.pageItems;
      var length = objects.length;

      for (var j = length - 1; j >= 0; j--) {
        var sourceObject = objects[j];
        var duplicatedObject = sourceObject.duplicate(targetLayer);
        duplicatedObject.top -= yOffsetPoints;
      }

      return; // 레이어를 찾고 작업을 완료한 후 함수 종료
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
  // 각 항목 처리
  for (var i = 0; i < params.length; i++) {
    // 주문자 입력 정보
    var layerName = params[i].layerName;
    var orderName = params[i].orderName;
    var mainName = params[i].mainName;

    var _orderName = params[i]._orderName;
    var _mainName = params[i]._mainName;

    var resultLayer = findLayerByName('결과물');

    processLayer(layerName, i * variantTypeNumber, _orderName, orderName, _mainName, mainName, resultLayer);
  }

  var configFile = new File(configFilePath);

  configFile.open('r');
  var configData = configFile.read();
  configFile.close();

  var config = parseJSON(configData);
  var uniqueFileName = generateUniqueFileName(config.pdfSavePath);
  savePDFCallBack(uniqueFileName);
}

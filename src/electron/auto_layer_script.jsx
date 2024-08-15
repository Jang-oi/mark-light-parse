var doc = app.activeDocument;

function savePDFCallBack(defaultPath) {
  var pdfSavePath = new File(defaultPath);

  if (pdfSavePath) {
    // PDF 저장 옵션 설정
    var pdfOptions = new PDFSaveOptions();
    pdfOptions.preserveEditing = true;
    pdfOptions.preserveEditability = true;
    pdfOptions.compatibility = PDFCompatibility.ACROBAT7;

    // 현재 문서를 PDF로 저장
    doc.saveAs(pdfSavePath, pdfOptions);

    // 문서 저장 후 닫기 (저장 후 열리는 문제를 방지)
    doc.close(SaveOptions.DONOTSAVECHANGES);
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

function processLayer(layerName, yOffset, oldText, newText, oldOrderName, newOrderName, targetLayer) {
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
        if (contents === oldText) {
          textFrames[k].contents = newText;
        } else if (contents === oldOrderName) {
          textFrames[k].contents = newOrderName;
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

function getParamPath() {
  // 경로 문자열에서 파일 이름을 교체
  var filePath = $.fileName;
  return filePath.replace(/auto_layer_script\.jsx$/, 'params.txt');
}
if (doc) {
  var paramPath = getParamPath();
  var file = new File(paramPath);

  file.open('r');
  var paramData = file.read();
  file.close();

  // JSON 문자열을 JavaScript 객체로 변환 (JSON.parse를 사용할 수 없으므로 직접 처리)
  var params = parseJSON(paramData);

  // 각 항목 처리
  for (var i = 0; i < params.length; i++) {
    var template = params[i].template;
    var orderName = params[i].orderName;
    var userName = params[i].userName;
    var characterCount = params[i].characterCount;
    var oldOrderName = params[i].oldOrderName;

    var resultLayer = findLayerByName('결과물');

    processLayer(template, i * 210, template, userName, oldOrderName, orderName, resultLayer);
  }
  savePDFCallBack('C:/Users/Jang-oi/Desktop/example.pdf');
}

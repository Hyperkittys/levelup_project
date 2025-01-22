const fileType = require('file-type'); // fileType 모듈 임포트 추가
const tf = require('@tensorflow/tfjs-node');
console.log('TensorFlow 로드 확인:', tf.node); // tf.node가 undefined인 경우 문제 확인 가능

const mobilenet = require('@tensorflow-models/mobilenet');

let model;

exports.loadModel = async () => {
    try {
        model = await mobilenet.load({ version: 2, alpha: 1.0 });
        console.log('MobileNet 모델 로드 완료');
    } catch (error) {
        console.error('모델 로드 중 오류:', error);
        throw new Error('모델을 로드하는 중 오류가 발생했습니다.');
    }
};

exports.extractFeatures = async (buffer) => {
    if (!model) {
        throw new Error('모델이 아직 로드되지 않았습니다.');
    }

    try {
        const type = await fileType.fromBuffer(buffer);
        if (!type || (type.mime !== 'image/jpeg' && type.mime !== 'image/png')) {
            throw new Error('지원되지 않는 이미지 형식입니다. JPEG 또는 PNG 형식의 이미지를 업로드해주세요.');
        }

        const tensor = tf.node.decodeImage(buffer, 3); // 이미지 버퍼를 텐서로 변환
        const activation = model.infer(tensor, { internal: true }); // 모델을 사용하여 특징 추출
        const features = Array.from(activation.dataSync()); // 특징 벡터를 배열로 변환

        tensor.dispose(); // 메모리 정리
        activation.dispose(); // 메모리 정리

        return features;
    } catch (error) {
        console.error('이미지 디코딩 중 오류:', error);
        throw new Error('이미지를 디코딩하는 중 오류가 발생했습니다. 이미지 형식을 확인해주세요.');
    }
};

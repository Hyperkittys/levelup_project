let model; // MobileNet 모델을 저장할 전역 변수

// MobileNet 모델을 로드하는 비동기 함수
async function loadModel() {
    console.log('모델 로딩 중...');
    model = await mobilenet.load({ version: 2, alpha: 1.0 }); // MobileNet 버전 2, alpha 1.0 로드
    console.log('모델 로딩 완료');
}

// 이미지에서 특징 벡터를 추출하는 비동기 함수
async function extractFeatures(img) {
    if (!model) {
        console.error('모델이 로드되지 않았습니다.');
        return;
    }
    // 모델을 사용하여 이미지의 특징을 추출
    const activation = model.infer(img, { internal: true });
    // 특징 벡터를 일반 배열로 변환
    const features = Array.from(activation.dataSync());
    
    // 콘솔에 전체 특징 벡터 로그 출력
    console.log('추출된 전체 특징 벡터:', features);
    
    return features;
}

// 이미지 업로드 및 처리를 설정하는 함수
function setupImageUpload() {
    const imageUpload = document.getElementById('imageUpload');
    const uploadedImage = document.getElementById('uploadedImage');
    const resultDiv = document.getElementById('result');

    // 파일 선택 시 이벤트 리스너 추가
    imageUpload.addEventListener('change', async (event) => {
        const file = event.target.files[0];
        const reader = new FileReader();

        // 파일을 읽은 후 실행될 콜백 함수
        reader.onload = async (e) => {
            uploadedImage.src = e.target.result;
            uploadedImage.style.display = 'block';

            // 이미지 로드 완료 시 실행될 콜백 함수
            uploadedImage.onload = async () => {
                try {
                    // 특징 벡터 추출
                    const features = await extractFeatures(uploadedImage);
                    
                    // 결과를 웹 페이지에 표시 (처음 10개 요소만)
                    resultDiv.textContent = `추출된 특징 벡터 (처음 10개 요소):\n${features.slice(0, 10).join(', ')}...`;
                    
                    // 콘솔에 추가 정보 출력
                    console.log('특징 벡터의 길이:', features.length);
                    console.log('특징 벡터의 최소값:', Math.min(...features));
                    console.log('특징 벡터의 최대값:', Math.max(...features));
                } catch (error) {
                    console.error('특징 추출 중 오류 발생:', error);
                    resultDiv.textContent = '특징 추출 중 오류가 발생했습니다.';
                }
            };
        };

        // 파일을 Data URL로 읽기
        reader.readAsDataURL(file);
    });
}

async function init() {
    try {
        await loadModel();
        setupImageUpload();
    } catch (error) {
        console.error('초기화 중 오류 발생:', error);
    }
}

init();

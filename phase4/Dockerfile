# Node.js 이미지 선택 (LTS 버전 사용)
FROM node:18

# 애플리케이션 디렉토리 생성
WORKDIR /usr/src/app

# package.json과 package-lock.json 복사
COPY package*.json ./

# 의존성 설치
RUN npm install

# 애플리케이션 소스 복사
COPY . .

# 환경 변수 설정 (필요한 경우)
ENV NODE_ENV=production

# 애플리케이션 포트 설정
EXPOSE 3000

# 애플리케이션 실행
CMD ["node", "src/app.js"]


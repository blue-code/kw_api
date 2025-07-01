# KW API: JWT 인증을 사용한 Node.js Express API

<div align="center">
  <p>Node.js, Express, MySQL 기반의 RESTful API 서버입니다. JSON Web Token (JWT)을 사용한 인증, Objection.js 및 Knex.js를 통한 데이터베이스 관리 기능을 제공합니다.</p>
</div>

## ✨ 주요 기능

-   **사용자 인증**: JWT 토큰 기반의 로그인 및 인증 상태 검증 (`/api/auth/login`, `/api/auth/validate`)
-   **아이템 관리**: CRUD 기능을 갖춘 아이템 관리 API
-   **보안**: JWT 미들웨어를 통해 보호되는 API 라우트
-   **객체 관계 매핑(ORM)**: Sequelize를 사용하여 JavaScript 객체와 데이터베이스 레코드를 매핑
-   **HTTPS 지원**: 개발 환경을 위한 자체 서명 인증서 사용

## 🛠️ 기술 스택

-   **백엔드**: Node.js, Express.js
-   **데이터베이스**: MySQL
-   **ORM**: Sequelize
-   **인증**: JSON Web Token (JWT), bcrypt
-   **로깅**: Winston
-   **기타**: dotenv, cors

## 📊 로깅

이 애플리케이션은 [Winston](https://github.com/winstonjs/winston) 라이브러리를 사용하여 로그를 관리합니다. 로그는 콘솔과 파일에 동시에 기록됩니다.

### 로그 파일 위치

-   **애플리케이션 로그**: `logs/application-YYYY-MM-DD.log`
-   **예외 로그**: `logs/exceptions-YYYY-MM-DD.log` (처리되지 않은 예외)
-   **거부된 Promise 로그**: `logs/rejections-YYYY-MM-DD.log` (처리되지 않은 Promise 거부)

로그 파일은 일별로 회전되며, 최대 크기(20MB) 및 보존 기간(14일)이 설정되어 있습니다.

### 로깅 설정

로깅 설정은 `config/logger.js` 파일에서 관리됩니다. 이곳에서 로그 레벨, 출력 형식, 파일 회전 정책 등을 조정할 수 있습니다。

## 🔄 API 응답 표준화

이 애플리케이션의 모든 API 응답은 일관된 구조를 가집니다. 이를 통해 클라이언트가 서버 응답을 예측하고 처리하기 용이하도록 합니다.

### 응답 구조

모든 응답은 다음 세 가지 필드를 포함합니다:

-   `resultCode`: 요청 처리 결과를 나타내는 코드입니다.
    -   `0`: 성공 (Success)
    -   그 외 숫자: 특정 오류를 나타내는 코드 (예: `1001` - 유효하지 않은 요청 파라미터, `2001` - 인증 실패 등)
-   `resultMessage`: `resultCode`에 해당하는 메시지입니다. 성공 시에는 성공 메시지가, 오류 시에는 오류에 대한 설명이 포함됩니다.
-   `data`: 요청에 대한 실제 결과 데이터입니다. 성공적인 응답의 경우 요청된 리소스나 처리 결과가 포함되며, 오류 응답의 경우 `null` 또는 추가적인 오류 정보가 포함될 수 있습니다.

### 오류 코드 정의

애플리케이션에서 사용되는 모든 오류 코드는 `config/errorCodes.js` 파일에 정의되어 있습니다. 이 파일을 통해 각 오류 코드의 의미를 명확하게 파악할 수 있습니다。

## 🚀 시작하기

### 📋 필수 조건

-   [Node.js](https://nodejs.org/) (v14 이상 권장)
-   [MySQL](https://www.mysql.com/)
-   `git`

### ⚙️ 설치 및 설정

1.  **저장소 클론**
    ```bash
    git clone https://github.com/blue-code/kw_api.git
    cd kw_api
    ```

2.  **NPM 패키지 설치**
    ```bash
    npm install
    ```

3.  **데이터베이스 설정**
    -   MySQL에 접속하여 `scripts/init_db.sql` 파일의 내용을 실행하여 데이터베이스와 테이블을 생성합니다.
    -   또는, 다음 명령어를 사용하여 직접 데이터베이스를 생성할 수 있습니다.
        ```sql
        CREATE DATABASE kw_api_db;
        ```

4.  **환경 변수 설정**
    -   `.env.example` 파일을 복사하여 `.env` 파일을 생성합니다.
        ```bash
        cp .env.example .env
        ```
    -   생성된 `.env` 파일을 열어 본인의 환경에 맞게 값을 수정합니다. (DB 정보, JWT 시크릿 등)

5.  **SSL 인증서 생성 (개발용)**
    -   HTTPS 서버를 로컬에서 실행하기 위해 자체 서명 인증서가 필요합니다. `openssl`을 사용하여 생성할 수 있습니다.
        ```bash
        openssl genrsa -out key.pem 2048
        openssl req -new -key key.pem -out csr.pem
        openssl x509 -req -days 365 -in csr.pem -signkey key.pem -out cert.pem
        ```
    -   생성된 `key.pem`과 `cert.pem` 파일은 프로젝트 루트 디렉토리에 위치해야 합니다.

### ▶️ 실행

-   **서버 시작**
    ```bash
    npm start
    ```
-   서버가 정상적으로 실행되면 콘솔에 `HTTPS 서버가 https://localhost:3001 에서 실행 중입니다.` 메시지가 출력됩니다.

## 📁 프로젝트 구조

```
.
├── config/             # 데이터베이스(Knex) 등 설정 파일
├── controllers/        # 요청 처리 및 응답 반환 로직
├── middleware/         # Express 미들웨어 (예: JWT 인증)
├── models/             # Objection.js 데이터베이스 모델
├── repositories/       # 데이터베이스 접근 로직 (CRUD)
├── routes/             # API 라우팅 정의
├── services/           # 비즈니스 로직
├── scripts/            # DB 초기화 스크립트, Insomnia 컬렉션 등
├── .env.example        # 환경 변수 예시 파일
├── app.js              # Express 애플리케이션 진입점
└── package.json        # 프로젝트 의존성 및 스크립트 정의
```

## 🌐 API 엔드포인트

| Method | Path                  | 설명                     | 인증 필요 |
| :----- | :-------------------- | :----------------------- | :-------: |
| `POST` | `/auth/login`         | 사용자 로그인 및 JWT 발급 |     ❌     |
| `POST` | `/auth/validate`      | JWT 토큰 유효성 검증     |     ✅     |
| `GET`  | `/items`              | 모든 아이템 조회         |     ✅     |
| `GET`  | `/items/:id`          | 특정 아이템 조회         |     ✅     |
| `POST` | `/items`              | 새 아이템 생성           |     ✅     |
| `PUT`  | `/items/:id`          | 아이템 정보 수정         |     ✅     |
| `DELETE`| `/items/:id`         | 아이템 삭제              |     ✅     |
| `GET`  | `/test`               | 보호된 테스트 라우트     |     ✅     |
| `POST` | `/files/upload`       | 파일 업로드              |     ❌     |
| `GET`  | `/files/images/:filename` | 이미지 파일 제공         |     ❌     |
| `GET`  | `/files/download/:filename` | 파일 다운로드            |     ❌     |

## scripts

-   `npm start`: Node.js 서버를 실행합니다.
-   `npm test`: (현재 설정되지 않음) 테스트를 실행합니다.

## 🤝 기여하기

프로젝트에 기여하고 싶으시다면, 이슈를 생성하거나 풀 리퀘스트를 보내주세요.

## 📄 라이선스

본 프로젝트는 ISC 라이선스를 따릅니다.
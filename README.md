# KW API: JWT 인증 및 다양한 기능을 제공하는 Node.js Express API

<div align="center">
  <p>Node.js, Express.js, MySQL 기반의 RESTful API 서버입니다. JSON Web Token (JWT)을 사용한 인증, Sequelize ORM을 통한 데이터베이스 관리, 파일 업로드/다운로드, 페이징 및 커스텀 SQL을 사용한 데이터 조회 등 다양한 기능을 제공합니다.</p>
  <p><em>이 문서는 특히 Java 개발자가 Node.js 프로젝트를 이해하는 데 도움을 주고자 작성되었습니다.</em></p>
</div>

## 🌟 Node.js와 Express.js 소개 (Java 개발자 관점)

-   **Node.js**: Chrome V8 JavaScript 엔진으로 빌드된 JavaScript 런타임 환경입니다. Java의 JVM(Java Virtual Machine)과 유사하게 JavaScript 코드를 서버 측에서 실행할 수 있게 해줍니다. Node.js는 **비동기 이벤트 기반** 아키텍처를 사용하여 높은 처리량과 확장성을 제공하는 데 중점을 둡니다.
-   **Express.js**: Node.js를 위한 경량 웹 애플리케이션 프레임워크입니다. Java의 Spring MVC 또는 Spring Boot와 유사한 역할을 하며, 라우팅, 미들웨어, 요청/응답 처리 등 웹 애플리케이션 개발에 필요한 핵심 기능들을 제공합니다.

## ✨ 주요 기능

-   **사용자 인증**: JWT 토큰 기반의 로그인 및 인증 상태 검증 (`/auth/token`, `/auth/validate`)
-   **아이템 관리**: 기본적인 CRUD 기능 및 연관된 상점 정보 조회, 페이징 처리된 목록 조회 (ORM 및 커스텀 SQL 사용)
-   **파일 관리**: 파일 업로드, 이미지 제공, 파일 다운로드 기능
-   **보안**: JWT 미들웨어를 통해 특정 API 라우트 보호
-   **객체 관계 매핑(ORM)**: Sequelize를 사용하여 JavaScript 객체와 데이터베이스 레코드를 매핑 (Java의 JPA/Hibernate와 유사)
-   **HTTPS 지원**: 개발 환경을 위한 자체 서명 인증서 사용

## 🛠️ 기술 스택

-   **백엔드**: Node.js, Express.js
-   **데이터베이스**: MySQL
-   **ORM**: Sequelize (Java의 JPA/Hibernate와 유사)
-   **인증**: JSON Web Token (JWT) (비밀번호 해싱에는 bcrypt 등 사용 권장 - 현재 예제에서는 미적용)
-   **로깅**: Winston (Java의 Log4j, SLF4j와 유사)
-   **환경 변수 관리**: dotenv (Java의 `application.properties` 또는 `.yml` 파일과 유사)
-   **기타**: cors (Cross-Origin Resource Sharing 처리)

## 📁 프로젝트 구조 (Java 개발자 관점)

```
.
├── config/             # 데이터베이스(Sequelize), 로거 등 설정 파일 (Java의 XML/Java Config 유사)
├── controllers/        # HTTP 요청을 받아 서비스 계층으로 전달하고, 결과를 응답으로 반환 (Spring의 @Controller/@RestController 유사)
├── middleware/         # Express 미들웨어 (예: JWT 인증, 에러 핸들링). Spring의 Interceptor나 Filter와 유사한 역할 수행.
├── models/             # Sequelize 데이터베이스 모델 정의 (JPA의 @Entity 클래스와 유사). models/index.js는 모델들을 통합하고 관계를 설정.
├── repositories/       # 데이터베이스 접근 로직 (CRUD) 캡슐화 (Spring Data JPA의 Repository 인터페이스 또는 DAO 구현체와 유사).
├── routes/             # API 라우팅 정의. 특정 URL 경로와 컨트롤러 메소드를 매핑 (Spring의 @RequestMapping 유사).
├── services/           # 비즈니스 로직 처리 (Spring의 @Service 클래스와 유사).
├── scripts/            # DB 초기화 스크립트, API 테스트용 Insomnia 컬렉션 등.
├── uploads/            # (생성될 수 있음) 파일 업로드 시 저장되는 디렉토리 (설정에 따라 다름).
├── .env.example        # 환경 변수 예시 파일.
├── .env                # 실제 환경 변수 설정 파일 (Git에 포함되지 않아야 함).
├── app.js              # Express 애플리케이션의 주 진입점 및 설정 파일 (Spring Boot의 메인 Application 클래스 및 Java Config 파일과 유사).
├── package.json        # 프로젝트 정보, 의존성(dependencies), 실행 스크립트(scripts) 정의 (Maven의 pom.xml 또는 Gradle의 build.gradle과 유사).
└── package-lock.json   # 실제 설치된 패키지 버전 정보 고정 (의존성 일관성 유지).
```

## 📊 로깅

이 애플리케이션은 [Winston](https://github.com/winstonjs/winston) 라이브러리를 사용하여 로그를 관리합니다. 로그는 콘솔과 파일에 동시에 기록됩니다. (Java의 Log4j, SLF4j + Logback/Log4j2 설정과 유사)

### 로그 파일 위치

-   **애플리케이션 로그**: `logs/application-YYYY-MM-DD.log`
-   **예외 로그**: `logs/exceptions-YYYY-MM-DD.log` (처리되지 않은 예외)
-   **거부된 Promise 로그**: `logs/rejections-YYYY-MM-DD.log` (처리되지 않은 Promise 거부)

로그 파일은 일별로 회전되며, 최대 크기(20MB) 및 보존 기간(14일)이 설정되어 있습니다.

### 로깅 설정

로깅 설정은 `config/logger.js` 파일에서 관리됩니다. 이곳에서 로그 레벨, 출력 형식, 파일 회전 정책 등을 조정할 수 있습니다.

## 🔄 API 응답 표준화

이 애플리케이션의 모든 API 응답은 일관된 구조를 가집니다. 이를 통해 클라이언트가 서버 응답을 예측하고 처리하기 용이하도록 합니다.

### 응답 구조

모든 응답은 다음 세 가지 주요 필드를 포함할 수 있는 `responseHandler.js` 유틸리티를 통해 생성됩니다:

-   `resultCode` (또는 유사한 필드, 예: `code`): 요청 처리 결과를 나타내는 코드 (예: `0` 또는 HTTP 상태 코드).
-   `message` (또는 `resultMessage`): `resultCode`에 해당하는 메시지.
-   `data`: 요청에 대한 실제 결과 데이터.

(실제 응답 구조는 `utils/responseHandler.js` 및 `config/errorCodes.js`의 구현에 따라 달라질 수 있습니다. 현재 프로젝트에서는 `successResponse`와 `errorResponse`가 주로 사용되며, `errorResponse`는 `message`, `status`(HTTP 상태 코드), `errorCode`(내부 에러 코드)를 포함할 수 있습니다.)

### 오류 코드 정의

애플리케이션에서 사용되는 내부 오류 코드는 `config/errorCodes.js` 파일에 정의되어 있습니다.

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
    (Java의 `mvn install` 또는 `gradle build`와 유사하게, `package.json`에 정의된 의존성을 `node_modules` 디렉토리에 다운로드하고 설치합니다.)

3.  **데이터베이스 설정**
    -   MySQL에 접속하여 `scripts/init_db.sql` 파일의 내용을 실행하여 데이터베이스와 테이블을 생성합니다.
    -   또는, 다음 명령어를 사용하여 직접 데이터베이스를 생성할 수 있습니다 (예시):
        ```sql
        CREATE DATABASE kw_api_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
        ```

4.  **환경 변수 설정**
    -   `.env.example` 파일을 복사하여 `.env` 파일을 생성합니다.
        ```bash
        cp .env.example .env
        ```
    -   생성된 `.env` 파일을 열어 본인의 환경에 맞게 값을 수정합니다. (DB 정보, JWT 시크릿 등). 이 파일은 Java의 `application.properties`와 유사한 역할을 합니다.

5.  **SSL 인증서 생성 (개발용)**
    -   HTTPS 서버를 로컬에서 실행하기 위해 자체 서명 인증서가 필요합니다. `openssl`을 사용하여 생성할 수 있습니다. (프로젝트 루트에서 실행)
        ```bash
        openssl genrsa -out key.pem 2048
        openssl req -new -key key.pem -out csr.pem
        openssl x509 -req -days 365 -in csr.pem -signkey key.pem -out cert.pem
        ```
    -   생성된 `key.pem`과 `cert.pem` 파일은 프로젝트 루트 디렉토리에 위치해야 합니다. (`app.js`에서 이 파일들을 읽어 HTTPS 서버를 설정합니다.)

### ▶️ 실행

-   **서버 시작**
    ```bash
    npm start
    ```
    (`package.json`의 "scripts" 항목에 정의된 `start` 명령을 실행합니다. 보통 `node app.js` 또는 유사한 명령이 실행됩니다.)
-   서버가 정상적으로 실행되면 콘솔에 `HTTPS 서버가 https://localhost:3001 에서 실행 중입니다.` (또는 HTTP, 포트 번호는 `.env` 설정에 따라 다름) 메시지가 출력됩니다.

## 🌐 API 엔드포인트 (주요 예시)

| Method   | Path                              | 설명                                       | 인증 필요 |
| :------- | :-------------------------------- | :----------------------------------------- | :-------: |
| `POST`   | `/auth/token`                     | 사용자 로그인 및 JWT 발급                  |     ❌     |
| `POST`   | `/auth/validate`                  | JWT 토큰 유효성 검증                      |     ✅     |
| `POST`   | `/items`                          | 새 아이템 생성                            |     ✅     |
| `GET`    | `/items`                          | 모든 아이템 조회 (상점 정보 포함 가능)       |     ❌     |
| `GET`    | `/items/with-store`               | 모든 아이템 및 상점 정보 조회 (ORM)        |     ❌     |
| `GET`    | `/items/with-store-custom-sql`    | 모든 아이템 및 상점 정보 조회 (커스텀 SQL) |     ❌     |
| `GET`    | `/items/paginated`                | 페이징 처리된 아이템 조회 (ORM)            |     ❌     |
| `GET`    | `/items/paginated-custom-sql`     | 페이징 처리된 아이템 조회 (커스텀 SQL)     |     ❌     |
| `GET`    | `/items/:id`                      | 특정 아이템 조회                          |     ❌     |
| `PUT`    | `/items/:id`                      | 아이템 정보 수정                          |     ✅     |
| `DELETE` | `/items/:id`                      | 아이템 삭제                               |     ✅     |
| `POST`   | `/files/upload`                   | 파일 업로드 (단일 파일)                     |     ❌     |
| `GET`    | `/files/images/:id`               | ID로 이미지 파일 제공 (DB 메타데이터 기반)  |     ❌     |
| `GET`    | `/files/download/:id`             | ID로 파일 다운로드 (DB 메타데이터 기반)   |     ❌     |
| `GET`    | `/test`                           | 보호된 테스트 라우트 (인증 테스트용)        |     ✅     |
| `POST`   | `/test/korean-test`               | 한글 입력 테스트                          |     ❌     |

**참고**: 위 API 엔드포인트 목록은 현재 프로젝트의 구성을 기반으로 하며, 실제 구현과 정확히 일치하도록 주기적인 업데이트가 필요합니다. 특히 `/items` 관련 GET 요청들은 다양한 파라미터를 통해 필터링, 정렬 등의 기능을 제공할 수 있습니다.

## 📜 주요 NPM 스크립트 (`package.json` 내)

-   `npm start`: `node app.js`를 실행하여 애플리케이션을 시작합니다.
-   `npm run dev`: (만약 정의되어 있다면) `nodemon` 등을 사용하여 개발 모드로 애플리케이션을 시작할 수 있습니다 (파일 변경 시 자동 재시작).
-   `npm test`: (현재 설정되지 않음) 정의된 테스트 스크립트를 실행합니다. (예: `jest`, `mocha`)

## 💡 Java 개발자를 위한 추가 정보

-   **JavaScript의 비동기 처리**: Node.js는 비동기 I/O를 적극 활용합니다. Java의 `Future`, `CompletableFuture`와 유사한 개념으로 `Promise`가 사용되며, `async/await` 문법은 이러한 비동기 코드를 동기 코드처럼 보이게 작성할 수 있도록 도와줍니다.
-   **싱글 스레드 이벤트 루프**: Node.js는 기본적으로 싱글 스레드 이벤트 루프 모델을 사용합니다. 이는 Java의 멀티 스레드 환경과 다르며, I/O 작업은 논블로킹 방식으로 처리되어 CPU를 효율적으로 사용합니다. CPU 집약적인 작업에는 적합하지 않을 수 있으며, 이 경우 워커 스레드(worker threads)를 활용할 수 있습니다.
-   **모듈 시스템**: Node.js는 CommonJS (예: `require()`, `module.exports`) 또는 ES 모듈 (예: `import`, `export`) 시스템을 사용합니다. 이 프로젝트는 ES 모듈 시스템을 사용하고 있습니다. Java의 패키지 및 `import` 문과 유사합니다.

## 🤝 기여하기

프로젝트에 기여하고 싶으시다면, 이슈를 생성하거나 풀 리퀘스트를 보내주세요.

## 📄 라이선스

본 프로젝트는 ISC 라이선스를 따릅니다.
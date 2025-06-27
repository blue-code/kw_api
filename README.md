<div align="center">
  <h1>JWT 인증을 사용한 간단한 Node.js Express API</h1>
</div>

이 프로젝트는 JSON Web Token (JWT)을 사용하여 사용자 인증을 구현한 간단한 Node.js Express API 서버입니다. `/auth` 경로를 통해 로그인 및 토큰 유효성 검증을 수행하며, `/test`와 같은 보호된 경로에 접근하기 위해서는 유효한 JWT가 필요합니다.

## 기능

-   사용자 로그인 및 JWT 발급 (`POST /auth/token`)
-   JWT 유효성 검증 (`POST /auth/validate`)
-   JWT로 보호되는 경로 (`GET /test`)
-   HTTPS 지원 (개발용 자체 서명 인증서 사용)
-   환경 변수를 사용한 JWT 설정 (시크릿, 만료 시간)

## 시작하기

이 지침은 프로젝트를 로컬 개발 환경에 설정하고 실행하는 방법을 안내합니다.

### 필수 조건


프로젝트를 로컬 환경에서 실행하기 위한 지침입니다.

### 사전 준비 사항

-   Node.js (v14 이상 권장)
-   npm 또는 yarn

### 설치

1.  저장소를 클론합니다:


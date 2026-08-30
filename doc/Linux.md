# Linux 명령 정리 — curl

> `curl`(Client URL) 명령의 자주 쓰는 사용법을 정리한 참고 문서입니다.
> `curl`은 URL로 데이터를 주고받는 CLI 도구로, HTTP/HTTPS·FTP 등 다양한 프로토콜을 지원합니다.

---

## 1. 기본

| 명령 | 설명 |
|---|---|
| `curl https://example.com` | URL의 응답 본문을 표준출력(stdout)에 표시 |
| `curl -o out.html https://example.com` | 응답을 `out.html` 파일로 저장(이름 지정) |
| `curl -O https://example.com/file.zip` | 원격 파일명 그대로 저장(`file.zip`) |
| `curl -L https://example.com` | 리다이렉트(3xx)를 따라감 |
| `curl -s https://example.com` | 진행률·에러 숨김(silent) |
| `curl -sS https://example.com` | silent이되 에러는 표시(스크립트 권장) |
| `curl -v https://example.com` | 요청·응답 헤더까지 상세 출력(verbose, 디버깅) |
| `curl -f https://example.com` | HTTP 에러(4xx/5xx) 시 실패로 종료(fail) |

> 스크립트에서는 보통 `curl -fsSL <URL>` 조합을 씁니다: 실패 감지(`-f`) + 조용히(`-sS`) + 리다이렉트 추적(`-L`).

---

## 2. HTTP 메서드

```bash
# GET (기본)
curl https://api.example.com/users

# POST — 폼 데이터
curl -X POST -d "name=kim&age=20" https://api.example.com/users

# POST — JSON 본문
curl -X POST \
  -H "Content-Type: application/json" \
  -d '{"name":"kim","age":20}' \
  https://api.example.com/users

# PUT / PATCH / DELETE
curl -X PUT    -d '{"age":21}' -H "Content-Type: application/json" https://api.example.com/users/1
curl -X DELETE https://api.example.com/users/1

# 파일 내용을 본문으로 전송 (@ = 파일에서 읽기)
curl -X POST -H "Content-Type: application/json" -d @payload.json https://api.example.com/users

# HEAD — 헤더만 (본문 없이 상태 확인)
curl -I https://example.com
```

---

## 3. 헤더 · 인증

```bash
# 커스텀 헤더
curl -H "Accept: application/json" -H "X-Request-Id: abc123" https://api.example.com

# Bearer 토큰 인증
curl -H "Authorization: Bearer $TOKEN" https://api.example.com/me

# Basic 인증 (user:password)
curl -u myuser:mypass https://api.example.com

# User-Agent 지정
curl -A "my-cli/1.0" https://example.com

# 쿠키 보내기 / 저장
curl -b "session=xyz" https://example.com          # 쿠키 전송
curl -c cookies.txt https://example.com            # 받은 쿠키를 파일로 저장
curl -b cookies.txt https://example.com            # 저장한 쿠키로 재요청
```

> **보안 주의**: 명령행에 비밀번호·토큰을 직접 넣으면 셸 히스토리·프로세스 목록에 노출됩니다. 환경변수(`$TOKEN`)나 `-u user`(비번은 프롬프트 입력), `--netrc` 사용을 권장합니다.

---

## 4. 파일 업로드 · 다운로드

```bash
# multipart/form-data 파일 업로드 (@ = 파일 첨부)
curl -F "file=@photo.jpg" -F "title=my photo" https://api.example.com/upload

# 다운로드 이어받기(resume) — 중단된 지점부터
curl -C - -O https://example.com/big.iso

# 여러 파일을 한 번에 (범위/목록 확장)
curl -O "https://example.com/img[1-5].png"          # img1.png ~ img5.png
curl -O "https://example.com/{a,b,c}.txt"           # a.txt, b.txt, c.txt

# 다운로드 속도 제한
curl --limit-rate 1M -O https://example.com/big.iso
```

---

## 5. 진단 · 상태 확인

```bash
# HTTP 상태 코드만 출력
curl -s -o /dev/null -w "%{http_code}\n" https://example.com

# 응답 시간 측정 (연결/전송 단계별)
curl -s -o /dev/null \
  -w "dns:%{time_namelookup} connect:%{time_connect} total:%{time_total}\n" \
  https://example.com

# 응답 헤더만 보기 (본문 버림)
curl -sD - -o /dev/null https://example.com

# 리다이렉트 경로 추적
curl -sIL https://example.com | grep -i "^location:"
```

주요 `-w`(write-out) 변수: `%{http_code}`, `%{time_total}`, `%{size_download}`, `%{url_effective}`, `%{num_redirects}`.

---

## 6. TLS · 프록시 · 네트워크 옵션

```bash
# 프록시 경유
curl -x http://proxy.local:8080 https://example.com

# 특정 CA 번들 지정 (사설 인증서 검증)
curl --cacert /path/to/ca-bundle.crt https://internal.example.com

# 클라이언트 인증서
curl --cert client.pem --key client.key https://mtls.example.com

# 타임아웃 (연결 5초, 전체 30초)
curl --connect-timeout 5 --max-time 30 https://example.com

# 실패 시 재시도 (지수 백오프 포함)
curl --retry 4 --retry-delay 2 --retry-all-errors -O https://example.com/file

# HTTP 버전 강제
curl --http2 https://example.com
curl --http1.1 https://example.com
```

> ⚠️ `-k`(`--insecure`)는 TLS 인증서 검증을 끕니다. 임시 테스트 외에는 사용하지 마세요 — 중간자 공격에 노출됩니다. 사설 인증서는 `--cacert`로 신뢰 번들을 지정하는 것이 올바른 방법입니다.

---

## 7. 자주 쓰는 조합 (레시피)

```bash
# JSON API 호출 후 jq로 파싱
curl -fsSL -H "Accept: application/json" https://api.example.com/users | jq '.[].name'

# 설치 스크립트 실행 패턴 (신뢰하는 출처만!)
curl -fsSL https://example.com/install.sh | sh

# GitHub API — 토큰 인증 GET
curl -fsSL -H "Authorization: Bearer $GITHUB_TOKEN" \
  https://api.github.com/repos/OWNER/REPO/commits

# 헬스체크 재시도 후 상태코드 확인 (배포 스크립트)
curl -fsS --retry 5 --retry-delay 3 -o /dev/null -w "%{http_code}\n" https://myapp/health
```

> **안전 주의**: `curl ... | sh` 패턴은 원격 스크립트를 그대로 실행합니다. **신뢰할 수 있는 출처인지 반드시 확인**하고, 가능하면 스크립트를 먼저 내려받아(`curl -O`) 내용을 검토한 뒤 실행하세요.

---

## 8. 옵션 빠른 참조

| 짧은 옵션 | 긴 옵션 | 의미 |
|---|---|---|
| `-o` | `--output <file>` | 지정한 파일명으로 저장 |
| `-O` | `--remote-name` | 원격 파일명으로 저장 |
| `-L` | `--location` | 리다이렉트 추적 |
| `-s` | `--silent` | 진행률/에러 숨김 |
| `-S` | `--show-error` | (silent에도) 에러는 표시 |
| `-f` | `--fail` | HTTP 에러 시 실패 종료 |
| `-v` | `--verbose` | 상세 출력 |
| `-I` | `--head` | 헤더만(HEAD) |
| `-H` | `--header <h>` | 요청 헤더 추가 |
| `-d` | `--data <d>` | 본문 데이터(POST) |
| `-F` | `--form <f>` | multipart 폼/파일 |
| `-X` | `--request <M>` | HTTP 메서드 지정 |
| `-u` | `--user <u:p>` | 인증 정보 |
| `-b` | `--cookie` | 쿠키 전송 |
| `-c` | `--cookie-jar` | 쿠키 저장 |
| `-A` | `--user-agent` | User-Agent |
| `-x` | `--proxy` | 프록시 |
| `-C -` | `--continue-at -` | 이어받기 |
| `-k` | `--insecure` | TLS 검증 비활성(비권장) |
| `-w` | `--write-out` | 결과 변수 출력 |

> 전체 옵션: `man curl` 또는 `curl --help all`

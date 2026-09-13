# Klotus production Elite — Komodo lane

## Scope

Tạo lane production Klotus song song Greenway trên Elite, CI GitHub Actions -> GHCR immutable image -> Komodo Core trên ops-01 -> ELITE.

## Contract

- Source delivery: `erp-master` commit/push, sau đó merge vào `erp-klotus-master`.
- Existing Klotus raw-Docker workflow remains unchanged.
- Stack Web: `erp-klotus-production-elite-web`.
- Web port: `8016:80`.
- API base URL phải trỏ tới Klotus production Elite API lane `10016`.

## Acceptance

- YAML validates; CI/build/test pass.
- Web build dùng biến Klotus production, không chứa runtime secret.
- Komodo target là ELITE; không deploy SSH/raw Docker.
- Existing Klotus workflow is preserved.
- Live Web returns `200`.

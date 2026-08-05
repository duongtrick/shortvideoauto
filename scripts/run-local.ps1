$ErrorActionPreference = "Stop"

if (!(Test-Path .env)) {
  Copy-Item .env.example .env
}

docker compose up -d postgres redis minio
npm.cmd run prisma:generate
npm.cmd run prisma:migrate
npm.cmd run dev

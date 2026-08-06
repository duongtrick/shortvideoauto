param(
  [switch]$CheckOnly
)

$ErrorActionPreference = "Stop"

function Require-Command($Name) {
  if (!(Get-Command $Name -ErrorAction SilentlyContinue)) {
    throw "Missing `$Name`. Install it first, then run npm.cmd run local again."
  }
}

function Import-DotEnv($Path) {
  Get-Content $Path | ForEach-Object {
    $line = $_.Trim()
    if (!$line -or $line.StartsWith("#") -or !$line.Contains("=")) { return }
    $name, $value = $line.Split("=", 2)
    $value = $value.Trim().Trim('"')
    if (!(Get-Item "Env:$name" -ErrorAction SilentlyContinue)) {
      Set-Item -Path "Env:$name" -Value $value
    }
  }
}

function Wait-Postgres {
  for ($i = 0; $i -lt 30; $i++) {
    docker exec shortvideoauto-postgres pg_isready -U postgres -d shortvideoauto *> $null
    if ($LASTEXITCODE -eq 0) { return }
    Start-Sleep -Seconds 2
  }
  throw "PostgreSQL did not become ready on localhost:5432."
}

Require-Command npm.cmd

if (!(Test-Path .env)) {
  Copy-Item .env.example .env
}
Import-DotEnv .env

if ($CheckOnly) {
  Write-Host "local script check passed"
  exit 0
}

Require-Command docker

docker compose up -d postgres redis minio minio-init
Wait-Postgres
npm.cmd run prisma:generate
npm.cmd run prisma:migrate
npm.cmd run prisma:seed
npm.cmd run dev

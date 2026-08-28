# しおり（Shiory）

## 環境変数

```bash
export DB_URL="jdbc:postgresql://aws-0-ap-northeast-1.pooler.supabase.com:5432/postgres?sslmode=require"
export DB_USERNAME="postgres.ievdpmjitwfencyvzdkz"
export DB_PASSWORD="summer-tech0821"
export SUPABASE_URL="https://ievdpmjitwfencyvzdkz.supabase.co"
export SUPABASE_SERVICE_ROLE_KEY="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImlldmRwbWppdHdmZW5jeXZ6ZGt6Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4NzI5MzcyOCwiZXhwIjoyMTAyODY5NzI4fQ.wKg4_DobMHcYVlwS1opCVyFsJbdST0hwE82aPT-EsIE"
export SUPABASE_STORAGE_BUCKET="shiori-photos"
```

または:

```bash
set -a && source .env && set +a
```

## バックエンド（Maven）

```bash
./mvnw spring-boot:run
```

## フロント

```bash
cd frontend && npm run dev
```

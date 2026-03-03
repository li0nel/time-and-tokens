#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"
CONTAINER_NAME="time-and-tokens-otel"

# Stop any existing collector
if docker ps -q --filter "name=$CONTAINER_NAME" | grep -q .; then
  echo "Stopping existing OTEL collector..."
  docker stop "$CONTAINER_NAME" >/dev/null 2>&1
  docker rm "$CONTAINER_NAME" >/dev/null 2>&1
fi

echo "Starting OpenTelemetry Collector..."

docker run -d \
  --name "$CONTAINER_NAME" \
  -p 4317:4317 \
  -v "$SCRIPT_DIR/otel-config.yaml:/etc/otelcol/config.yaml:ro" \
  -v "$REPO_ROOT/output:/output" \
  otel/opentelemetry-collector:latest \
  --config /etc/otelcol/config.yaml

echo ""
echo "=== OTEL Collector running on port 4317 ==="
echo ""
echo "Run these commands in your terminal before starting Claude Code:"
echo ""
echo "  export OTEL_EXPORTER_OTLP_ENDPOINT=\"http://localhost:4317\""
echo "  export OTEL_EXPORTER_OTLP_PROTOCOL=\"grpc\""
echo "  export OTEL_TRACES_EXPORTER=\"otlp\""
echo "  export OTEL_METRICS_EXPORTER=\"otlp\""
echo "  export OTEL_LOGS_EXPORTER=\"otlp\""
echo ""
echo "Telemetry will be written to: $REPO_ROOT/output/claude_telemetry.json"
echo ""
echo "To stop the collector: docker stop $CONTAINER_NAME && docker rm $CONTAINER_NAME"

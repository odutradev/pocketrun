FROM golang:1.27-alpine AS builder
WORKDIR /app
COPY go.mod go.sum ./
RUN go mod download
COPY . .
RUN CGO_ENABLED=0 GOOS=linux go build -trimpath -ldflags="-s -w" -o /out/api ./cmd/api

FROM gcr.io/distroless/static-debian12 AS runner
WORKDIR /app
COPY --from=builder /out/api /app/api
EXPOSE 80
USER nonroot:nonroot
HEALTHCHECK --interval=30s --timeout=5s --start-period=20s --retries=3 CMD ["/app/api", "healthcheck"]
ENTRYPOINT ["/app/api"]

FROM golang:1.27-alpine AS builder
WORKDIR /app
COPY go.mod go.sum ./
RUN go mod download
COPY . .
RUN CGO_ENABLED=0 GOOS=linux go build -trimpath -ldflags="-s -w" -o /out/api ./cmd/api

FROM gcr.io/distroless/static-debian12 AS runner
WORKDIR /app
ENV PORT=80
COPY --from=builder /out/api /app/api
EXPOSE 80
USER nonroot:nonroot
ENTRYPOINT ["/app/api"]

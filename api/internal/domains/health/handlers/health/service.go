package health

type Service struct{}

func NewService() *Service {
	return &Service{}
}

func (s *Service) Ping() PingResponse {
	return PingResponse{Status: "success", Message: "pong"}
}

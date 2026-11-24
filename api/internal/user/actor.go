package user

import (
	"context"
	"fmt"

	"go.mongodb.org/mongo-driver/v2/bson"
)

const systemActorName = "Sistema"

func SystemActor() Actor {
	return Actor{Name: systemActorName}
}

func (s *Service) Actor(ctx context.Context) (Actor, error) {
	claims, ok := ClaimsFromContext(ctx)
	if !ok {
		return SystemActor(), nil
	}

	actor := Actor{Name: claims.Email, Email: claims.Email}
	id, err := bson.ObjectIDFromHex(claims.UserID)
	if err != nil {
		return actor, nil
	}
	actor.ID = &id

	member, err := s.GetUserByID(ctx, id)
	if err != nil {
		return actor, fmt.Errorf("resolve actor %s: %w", claims.UserID, err)
	}
	actor.Name = member.Name
	actor.Email = member.Email
	return actor, nil
}

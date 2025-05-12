package mapper

import (
	"github.com/IlfGauhnith/GraoAGrao/pkg/dto/request"
	"github.com/IlfGauhnith/GraoAGrao/pkg/dto/response"
	"github.com/IlfGauhnith/GraoAGrao/pkg/model"
)

func CreateStoreToModel(req *request.CreateStoreRequest, userID uint) *model.Store {
	return &model.Store{
		Name:      req.Name,
		CreatedBy: model.User{ID: userID},
	}
}

func UpdateStoreToModel(req *request.UpdateStoreRequest, userID uint) *model.Store {
	return &model.Store{
		ID:        req.ID,
		Name:      req.Name,
		CreatedBy: model.User{ID: userID},
	}
}

func ToStoreResponse(m *model.Store) response.StoreResponse {
	return response.StoreResponse{
		ID:        m.ID,
		Name:      m.Name,
		CreatedAt: m.CreatedAt,
		UpdatedAt: m.UpdatedAt,
	}
}

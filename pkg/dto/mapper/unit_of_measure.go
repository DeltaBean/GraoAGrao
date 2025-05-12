package mapper

import (
	"github.com/IlfGauhnith/GraoAGrao/pkg/dto/request"
	"github.com/IlfGauhnith/GraoAGrao/pkg/dto/response"
	"github.com/IlfGauhnith/GraoAGrao/pkg/model"
)

func CreateUnitOfMeasureToModel(createUnitOfMeasure *request.CreateUnitOfMeasureRequest, ownerID, storeID uint) *model.UnitOfMeasure {
	return &model.UnitOfMeasure{
		Description: createUnitOfMeasure.Description,
		CreatedBy: model.User{
			ID: ownerID,
		},
		Store: model.Store{
			ID: storeID,
		},
	}
}

func UpdateUnitOfMeasureToModel(updateUnitOfMeasure *request.UpdateUnitOfMeasureRequest, ownerID uint) *model.UnitOfMeasure {
	return &model.UnitOfMeasure{
		ID:          updateUnitOfMeasure.ID,
		Description: updateUnitOfMeasure.Description,
		CreatedBy: model.User{
			ID: ownerID,
		},
	}
}

func ToUnitOfMeasureResponse(unitOfMeasure *model.UnitOfMeasure) response.UnitOfMeasureResponse {
	return response.UnitOfMeasureResponse{
		ID:          unitOfMeasure.ID,
		Description: unitOfMeasure.Description,
	}
}

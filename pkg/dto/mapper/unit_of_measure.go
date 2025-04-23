package mapper

import (
	"github.com/IlfGauhnith/GraoAGrao/pkg/dto/request"
	"github.com/IlfGauhnith/GraoAGrao/pkg/dto/response"
	"github.com/IlfGauhnith/GraoAGrao/pkg/model"
)

func CreateUnitOfMeasureToModel(createUnitOfMeasure *request.CreateUnitOfMeasureRequest, ownerID uint) *model.UnitOfMeasure {
	return &model.UnitOfMeasure{
		Description: createUnitOfMeasure.Description,
		Owner: model.User{
			ID: ownerID,
		},
	}
}

func UpdateUnitOfMeasureToModel(updateUnitOfMeasure *request.UpdateUnitOfMeasureRequest, ownerID uint) *model.UnitOfMeasure {
	return &model.UnitOfMeasure{
		ID:          updateUnitOfMeasure.ID,
		Description: updateUnitOfMeasure.Description,
		Owner: model.User{
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

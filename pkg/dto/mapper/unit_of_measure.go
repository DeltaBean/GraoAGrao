package mapper

import (
	"github.com/IlfGauhnith/GraoAGrao/pkg/dto/request"
	"github.com/IlfGauhnith/GraoAGrao/pkg/dto/response"
	"github.com/IlfGauhnith/GraoAGrao/pkg/model"
)

func CreateUnitOfMeasureToModel(createUnitOfMeasure request.CreateUnitOfMeasureRequest) model.UnitOfMeasure {
	return model.UnitOfMeasure{
		Description: createUnitOfMeasure.Description,
	}
}

func UpdateUnitOfMeasureToModel(updateUnitOfMeasure request.UpdateUnitOfMeasureRequest) model.UnitOfMeasure {
	return model.UnitOfMeasure{
		ID:          updateUnitOfMeasure.ID,
		Description: updateUnitOfMeasure.Description,
	}
}

func ToUnitOfMeasureResponse(unitOfMeasure model.UnitOfMeasure) response.UnitOfMeasureResponse {
	return response.UnitOfMeasureResponse{
		ID:          unitOfMeasure.ID,
		Description: unitOfMeasure.Description,
	}
}

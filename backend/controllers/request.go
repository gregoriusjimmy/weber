package controllers

import (
	"backend/database"
	"backend/models"
	"errors"
)

func RequestToService(serviceId int, inputData models.ServiceRequestInput) (models.ServiceRequestResultData, error) {
	db := database.GetDB()
	var service models.Service
	var data models.ServiceRequestResultData
	var err error

	if err = db.First(&service, serviceId).Error; err != nil {
		return data, err
	}

	switch service.Type {
	case "analytic":
		data, err = requestToServiceAnalytics(service, inputData)
	case "solution":
		data, err = requestToServiceSolution(service, inputData)

		// TODO: add case for innovation
	}

	return data, err
}

func requestToServiceAnalytics(service models.Service, inputData models.ServiceRequestInput) (models.ServiceRequestResultData, error) {
	var data models.ServiceRequestResultData
	var err error
	dataAnalytic := GetDataAnalytic(service, inputData)
	data, err = RequestToAnalyticSync(dataAnalytic, service.Slug)

	if err != nil {
		return data, err
	}

	return data, nil
}

func requestToServiceSolution(service models.Service, inputData models.ServiceRequestInput) (models.ServiceRequestResultData, error) {
	switch service.Slug {
	case "ekyc":
		return implementEKYCSolution(service, inputData)
	// Add another solution case here

	default:
		var data models.ServiceRequestResultData
		err := errors.New("Implementation of Solution from slug: " + service.Slug + " is not found.")
		return data, err
	}
}

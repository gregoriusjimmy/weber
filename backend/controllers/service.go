package controllers

import (
	"backend/database"
	"backend/models"
	"backend/utils"
	"errors"
	"fmt"
	"log"
	"net/http"
	"strconv"

	"github.com/gin-gonic/gin"
	"gorm.io/gorm"
)

func GetServices(ctx *gin.Context) {
	serviceTypeQuery, isAnyQueryType := ctx.GetQuery("type")

	// check if there is a query URL "type"
	// and it has an invalid value
	isValid, serviceType := models.IsValidServiceType(serviceTypeQuery)
	if isAnyQueryType && !isValid {
		ctx.JSON(http.StatusBadRequest, gin.H{
			"ok":      false,
			"message": "Value of argument '?type=' is not valid",
		})
		return
	}

	switch serviceType {
	case models.AnalyticServiceType:
		getServiceAnalytic(ctx)
	case models.SolutionServiceType:
		getServiceSolution(ctx)
	case models.InnovationServiceType:
		getServiceInnovation(ctx)
	default:
		getAllServices(ctx)
	}
}

func getAllServices(ctx *gin.Context) {
	db := database.GetDB()

	service := &models.Service{}
	analyticsService := &[]models.APIService{}

	if err := db.Model(service).Find(analyticsService).Error; err != nil {
		log.Fatal(err)
	}

	ctx.JSON(http.StatusOK, gin.H{
		"ok":      true,
		"message": "Get all services success",
		"data":    &analyticsService,
	})
}

func getServiceAnalytic(ctx *gin.Context) {
	db := database.GetDB()

	service := &models.Service{}
	analyticsService := &[]models.APIService{}

	if err := db.Model(service).Where("type = ?", "analytic").Find(analyticsService).Error; err != nil {
		log.Fatal(err)
	}

	ctx.JSON(http.StatusOK, gin.H{
		"ok":      true,
		"message": "Get all analytics service success",
		"data":    &analyticsService,
	})
}

func getServiceSolution(ctx *gin.Context) {
	db := database.GetDB()

	service := &models.Service{}
	solutionsService := &[]models.APIService{}

	if err := db.Model(service).Where("type = ?", "solution").Find(solutionsService).Error; err != nil {
		log.Fatal(err)
	}

	ctx.JSON(http.StatusOK, gin.H{
		"ok":      true,
		"message": "Get all solutions service success",
		"data":    &solutionsService,
	})
}

func getServiceInnovation(ctx *gin.Context) {
	db := database.GetDB()

	service := &models.Service{}
	innovationsService := &[]models.APIService{}

	if err := db.Model(service).Where("type = ?", "innovation").Find(innovationsService).Error; err != nil {
		log.Fatal(err)
	}

	ctx.JSON(http.StatusOK, gin.H{
		"ok":      true,
		"message": "Get all innovations service success",
		"data":    &innovationsService,
	})
}

func GetServiceBySlug(ctx *gin.Context) {
	db := database.GetDB()
	service := &models.Service{}
	apiService := &models.APIService{}
	slug := ctx.Param("slug")

	if err := db.Model(service).First(&apiService, "slug = ?", slug).Error; err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			ctx.JSON(http.StatusNotFound, gin.H{
				"ok":      false,
				"message": "Service not found",
			})
			return
		}
	}

	message := fmt.Sprintf("Get service by slug=%v success", slug)
	ctx.JSON(http.StatusOK, gin.H{
		"ok":      true,
		"message": message,
		"data":    &apiService,
	})
}

func CreateServiceRequest(ctx *gin.Context) {
	var inputData models.ServiceRequestInput
	ctx.BindJSON(&inputData)
	sessionId := inputData.SessionID

	// Check if session is not exist in our record
	if !utils.IsSessionExist(sessionId) {
		ctx.JSON(http.StatusUnauthorized, gin.H{
			"ok":      false,
			"message": "Session ID is not valid",
		})
		return
	}

	// Check if session has expired
	if utils.IsSessionExpired(sessionId) {
		ctx.JSON(http.StatusUnauthorized, gin.H{
			"ok":      false,
			"message": "Session ID has expired",
		})
		return
	}

	// Convert value of parameter id from string to int
	// and validate if its value is am integer number
	serviceId, err := strconv.ParseUint(ctx.Param("id"), 10, 32)
	if err != nil {
		ctx.JSON(http.StatusBadRequest, gin.H{
			"ok":      false,
			"message": "Expected an integer value from argument 'id'",
		})
		return
	}

	// Get service data from database
	var service models.Service
	db := database.GetDB()
	if err = db.First(&service, serviceId).Error; err != nil {
		ctx.JSON(http.StatusInternalServerError, gin.H{
			"ok":      false,
			"message": err.Error(),
		})
		return
	}

	if service.Type == "analytic" {
		visitorActivity := &models.VisitorActivity{SessionID: inputData.SessionID, ServiceID: service.ID, Completeness: 100}
		if err = models.CreateVisitorActivity(db, visitorActivity); err != nil {
			ctx.JSON(http.StatusInternalServerError, gin.H{
				"ok":      false,
				"message": err.Error(),
			})
			return
		}
		RequestToServiceAnalytics(ctx, service, inputData)
		return
	}

	ctx.JSON(http.StatusInternalServerError, gin.H{
		"ok":      false,
		"message": "Undefined implementation of: " + service.Slug,
	})
	return

}

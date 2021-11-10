package controllers

import (
	"backend/models"
	"backend/utils"
	"net/http"
	"strconv"

	"github.com/gin-gonic/gin"
)

func (ctrl *Controller) CreateFeedback(ctx *gin.Context) {
	serviceId, _ := strconv.Atoi(ctx.Param("service_id"))
	var feedbackInput models.FeedbackInput
	ctx.BindJSON(&feedbackInput)

	// Check if session is not exist in our record
	if !ctrl.IsSessionExist(feedbackInput.SessionID) {
		ctx.JSON(http.StatusUnauthorized, gin.H{
			"ok":      false,
			"message": "Session ID is not valid",
		})
		return
	}

	// Check if session has expired
	if ctrl.IsSessionExpired(feedbackInput.SessionID) {
		ctx.JSON(http.StatusUnauthorized, gin.H{
			"ok":      false,
			"message": "Session ID has expired",
		})
		return
	}

	//validate Input
	if feedbackInput.Rating < 4 {
		if feedbackInput.Comment == "" {
			ctx.JSON(http.StatusBadRequest, gin.H{"message": "Your comment for this feedback is required", "ok": false})
			return
		}
	}

	err := utils.Validate.Struct(feedbackInput)
	errs := utils.TranslateError(err)
	if len(errs) > 0 {
		ctx.JSON(http.StatusBadRequest, gin.H{"message": errs[0].Error(), "ok": false})
		return
	}

	var lastActivity models.VisitorActivity
	if err := ctrl.Model.GetCurrentVisitorActivity(&lastActivity, feedbackInput.SessionID, serviceId); err != nil {
		ctx.JSON(http.StatusInternalServerError, gin.H{
			"ok":      false,
			"message": err.Error(),
		})
		return
	}

	var feedback models.Feedback
	feedback.VisitorActivityID = lastActivity.ID
	feedback.Comment = feedbackInput.Comment
	feedback.Rating = feedbackInput.Rating

	if err := ctrl.Model.CreateFeedbackDb(&feedback); err != nil {
		ctx.JSON(http.StatusInternalServerError, gin.H{
			"ok":      false,
			"message": err.Error(),
		})
		return
	}

	ctx.JSON(http.StatusOK, gin.H{"message": "Feedback submited!", "ok": true})
}

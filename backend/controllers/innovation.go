package controllers

import (
	"backend/models"
	"bytes"
	"encoding/json"
	"fmt"
	"net/http"
	"os"

	log "github.com/sirupsen/logrus"
	"github.com/tidwall/gjson"
)

func RequestToInnovationSync(postBody []byte, innovationSlug string) (models.ServiceRequestResultData, error) {
	var err error
	var request *http.Request
	var data models.ServiceRequestResultData

	BASE_URL := fmt.Sprintf("%s/%s/predict", os.Getenv("URL_INNOVATIONS"), innovationSlug)
	payload := bytes.NewBuffer(postBody)
	request, err = http.NewRequest("POST", BASE_URL, payload)

	if err != nil {
		log.WithFields(log.Fields{
			"error":    err,
			"data":     data,
			"payload":  payload,
			"base_url": BASE_URL,
			"slug":     innovationSlug,
			"method":   "POST",
		}).Error("error on send http new request to innovation!")
	}

	request.Header.Set("Content-Type", "application/json")

	var client = &http.Client{}
	response, err := client.Do(request)
	if err != nil {
		log.WithFields(log.Fields{
			"error":   err,
			"data":    data,
			"request": request,
		}).Error("error on request to innovation!")
		return data, err
	}

	defer response.Body.Close()

	err = json.NewDecoder(response.Body).Decode(&data)
	if err != nil {
		log.WithFields(log.Fields{
			"error":         err,
			"data":          data,
			"response_body": response.Body,
		}).Error("error on decode response body!")
		return data, err
	}

	return data, nil
}

func ImplementFOAInnovation(postBody []byte) (models.ServiceRequestResultData, error) {
	// Request to Face Detection API
	resultFaceDetection, err := RequestToInnovationSync(postBody, "face-detection")
	if err != nil {
		return resultFaceDetection, err
	}

	resultFaceDetectionJson, _ := json.Marshal(resultFaceDetection)
	isFaceDetected := gjson.Get(string(resultFaceDetectionJson), "job.result.result.0.face_detection.face_detected").Bool()
	if !isFaceDetected {
		return resultFaceDetection, err
	}
	
	return resultFaceDetection, nil
}

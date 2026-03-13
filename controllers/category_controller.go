package controllers

import (
	"net/http"

	"github.com/gin-gonic/gin"

	"bill/db"
	"bill/models"
)

func GetCategories(c *gin.Context) {
	var categories []models.Category
	if err := db.DB.Where("parent_id IS NULL").Preload("Children").Find(&categories).Error; err != nil {
		c.JSON(http.StatusOK, models.Error(1, "获取分类失败", "CATEGORY_FETCH_FAILED"))
		return
	}
	c.JSON(http.StatusOK, models.Success(categories))
}

func CreateCategory(c *gin.Context) {
	var category models.Category
	if err := c.ShouldBindJSON(&category); err != nil {
		c.JSON(http.StatusOK, models.Error(2, "参数错误", "INVALID_PARAMS"))
		return
	}

	if err := db.DB.Create(&category).Error; err != nil {
		c.JSON(http.StatusOK, models.Error(3, "创建分类失败", "CATEGORY_CREATE_FAILED"))
		return
	}

	c.JSON(http.StatusOK, models.Success(category))
}

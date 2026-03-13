package controllers

import (
	"net/http"
	"strconv"
	"time"

	"github.com/gin-gonic/gin"

	"bill/db"
	"bill/models"
)

func CreateBill(c *gin.Context) {
	var bill models.Bill
	if err := c.ShouldBindJSON(&bill); err != nil {
		c.JSON(http.StatusOK, models.Error(2, "参数错误", "INVALID_PARAMS"))
		return
	}

	if bill.Time.IsZero() {
		bill.Time = time.Now()
	}

	if err := db.DB.Create(&bill).Error; err != nil {
		c.JSON(http.StatusOK, models.Error(4, "创建账单失败", "BILL_CREATE_FAILED"))
		return
	}

	c.JSON(http.StatusOK, models.Success(bill))
}

func GetBills(c *gin.Context) {
	query := db.DB.Preload("Category")

	billType := c.Query("type")
	if billType != "" {
		query = query.Where("type = ?", billType)
	}

	startDate := c.Query("start_date")
	if startDate != "" {
		if t, err := time.Parse("2006-01-02", startDate); err == nil {
			query = query.Where("time >= ?", t)
		}
	}

	endDate := c.Query("end_date")
	if endDate != "" {
		if t, err := time.Parse("2006-01-02", endDate); err == nil {
			query = query.Where("time <= ?", t.Add(24*time.Hour))
		}
	}

	categoryID := c.Query("category_id")
	if categoryID != "" {
		query = query.Where("category_id = ?", categoryID)
	}

	var bills []models.Bill
	if err := query.Order("time DESC").Find(&bills).Error; err != nil {
		c.JSON(http.StatusOK, models.Error(5, "获取账单失败", "BILL_FETCH_FAILED"))
		return
	}

	c.JSON(http.StatusOK, models.Success(bills))
}

func GetBillByID(c *gin.Context) {
	id := c.Param("id")
	var bill models.Bill
	if err := db.DB.Preload("Category").First(&bill, id).Error; err != nil {
		c.JSON(http.StatusOK, models.Error(6, "账单不存在", "BILL_NOT_FOUND"))
		return
	}
	c.JSON(http.StatusOK, models.Success(bill))
}

func UpdateBill(c *gin.Context) {
	id, _ := strconv.Atoi(c.Param("id"))
	var bill models.Bill
	if err := db.DB.First(&bill, id).Error; err != nil {
		c.JSON(http.StatusOK, models.Error(6, "账单不存在", "BILL_NOT_FOUND"))
		return
	}

	if err := c.ShouldBindJSON(&bill); err != nil {
		c.JSON(http.StatusOK, models.Error(2, "参数错误", "INVALID_PARAMS"))
		return
	}

	if err := db.DB.Save(&bill).Error; err != nil {
		c.JSON(http.StatusOK, models.Error(7, "更新账单失败", "BILL_UPDATE_FAILED"))
		return
	}

	c.JSON(http.StatusOK, models.Success(bill))
}

func DeleteBill(c *gin.Context) {
	id := c.Param("id")
	if err := db.DB.Delete(&models.Bill{}, id).Error; err != nil {
		c.JSON(http.StatusOK, models.Error(8, "删除账单失败", "BILL_DELETE_FAILED"))
		return
	}
	c.JSON(http.StatusOK, models.Success(nil))
}

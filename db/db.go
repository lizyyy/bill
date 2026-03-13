package db

import (
	"log"
	"time"

	"gorm.io/driver/sqlite"
	"gorm.io/gorm"

	"bill/models"
)

var DB *gorm.DB

func InitDB() {
	var err error
	DB, err = gorm.Open(sqlite.Open("./bill.db"), &gorm.Config{})
	if err != nil {
		log.Fatal("Failed to connect to database:", err)
	}

	err = DB.AutoMigrate(&models.Category{}, &models.Bill{})
	if err != nil {
		log.Fatal("Failed to migrate database:", err)
	}

	initDefaultCategories()
}

func initDefaultCategories() {
	var count int64
	DB.Model(&models.Category{}).Count(&count)
	if count > 0 {
		return
	}

	foodCat := &models.Category{Name: "饮食"}
	DB.Create(foodCat)
	trafficCat := &models.Category{Name: "交通"}
	DB.Create(trafficCat)
	DB.Create(&models.Category{Name: "购物"})
	DB.Create(&models.Category{Name: "娱乐"})
	DB.Create(&models.Category{Name: "医疗"})
	DB.Create(&models.Category{Name: "教育"})
	DB.Create(&models.Category{Name: "住房"})
	salaryCat := &models.Category{Name: "工资"}
	DB.Create(salaryCat)
	DB.Create(&models.Category{Name: "奖金"})
	DB.Create(&models.Category{Name: "其他"})

	DB.Create(&models.Category{Name: "水果", ParentID: &foodCat.ID})
	DB.Create(&models.Category{Name: "外卖", ParentID: &foodCat.ID})
	DB.Create(&models.Category{Name: "公交", ParentID: &trafficCat.ID})
	DB.Create(&models.Category{Name: "地铁", ParentID: &trafficCat.ID})

	now := time.Now()
	DB.Create(&models.Bill{
		Type:       models.BillTypeExpense,
		Amount:     25.5,
		CategoryID: foodCat.ID,
		Time:       now,
		Remark:     "午餐",
	})
	DB.Create(&models.Bill{
		Type:       models.BillTypeIncome,
		Amount:     10000,
		CategoryID: salaryCat.ID,
		Time:       now.AddDate(0, 0, -5),
		Remark:     "工资收入",
	})
}

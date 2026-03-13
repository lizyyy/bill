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

	defaultCategories := []models.Category{
		{Name: "饮食"},
		{Name: "交通"},
		{Name: "购物"},
		{Name: "娱乐"},
		{Name: "医疗"},
		{Name: "教育"},
		{Name: "住房"},
		{Name: "工资"},
		{Name: "奖金"},
		{Name: "其他"},
	}

	for _, cat := range defaultCategories {
		DB.Create(&cat)
	}

	DB.Create(&models.Category{Name: "水果", ParentID: &defaultCategories[0].ID})
	DB.Create(&models.Category{Name: "外卖", ParentID: &defaultCategories[0].ID})
	DB.Create(&models.Category{Name: "公交", ParentID: &defaultCategories[1].ID})
	DB.Create(&models.Category{Name: "地铁", ParentID: &defaultCategories[1].ID})

	now := time.Now()
	DB.Create(&models.Bill{
		Type:       models.BillTypeExpense,
		Amount:     25.5,
		CategoryID: defaultCategories[0].ID,
		Time:       now,
		Remark:     "午餐",
	})
	DB.Create(&models.Bill{
		Type:       models.BillTypeIncome,
		Amount:     10000,
		CategoryID: defaultCategories[7].ID,
		Time:       now.AddDate(0, 0, -5),
		Remark:     "工资收入",
	})
}

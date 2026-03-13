package models

import (
	"time"

	"gorm.io/gorm"
)

type Category struct {
	ID        uint           `json:"id" gorm:"primaryKey"`
	Name      string         `json:"name" gorm:"not null"`
	ParentID  *uint          `json:"parent_id"`
	Children  []Category     `json:"children,omitempty" gorm:"foreignKey:ParentID"`
	CreatedAt time.Time      `json:"created_at"`
	UpdatedAt time.Time      `json:"updated_at"`
	DeletedAt gorm.DeletedAt `json:"-" gorm:"index"`
}

type BillType string

const (
	BillTypeExpense BillType = "expense"
	BillTypeIncome  BillType = "income"
	BillTypeTransfer BillType = "transfer"
	BillTypeLoan    BillType = "loan"
)

type Bill struct {
	ID         uint           `json:"id" gorm:"primaryKey"`
	Type       BillType       `json:"type" gorm:"not null;index"`
	Amount     float64        `json:"amount" gorm:"not null"`
	CategoryID uint           `json:"category_id" gorm:"not null;index"`
	Category   Category       `json:"category" gorm:"foreignKey:CategoryID"`
	Time       time.Time      `json:"time" gorm:"not null;index"`
	Remark     string         `json:"remark"`
	CreatedAt  time.Time      `json:"created_at"`
	UpdatedAt  time.Time      `json:"updated_at"`
	DeletedAt  gorm.DeletedAt `json:"-" gorm:"index"`
}

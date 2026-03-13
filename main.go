package main

import (
	"net/http"

	"github.com/gin-gonic/gin"

	"bill/controllers"
	"bill/db"
)

func main() {
	db.InitDB()

	r := gin.Default()

	r.Static("/static", "./static")
	r.LoadHTMLGlob("views/*")

	r.GET("/", func(c *gin.Context) {
		c.HTML(http.StatusOK, "index.html", nil)
	})

	api := r.Group("/api")
	{
		api.GET("/categories", controllers.GetCategories)
		api.POST("/categories", controllers.CreateCategory)

		api.GET("/bills", controllers.GetBills)
		api.POST("/bills", controllers.CreateBill)
		api.GET("/bills/:id", controllers.GetBillByID)
		api.PUT("/bills/:id", controllers.UpdateBill)
		api.DELETE("/bills/:id", controllers.DeleteBill)
	}

	r.Run(":8001")
}

package main

import (
	"time"

	"github.com/gin-contrib/cors"
	"github.com/gin-gonic/gin"

	"github.com/Luizz29/go-gin-project/config"
	"github.com/Luizz29/go-gin-project/handler"
	"github.com/Luizz29/go-gin-project/models"
	"github.com/Luizz29/go-gin-project/repository"
	"github.com/Luizz29/go-gin-project/routes"
	"github.com/Luizz29/go-gin-project/services"
)

func main() {
	r := gin.Default()

	// ================= CORS =================
	r.Use(cors.New(cors.Config{
		AllowOrigins:     []string{"http://localhost:5173"},
		AllowMethods:     []string{"GET", "POST", "PUT", "DELETE"},
		AllowHeaders:     []string{"Content-Type", "Authorization"},
		AllowCredentials: true,
		MaxAge:           12 * time.Hour,
	}))

	// ================= DB =================
	db := config.ConnectDB()

	db.AutoMigrate(
		&models.User{},
		&models.Role{},
		&models.Subject{},
	)

	// ================= REPOSITORY =================
	userRepo := repository.NewUserRepository(db)
	subjectRepo := repository.NewSubjectRepository(db)
	selectRepo := repository.NewSelectRepository(db)
	classRepo := repository.NewClassRepository(db)
	roomRepo := repository.NewRoomRepository(db)
	siswaRepo := repository.NewSiswaRepository(db)
	teacherRepo := repository.NewTeacherRepository(db)
	questionBankRepo := repository.NewQuestionBankRepository(db)
	questionRepo := repository.NewQuestionRepository(db)
	questionOptionRepo := repository.NewQuestionOptionRepository(db)
	examRepo := repository.NewExamRepository(db)
	scheduleRepo := repository.NewExamScheduleRepository(db)
	classMemberRepo := repository.NewClassMemberRepository(db)
	examSecurityRepo := repository.NewExamSecurityRepository(db)

	// ================= SERVICE =================
	authService := services.NewAuthService(userRepo)
	userService := services.NewUserService(userRepo)
	subjectService := services.NewSubjectService(subjectRepo)
	selectService := services.NewSelectService(selectRepo)
	classService := services.NewClassService(classRepo)
	roomService := services.NewRoomService(roomRepo)
	siswaService := services.NewSiswaService(siswaRepo)
	teacherService := services.NewTeacherService(teacherRepo)
	questionBankService := services.NewQuestionBankService(questionBankRepo)
	scheduleService := services.NewExamScheduleService(scheduleRepo)
	examSecurityService := services.NewExamSecurityService(examSecurityRepo)

	// ⭐ FIX FINAL
	examService := services.NewExamService(
		examRepo,
		questionRepo,
		questionOptionRepo,
		classMemberRepo,
		db,
	)

	questionService := services.NewQuestionService(questionRepo, db)
	questionOptionService := services.NewQuestionOptionService(questionOptionRepo)

	// ================= HANDLER =================
	authHandler := handler.NewAuthHandler(authService)
	userHandler := handler.NewUserHandler(userService)
	subjectHandler := handler.NewSubjectHandler(subjectService)
	selectHandler := handler.NewSelectHandler(selectService)
	classHandler := handler.NewClassHandler(classService)
	roomHandler := handler.NewRoomHandler(roomService)
	siswaHandler := handler.NewSiswaHandler(siswaService)
	teacherHandler := handler.NewTeacherHandler(teacherService)
	questionBankHandler := handler.NewQuestionBankHandler(questionBankService)
	questionHandler := handler.NewQuestionHandler(questionService)
	questionOptionHandler := handler.NewQuestionOptionHandler(questionOptionService)
	examHandler := handler.NewExamHandler(examService)
	scheduleHandler := handler.NewExamScheduleHandler(scheduleService)
	examSecurityHandler := handler.NewExamSecurityHandler(examSecurityService)
	// ================= ROUTES =================
	routes.SetupRoutes(
		r,
		authHandler,
		userHandler,
		subjectHandler,
		selectHandler,
		classHandler,
		roomHandler,
		siswaHandler,
		teacherHandler,
		questionBankHandler,
		questionHandler,
		questionOptionHandler,
		examHandler,
		scheduleHandler,
		examSecurityHandler,
	)

	r.Run(":8081")
}

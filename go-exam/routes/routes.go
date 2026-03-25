package routes

import (
	"github.com/gin-gonic/gin"

	"github.com/Luizz29/go-gin-project/handler"
	"github.com/Luizz29/go-gin-project/middlewares"
)

func SetupRoutes(
	r *gin.Engine,
	authHandler *handler.AuthHandler,
	userHandler *handler.UserHandler,
	subjectHandler *handler.SubjectHandler,
	selectHandler *handler.SelectHandler,
	classHandler *handler.ClassHandler,
	roomHandler *handler.RoomHandler,
	siswaHandler *handler.SiswaHandler,
	teacherHandler *handler.TeacherHandler,
	questionBankHandler *handler.QuestionBankHandler,
	questionHandler *handler.QuestionHandler,
	questionOptionHandler *handler.QuestionOptionHandler,
	examHandler *handler.ExamHandler,
	examScheduleHandler *handler.ExamScheduleHandler,
	examSecurityHandler *handler.ExamSecurityHandler,
	studentHandler *handler.StudentHandler,

) {

	// ================= AUTH =================
	r.POST("/api/auth/login", authHandler.Login)

	// ================= USER =================
	user := r.Group("/users")
	user.Use(middlewares.JWTAuth())
	{
		user.GET("", userHandler.GetUsers)
		user.POST("", userHandler.CreateUser)
		user.PUT("/:id", userHandler.UpdateUser)
		user.DELETE("/:id", userHandler.DeleteUser)
		user.GET("/profile", userHandler.GetProfile)
	}

	// ================= ROLE =================

	// ================= SELECT =================
	selectGroup := r.Group("/select")
	selectGroup.Use(middlewares.JWTAuth())
	{
		selectGroup.GET("/roles", selectHandler.GetRoles)
		selectGroup.GET("/users", selectHandler.GetUsers)
		selectGroup.GET("/classes", selectHandler.GetClasses)
		selectGroup.GET("/subjects", selectHandler.GetSubjects)
		selectGroup.GET("/teachers", selectHandler.GetTeachers)
	}

	// ================= SUBJECT =================
	subject := r.Group("/master/subject")
	subject.Use(middlewares.JWTAuth())
	{
		subject.POST("", subjectHandler.CreateSubject)
		subject.GET("", subjectHandler.GetSubjects)
		subject.PUT("/:id", subjectHandler.UpdateSubject)
		subject.DELETE("/:id", subjectHandler.DeleteSubject)
	}

	// ================= CLASS =================
	class := r.Group("/master/class")
	class.Use(middlewares.JWTAuth())
	{
		class.POST("", classHandler.CreateClass)
		class.GET("", classHandler.GetClass)
		class.PUT("/:id", classHandler.UpdateClass)
		class.DELETE("/:id", classHandler.DeleteClass)
	}

	// ================= ROOM =================
	room := r.Group("/master/room")
	room.Use(middlewares.JWTAuth())
	{
		room.GET("", roomHandler.GetRooms)
		room.POST("", roomHandler.CreateRoom)
		room.PUT("/:id", roomHandler.UpdateRoom)
		room.DELETE("/:id", roomHandler.DeleteRoom)
	}

	// ================= Master Siswa =================
	siswa := r.Group("/master/siswa")
	siswa.Use(middlewares.JWTAuth())
	{
		siswa.GET("", siswaHandler.GetSiswa)
		siswa.POST("", siswaHandler.CreateSiswa)
		siswa.PUT("/:id", siswaHandler.UpdateSiswa)
		siswa.DELETE("/:id", siswaHandler.DeleteSiswa)
	}

	// ================= Master Teacher =================
	teacher := r.Group("/master/teacher")
	teacher.Use(middlewares.JWTAuth())
	{
		teacher.GET("", teacherHandler.GetTeacher)
		teacher.POST("", teacherHandler.CreateTeacher)
		teacher.PUT("/:id", teacherHandler.UpdateTeacher)
		teacher.DELETE("/:id", teacherHandler.DeleteTeacher)
	}

	// ================= Bank Question =================
	question := r.Group("/master/question-bank")
	question.Use(middlewares.JWTAuth())
	{
		question.GET("", questionBankHandler.GetAll)
		question.POST("", questionBankHandler.Create)
		question.DELETE("/:id", questionBankHandler.Delete)
	}

	// ================= Question List =================
	questionlist := r.Group("/master/question")
	questionlist.Use(middlewares.JWTAuth())
	{
		questionlist.GET("/:headerid", questionHandler.GetByHeader)
		questionlist.POST("/:headerid", questionHandler.Create)
		questionlist.PUT("/:detailid", questionHandler.Update)
		questionlist.DELETE("/:detailid", questionHandler.Delete)
	}

	questionOption := r.Group("/master/question-option")
	questionOption.Use(middlewares.JWTAuth())
	{
		questionOption.GET("/:detailid", questionOptionHandler.GetByDetail)
		questionOption.POST("/:detailid", questionOptionHandler.Create)
		questionOption.DELETE("/:detailid", questionOptionHandler.Delete)
	}

	// ================= Master Exam =================
	exam := r.Group("/master/exam")
	exam.Use(middlewares.JWTAuth())
	{
		exam.GET("", examHandler.GetAll)
		exam.POST("", examHandler.Create)
		exam.GET("/my-exams", examHandler.GetMyExams)
		exam.GET("/:id", examHandler.GetByID)
		exam.PUT("/:id", examHandler.Update)
		exam.DELETE("/:id", examHandler.Delete)

		exam.GET("/:id/questions", examHandler.GetExamQuestions)
		exam.PUT("/:id/assign-teacher", examHandler.AssignTeacher)
		exam.PUT("/:id/set-bank", examHandler.SetBank)

		//Participant
		exam.POST("/:id/assign-class", examHandler.AssignClass)
		exam.GET("/:id/classes", examHandler.GetAssignedClasses)
		exam.GET("/:id/participants", examHandler.GetParticipants)

		//Schedule
		exam.POST("/:id/schedule", examScheduleHandler.Create)
		exam.GET("/:id/schedule", examScheduleHandler.GetByExamId)
		exam.PUT("/:id/schedule", examScheduleHandler.Update)

		// SECURITY
		exam.POST("/:id/security", examSecurityHandler.Create)
		exam.GET("/:id/security", examSecurityHandler.GetByExamId)
		exam.PUT("/:id/security", examSecurityHandler.Update)

		//Publish
		exam.PUT("/:id/publish", examHandler.Publish)

	}

	student := r.Group("/student")
	student.Use(middlewares.JWTAuth())
	{
		student.GET("/dashboard", studentHandler.GetDashboard)
		student.POST("/exam/:examID/join", studentHandler.JoinExam)
		student.GET("/exam/:examID/questions", studentHandler.GetExamQuestions)
		student.POST("/exam/:examID/submit", studentHandler.SubmitExam)
	}

}

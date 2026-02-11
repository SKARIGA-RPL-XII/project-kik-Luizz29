package repository

import (
	"github.com/Luizz29/go-gin-project/models"
	"gorm.io/gorm"
)

type ClassMemberRepository interface {
	GetStudentsByClassIDs(tx *gorm.DB, classIDs []uint) ([]models.StudentSnapshot, error)
}

type classMemberRepository struct {
	db *gorm.DB
}

func NewClassMemberRepository(db *gorm.DB) ClassMemberRepository {
	return &classMemberRepository{db}
}

func (r *classMemberRepository) GetStudentsByClassIDs(
	tx *gorm.DB,
	classIDs []uint,
) ([]models.StudentSnapshot, error) {

	var result []models.StudentSnapshot

	err := tx.Raw(`
		SELECT 
			s.siswaid AS studentid,
			u.name AS studentname,
			u.email AS studentnumber,
			s.classid
		FROM mssiswa s
		JOIN users u ON u.id = s.userid
		WHERE s.classid IN ?
		AND s.isactive = true
		AND u.isactive = true
	`, classIDs).Scan(&result).Error

	return result, err
}


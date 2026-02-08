package repository

import (
	"github.com/Luizz29/go-gin-project/models"
	"gorm.io/gorm"
)

type RoomRepository interface {
	FindAll() ([]models.Room, error)
	Create(room *models.Room) error
	Update(id uint, data map[string]interface{}) error
	Delete(id uint) error
}

type roomRepository struct {
	db *gorm.DB
}

func NewRoomRepository(db *gorm.DB) RoomRepository {
	return &roomRepository{db}
}

func (r *roomRepository) FindAll() ([]models.Room, error) {
	var rooms []models.Room
	err := r.db.Order("roomid ASC").Find(&rooms).Error
	return rooms, err
}

func (r *roomRepository) Create(room *models.Room) error {
	return r.db.Create(room).Error
}

func (r *roomRepository) Update(id uint, data map[string]interface{}) error {
	return r.db.Model(&models.Room{}).
		Where("roomid = ?", id).
		Updates(data).Error
}

func (r *roomRepository) Delete(id uint) error {
	return r.db.Where("roomid = ?", id).
		Delete(&models.Room{}).Error
}

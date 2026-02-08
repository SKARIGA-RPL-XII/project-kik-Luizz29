package services

import (
	"github.com/Luizz29/go-gin-project/models"
	"github.com/Luizz29/go-gin-project/repository"
)

type RoomService interface {
	GetAll() ([]models.Room, error)
	Create(req models.CreateRoomRequest) (models.Room, error)
	Update(id uint, req models.UpdateRoomRequest) error
	Delete(id uint) error
}

type roomService struct {
	roomRepo repository.RoomRepository
}

func NewRoomService(roomRepo repository.RoomRepository) RoomService {
	return &roomService{roomRepo}
}

func (s *roomService) GetAll() ([]models.Room, error) {
	return s.roomRepo.FindAll()
}

func (s *roomService) Create(req models.CreateRoomRequest) (models.Room, error) {
	room := models.Room{
		RoomNm:   req.RoomNm,
		IsActive: req.IsActive,
	}

	err := s.roomRepo.Create(&room)
	if err != nil {
		return models.Room{}, err
	}

	return room, nil
}

func (s *roomService) Update(id uint, req models.UpdateRoomRequest) error {
	data := map[string]interface{}{}

	if req.RoomNm != "" {
		data["roomnm"] = req.RoomNm
	}
	if req.IsActive != nil {
		data["isactive"] = *req.IsActive
	}

	return s.roomRepo.Update(id, data)
}

func (s *roomService) Delete(id uint) error {
	return s.roomRepo.Delete(id)
}

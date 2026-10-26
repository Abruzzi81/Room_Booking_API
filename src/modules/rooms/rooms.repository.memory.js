class RoomsRepositoryMemory {
  constructor() {
    // Tablica z danymi istnieje wyłącznie w pliku repository (wymóg Zadania 1)
    this.rooms = [
      { id: 1, name: "A101", capacity: 30 },
      { id: 2, name: "B202", capacity: 15 },
      { id: 3, name: "C303", capacity: 50 },
      { id: 4, name: "D404", capacity: 10 }
    ];
  }

  async findAll() {
    return this.rooms;
  }

  async findById(id) {
    return this.rooms.find(room => room.id === id) || null;
  }
}

module.exports = RoomsRepositoryMemory;
export interface Room {
  id: string;
  name: string;
  description?: string;
  bedCount: number;
  maxOccupancy: number;
  currentOccupancy: number;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
  createdBy?: string;
  accommodationAssignments?: AccommodationAssignment[];
}

export interface AccommodationAssignment {
  id: string;
  roomId: string;
  registrationId: string;
  bedNumber?: number;
  assignedAt: Date;
  assignedBy?: string;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
  Room?: Room;
  Registration?: {
    id: string;
    YoungPeople: {
      id: string;
      firstName: string;
      lastName: string;
      gender: string;
    };
    Classification: {
      id: string;
      name: string;
    };
    GradeLevel: {
      id: string;
      name: string;
    };
  };
}

export interface RoomFormData {
  name: string;
  description: string;
  bedCount: string;
  maxOccupancy: string;
}

export interface AccommodationAssignmentFormData {
  roomId: string;
  registrationId: string;
  bedNumber: string;
  notes: string;
}
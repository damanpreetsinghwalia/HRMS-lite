from pydantic import BaseModel, EmailStr
from datetime import date
from enum import Enum

# Define Enum here for Pydantic validation
class StatusEnum(str, Enum):
    PRESENT = "Present"
    ABSENT = "Absent"

# --- Employee Schemas ---
class EmployeeBase(BaseModel):
    full_name: str
    email: EmailStr
    department: str

class EmployeeCreate(EmployeeBase):
    employee_id: str

class Employee(EmployeeBase):
    id: int
    employee_id: str

    class Config:
        from_attributes = True

# --- Attendance Schemas ---
class AttendanceCreate(BaseModel):
    employee_id: str
    date: date
    status: StatusEnum  # Using Enum ensures API rejects invalid values instantly

class Attendance(AttendanceCreate):
    id: int

    class Config:
        from_attributes = True
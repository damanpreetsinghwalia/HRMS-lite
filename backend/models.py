import enum
from sqlalchemy import Column, Integer, String, Date, Enum, ForeignKey, UniqueConstraint
from sqlalchemy.orm import relationship
from database import Base

class StatusEnum(enum.Enum):
    PRESENT = "Present"
    ABSENT = "Absent"

class Employee(Base):
    __tablename__ = "employees"

    id = Column(Integer, primary_key=True, index=True)
    employee_id = Column(String(50), unique=True, index=True, nullable=False)
    full_name = Column(String(100), nullable=False)
    email = Column(String(100), nullable=False)
    department = Column(String(100), nullable=False)

    attendances = relationship("Attendance", back_populates="employee", cascade="all, delete-orphan")

class Attendance(Base):
    __tablename__ = "attendances"

    id = Column(Integer, primary_key=True, index=True)
    # Note: We are linking to the String 'employee_id', not the Integer 'id'. 
    # This is valid and easier for your API, but requires the String column to be Unique (which it is).
    employee_id = Column(String(50), ForeignKey("employees.employee_id"), nullable=False)
    date = Column(Date, nullable=False)
    status = Column(Enum(StatusEnum), nullable=False)

    employee = relationship("Employee", back_populates="attendances")

    # Prevents marking attendance twice for the same person on the same day
    __table_args__ = (
        UniqueConstraint('employee_id', 'date', name='uq_employee_attendance_day'),
    )
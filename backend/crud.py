from sqlalchemy.orm import Session
from sqlalchemy.exc import IntegrityError
import models
import schemas


# --- Employee CRUD Operations ---

def get_employee_by_id(db: Session, employee_id: str):
    """Query employee by their string employee_id"""
    return db.query(models.Employee).filter(models.Employee.employee_id == employee_id).first()


def get_employees(db: Session, skip: int = 0, limit: int = 100):
    """Return a list of employees with pagination"""
    return db.query(models.Employee).offset(skip).limit(limit).all()


def create_employee(db: Session, employee: schemas.EmployeeCreate):
    """
    Add a new employee.
    Returns the created employee or None if employee_id already exists.
    """
    # Check if employee already exists
    existing_employee = get_employee_by_id(db, employee.employee_id)
    if existing_employee:
        return None
    
    db_employee = models.Employee(
        employee_id=employee.employee_id,
        full_name=employee.full_name,
        email=employee.email,
        department=employee.department
    )
    
    try:
        db.add(db_employee)
        db.commit()
        db.refresh(db_employee)
        return db_employee
    except IntegrityError:
        db.rollback()
        return None


def delete_employee(db: Session, employee_id: str):
    """
    Remove an employee by their string employee_id.
    Returns True if deleted, False if not found.
    """
    employee = get_employee_by_id(db, employee_id)
    if not employee:
        return False
    
    db.delete(employee)
    db.commit()
    return True


# --- Attendance CRUD Operations ---

def get_attendance(db: Session, employee_id: str):
    """Return all attendance records for a specific employee"""
    return db.query(models.Attendance).filter(
        models.Attendance.employee_id == employee_id
    ).all()


def create_attendance(db: Session, attendance: schemas.AttendanceCreate):
    """
    Add an attendance record.
    Checks if a record already exists for that employee_id and date.
    Returns the created attendance or None if duplicate exists.
    """
    # Check if attendance already exists for this employee on this date
    existing_attendance = db.query(models.Attendance).filter(
        models.Attendance.employee_id == attendance.employee_id,
        models.Attendance.date == attendance.date
    ).first()
    
    if existing_attendance:
        return None
    
    # Convert Pydantic enum to SQLAlchemy enum
    db_attendance = models.Attendance(
        employee_id=attendance.employee_id,
        date=attendance.date,
        status=models.StatusEnum[attendance.status.name]  # Convert from Pydantic to SQLAlchemy enum
    )
    
    try:
        db.add(db_attendance)
        db.commit()
        db.refresh(db_attendance)
        return db_attendance
    except IntegrityError:
        db.rollback()
        return None


def get_attendance_by_date(db: Session, date: str):
    """Return all attendance records for a specific date"""
    return db.query(models.Attendance).filter(
        models.Attendance.date == date
    ).all()


# --- Dashboard Statistics ---

def get_dashboard_stats(db: Session):
    """
    Calculate and return dashboard statistics:
    - total_employees: total count of employees
    - present_today: count of attendance records marked Present for today
    - absent_today: count of attendance records marked Absent for today
    """
    from datetime import date
    
    today = date.today().isoformat()
    
    # Count total employees
    total_employees = db.query(models.Employee).count()
    
    # Count present employees today
    present_today = db.query(models.Attendance).filter(
        models.Attendance.date == today,
        models.Attendance.status == models.StatusEnum.PRESENT
    ).count()
    
    # Count absent employees today
    absent_today = db.query(models.Attendance).filter(
        models.Attendance.date == today,
        models.Attendance.status == models.StatusEnum.ABSENT
    ).count()
    
    return {
        "total_employees": total_employees,
        "present_today": present_today,
        "absent_today": absent_today
    }


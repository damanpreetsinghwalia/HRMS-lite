from fastapi import FastAPI, Depends, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from typing import List

import models
import schemas
import crud
from database import engine, get_db

# Create database tables
models.Base.metadata.create_all(bind=engine)

app = FastAPI(title="HRMS Lite API", version="1.0.0")

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production, replace with specific origins like ["http://localhost:5173"]
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# --- Root Endpoint ---
@app.get("/")
def read_root():
    return {"message": "HRMS Lite API - Visit /docs for API documentation"}


# --- Employee Endpoints ---

@app.post("/employees/", response_model=schemas.Employee, status_code=201)
def create_employee(employee: schemas.EmployeeCreate, db: Session = Depends(get_db)):
    """Create a new employee"""
    db_employee = crud.create_employee(db, employee)
    if db_employee is None:
        raise HTTPException(
            status_code=400, 
            detail=f"Employee with ID '{employee.employee_id}' already exists"
        )
    return db_employee


@app.get("/employees/", response_model=List[schemas.Employee])
def get_employees(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    """Get all employees with pagination"""
    employees = crud.get_employees(db, skip=skip, limit=limit)
    return employees


@app.get("/employees/{employee_id}", response_model=schemas.Employee)
def get_employee(employee_id: str, db: Session = Depends(get_db)):
    """Get a specific employee by ID"""
    employee = crud.get_employee_by_id(db, employee_id)
    if employee is None:
        raise HTTPException(status_code=404, detail=f"Employee '{employee_id}' not found")
    return employee


@app.delete("/employees/{employee_id}", status_code=204)
def delete_employee(employee_id: str, db: Session = Depends(get_db)):
    """Delete an employee by ID"""
    success = crud.delete_employee(db, employee_id)
    if not success:
        raise HTTPException(status_code=404, detail=f"Employee '{employee_id}' not found")
    return None


# --- Attendance Endpoints ---

@app.post("/attendance/", response_model=schemas.Attendance, status_code=201)
def create_attendance(attendance: schemas.AttendanceCreate, db: Session = Depends(get_db)):
    """Create a new attendance record"""
    # First verify the employee exists
    employee = crud.get_employee_by_id(db, attendance.employee_id)
    if not employee:
        raise HTTPException(
            status_code=404,
            detail=f"Employee '{attendance.employee_id}' not found"
        )
    
    db_attendance = crud.create_attendance(db, attendance)
    if db_attendance is None:
        raise HTTPException(
            status_code=400,
            detail=f"Attendance for employee '{attendance.employee_id}' on {attendance.date} already exists"
        )
    return db_attendance


@app.get("/attendance/{employee_id}", response_model=List[schemas.Attendance])
def get_attendance(employee_id: str, db: Session = Depends(get_db)):
    """Get all attendance records for a specific employee"""
    # Verify employee exists
    employee = crud.get_employee_by_id(db, employee_id)
    if not employee:
        raise HTTPException(status_code=404, detail=f"Employee '{employee_id}' not found")
    
    attendance_records = crud.get_attendance(db, employee_id)
    return attendance_records


@app.get("/attendance/date/{date}", response_model=List[schemas.Attendance])
def get_attendance_by_date(date: str, db: Session = Depends(get_db)):
    """Get all attendance records for a specific date (format: YYYY-MM-DD)"""
    attendance_records = crud.get_attendance_by_date(db, date)
    return attendance_records


# --- Dashboard Endpoints ---

@app.get("/dashboard/stats")
def get_dashboard_stats(db: Session = Depends(get_db)):
    """Get dashboard statistics including employee counts and today's attendance"""
    stats = crud.get_dashboard_stats(db)
    return stats



if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)

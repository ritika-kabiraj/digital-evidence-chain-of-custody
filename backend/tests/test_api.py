import pytest
from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)

def test_health_check():
    response = client.get("/health")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "online"
    assert "project" in data

def test_login_success():
    response = client.post("/api/v1/auth/login", json={
        "email": "admin@evidence.gov",
        "password": "AdminPassword123!"
    })
    assert response.status_code == 200
    data = response.json()
    assert "access_token" in data
    assert data["user"]["email"] == "admin@evidence.gov"

def test_login_invalid_password():
    response = client.post("/api/v1/auth/login", json={
        "email": "admin@evidence.gov",
        "password": "WrongPassword!"
    })
    assert response.status_code == 401

def test_cases_api_unauthorized():
    response = client.get("/api/v1/cases")
    assert response.status_code == 401

def test_cases_api_authorized():
    # Login first
    login_res = client.post("/api/v1/auth/login", json={
        "email": "investigator@evidence.gov",
        "password": "Investigator123!"
    })
    token = login_res.json()["access_token"]
    headers = {"Authorization": f"Bearer {token}"}

    # Fetch cases list
    res = client.get("/api/v1/cases", headers=headers)
    assert res.status_code == 200
    assert isinstance(res.json(), list)

def test_create_case():
    login_res = client.post("/api/v1/auth/login", json={
        "email": "admin@evidence.gov",
        "password": "AdminPassword123!"
    })
    token = login_res.json()["access_token"]
    headers = {"Authorization": f"Bearer {token}"}

    case_payload = {
        "case_number": "CASE-TEST-001",
        "title": "Cyber Extortion Ransomware Investigation",
        "description": "Analysis of encrypted server disk images",
        "status": "OPEN"
    }

    res = client.post("/api/v1/cases", json=case_payload, headers=headers)
    assert res.status_code == 201
    data = res.json()
    assert data["case_number"] == "CASE-TEST-001"
    assert "id" in data
